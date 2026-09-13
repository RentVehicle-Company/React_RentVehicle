import { assets } from "../assets/assets.js";
import { API_ENDPOINTS, request } from "./api.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock fleet used when the Spring Boot backend is unreachable.
// TODO: Replace with real per-vehicle images once the backend provides them.
export const mockVehicles = [
  {
    id: 1,
    brand: "Toyota",
    model: "Supra",
    image: assets.main_car,
    year: 2022,
    category: "Sports Car",
    seating_capacity: 2,
    fuel_type: "Petrol",
    transmission: "Automatic",
    price_per_day: 150,
    location: "Phnom Penh",
    stock_left: 2,
    description:
      "Iconic Japanese sports coupe with a turbocharged straight-six and sharp handling.",
    is_available: true,
    created_at: "2025-01-10T08:00:00.000Z",
  },
  {
    id: 2,
    brand: "Ford",
    model: "Mustang",
    image: assets.car_image2,
    year: 2023,
    category: "Sports Car",
    seating_capacity: 4,
    fuel_type: "Petrol",
    transmission: "Manual",
    price_per_day: 140,
    location: "Phnom Penh",
    stock_left: 1,
    description:
      "American muscle legend with a roaring V8 and unmistakable styling.",
    is_available: true,
    created_at: "2025-01-11T08:00:00.000Z",
  },
  {
    id: 3,
    brand: "Range Rover",
    model: "Sport",
    image: assets.car_image3,
    year: 2024,
    category: "Luxury SUV",
    seating_capacity: 5,
    fuel_type: "Diesel",
    transmission: "Automatic",
    price_per_day: 220,
    location: "Phnom Penh",
    description:
      "Luxury British SUV that blends off-road capability with premium comfort.",
    is_available: true,
    created_at: "2025-01-12T08:00:00.000Z",
  },
  {
    id: 4,
    brand: "Porsche",
    model: "911 Carrera",
    image: assets.car_image2,
    year: 2022,
    category: "Sports Car",
    seating_capacity: 2,
    fuel_type: "Petrol",
    transmission: "Automatic",
    price_per_day: 260,
    location: "Phnom Penh",
    stock_left: 1,
    description:
      "Timeless rear-engine sports car with precision engineering and effortless poise.",
    is_available: true,
    created_at: "2025-01-13T08:00:00.000Z",
  },
  {
    id: 5,
    brand: "Audi",
    model: "R8",
    image: assets.car_image4,
    year: 2022,
    category: "Supercar",
    seating_capacity: 2,
    fuel_type: "Petrol",
    transmission: "Semi-Automatic",
    price_per_day: 300,
    location: "Siem Reap",
    description:
      "Mid-engine V10 supercar with quattro grip and head-turning looks.",
    is_available: true,
    created_at: "2025-01-14T08:00:00.000Z",
  },
  {
    id: 6,
    brand: "Tesla",
    model: "Model 3",
    image: assets.car_image2,
    year: 2023,
    category: "Electric",
    seating_capacity: 4,
    fuel_type: "Electric",
    transmission: "Automatic",
    price_per_day: 120,
    location: "Siem Reap",
    description:
      "Sleek all-electric sedan with instant torque and advanced autopilot features.",
    is_available: true,
    created_at: "2025-01-15T08:00:00.000Z",
  },
  {
    id: 7,
    brand: "BMW",
    model: "X5",
    image: assets.car_image3,
    year: 2023,
    category: "SUV",
    seating_capacity: 4,
    fuel_type: "Hybrid",
    transmission: "Semi-Automatic",
    price_per_day: 300,
    location: "Siem Reap",
    description:
      "Mid-size luxury SUV offering a refined cabin and confident highway cruising.",
    is_available: true,
    created_at: "2025-01-16T08:00:00.000Z",
  },
  {
    id: 8,
    brand: "Toyota",
    model: "Corolla",
    image: assets.car_image4,
    year: 2021,
    category: "Sedan",
    seating_capacity: 4,
    fuel_type: "Diesel",
    transmission: "Manual",
    price_per_day: 130,
    location: "Siem Reap",
    description:
      "Reliable and fuel-efficient sedan, perfect for city and long-distance trips.",
    is_available: true,
    created_at: "2025-01-17T08:00:00.000Z",
  },
  {
    id: 9,
    brand: "Jeep",
    model: "Wrangler",
    image: assets.banner_car_image,
    year: 2023,
    category: "SUV",
    seating_capacity: 4,
    fuel_type: "Hybrid",
    transmission: "Automatic",
    price_per_day: 200,
    location: "Sihanoukville",
    description:
      "Go-anywhere off-road icon, ideal for the rougher coastal roads.",
    is_available: true,
    created_at: "2025-01-18T08:00:00.000Z",
  },
  {
    id: 10,
    brand: "Ford",
    model: "Neo 6",
    image: assets.car_image2,
    year: 2022,
    category: "Sedan",
    seating_capacity: 2,
    fuel_type: "Diesel",
    transmission: "Semi-Automatic",
    price_per_day: 209,
    location: "Sihanoukville",
    description:
      "Sleek mid-size sedan with a comfortable ride and modern tech.",
    is_available: true,
    created_at: "2025-01-19T08:00:00.000Z",
  },
  {
    id: 11,
    brand: "Mercedes-Benz",
    model: "G63 AMG",
    image: assets.car_image3,
    year: 2024,
    category: "Luxury SUV",
    seating_capacity: 5,
    fuel_type: "Petrol",
    transmission: "Automatic",
    price_per_day: 320,
    location: "Sihanoukville",
    description:
      "Boxy luxury SUV with a hand-built V8 and imposing street presence.",
    is_available: true,
    created_at: "2025-01-20T08:00:00.000Z",
  },
  {
    id: 12,
    brand: "Honda",
    model: "Civic",
    image: assets.car_image4,
    year: 2022,
    category: "Sedan",
    seating_capacity: 4,
    fuel_type: "Petrol",
    transmission: "Manual",
    price_per_day: 95,
    location: "Sihanoukville",
    stock_left: 1,
    description:
      "Practical and agile compact sedan, great value for daily rentals.",
    is_available: true,
    created_at: "2025-01-21T08:00:00.000Z",
  },
  {
    id: 13,
    brand: "Kia",
    model: "Picanto",
    image: assets.car_image1,
    year: 2023,
    category: "Hatchback",
    seating_capacity: 4,
    fuel_type: "Petrol",
    transmission: "Manual",
    price_per_day: 45,
    location: "Phnom Penh",
    description:
      "Compact city hatchback that is easy to park and light on the wallet.",
    is_available: true,
    created_at: "2025-01-22T08:00:00.000Z",
  },
  {
    id: 14,
    brand: "Toyota",
    model: "RAV4",
    image: assets.car_image3,
    year: 2023,
    category: "SUV",
    seating_capacity: 5,
    fuel_type: "Hybrid",
    transmission: "Automatic",
    price_per_day: 160,
    location: "Phnom Penh",
    description:
      "Popular compact SUV that balances efficiency with everyday practicality.",
    is_available: true,
    created_at: "2025-01-23T08:00:00.000Z",
  },
  {
    id: 15,
    brand: "Nissan",
    model: "GT-R",
    image: assets.car_image4,
    year: 2022,
    category: "Sports Car",
    seating_capacity: 2,
    fuel_type: "Petrol",
    transmission: "Semi-Automatic",
    price_per_day: 280,
    location: "Phnom Penh",
    description:
      "The supercar slayer — twin-turbo V6, all-wheel drive and legendary launch control.",
    is_available: true,
    created_at: "2025-01-24T08:00:00.000Z",
  },
];

export const featuredVehicles = [1, 15, 4]
  .map((id) => mockVehicles.find((car) => car.id === id))
  .filter(Boolean);

const unwrapList = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

export const getVehicles = async () => {
  try {
    const data = await request(API_ENDPOINTS.vehicles);
    return unwrapList(data);
  } catch {
    // Backend offline -> mock fallback so the UI keeps working.
    await delay(400);
    return mockVehicles.map((car) => ({ ...car }));
  }
};

export const getVehicleById = async (id) => {
  try {
    const data = await request(API_ENDPOINTS.vehicleById(id));
    const vehicle = data?.data ?? data;
    if (!vehicle || vehicle.id === undefined) {
      throw new Error("Vehicle not found");
    }
    return vehicle;
  } catch (error) {
    // A real server error (e.g. 404) should surface to the page.
    if (error?.status || !(error instanceof TypeError)) throw error;

    // Backend offline -> mock fallback.
    await delay(300);
    const vehicle = mockVehicles.find((car) => car.id === Number(id));
    if (!vehicle) throw new Error("Vehicle not found");
    return { ...vehicle };
  }
};