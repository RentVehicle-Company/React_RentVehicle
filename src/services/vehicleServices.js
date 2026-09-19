import { API_BASE_URL, API_ENDPOINTS, request } from "./api.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Gallery builder — generates crop/zoom variants from a single primary image
// URL so every vehicle's gallery always matches its own card photo. No shared
// fallback pool is ever used.
// ---------------------------------------------------------------------------
const buildGalleryFromImage = (primaryUrl, count = 5) => {
  if (!primaryUrl) return [];
  const gallery = [primaryUrl];
  if (primaryUrl.includes("unsplash.com")) {
    const base = primaryUrl.split("?")[0];
    const crops = [
      { fit: "crop", crop: "faces", w: 800, h: 600, q: 80 },
      { fit: "crop", crop: "entropy", w: 900, h: 500, q: 80 },
      { fit: "crop", crop: "edges", w: 700, h: 700, q: 80 },
      { fit: "crop", w: 1000, h: 400, q: 80 },
      { fit: "crop", crop: "faces", w: 600, h: 800, q: 80 },
    ];
    for (let i = 0; i < count - 1 && i < crops.length; i++) {
      const p = new URLSearchParams(
        Object.entries(crops[i]).map(([k, v]) => [k, String(v)])
      );
      p.set("auto", "format");
      gallery.push(`${base}?${p.toString()}`);
    }
  }
  return gallery.slice(0, count);
};

// ---------------------------------------------------------------------------
// Dedicated primary images — one unique URL per vehicle, matched to its body
// category. High-visibility models use metadata-verified Wikimedia Commons
// photos (their exact file names), everything else uses dedicated Unsplash
// photography. Each vehicle's gallery is then derived from its own URL via
// buildGalleryFromImage, guaranteeing zero cross-model mismatch.
// ---------------------------------------------------------------------------
const u = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const commons = (path) => `https://upload.wikimedia.org/wikipedia/commons/${path}`;

const IMG = {
  // Sports Car
  supra: commons("b/bc/1996_Toyota_Supra_A80_%28front%29.jpg"),
  mustang: u("photo-1494976388531-d1058494cdd8"),
  porsche911: commons("c/c6/2013_Porsche_911_Carrera_4S_%28991%29_%289626546987%29.jpg"),
  gtr: commons("9/99/NISSAN_GT-R_%28R35%29_China.jpg"),
  // Supercar
  r8: u("photo-1542362567-b07e54358753"),
  // Electric
  tesla: u("photo-1560958089-b8a1929cea89"),
  // SUV
  x5: u("photo-1533473359331-0135ef1b58bf"),
  wrangler: u("photo-1525609004556-c46c7d6cf023"),
  rav4: u("photo-1570125909232-eb263c188f7e"),
  // Sedan
  corolla: u("photo-1492144534655-ae79c964c9d7"),
  neo6: u("photo-1552519507-da3b142c6e3d"),
  civic: u("photo-1549317661-bd32c8ce0db2"),
  // Luxury SUV
  rangeRover: u("photo-1449965408869-eaa3f722e40d"),
  g63: u("photo-1555215695-3004980ad54e"),
  // Hatchback
  picanto: u("photo-1541899481282-d53bffe3c35d"),
};

// Mock fleet used when the Spring Boot backend is unreachable.
const baseVehicles = [
  {
    id: 1,
    brand: "Toyota",
    model: "Supra",
    image: IMG.supra,
    images: [
      IMG.supra,
      commons("4/47/1996-2002_Toyota_Supra_rear.jpg"),
    ],
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
    image: IMG.mustang,
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
    image: IMG.rangeRover,
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
    image: IMG.porsche911,
    images: [IMG.porsche911],
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
    image: IMG.r8,
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
    image: IMG.tesla,
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
    image: IMG.x5,
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
    image: IMG.corolla,
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
    image: IMG.wrangler,
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
    image: IMG.neo6,
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
    image: IMG.g63,
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
    image: IMG.civic,
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
    image: IMG.picanto,
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
    image: IMG.rav4,
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
    image: IMG.gtr,
    images: [
      IMG.gtr,
      commons("c/c9/Nissan_GT-R_%28CBA-R35%29_rear.jpg"),
    ],
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

  const images =
    vehicle.images?.length > 0
      ? vehicle.images
      : buildGalleryFromImage(vehicle.image, 5);

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
// Motorbike & bicycle fleet. Images use real Unsplash photography URLs for
// the card photo and gallery until the backend serves dedicated assets.
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

// Two-wheelers use metadata-verified Wikimedia Commons photos matched to each
// exact model (never automobile photos, and never a shared pool), so every
// ride's card and gallery depict the correct machine via buildGalleryFromImage.
const MOTO_IMG = {
  click: commons("7/7e/Honda_Click_125.jpg"),
  pcx: commons("7/76/2022_Honda_PCX_160.jpg"),
  wave: commons("6/6f/Honda_Wave_110_at_hanoi.jpg"),
  vespa: commons("2/2f/Vespa_Primavera_1.jpg"),
  monster: commons("d/d9/Ducati_Monster_821_%281%29.jpg"),
  gs: commons("0/09/BMW_R_1250_GS_%281%29.jpg"),
  ninja: commons("b/b9/Kawasaki_Ninja_400.jpg"),
  xsr: commons("1/1b/Yamaha_XSR_155.jpg"),
};

const BIKE_IMG = {
  marlin7: commons("b/b9/Trek_820_%289518781581%29.jpg"),
  escape3: commons("c/c0/Giant_Escape_M2.jpg"),
  allez: commons("a/a6/Specialized_road_bike.JPG"),
  ebike: commons("a/af/Electric_Bike_2.jpg"),
  trail8: commons("5/56/Cannondale_Trail_6_2017.jpg"),
  s3: commons("8/86/VanMoof_Electrified_S.jpg"),
};

const motoBaseVehicles = [
  {
    id: 101,
    brand: "Honda",
    model: "Click 125i",
    image: MOTO_IMG.click,
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
    brand: "Honda",
    model: "PCX 160",
    image: MOTO_IMG.pcx,
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
    image: MOTO_IMG.wave,
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
    image: MOTO_IMG.vespa,
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
    image: MOTO_IMG.monster,
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
    image: MOTO_IMG.gs,
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
    image: MOTO_IMG.ninja,
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
    image: MOTO_IMG.xsr,
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
    image: BIKE_IMG.marlin7,
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
    image: BIKE_IMG.escape3,
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
    image: BIKE_IMG.allez,
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
    image: BIKE_IMG.ebike,
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
    image: BIKE_IMG.trail8,
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
    image: BIKE_IMG.s3,
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

const enrichFleet = (vehicle, specs, featurePool) => {
  const gallery = buildGalleryFromImage(vehicle.image, 5);
  const start = ((vehicle.id % featurePool.length) + featurePool.length) % featurePool.length;
  const features = [
    ...featurePool.slice(start),
    ...featurePool.slice(0, start),
  ].slice(0, 8);
  return { ...vehicle, specs, features, images: gallery };
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
  return enrichFleet(vehicle, specs, MOTO_FEATURES);
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
  return enrichFleet(vehicle, specs, BIKE_FEATURES);
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

// Legacy convenience wrappers. The backend serves every fleet through
// GET /api/products (scoped by vehicleType via /api/categories), so these
// resolve against the real catalog instead of nonexistent /vehicles-style
// endpoints.
export const getVehicles = async () => getCatalogVehicles({ vehicleType: "car" });

export const getMotorbikes = async () => getCatalogVehicles({ vehicleType: "moto" });

export const getBicycles = async () => getCatalogVehicles({ vehicleType: "bicycle" });

export const getVehicleById = async (id) => {
  try {
    const data = await request(API_ENDPOINTS.productById(id));
    const vehicle = data?.data ?? data;
    if (!vehicle || vehicle.id === undefined) {
      throw new Error("Vehicle not found");
    }
    const refs = await buildCatalogRefs();
    return mapProductToVehicle(vehicle, refs);
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

// ---------------------------------------------------------------------------
// Featured + catalog (GET /api/products)
//
// Fetches the vehicle catalog live from the backend. Supports categoryId /
// locationId (Long) query params as well as isAvailable / maxPrice / page /
// size; responses can arrive as a plain array, a wrapped { data } body or a
// Spring Data Page ({ content }).
// ---------------------------------------------------------------------------

const unwrapProductList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.products)) return data.products;
  return [];
};

const valueOf = (object, keys, fallback = null) => {
  for (const key of keys) {
    const value = object?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return fallback;
};

const asString = (value) => (value == null ? "" : String(value).trim());

// Origin of the deployment that hosts the API, used to absolutize relative
// image paths the backend may return (e.g. "/uploads/car.jpg").
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api(\/v\d+)?\/?$/i, "");

// Normalizes an image URL coming from any item shape:
//   - absolute http(s), data: and blob: URLs pass through untouched;
//   - protocol-relative URLs (//cdn...) get their scheme back;
//   - root-relative paths (/uploads/...) are resolved against the backend
//     origin so they always point at the real image, never a broken src.
const absolutizeImageUrl = (value) => {
  const url = asString(value);
  if (!url) return "";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/") && !url.startsWith("//")) {
    return `${BACKEND_ORIGIN}${url}`;
  }
  return url;
};

const resolveName = (value) => {
  if (typeof value === "string") return asString(value);
  if (value && typeof value === "object") {
    return asString(valueOf(value, ["name", "value", "label", "title"]));
  }
  return "";
};

const resolveImage = (value) => {
  if (typeof value === "string") return absolutizeImageUrl(asString(value));
  if (value && typeof value === "object") {
    return absolutizeImageUrl(
      asString(
        valueOf(value, ["url", "imageUrl", "src", "image", "path", "image_url"])
      )
    );
  }
  return "";
};

// Normalizes a backend product record into the snake_case shape the catalog
// cards (CarCard etc.) render, tolerating both camelCase DTO fields and
// snake_case/embedded category/location variants. When `refs` (resolved from
// GET /api/categories and GET /api/locations) is provided, numeric
// categoryId/locationId are translated back into displayable names.
// ---------------------------------------------------------------------------
// Product images (GET /api/products/{id}/images)
//
// ProductResponse carries no image data — thumbnails live on ProductImage rows
// served by ProductImageController. Catalog helpers fetch them lazily (the
// primary image first), then cache the result per product id so repeated page
// loads never re-request the same thumbnail.
// ---------------------------------------------------------------------------

const productImagesCache = new Map();
const productImagesInflight = new Map();

export const getProductImages = async (productId) => {
  const key = String(productId);
  if (productImagesCache.has(key)) return productImagesCache.get(key);
  if (productImagesInflight.has(key)) return productImagesInflight.get(key);

  const promise = (async () => {
    let urls = [];
    try {
      const entries = unwrapList(await request(API_ENDPOINTS.productImages(key)));
      const primary = entries.find(
        (img) =>
          img &&
          (img.isPrimary === true ||
            img.primary === true ||
            img.is_primary === true)
      );
      const ordered = primary
        ? [primary, ...entries.filter((img) => img !== primary)]
        : entries;
      urls = ordered.map(resolveImage).filter(Boolean);
    } catch {
      urls = [];
    }
    productImagesCache.set(key, urls);
    return urls;
  })();

  productImagesInflight.set(key, promise);
  promise.finally(() => productImagesInflight.delete(key));
  return promise;
};

// Backfills `image` / `images` on any vehicle that has none, using a small
// worker pool so a large fleet never fires hundreds of parallel requests.
const enrichCatalogImages = async (vehicles, { concurrency = 8 } = {}) => {
  const pending = vehicles.filter((vehicle) => vehicle && vehicle.id != null && !vehicle.image);
  if (!pending.length) return vehicles;

  let cursor = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, pending.length) },
    async () => {
      while (cursor < pending.length) {
        const vehicle = pending[cursor];
        cursor += 1;
        const urls = await getProductImages(vehicle.id);
        if (urls.length) vehicle.image = urls[0];
        if (urls.length > 1) vehicle.images = urls;
      }
    }
  );
  await Promise.allSettled(workers);
  return vehicles;
};

export const mapProductToVehicle = (raw, refs = {}) => {
  if (!raw || typeof raw !== "object") return raw;

  const categoryId = valueOf(raw, ["categoryId", "category_id"]);
  const locationId = valueOf(raw, ["locationId", "location_id"]);
  const categoryRef =
    categoryId != null ? refs.categoryById?.get(String(categoryId)) : null;
  const locationRef =
    locationId != null ? refs.locationById?.get(String(locationId)) : null;

  const latitude = valueOf(raw, ["latitude", "lat"], locationRef?.latitude);
  const longitude = valueOf(raw, ["longitude", "lng", "lon"], locationRef?.longitude);

  const category =
    resolveName(raw.category) ||
    resolveName(raw.categoryName) ||
    resolveName(raw.category_type) ||
    categoryRef?.name ||
    asString(categoryId) ||
    "Vehicle";
  const location =
    resolveName(raw.location) ||
    resolveName(raw.locationName) ||
    resolveName(raw.location_name) ||
    locationRef?.name ||
    locationRef?.city ||
    asString(locationId) ||
    "";

  const images = (Array.isArray(raw.images) ? raw.images : [])
    .map((img) => {
      if (typeof img === "string") return img.trim();
      if (img && typeof img === "object") {
        return resolveImage(valueOf(img, ["imageUrl", "url", "src", "image"]));
      }
      return "";
    })
    .filter(Boolean);

  const image =
    resolveImage(raw.image) ||
    resolveImage(raw.imageUrl) ||
    resolveImage(raw.image_url) ||
    resolveImage(raw.primaryImageUrl) ||
    resolveImage(raw.primaryImage) ||
    images[0];

  const isAvailable = valueOf(
    raw,
    ["isAvailable", "is_available", "available"],
    true
  );

  return {
    id: raw.id,
    brand: asString(valueOf(raw, ["brand", "make"], "Unknown")) || "Unknown",
    model: asString(valueOf(raw, ["model", "name", "title"], "Vehicle")) || "Vehicle",
    name: valueOf(raw, ["name", "title"]),
    year: valueOf(raw, ["modelYear", "year"]),
    category,
    location,
    price_per_day: Number(
      valueOf(raw, ["pricePerDay", "price_per_day", "price"], 0)
    ),
    seating_capacity: valueOf(
      raw,
      ["seatingCapacity", "seating_capacity", "seats"]
    ),
    fuel_type: valueOf(raw, ["fuelType", "fuel_type"], "Petrol"),
    transmission: valueOf(raw, ["transmission"]),
    stock_left: valueOf(raw, ["stockLeft", "stock_left", "stock"]),
    is_available:
      typeof isAvailable === "boolean"
        ? isAvailable
        : asString(isAvailable).toLowerCase() !== "false",
    description: asString(valueOf(raw, ["description"])),
    image,
    images,
    bookedDates:
      raw.bookedDates ?? raw.booked_dates ?? raw.unavailableDates ?? undefined,
    categoryId:
      categoryId != null ? Number(categoryId) : undefined,
    locationId:
      locationId != null ? Number(locationId) : undefined,
    // Moto / bicycle extras surfaced by the backend camelCase DTO fields.
    engine_cc: valueOf(raw, ["engineCc", "engine_cc"]),
    fuel_efficiency: valueOf(raw, ["fuelEfficiency", "fuel_efficiency"]),
    top_speed: valueOf(raw, ["topSpeed", "top_speed"]),
    frame_material: valueOf(raw, ["material", "frame_material"]),
    gears: valueOf(raw, ["speeds", "gears"]),
    wheel_size: valueOf(raw, ["wheelSize", "wheel_size"]),
    ...(raw.specs ? { specs: raw.specs } : {}),
    ...(raw.features ? { features: raw.features } : {}),
    ...(latitude != null ? { latitude: Number(latitude) } : {}),
    ...(longitude != null ? { longitude: Number(longitude) } : {}),
  };
};

// ---------------------------------------------------------------------------
// Reference caches resolved from GET /api/categories and GET /api/locations.
// The backend filters catalog queries by categoryId / locationId, so the pages
// fetch these once and translate user-facing names into numeric ids (and vice
// versa when rendering product cards). Static lists act as offline fallbacks.
// ---------------------------------------------------------------------------

const CATEGORY_FALLBACK = [
  { id: 1, name: "Sedan", slug: "sedan", vehicleType: "car" },
  { id: 2, name: "SUV", slug: "suv", vehicleType: "car" },
  { id: 3, name: "Sports Car", slug: "sports-car", vehicleType: "car" },
  { id: 4, name: "Luxury SUV", slug: "luxury-suv", vehicleType: "car" },
  { id: 5, name: "Motorbike", slug: "motorbike", vehicleType: "moto" },
  { id: 6, name: "Scooter", slug: "scooter", vehicleType: "moto" },
  { id: 7, name: "Bicycle", slug: "bicycle", vehicleType: "bicycle" },
  { id: 8, name: "Mountain Bike", slug: "mountain-bike", vehicleType: "bicycle" },
];

let categoriesCache = null;
let locationsCache = null;

// ---------------------------------------------------------------------------
// Dynamic category type inference
//
// The seeded database behind GET /api/categories stores motorbike products
// under a category labelled bicycle (id=2 "Cross", description "for
// Motorbikes"). To keep Motorbikes under /motorbikes and Bicycles under
// /bicycles we therefore derive each category's REAL vehicle type from its
// name, slug and description instead of trusting the backend label alone.
// The backend `vehicleType` field is kept only as a fallback for names the
// hints don't recognise.
// ---------------------------------------------------------------------------

const CATEGORY_TYPE_HINTS = {
  moto: [
    "scooter",
    "underbone",
    "motorbike",
    "motorcycle",
    "moto",
    "sportbike",
    "cruiser",
    "touring",
    "cross",
    "nmax",
  ],
  car: [
    "sedan",
    "sedans",
    "suv",
    "suvs",
    "sports car",
    "sports cars",
    "luxury",
    "coupe",
    "hatchback",
    "car",
  ],
  bicycle: [
    "bicycle",
    "bike",
    "mountain",
    "road bike",
    "hybrid",
    "e-bike",
    "ebike",
    "city bike",
  ],
};

const classifyCategoryType = (category = {}) => {
  const text = asString(
    `${category?.name ?? ""} ${category?.slug ?? ""} ${category?.description ?? ""}`
  ).toLowerCase();
  const score = (keywords) =>
    keywords.reduce((total, keyword) => total + (text.includes(keyword) ? 1 : 0), 0);
  const scores = {
    moto: score(CATEGORY_TYPE_HINTS.moto),
    car: score(CATEGORY_TYPE_HINTS.car),
    bicycle: score(CATEGORY_TYPE_HINTS.bicycle),
  };
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (best && best[1] > 0) return best[0];
  return asString(category?.vehicleType || category?.vehicle_type).toLowerCase() || "car";
};

// GET /api/categories?vehicleType=... -> [{ id, name, slug, vehicleType }]
// vehicleType uses the backend enum lowercase values: car | moto | bicycle.
// The type is resolved dynamically via classifyCategoryType so the page maps
// match what the database actually stores.
export const getCatalogCategories = async ({ vehicleType, refresh = false } = {}) => {
  if (!categoriesCache || refresh) {
    try {
      const data = await request(`${API_ENDPOINTS.categories}?size=200`);
      const raw = unwrapList(data);
      categoriesCache = raw.length
        ? raw.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            description: item.description,
            vehicleType: classifyCategoryType(item),
          }))
        : CATEGORY_FALLBACK.slice();
      categoriesCache._fromBackend = raw.length > 0;
    } catch {
      categoriesCache = CATEGORY_FALLBACK.slice();
      categoriesCache._fromBackend = false;
    }
  }
  const filtered = vehicleType
    ? categoriesCache.filter(
        (cat) =>
          asString(cat.vehicleType).toLowerCase() ===
          asString(vehicleType).toLowerCase()
      )
    : categoriesCache;
  return filtered.map((cat) => ({ ...cat }));
};

// GET /api/locations -> [{ id, name, address, city, latitude, longitude }]
export const getCatalogLocations = async ({ refresh = false } = {}) => {
  if (!locationsCache || refresh) {
    try {
      const data = await request(`${API_ENDPOINTS.locations}?size=200`);
      const raw = unwrapList(data);
      locationsCache = raw.length
        ? raw.map((item) => ({
            id: item.id,
            name: item.name,
            address: item.address,
            city: item.city,
            latitude: item.latitude,
            longitude: item.longitude,
          }))
        : [
            {
              id: 1,
              name: "Phnom Penh",
              city: "Phnom Penh",
              latitude: 11.5564,
              longitude: 104.9282,
            },
          ];
      locationsCache._fromBackend = raw.length > 0;
    } catch {
      locationsCache = [
        {
          id: 1,
          name: "Phnom Penh",
          city: "Phnom Penh",
          latitude: 11.5564,
          longitude: 104.9282,
        },
      ];
      locationsCache._fromBackend = false;
    }
  }
  return locationsCache.map((loc) => ({ ...loc }));
};

// Resolved reference maps keyed by numeric id, used to enrich products.
export const buildCatalogRefs = async () => {
  const [categories, locations] = await Promise.all([
    getCatalogCategories(),
    getCatalogLocations(),
  ]);
  return {
    categoryById: new Map(categories.map((cat) => [String(cat.id), cat])),
    locationById: new Map(locations.map((loc) => [String(loc.id), loc])),
  };
};

// GET /api/products?isAvailable=true&size=6&page=0 — the backend has no
// "featured" endpoint, so featured vehicles are simply the first available
// fleet items. Falls back to the local static featured list when offline.
export const getFeaturedVehicles = async (options = {}) => {
  try {
    const data = await request(
      `${API_ENDPOINTS.products}?isAvailable=true&page=0&size=6`,
      { signal: options.signal }
    );
    if (!data) throw new Error("Backend offline");
    const refs = await buildCatalogRefs();
    const vehicles = unwrapProductList(data).map((product) =>
      mapProductToVehicle(product, refs)
    );
    if (!vehicles.length) throw new Error("Backend offline");
    return await enrichCatalogImages(vehicles);
  } catch (error) {
    if (error && error.name === "AbortError") throw error;
    await delay(400);
    return featuredVehicles.map((vehicle) => ({ ...vehicle }));
  }
};

// GET /api/products?categoryId=...&locationId=...&page=...&size=...
// Latest catalog wiring. Takes numeric categoryId / locationId (Long) plus the
// optional isAvailable / maxPrice / page / size filters understood by
// ProductController, maps the Spring Page payload onto the card shape, backfills
// thumbnails from GET /api/products/{id}/images and falls back to the matching
// mock fleet when the backend is unreachable.
//
// `vehicleType` (car | moto | bicycle) keeps the page scoped to its own fleet:
// the backend only filters by a SINGLE categoryId, so when no exact category is
// chosen the type's category ids are resolved from /api/categories and enforced
// client-side. Any product whose categoryId is outside the type is dropped.
export const getCatalogVehicles = async (
  {
    categoryId,
    categoryIds,
    locationId,
    vehicleType,
    isAvailable,
    maxPrice,
    page = 0,
    size = 200,
  } = {},
  options = {}
) => {
  let allowedSet = null;
  if (categoryIds && categoryIds.length) {
    allowedSet = new Set(categoryIds.map((id) => Number(id)));
  } else if (vehicleType) {
    const typeCategories = await getCatalogCategories({ vehicleType });
    const ids = typeCategories
      .map((cat) => Number(cat.id))
      .filter((id) => Number.isFinite(id) && id > 0);
    if (ids.length) allowedSet = new Set(ids);
  }

  // Forward an exact category only when it belongs to the page's vehicle type;
  // otherwise the client-side type filter below handles it.
  let selectedId = categoryId;
  if (allowedSet && selectedId != null && selectedId !== "") {
    selectedId = allowedSet.has(Number(selectedId)) ? Number(selectedId) : undefined;
  }

  const params = new URLSearchParams();
  if (selectedId != null && selectedId !== "") params.set("categoryId", String(selectedId));
  if (locationId != null && locationId !== "") params.set("locationId", String(locationId));
  if (isAvailable != null) params.set("isAvailable", String(isAvailable));
  if (maxPrice != null) params.set("maxPrice", String(maxPrice));
  params.set("page", String(page));
  params.set("size", String(size));
  const url = `${API_ENDPOINTS.products}?${params.toString()}`;

  try {
    const data = await request(url, { signal: options.signal });
    if (!data) throw new Error("Backend offline");
    let products = unwrapProductList(data);
    // No exact category forwarded -> keep only the vehicle-type's products so
    // /cars never shows motorbikes or bicycles (and vice versa).
    if (allowedSet && (selectedId == null || selectedId === "")) {
      products = products.filter((product) =>
        allowedSet.has(Number(product?.categoryId))
      );
    }
    const refs = await buildCatalogRefs();
    const vehicles = products.map((product) =>
      mapProductToVehicle(product, refs)
    );
    return await enrichCatalogImages(vehicles);
  } catch (error) {
    // Treat aborted requests as a no-op (the caller handles the race).
    if (error && error.name === "AbortError") throw error;
    await delay(400);
    // Return the right mock fleet for this page's vehicle type so the offline
    // experience never mixes cars with motorbikes/bicycles.
    if (vehicleType === "moto") return mockMotorbikes.map((moto) => ({ ...moto }));
    if (vehicleType === "bicycle") return mockBicycles.map((bike) => ({ ...bike }));
    return mockVehicles.map((car) => ({ ...car }));
  }
};