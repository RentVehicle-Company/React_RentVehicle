import { assets, dummyCarData } from "../assets/assets.js";

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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

const toDate = (value) => {
  if (!value) return new Date(0);
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return new Date(`${value}T00:00:00`);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
};

const deriveBookingStatus = (booking) => {
  if (booking.status === "cancelled") return "cancelled";
  const start = toDate(booking.startDate);
  const end = toDate(booking.endDate);
  const now = new Date();
  if (now < start) return "confirmed";
  if (now >= start && now <= end) return "active";
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

// TODO: Replace with Spring Boot API call — GET /api/bookings/my-bookings
export const getMyBookings = async () => {
  await delay(400);
  return mockBookings.map(enrichBooking);
};

// TODO: Replace with Spring Boot API call — GET /api/bookings/{id}
export const getBookingById = async (id) => {
  await delay(300);
  const booking = mockBookings.find((b) => b.id === Number(id));
  if (!booking) throw new Error("Booking not found");
  return enrichBooking(booking);
};

// TODO: Replace with Spring Boot API call — PUT /api/bookings/{id}/cancel
export const cancelBooking = async (id) => {
  await delay(500);
  const index = mockBookings.findIndex((b) => b.id === Number(id));
  if (index === -1) throw new Error("Booking not found");
  const updated = { ...mockBookings[index], status: "cancelled" };
  mockBookings = mockBookings.map((b, i) => (i === index ? updated : b));
  persistBookings(mockBookings);
  return enrichBooking(updated);
};

// TODO: Replace with Spring Boot API call — POST /api/bookings
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