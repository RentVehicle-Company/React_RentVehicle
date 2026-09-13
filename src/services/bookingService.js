import { assets } from "../assets/assets.js";

const mockBookings = [
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
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// TODO: Replace with Spring Boot API call — GET /api/bookings/my-bookings
export const getMyBookings = async () => {
  await delay(400);
  return mockBookings.map((booking) => ({ ...booking }));
};

// TODO: Replace with Spring Boot API call — GET /api/bookings/{id}
export const getBookingById = async (id) => {
  await delay(300);
  const booking = mockBookings.find((b) => b.id === Number(id));
  if (!booking) throw new Error("Booking not found");
  return { ...booking };
};

// TODO: Replace with Spring Boot API call — PUT /api/bookings/{id}/cancel
export const cancelBooking = async (id) => {
  await delay(500);
  const index = mockBookings.findIndex((b) => b.id === Number(id));
  if (index === -1) throw new Error("Booking not found");
  mockBookings[index] = { ...mockBookings[index], status: "cancelled" };
  return { ...mockBookings[index] };
};
