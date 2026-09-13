import { assets } from "../assets/assets.js";
import { API_ENDPOINTS, request } from "./api.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock fleet used when the Spring Boot backend is unreachable.
// TODO: Replace with real per-vehicle images once the backend provides them.
const baseVehicles = [
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

// Per-category performance baseline used to stamp unique specs on every car.
const RICH_SPECS = {
  "Sports Car": {
    engine: "3.0L Twin-Turbo Inline-6",
    topSpeed: 290,
    acceleration: 4.3,
    horsepower: 430,
    drive: "RWD",
  },
  Supercar: {
    engine: "5.2L Naturally Aspirated V10",
    topSpeed: 335,
    acceleration: 3.2,
    horsepower: 570,
    drive: "AWD",
  },
  "Luxury SUV": {
    engine: "4.0L Twin-Turbo V8",
    topSpeed: 260,
    acceleration: 5.6,
    horsepower: 550,
    drive: "AWD",
  },
  SUV: {
    engine: "2.0L Turbocharged I4",
    topSpeed: 215,
    acceleration: 7.4,
    horsepower: 248,
    drive: "AWD",
  },
  Sedan: {
    engine: "2.5L Naturally Aspirated I4",
    topSpeed: 205,
    acceleration: 9.2,
    horsepower: 184,
    drive: "FWD",
  },
  Hatchback: {
    engine: "1.2L Inline-3",
    topSpeed: 175,
    acceleration: 10.6,
    horsepower: 84,
    drive: "FWD",
  },
  Electric: {
    engine: "Dual-Motor Electric AWD",
    topSpeed: 230,
    acceleration: 5.5,
    horsepower: 455,
    drive: "AWD",
  },
  Truck: {
    engine: "3.5L EcoBoost V6",
    topSpeed: 185,
    acceleration: 8.2,
    horsepower: 325,
    drive: "4WD",
  },
};

const RICH_FEATURES = [
  "Bluetooth Audio",
  "GPS Navigation",
  "Leather Seats",
  "Cruise Control",
  "Reverse Camera",
  "Apple CarPlay",
  "Keyless Entry",
  "Heated Seats",
  "Sunroof",
  "360° Parking Sensors",
  "Adaptive Cruise Control",
  "Wireless Charging",
];

const RICH_IMAGE_POOL = [
  assets.car_image1,
  assets.car_image2,
  assets.car_image3,
  assets.car_image4,
  assets.main_car,
  assets.banner_car_image,
];

// Stamps each car with its own images gallery, full spec sheet and feature
// list, derived deterministically so every id renders rich detail data.
const enrichVehicle = (vehicle) => {
  const profile = RICH_SPECS[vehicle.category] ?? RICH_SPECS.Sedan;
  const offset = (vehicle.id % 5) - 2;

  const specs = {
    engine: profile.engine,
    topSpeed: profile.topSpeed + offset * 8,
    acceleration: Math.max(
      2.5,
      Math.round((profile.acceleration + offset * 0.12) * 10) / 10
    ),
    horsepower: profile.horsepower + offset * 14,
    drive: profile.drive,
  };

  const gallery = [];
  if (vehicle.image) gallery.push(vehicle.image);
  for (let i = 0; gallery.length < 5; i++) {
    const src = RICH_IMAGE_POOL[(vehicle.id * 3 + i * 5) % RICH_IMAGE_POOL.length];
    if (!gallery.includes(src)) gallery.push(src);
  }
  const images = gallery.slice(0, 6);

  const start = vehicle.id % RICH_FEATURES.length;
  const features = [
    ...RICH_FEATURES.slice(start),
    ...RICH_FEATURES.slice(0, start),
  ].slice(0, 8);

  return { ...vehicle, images, specs, features };
};

export const mockVehicles = baseVehicles.map(enrichVehicle);

export const featuredVehicles = [1, 15, 4]
  .map((id) => mockVehicles.find((car) => String(car.id) === String(id)))
  .filter(Boolean);

// ---------------------------------------------------------------------------
// Motorbike & bicycle fleet. No dedicated image assets exist yet, so each
// type gets lightweight inline-SVG silhouettes (one per accent colour) that
// are used for both the card photo and the gallery.
// ---------------------------------------------------------------------------

export const MOTO_CATEGORIES = [
  "Scooter",
  "Underbone",
  "Touring",
  "Sportbike",
  "Cruiser",
];

export const BIKE_CATEGORIES = [
  "Mountain Bike",
  "Road Bike",
  "Hybrid / City Bike",
  "E-Bike / Electric",
];

export const isMotorbike = (vehicle) => MOTO_CATEGORIES.includes(vehicle?.category);
export const isBicycle = (vehicle) => BIKE_CATEGORIES.includes(vehicle?.category);
export const isAutomobile = (vehicle) => !isMotorbike(vehicle) && !isBicycle(vehicle);

const svgToUri = (svg) =>
  `data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, " "))}`;

const MOTO_SILHOUETTE = (accent) =>
  svgToUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${accent}"/>
        <stop offset="1" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="#0b1120"/>
    <circle cx="230" cy="368" r="92" fill="#0b1220" stroke="#334155" stroke-width="9"/>
    <circle cx="230" cy="368" r="52" fill="#cbd5e1"/>
    <circle cx="575" cy="368" r="92" fill="#0b1220" stroke="#334155" stroke-width="9"/>
    <circle cx="575" cy="368" r="52" fill="#cbd5e1"/>
    <path d="M250 300 Q 335 240 465 248 L 520 208 Q 552 214 585 220 L 540 300 Q 505 330 450 305 Z" fill="#e2e8f0"/>
    <rect x="305" y="165" width="125" height="95" rx="20" fill="url(#g)"/>
    <rect x="428" y="148" width="88" height="46" rx="12" fill="#334155"/>
    <line x1="400" y1="195" x2="400" y2="118" stroke="#94a3b8" stroke-width="22" stroke-linecap="round"/>
    <circle cx="412" cy="110" r="36" fill="#0b1220"/>
    <circle cx="412" cy="110" r="22" fill="#e2e8f0"/>
    <circle cx="398" cy="298" r="10" fill="#334155"/>
  </svg>`);

const BIKE_SILHOUETTE = (accent) =>
  svgToUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${accent}"/>
        <stop offset="1" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="#0b1120"/>
    <circle cx="215" cy="370" r="88" fill="none" stroke="#334155" stroke-width="12"/>
    <circle cx="215" cy="370" r="46" fill="#cbd5e1"/>
    <circle cx="588" cy="370" r="88" fill="none" stroke="#334155" stroke-width="12"/>
    <circle cx="588" cy="370" r="46" fill="#cbd5e1"/>
    <path d="M215 370 L 400 370 L 335 248 L 255 318 Z" fill="none" stroke="#e2e8f0" stroke-width="15" stroke-linejoin="round"/>
    <line x1="400" y1="370" x2="335" y2="248" stroke="#e2e8f0" stroke-width="15"/>
    <circle cx="400" cy="370" r="22" fill="#94a3b8"/>
    <rect x="300" y="65" width="14" height="82" rx="7" fill="url(#g)"/>
    <rect x="258" y="96" width="96" height="14" rx="7" fill="#e2e8f0"/>
    <path d="M255 318 Q 214 178 138 176" fill="none" stroke="#94a3b8" stroke-width="13" stroke-linecap="round"/>
    <rect x="435" y="332" width="168" height="14" rx="7" fill="url(#g)"/>
    <rect x="443" y="272" width="16" height="64" rx="8" fill="#334155"/>
  </svg>`);

const MOTO_IMAGE_POOL = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#0891b2"].map(
  MOTO_SILHOUETTE
);
const BIKE_IMAGE_POOL = ["#0ea5e9", "#84cc16", "#f59e0b", "#d946ef", "#10b981", "#f43f5e"].map(
  BIKE_SILHOUETTE
);

const motoBaseVehicles = [
  {
    id: 101,
    brand: "Honda",
    model: "Click 125i",
    image: MOTO_IMAGE_POOL[0],
    year: 2023,
    category: "Scooter",
    seating_capacity: 2,
    fuel_type: "Petrol",
    transmission: "Automatic (CVT)",
    engine_cc: 125,
    fuel_efficiency: 55,
    top_speed: 95,
    price_per_day: 15,
    location: "Phnom Penh",
    description:
      "The city's favourite scooter — nimble, economical and dead simple to ride.",
    is_available: true,
  },
  {
    id: 102,
    brand: "Yamaha",
    model: "PCX 160",
    image: MOTO_IMAGE_POOL[1],
    year: 2024,
    category: "Scooter",
    seating_capacity: 2,
    fuel_type: "Petrol",
    transmission: "Automatic (CVT)",
    engine_cc: 160,
    fuel_efficiency: 48,
    top_speed: 120,
    price_per_day: 22,
    location: "Phnom Penh",
    description:
      "Premium maxi-scooter with a roomy seat, big underseat storage and smooth highway legs.",
    is_available: true,
  },
  {
    id: 103,
    brand: "Honda",
    model: "Wave 110",
    image: MOTO_IMAGE_POOL[2],
    year: 2022,
    category: "Underbone",
    seating_capacity: 2,
    fuel_type: "Petrol",
    transmission: "4-Speed Manual",
    engine_cc: 110,
    fuel_efficiency: 62,
    top_speed: 100,
    price_per_day: 10,
    location: "Sihanoukville",
    description:
      "Legendary underbone workhorse — incredible fuel economy and bulletproof reliability.",
    is_available: true,
  },
  {
    id: 104,
    brand: "Vespa",
    model: "Primavera 150",
    image: MOTO_IMAGE_POOL[3],
    year: 2023,
    category: "Scooter",
    seating_capacity: 2,
    fuel_type: "Petrol",
    transmission: "Automatic (CVT)",
    engine_cc: 155,
    fuel_efficiency: 42,
    top_speed: 118,
    price_per_day: 28,
    location: "Siem Reap",
    description:
      "Timeless Italian style with a steel monocoque body and effortless city manners.",
    is_available: true,
  },
  {
    id: 105,
    brand: "Ducati",
    model: "Monster 821",
    image: MOTO_IMAGE_POOL[4],
    year: 2022,
    category: "Cruiser",
    seating_capacity: 2,
    fuel_type: "Petrol",
    transmission: "6-Speed Manual",
    engine_cc: 821,
    fuel_efficiency: 21,
    top_speed: 225,
    price_per_day: 55,
    location: "Phnom Penh",
    description:
      "Naked Italian roadster with a punchy L-twin and light, flickable handling.",
    is_available: true,
  },
  {
    id: 106,
    brand: "BMW",
    model: "R 1250 GS",
    image: MOTO_IMAGE_POOL[5],
    year: 2023,
    category: "Touring",
    seating_capacity: 2,
    fuel_type: "Petrol",
    transmission: "6-Speed Manual",
    engine_cc: 1254,
    fuel_efficiency: 19,
    top_speed: 215,
    price_per_day: 75,
    location: "Siem Reap",
    description:
      "The ultimate adventure tourer — shaft drive, boxer twin and endless range.",
    is_available: true,
  },
  {
    id: 107,
    brand: "Kawasaki",
    model: "Ninja 400",
    image: MOTO_IMAGE_POOL[0],
    year: 2023,
    category: "Sportbike",
    seating_capacity: 2,
    fuel_type: "Petrol",
    transmission: "6-Speed Manual",
    engine_cc: 399,
    fuel_efficiency: 28,
    top_speed: 190,
    price_per_day: 45,
    location: "Sihanoukville",
    description:
      "Lightweight supersport with a revvy twin and a friendly power band for A2 riders.",
    is_available: true,
  },
  {
    id: 108,
    brand: "Yamaha",
    model: "XSR 155",
    image: MOTO_IMAGE_POOL[1],
    year: 2022,
    category: "Cruiser",
    seating_capacity: 2,
    fuel_type: "Petrol",
    transmission: "5-Speed Manual",
    engine_cc: 155,
    fuel_efficiency: 44,
    top_speed: 135,
    price_per_day: 18,
    location: "Kampot",
    description:
      "Retro-styled café racer with modern running gear — perfect for Kampot back roads.",
    is_available: true,
  },
];

const bikeBaseVehicles = [
  {
    id: 201,
    brand: "Trek",
    model: "Marlin 7",
    image: BIKE_IMAGE_POOL[0],
    year: 2024,
    category: "Mountain Bike",
    seating_capacity: 1,
    fuel_type: "Manual",
    gears: "21-Speed",
    frame_material: "Aluminum",
    wheel_size: "29 inch",
    price_per_day: 12,
    location: "Siem Reap",
    description:
      "Versatile hardtail trail bike with a suspension fork and wide-range gears.",
    is_available: true,
  },
  {
    id: 202,
    brand: "Giant",
    model: "Escape 3",
    image: BIKE_IMAGE_POOL[1],
    year: 2023,
    category: "Hybrid / City Bike",
    seating_capacity: 1,
    fuel_type: "Manual",
    gears: "21-Speed",
    frame_material: "Aluminum",
    wheel_size: "28 inch",
    price_per_day: 9,
    location: "Phnom Penh",
    description:
      "Comfortable, upright city bike that eats up potholed streets and Sunday rides.",
    is_available: true,
  },
  {
    id: 203,
    brand: "Specialized",
    model: "Allez",
    image: BIKE_IMAGE_POOL[2],
    year: 2023,
    category: "Road Bike",
    seating_capacity: 1,
    fuel_type: "Manual",
    gears: "16-Speed",
    frame_material: "Aluminum",
    wheel_size: "28 inch",
    price_per_day: 14,
    location: "Phnom Penh",
    description:
      "A snappy aero road bike built for fast club rides and smooth tarmac.",
    is_available: true,
  },
  {
    id: 204,
    brand: "Xiaomi",
    model: "Electric City E-Bike",
    image: BIKE_IMAGE_POOL[3],
    year: 2024,
    category: "E-Bike / Electric",
    seating_capacity: 1,
    fuel_type: "Electric",
    gears: "Single-Speed",
    frame_material: "Aluminum",
    wheel_size: "26 inch",
    price_per_day: 18,
    location: "Sihanoukville",
    description:
      "Pedal-assist e-bike with a 30 km range — zip around town without breaking a sweat.",
    is_available: true,
  },
  {
    id: 205,
    brand: "Cannondale",
    model: "Trail 8",
    image: BIKE_IMAGE_POOL[4],
    year: 2022,
    category: "Mountain Bike",
    seating_capacity: 1,
    fuel_type: "Manual",
    gears: "18-Speed",
    frame_material: "Aluminum",
    wheel_size: "27.5 inch",
    price_per_day: 11,
    location: "Sihanoukville",
    description:
      "Agile trail bike with confident braking and yes, the famous Lefty shrugged.",
    is_available: true,
  },
  {
    id: 206,
    brand: "VanMoof",
    model: "S3",
    image: BIKE_IMAGE_POOL[5],
    year: 2023,
    category: "E-Bike / Electric",
    seating_capacity: 1,
    fuel_type: "Electric",
    gears: "Single-Speed",
    frame_material: "Steel",
    wheel_size: "26 inch",
    price_per_day: 25,
    location: "Siem Reap",
    description:
      "Sleek Tesla-like e-bike with integrated lights, anti-theft and app tracking.",
    is_available: true,
  },
];

const MOTO_SPECS_FALLBACK = {
  Scooter: {
    displacementCc: 125,
    transmission: "Automatic (CVT)",
    fuelEfficiency: 50,
    topSpeed: 110,
    horsepower: 11,
    acceleration: 12.5,
  },
  Underbone: {
    displacementCc: 110,
    transmission: "4-Speed Manual",
    fuelEfficiency: 62,
    topSpeed: 95,
    horsepower: 8,
    acceleration: 14,
  },
  Touring: {
    displacementCc: 1254,
    transmission: "6-Speed Manual",
    fuelEfficiency: 19,
    topSpeed: 215,
    horsepower: 136,
    acceleration: 3.9,
  },
  Sportbike: {
    displacementCc: 399,
    transmission: "6-Speed Manual",
    fuelEfficiency: 28,
    topSpeed: 190,
    horsepower: 45,
    acceleration: 4.6,
  },
  Cruiser: {
    displacementCc: 155,
    transmission: "5-Speed Manual",
    fuelEfficiency: 44,
    topSpeed: 135,
    horsepower: 17,
    acceleration: 7.5,
  },
};

const BIKE_SPECS_FALLBACK = {
  "Mountain Bike": {
    frame: "Aluminum",
    gears: "21-Speed",
    driveType: "Manual",
    wheelSize: "29 inch",
  },
  "Road Bike": {
    frame: "Aluminum",
    gears: "16-Speed",
    driveType: "Manual",
    wheelSize: "28 inch",
  },
  "Hybrid / City Bike": {
    frame: "Aluminum",
    gears: "21-Speed",
    driveType: "Manual",
    wheelSize: "28 inch",
  },
  "E-Bike / Electric": {
    frame: "Aluminum",
    gears: "Single-Speed",
    driveType: "Electric",
    wheelSize: "26 inch",
  },
};

const MOTO_FEATURES = [
  "Helmet Included",
  "Top Case / Storage",
  "Phone Mount",
  "USB Charger",
  "Rain Cover",
  "Rear Grab Rail",
  "Hi-Vis Safety Jacket",
  "24/7 Roadside Assistance",
];

const BIKE_FEATURES = [
  "Helmet Included",
  "Bike Lock",
  "Front Basket",
  "Rear Rack",
  "Lights & Reflectors",
  "Kickstand",
  "Air Pump",
  "24/7 Roadside Assistance",
];

const enrichFleet = (vehicle, specs, featurePool, imagePool) => {
  const gallery = [];
  if (vehicle.image) gallery.push(vehicle.image);
  for (let i = 0; gallery.length < 5; i++) {
    const src = imagePool[(vehicle.id * 3 + i * 5) % imagePool.length];
    if (!gallery.includes(src)) gallery.push(src);
  }
  const start = ((vehicle.id % featurePool.length) + featurePool.length) % featurePool.length;
  const features = [
    ...featurePool.slice(start),
    ...featurePool.slice(0, start),
  ].slice(0, 8);
  return { ...vehicle, specs, features, images: gallery.slice(0, 6) };
};

const enrichMotorbike = (vehicle) => {
  const profile = MOTO_SPECS_FALLBACK[vehicle.category] ?? MOTO_SPECS_FALLBACK.Scooter;
  const offset = (vehicle.id % 5) - 2;
  const specs = {
    engine: `${vehicle.engine_cc ?? profile.displacementCc}cc ${vehicle.transmission?.toLowerCase().includes("automatic") ? "CVT Engine" : "Engine"}`,
    topSpeed: vehicle.top_speed ?? profile.topSpeed,
    acceleration: Math.max(3, Math.round((profile.acceleration + offset * 0.2) * 10) / 10),
    horsepower: profile.horsepower + offset * 2,
    drive: vehicle.transmission?.toLowerCase().includes("automatic") ? "CVT" : "Chain Drive",
    displacementCc: vehicle.engine_cc ?? profile.displacementCc,
    transmission: vehicle.transmission ?? profile.transmission,
    fuelEfficiency: vehicle.fuel_efficiency ?? profile.fuelEfficiency,
  };
  return enrichFleet(vehicle, specs, MOTO_FEATURES, MOTO_IMAGE_POOL);
};

const enrichBicycle = (vehicle) => {
  const profile =
    BIKE_SPECS_FALLBACK[vehicle.category] ?? BIKE_SPECS_FALLBACK["Mountain Bike"];
  const specs = {
    frame: vehicle.frame_material ?? profile.frame,
    gears: vehicle.gears ?? profile.gears,
    driveType: vehicle.fuel_type ?? profile.driveType,
    wheelSize: vehicle.wheel_size ?? profile.wheelSize,
    topSpeed: vehicle.fuel_type === "Electric" ? 25 : 18,
    acceleration: 4.2,
    horsepower: vehicle.fuel_type === "Electric" ? 0.6 : 0.3,
  };
  return enrichFleet(vehicle, specs, BIKE_FEATURES, BIKE_IMAGE_POOL);
};

export const mockMotorbikes = motoBaseVehicles.map(enrichMotorbike);
export const mockBicycles = bikeBaseVehicles.map(enrichBicycle);

export const ALL_MOCK_VEHICLES = [
  ...mockVehicles,
  ...mockMotorbikes,
  ...mockBicycles,
];

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

export const getMotorbikes = async () => {
  try {
    const data = await request(API_ENDPOINTS.motorbikes);
    return unwrapList(data);
  } catch {
    await delay(400);
    return mockMotorbikes.map((moto) => ({ ...moto }));
  }
};

export const getBicycles = async () => {
  try {
    const data = await request(API_ENDPOINTS.bicycles);
    return unwrapList(data);
  } catch {
    await delay(400);
    return mockBicycles.map((bike) => ({ ...bike }));
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
  } catch {
    // Any backend failure (offline, 404 for a mock-only id, malformed body)
    // falls back to the matching mock vehicle so the id always resolves.
    await delay(300);
    const vehicle = ALL_MOCK_VEHICLES.find(
      (item) => String(item.id) === String(id)
    );
    if (!vehicle) throw new Error("Vehicle not found");
    return { ...vehicle };
  }
};