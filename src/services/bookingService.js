import { assets } from "../assets/assets.js";
import { API_ENDPOINTS, request } from "./api.js";
import { getCachedUser } from "./userService.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const unwrapList = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

const safe = (promise) => promise.catch(() => []);

const toDate = (iso) => {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (date) =>
  date
    ? date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

const formatDateTime = (date) =>
  date
    ? date.toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

const FALLBACK_LOCATION = {
  name: "Phnom Penh",
  latitude: 11.5564,
  longitude: 104.9282,
};

const locationFallback = (location) => {
  if (!location) return FALLBACK_LOCATION;
  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);
  const validLat = Number.isFinite(latitude) && latitude >= -90 && latitude <= 90;
  const validLng =
    Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
  if (!validLat || !validLng) return FALLBACK_LOCATION;
  return { name: location.name, latitude, longitude };
};

// Loads the products/locations/images/payments the listing UI needs and
// indexes them so bookings can be enriched in one pass.
export const loadCatalog = async (bookings = []) => {
  const productIds = [
    ...new Set(bookings.map((b) => String(b.productId)).filter(Boolean)),
  ];

  const [products, locations] = await Promise.all([
    safe(request(API_ENDPOINTS.products)),
    safe(request(API_ENDPOINTS.locations)),
  ]);
  const productList = unwrapList(products);
  const locationList = unwrapList(locations);

  const [images, payments] = await Promise.all([
    Promise.all(
      productIds.map((productId) =>
        safe(request(API_ENDPOINTS.productImages(productId)))
      )
    ),
    Promise.all(
      bookings.map((booking) =>
        safe(request(API_ENDPOINTS.paymentsByBooking(booking.id)))
      )
    ),
  ]);

  const productById = new Map(productList.map((p) => [String(p.id), p]));
  const locationById = new Map(locationList.map((l) => [String(l.id), l]));

  const imagesByProduct = {};
  productIds.forEach((productId, index) => {
    imagesByProduct[productId] = unwrapList(images[index] || []);
  });

  const paymentsByBooking = {};
  bookings.forEach((booking, index) => {
    paymentsByBooking[String(booking.id)] = unwrapList(payments[index] || []);
  });

  return { productById, locationById, imagesByProduct, paymentsByBooking };
};

// Maps a backend BookingResponseDTO (plus context) to the shape the UI uses.
export const mapBooking = (raw, context) => {
  const product = context.productById.get(String(raw.productId));
  const productImages = product
    ? context.imagesByProduct[String(raw.productId)] || []
    : [];
  const primaryImage =
    productImages.find((image) => image.isPrimary) || productImages[0];
  const location = locationFallback(
    product ? context.locationById.get(String(product.locationId)) : null
  );

  const payments = context.paymentsByBooking[String(raw.id)] || [];
  const paid = payments.some(
    (payment) => String(payment.paymentStatus || "").toUpperCase() === "PAID"
  );
  const payment = payments[0] || null;

  // A booking that has been paid for is confirmed — don't keep showing the
  // amber "Pending" badge alongside a blue "Paid" payment badge.
  const rawStatus = String(raw.status || "pending").toLowerCase();
  const confirmedStatus =
    paid && rawStatus === "pending" ? "confirmed" : rawStatus;
  const finishedStatus =
    confirmedStatus === "finished" ? "completed" : confirmedStatus;

  const pickup = toDate(raw.pickupDate);
  const returned = toDate(raw.returnDate);

  // Past rentals automatically complete once the return date has passed,
  // so the "Completed" tab stays populated (unless cancelled by a user).
  const isPast =
    returned != null &&
    !Number.isNaN(returned.getTime()) &&
    returned.getTime() < Date.now();
  const status =
    isPast && finishedStatus !== "cancelled" ? "completed" : finishedStatus;
  const days =
    pickup && returned
      ? Math.max(1, Math.round((returned - pickup) / 86400000))
      : 1;
  const pricePerDay = Number(product?.pricePerDay) || 0;
  const totalPrice = Number(raw.totalAmount) || 0;
  const rentalFee = pricePerDay * days;

  return {
    id: raw.id,
    productId: raw.productId,
    vehicleName: product
      ? `${product.brand || ""} ${product.model || ""}`.trim() ||
        product.name ||
        "Vehicle"
      : "Vehicle",
    image: primaryImage?.imageUrl || assets.car_image1,
    startDate: formatDate(pickup),
    endDate: formatDate(returned),
    pricePerDay,
    totalPrice,
    status,
    paymentStatus: paid ? "PAID" : "UNPAID",
    rentalFee,
    serviceFee: Math.max(0, totalPrice - rentalFee),
    paymentMethod: payment?.paymentMethod === "CASH" ? "Cash" : "Bakong KHQR",
    pickupLocation: location.name,
    pickupDate: formatDateTime(pickup),
    returnDate: formatDateTime(returned),
    latitude: location.latitude,
    longitude: location.longitude,
    contactPhone: raw.contactPhone,
    notes: raw.notes,
    payment,
    transactionId: payment?.transactionId,
  };
};

// GET /api/bookings filtered to the current user, enriched with product and
// payment data. Uses live data only — failures surface to the caller.
export const getMyBookings = async () => {
  const userId = getCachedUser().id;
  const data = await request(API_ENDPOINTS.bookings);
  const all = unwrapList(data);
  const mine = userId
    ? all.filter((booking) => String(booking.userId) === String(userId))
    : all;
  const context = await loadCatalog(mine);
  return mine.map((booking) => mapBooking(booking, context));
};

// GET /api/bookings/{id} — enriched the same way.
export const getBookingById = async (id) => {
  const data = await request(API_ENDPOINTS.bookingById(id));
  const raw = data?.data ?? data;
  if (!raw || raw.id === undefined) throw new Error("Booking not found");
  const context = await loadCatalog([raw]);
  return mapBooking(raw, context);
};

// No cancel endpoint exists on the backend yet (PUT /api/bookings/{id} has no
// status field), so cancellation is applied locally for now.
export const cancelBooking = async (id) => {
  await delay(300);
  return { id: Number(id), status: "cancelled" };
};