import { assets, dummyCarData } from "../assets/assets.js";
import { API_ENDPOINTS, request } from "./api.js";
import { getCachedUser } from "./userService.js";

// ---------------------------------------------------------------------------
// Live backend helpers
// ---------------------------------------------------------------------------

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const unwrapList = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

const safe = (promise) => promise.catch(() => []);

const toDate = (value) => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return new Date(`${value}T00:00:00`);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
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

// ---------------------------------------------------------------------------
// Mock bookings (used when the backend is unreachable)
// ---------------------------------------------------------------------------

const BOOKINGS_KEY = "rental_mock_bookings";

const seedBookings = [
  {
    id: 1,
    vehicleName: "BMW X5",
    image: assets.car_image1,
    startDate: "20 Aug 2026",
    endDate: "23 Aug 2026",
    pricePerDay: 300,
    totalPrice: 900,
    status: "confirmed",
    paymentStatus: "paid",
    rentalFee: 885,
    serviceFee: 15,
    paymentMethod: "Visa ending 4141",
    pickupLocation: "Phnom Penh",
    pickupDate: "20 Aug, 10:00 AM",
    returnDate: "23 Aug, 10:00 AM",
    latitude: 11.5564,
    longitude: 104.9282,
  },
  {
    id: 2,
    vehicleName: "Toyota Corolla",
    image: assets.car_image2,
    startDate: "24 Aug 2026",
    endDate: "27 Aug 2026",
    pricePerDay: 130,
    totalPrice: 390,
    status: "confirmed",
    paymentStatus: "unpaid",
    rentalFee: 380,
    serviceFee: 10,
    paymentMethod: "Visa ending 4141",
    pickupLocation: "Chicago",
    pickupDate: "24 Aug, 10:00 AM",
    returnDate: "27 Aug, 10:00 AM",
    latitude: 41.8781,
    longitude: -87.6298,
  },
  {
    id: 3,
    vehicleName: "Jeep Wrangler",
    image: assets.car_image3,
    startDate: "02 Sep 2026",
    endDate: "05 Sep 2026",
    pricePerDay: 200,
    totalPrice: 600,
    status: "confirmed",
    paymentStatus: "paid",
    rentalFee: 588,
    serviceFee: 12,
    paymentMethod: "Visa ending 4141",
    pickupLocation: "Los Angeles",
    pickupDate: "02 Sep, 10:00 AM",
    returnDate: "05 Sep, 10:00 AM",
    latitude: 34.0522,
    longitude: -118.2437,
  },
  {
    id: 4,
    vehicleName: "Ford Neo 6",
    image: assets.car_image4,
    startDate: "10 Jun 2026",
    endDate: "13 Jun 2026",
    pricePerDay: 209,
    totalPrice: 627,
    status: "completed",
    paymentStatus: "paid",
    rentalFee: 612,
    serviceFee: 15,
    paymentMethod: "Visa ending 4141",
    pickupLocation: "Houston",
    pickupDate: "10 Jun, 10:00 AM",
    returnDate: "13 Jun, 10:00 AM",
    latitude: 29.7604,
    longitude: -95.3698,
  },
  {
    id: 5,
    vehicleName: "Toyota Corolla",
    image: assets.car_image2,
    startDate: "04 Jul 2026",
    endDate: "08 Jul 2026",
    pricePerDay: 130,
    totalPrice: 520,
    status: "completed",
    paymentStatus: "paid",
    rentalFee: 510,
    serviceFee: 10,
    paymentMethod: "Visa ending 4141",
    pickupLocation: "Chicago",
    pickupDate: "04 Jul, 10:00 AM",
    returnDate: "08 Jul, 10:00 AM",
    latitude: 41.8781,
    longitude: -87.6298,
  },
  {
    id: 6,
    vehicleName: "Jeep Wrangler",
    image: assets.car_image3,
    startDate: "15 Jul 2026",
    endDate: "18 Jul 2026",
    pricePerDay: 200,
    totalPrice: 600,
    status: "cancelled",
    paymentStatus: "paid",
    rentalFee: 588,
    serviceFee: 12,
    paymentMethod: "Visa ending 4141",
    pickupLocation: "Los Angeles",
    pickupDate: "15 Jul, 10:00 AM",
    returnDate: "18 Jul, 10:00 AM",
    latitude: 34.0522,
    longitude: -118.2437,
  },
  {
    id: 7,
    vehicleName: "BMW X5",
    image: assets.car_image1,
    startDate: "28 Jul 2026",
    endDate: "30 Jul 2026",
    pricePerDay: 300,
    totalPrice: 600,
    status: "cancelled",
    paymentStatus: "unpaid",
    rentalFee: 585,
    serviceFee: 15,
    paymentMethod: "Visa ending 4141",
    pickupLocation: "New York",
    pickupDate: "28 Jul, 10:00 AM",
    returnDate: "30 Jul, 10:00 AM",
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    id: 8,
    vehicleName: "Ford Neo 6",
    image: assets.car_image4,
    startDate: "18 Sep 2026",
    endDate: "21 Sep 2026",
    pricePerDay: 209,
    totalPrice: 627,
    status: "confirmed",
    paymentStatus: "paid",
    rentalFee: 612,
    serviceFee: 15,
    paymentMethod: "Visa ending 4141",
    pickupLocation: "Houston",
    pickupDate: "18 Sep, 10:00 AM",
    returnDate: "21 Sep, 10:00 AM",
    latitude: 29.7604,
    longitude: -95.3698,
  },
  {
    id: 9,
    vehicleName: "BMW X5",
    image: assets.car_image1,
    startDate: "12 Sep 2026",
    endDate: "16 Sep 2026",
    pricePerDay: 300,
    totalPrice: 1260,
    status: "confirmed",
    paymentStatus: "paid",
    rentalFee: 1200,
    serviceFee: 60,
    paymentMethod: "Bakong KHQR",
    pickupLocation: "Phnom Penh",
    pickupDate: "12 Sep, 09:00 AM",
    returnDate: "16 Sep, 09:00 AM",
    latitude: 11.5564,
    longitude: 104.9282,
    isActiveDemo: true,
  },
];

const readBookings = () => {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    // ignore storage failures
  }
  return seedBookings.map((booking) => ({ ...booking }));
};

const persistBookings = (list) => {
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
  } catch {
    // Stay in-memory only when storage is unavailable.
  }
};

let mockBookings = readBookings();

const normalizeName = (value) =>
  String(value || "").replace(/\s+/g, " ").trim().toLowerCase();

const specLookup = (vehicleName) =>
  dummyCarData.find(
    (car) =>
      normalizeName(`${car.brand} ${car.model}`) === normalizeName(vehicleName)
  ) || null;

const deriveBookingStatus = (booking) => {
  if (booking.status === "cancelled") return "cancelled";
  const start = toDate(booking.startDate);
  const end = toDate(booking.endDate);
  const now = Date.now();
  const startTime = start == null ? 0 : start.getTime();
  const endTime = end == null ? 0 : end.getTime();
  if (now < startTime) return "confirmed";
  if (now >= startTime && now <= endTime) return "active";
  return "completed";
};

const enrichBooking = (booking) => {
  const car = specLookup(booking.vehicleName);
  return {
    ...booking,
    status: deriveBookingStatus(booking),
    vehicleSpecs: car
      ? {
          category: car.category,
          transmission: car.transmission,
          fuel_type: car.fuel_type,
          seating_capacity: car.seating_capacity,
          year: car.year,
        }
      : null,
  };
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

// GET /api/bookings filtered to the current user, enriched with product and
// payment data. Falls back to local mocks when the backend is unreachable.
export const getMyBookings = async () => {
  const data = await request(API_ENDPOINTS.bookings);

  if (data == null) {
    await delay(400);
    return mockBookings.map(enrichBooking);
  }

  try {
    const userId = getCachedUser().id;
    const all = unwrapList(data);
    const mine = userId
      ? all.filter((booking) => String(booking.userId) === String(userId))
      : all;
    const context = await loadCatalog(mine);
    return mine.map((booking) => mapBooking(booking, context));
  } catch (error) {
    if (error?.status || !(error instanceof TypeError)) throw error;
    await delay(400);
    return mockBookings.map(enrichBooking);
  }
};

// GET /api/bookings/{id} — enriched the same way, with mock fallback.
export const getBookingById = async (id) => {
  const data = await request(API_ENDPOINTS.bookingById(id));

  if (data == null) {
    await delay(300);
    const booking = mockBookings.find((b) => b.id === Number(id));
    if (!booking) throw new Error("Booking not found");
    return enrichBooking(booking);
  }

  try {
    const raw = data?.data ?? data;
    if (!raw || raw.id === undefined) throw new Error("Booking not found");
    const context = await loadCatalog([raw]);
    return mapBooking(raw, context);
  } catch (error) {
    if (error?.status || !(error instanceof TypeError)) throw error;
    const booking = mockBookings.find((b) => b.id === Number(id));
    if (!booking) throw new Error("Booking not found");
    return enrichBooking(booking);
  }
};

// No cancel endpoint exists on the backend yet (PUT /api/bookings/{id} has no
// status field), so cancellation is applied locally for now.
export const cancelBooking = async (id) => {
  await delay(300);
  const index = mockBookings.findIndex((b) => b.id === Number(id));
  if (index === -1) return { id: Number(id), status: "cancelled" };
  const updated = { ...mockBookings[index], status: "cancelled" };
  mockBookings = mockBookings.map((b, i) => (i === index ? updated : b));
  persistBookings(mockBookings);
  try {
    return enrichBooking(updated);
  } catch {
    return { ...updated };
  }
};

const toDisplayLabel = (value) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return value;
};

// Creates a booking locally. Falls back to a mock record when the backend is
// unreachable (TODO: POST /api/bookings).
export const createBooking = async (data = {}) => {
  await delay(250);
  const nextId =
    mockBookings.reduce((max, b) => Math.max(max, Number(b.id) || 0), 0) + 1;
  const booking = {
    id: nextId,
    vehicleName: data.vehicleName,
    image: data.image,
    startDate: toDisplayLabel(data.startDate || data.pickupDate),
    endDate: toDisplayLabel(data.endDate || data.returnDate),
    pickupDate: data.pickupDate || data.startDate,
    returnDate: data.returnDate || data.endDate,
    pickupLocation: data.pickupLocation || "Phnom Penh",
    deliveryMethod: data.deliveryMethod || "pickup",
    deliveryFee: Number(data.deliveryFee) || 0,
    deliveryCity: data.deliveryCity || null,
    deliveryDistrict: data.deliveryDistrict || null,
    deliveryAddress: data.deliveryAddress || null,
    pricePerDay: data.pricePerDay,
    rentalFee: data.rentalFee,
    serviceFee: data.serviceFee,
    totalPrice: data.totalPrice ?? data.rentalFee + (data.serviceFee || 0),
    addOns: data.addOns || [],
    duration: data.duration,
    status: "confirmed",
    paymentStatus: data.paymentStatus || "paid",
    paymentMethod: data.paymentMethod || "Online",
    latitude: 11.5564,
    longitude: 104.9282,
  };
  mockBookings = [booking, ...mockBookings];
  persistBookings(mockBookings);
  return enrichBooking(booking);
};