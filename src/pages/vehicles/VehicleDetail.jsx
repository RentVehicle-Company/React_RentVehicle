import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  LuArrowLeft,
  LuArrowRight,
  LuBaby,
  LuBike,
  LuCalendarCheck,
  LuCalendarDays,
  LuCamera,
  LuCheck,
  LuCircleDot,
  LuClock3,
  LuCog,
  LuCompass,
  LuFuel,
  LuGauge,
  LuHeadset,
  LuIdCard,
  LuLayers,
  LuMapPin,
  LuPause,
  LuPhone,
  LuPlay,
  LuQrCode,
  LuRotateCcw,
  LuSettings2,
  LuShieldCheck,
  LuStar,
  LuTimer,
  LuUserPlus,
  LuUsers,
  LuZap,
} from "react-icons/lu";
import { assets } from "../../assets/assets";
import {
  ALL_MOCK_VEHICLES,
  getVehicleById,
  isBicycle,
  isMotorbike,
} from "../../services/vehicleServices";
import { usePreferences } from "../../context/PreferencesContext";

const inputClass =
  "w-full px-4 py-2.5 bg-white border border-borderColor rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

const ADDONS = [
  { key: "insurance", label: "Full Comprehensive Insurance", rate: 15 },
  { key: "driver", label: "Additional Driver", rate: 10 },
  { key: "seat", label: "Child Safety Seat", rate: 5 },
];

const REVIEWS = [
  {
    name: "Sokha Chea",
    date: "3 days ago",
    rating: 5,
    text: "The car was spotless and ready on time. Pickup at the airport took under 10 minutes — highly recommend.",
    initials: "SC",
    color: "bg-blue-500",
  },
  {
    name: "James Miller",
    date: "1 week ago",
    rating: 5,
    text: "Smooth booking and great condition throughout the rental. Roadside assistance gave quick help when I called.",
    initials: "JM",
    color: "bg-indigo-500",
  },
];

const RATING_BARS = [
  { label: "Cleanliness", value: 5.0 },
  { label: "Vehicle Condition", value: 4.9 },
  { label: "Pickup Smoothness", value: 4.8 },
];

const CITY_COORDS = {
  "New York": [40.7128, -74.006],
  "Los Angeles": [34.0522, -118.2437],
  Houston: [29.7604, -95.3698],
  Chicago: [41.8781, -87.6298],
  "Phnom Penh": [11.5564, 104.9282],
  "Seam Reap": [13.3671, 103.8446],
  "Siem Reap": [13.3671, 103.8446],
  Kampot: [10.6104, 104.1815],
  Sihanoukville: [10.6093, 103.5296],
};

const GALLERY_IMAGES = [
  assets.car_image1,
  assets.car_image2,
  assets.car_image3,
  assets.car_image4,
  assets.main_car,
  assets.banner_car_image,
];

// Derived performance profile per body-category. The mock fleet has no engine
// figures, so we stamp believable specs onto each vehicle deterministically.
const ENGINE_PROFILES = {
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

const FEATURE_POOL = [
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

const formatDate = (iso) => {
  if (!iso) return "";
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const deriveSpecs = (vehicle) => {
  const profile = ENGINE_PROFILES[vehicle.category] ?? ENGINE_PROFILES.Sedan;
  const offset = (vehicle.id % 5) - 2;
  return {
    engine: profile.engine,
    topSpeed: profile.topSpeed + offset * 8,
    acceleration: Math.max(
      2.5,
      Math.round((profile.acceleration + offset * 0.12) * 10) / 10
    ),
    horsepower: profile.horsepower + offset * 14,
    drive: profile.drive,
  };
};

const deriveFeatures = (vehicle, count = 7) => {
  const start = vehicle.id % FEATURE_POOL.length;
  const rotated = [
    ...FEATURE_POOL.slice(start),
    ...FEATURE_POOL.slice(0, start),
  ];
  return rotated.slice(0, count);
};

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = usePreferences();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("photo");
  const [activeImg, setActiveImg] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [spinning, setSpinning] = useState(true);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [addOns, setAddOns] = useState({
    insurance: false,
    driver: false,
    seat: false,
  });
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
    setError(null);
    setVehicle(null);
    setViewMode("photo");
    setActiveImg(0);
    setFrameIndex(0);
    setPickupDate("");
    setReturnDate("");
    setAddOns({ insurance: false, driver: false, seat: false });
    getVehicleById(id)
      .then((data) => {
        setVehicle(data);
        setLoading(false);
      })
      .catch(() => {
        const fallback = ALL_MOCK_VEHICLES.find(
          (vehicle) => String(vehicle.id) === String(id)
        );
        if (fallback) {
          setVehicle({ ...fallback });
        } else {
          setError("Vehicle not found.");
        }
        setLoading(false);
      });
  }, [id]);

  const images = useMemo(() => {
    if (!vehicle) return [];
    if (vehicle.images?.length) return vehicle.images;
    return [vehicle.image, ...GALLERY_IMAGES.filter((img) => img !== vehicle.image)];
  }, [vehicle]);

  const derived = useMemo(
    () => (vehicle ? vehicle.specs ?? deriveSpecs(vehicle) : null),
    [vehicle]
  );
  const features = useMemo(
    () => (vehicle ? vehicle.features ?? deriveFeatures(vehicle) : []),
    [vehicle]
  );

  useEffect(() => {
    if (viewMode !== "360" || !spinning) return;
    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % images.length);
    }, 400);
    return () => clearInterval(timer);
  }, [viewMode, spinning, images.length]);

  const coords = CITY_COORDS[vehicle?.location] || CITY_COORDS["Phnom Penh"];
  const [lat, lon] = coords;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.04}%2C${lat - 0.03}%2C${lon + 0.04}%2C${lat + 0.03}&layer=mapnik&marker=${lat}%2C${lon}`;

  const pickupMs = pickupDate ? new Date(`${pickupDate}T00:00:00`).getTime() : 0;
  const returnMs = returnDate ? new Date(`${returnDate}T00:00:00`).getTime() : 0;
  const hasValidDates = Boolean(pickupDate && returnDate && returnMs >= pickupMs);
  const days = hasValidDates
    ? Math.max(1, Math.round((returnMs - pickupMs) / 86400000))
    : 0;
  const rentalFee = vehicle ? Math.round(vehicle.price_per_day * days) : 0;
  const serviceFee = vehicle ? Math.round(rentalFee * 0.05) : 0;
  const activeAddOns = ADDONS.filter((addon) => addOns[addon.key]);
  const addOnTotal = activeAddOns.reduce(
    (sum, addon) => sum + addon.rate * days,
    0
  );
  const totalPrice = rentalFee + serviceFee + addOnTotal;

  const toggleAddOn = (key) =>
    setAddOns((prev) => ({ ...prev, [key]: !prev[key] }));

  const similarVehicles = useMemo(() => {
    if (!vehicle) return [];
    const inCategory = ALL_MOCK_VEHICLES.filter(
      (item) =>
        String(item.id) !== String(vehicle.id) &&
        item.category === vehicle.category
    );
    if (inCategory.length >= 3) return inCategory.slice(0, 3);
    const others = ALL_MOCK_VEHICLES.filter(
      (item) =>
        String(item.id) !== String(vehicle.id) &&
        item.category !== vehicle.category
    );
    return [...inCategory, ...others].slice(0, 3);
  }, [vehicle]);

  const handleBook = (method) => {
    if (!vehicle || !hasValidDates) return;
    const booking = {
      id: vehicle.id,
      vehicleName: `${vehicle.brand} ${vehicle.model}`,
      image: vehicle.image,
      startDate: formatDate(pickupDate),
      endDate: formatDate(returnDate),
      pickupLocation: vehicle.location,
      pricePerDay: vehicle.price_per_day,
      rentalFee,
      serviceFee,
      addOns: activeAddOns.map((addon) => ({
        label: addon.label,
        rate: addon.rate,
        total: addon.rate * days,
      })),
      addOnTotal,
      totalPrice,
      duration: days,
      status: "confirmed",
      paymentStatus: "unpaid",
    };
    navigate(method === "visa" ? "/payment/visa" : "/payment/khqr", {
      state: { booking },
    });
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8 text-sm text-slate-500">
        Loading {`vehicle${id ? ` #${id}` : ""}`}...
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Link
          to="/cars"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <LuArrowLeft size={18} />
          Back to Cars
        </Link>
        <div className="mt-6 bg-white border border-borderColor rounded-2xl p-10 text-center text-sm text-slate-500">
          {error || "Vehicle not found."}
        </div>
      </div>
    );
  }

  const specItems = !derived
    ? []
    : isBicycle(vehicle)
      ? [
          {
            icon: LuLayers,
            label: "Frame",
            value: derived.frame ?? vehicle.frame_material ?? "Aluminum",
          },
          {
            icon: LuSettings2,
            label: "Gears",
            value: derived.gears ?? vehicle.gears ?? "Single-Speed",
          },
          {
            icon: LuBike,
            label: "Type",
            value: derived.driveType ?? vehicle.fuel_type ?? "Manual",
          },
          {
            icon: LuCircleDot,
            label: "Wheel Size",
            value: derived.wheelSize ?? vehicle.wheel_size ?? "26 inch",
          },
          {
            icon: LuFuel,
            label: "Propulsion",
            value: vehicle.fuel_type ?? "Manual",
          },
          {
            icon: LuGauge,
            label: "Top Speed",
            value: `${derived.topSpeed ?? 18} km/h`,
          },
          {
            icon: LuUsers,
            label: "Seats",
            value: `${vehicle.seating_capacity ?? 1} Rider`,
          },
          {
            icon: LuMapPin,
            label: "Location",
            value: vehicle.location,
          },
        ]
      : isMotorbike(vehicle)
        ? [
            {
              icon: LuCog,
              label: "Engine",
              value: `${derived.displacementCc ?? vehicle.engine_cc ?? 125} cc`,
            },
            {
              icon: LuSettings2,
              label: "Transmission",
              value: derived.transmission ?? vehicle.transmission ?? "Automatic",
            },
            {
              icon: LuGauge,
              label: "Top Speed",
              value: `${derived.topSpeed ?? vehicle.top_speed ?? 110} km/h`,
            },
            {
              icon: LuFuel,
              label: "Fuel Efficiency",
              value: `${derived.fuelEfficiency ?? vehicle.fuel_efficiency ?? 45} km/l`,
            },
            {
              icon: LuZap,
              label: "Horsepower",
              value: `${derived.horsepower ?? 15} HP`,
            },
            {
              icon: LuCompass,
              label: "Drivetrain",
              value: derived.drive ?? "CVT",
            },
            {
              icon: LuUsers,
              label: "Seats",
              value: `${vehicle.seating_capacity ?? 2} Riders`,
            },
            {
              icon: LuMapPin,
              label: "Location",
              value: vehicle.location,
            },
          ]
        : [
            { icon: LuCog, label: "Engine", value: derived.engine },
            { icon: LuGauge, label: "Top Speed", value: `${derived.topSpeed} km/h` },
            { icon: LuTimer, label: "0-100 km/h", value: `${derived.acceleration} s` },
            { icon: LuZap, label: "Horsepower", value: `${derived.horsepower} HP` },
            { icon: LuCompass, label: "Drivetrain", value: derived.drive },
            { icon: LuFuel, label: "Fuel Type", value: vehicle.fuel_type },
            { icon: LuUsers, label: "Seats", value: `${vehicle.seating_capacity} Passengers` },
            { icon: LuMapPin, label: "Location", value: vehicle.location },
          ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link
        to="/cars"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
      >
        <LuArrowLeft size={18} />
        Back to Cars
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            {vehicle.category}
          </p>
          <h1 className="mt-0.5 text-2xl font-bold text-slate-900 sm:text-3xl">
            {vehicle.brand} {vehicle.model}
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <LuMapPin size={14} className="text-primary" />
              {vehicle.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <LuCalendarDays size={14} className="text-primary" />
              Year {vehicle.year}
            </span>
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-2xl font-bold text-slate-900">
            {formatPrice(vehicle.price_per_day)}
          </p>
          <p className="text-xs text-slate-500">per day</p>
        </div>
      </div>

      <div className="mt-5 grid lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)] gap-5">
        <div className="min-w-0 space-y-5">
          {/* Gallery / 360 viewer */}
          <section className="bg-white border border-borderColor rounded-2xl overflow-hidden shadow-sm">
            <div className="relative bg-slate-900">
              {viewMode === "photo" ? (
                <div className="group relative h-72 overflow-hidden sm:h-[480px] md:h-[520px]">
                  <img
                    src={images[activeImg]}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="h-full w-full cursor-zoom-in object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                </div>
              ) : (
                <div className="relative flex h-72 sm:h-[480px] md:h-[520px] w-full items-center justify-center overflow-hidden">
                  <img
                    src={images[frameIndex]}
                    alt=""
                    className="h-full w-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-slate-950/80 to-transparent p-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setFrameIndex(
                            (prev) => (prev - 1 + images.length) % images.length
                          )
                        }
                        aria-label="Previous frame"
                        className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
                      >
                        <LuRotateCcw size={16} />
                      </button>
                      <button
                        type="button"
                        aria-pressed={spinning}
                        onClick={() => setSpinning((on) => !on)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/40"
                      >
                        {spinning ? <LuPause size={13} /> : <LuPlay size={13} />}
                        {spinning ? "Auto" : "Play"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFrameIndex((prev) => (prev + 1) % images.length)
                        }
                        aria-label="Next frame"
                        className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
                      >
                        <LuRotateCcw size={16} className="rotate-180" />
                      </button>
                    </div>
                    <span className="mt-2 text-[11px] text-white/70">
                      360° View · Frame {frameIndex + 1}/{images.length}
                    </span>
                  </div>
                </div>
              )}

              {vehicle.is_available && (
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-white" />
                  Available Now
                </span>
              )}

              <div className="absolute bottom-3 left-4 flex gap-1.5">
                {[
                  { key: "photo", label: "Photo", icon: LuCamera },
                  { key: "360", label: "360° View" },
                ].map((tab) => {
                  const isActive = viewMode === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setViewMode(tab.key)}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors ${
                        isActive
                          ? "bg-white text-slate-900"
                          : "bg-white/70 text-slate-600 hover:bg-white"
                      }`}
                    >
                      {tab.icon && <tab.icon size={13} />}
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {viewMode === "photo" && (
              <div className="flex items-center justify-center gap-2.5 overflow-x-auto p-4">
                {images.map((image, index) => (
                  <button
                    key={image + index}
                    type="button"
                    onClick={() => setActiveImg(index)}
                    aria-label={`Photo ${index + 1}`}
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors cursor-pointer ${
                      index === activeImg
                        ? "border-primary"
                        : "border-transparent hover:border-borderColor"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${vehicle.brand} ${vehicle.model} photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Description */}
          <section className="bg-white border border-borderColor rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">About this vehicle</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {vehicle.description}
            </p>
          </section>

          {/* Full specs */}
          <section className="bg-white border border-borderColor rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Full Specifications
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {specItems.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="group rounded-2xl bg-gradient-to-br from-blue-500/40 via-slate-200/50 to-indigo-500/40 p-px shadow-sm transition-shadow duration-200 group-hover:shadow-lg group-hover:shadow-primary/10"
                >
                  <div className="flex h-full flex-col items-center rounded-[15px] bg-white p-3 text-center">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-110">
                      <Icon size={17} />
                    </span>
                    <p className="mt-2 text-xs text-slate-500">{label}</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Features checklist */}
          <section className="bg-white border border-borderColor rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Features &amp; Amenities
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="group rounded-xl bg-gradient-to-br from-emerald-500/40 to-teal-500/30 p-px"
                >
                  <div className="flex w-full items-center gap-2 rounded-[11px] bg-white px-3 py-2 text-sm text-slate-700 transition-colors duration-200 group-hover:bg-slate-50">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-125">
                      <LuCheck size={13} strokeWidth={3} />
                    </span>
                    {feature}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pickup location */}
          <section className="bg-white border border-borderColor rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Pickup Location</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
              <LuMapPin size={15} className="text-primary" />
              {vehicle.location}
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-borderColor bg-slate-100">
              <iframe
                title={`Map showing ${vehicle.location}`}
                src={mapUrl}
                className="h-[240px] w-full border-0"
                loading="lazy"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {vehicle.location} | Lat: {lat.toFixed(4)}, Long: {lon.toFixed(4)}
            </p>
          </section>

          {similarVehicles.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-slate-900">
                Similar Vehicles You Might Like
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                More {vehicle.category.toLowerCase()} options near {vehicle.location}
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {similarVehicles.map((similar) => (
                  <article
                    key={similar.id}
                    className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
                  >
                    <div className="h-32 overflow-hidden">
                      <img
                        src={similar.image}
                        alt={`${similar.brand} ${similar.model}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-3.5">
                      <p className="text-sm font-semibold text-slate-900">
                        {similar.brand} {similar.model}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {similar.category} · {similar.location}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-primary">
                          {formatPrice(similar.price_per_day)}
                          <span className="text-xs font-normal text-slate-400">
                            /day
                          </span>
                        </p>
                        <Link
                          to={`/vehicles/${similar.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary"
                        >
                          View Details
                          <LuArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Booking widget */}
        <aside className="sticky top-6 space-y-6 self-start">
          <section className="bg-white border border-borderColor rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Book This Vehicle
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {vehicle.brand} {vehicle.model}
                </p>
              </div>
              <p className="text-right text-lg font-bold text-slate-900">
                {formatPrice(vehicle.price_per_day)}
                <span className="block text-xs font-normal text-slate-500">
                  /day
                </span>
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="detail-pickup" className={labelClass}>
                  Pick-up Date
                </label>
                <input
                  id="detail-pickup"
                  type="date"
                  min={today}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="detail-return" className={labelClass}>
                  Return Date
                </label>
                <input
                  id="detail-return"
                  type="date"
                  min={pickupDate || today}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-5 border-t border-borderColor pt-4">
              <p className="text-sm font-medium text-slate-700">
                Optional add-ons
              </p>
              <div className="mt-3 space-y-2">
                {ADDONS.map((addon) => {
                  const active = addOns[addon.key];
                  const AddOnIcon =
                    addon.key === "insurance"
                      ? LuShieldCheck
                      : addon.key === "driver"
                        ? LuUserPlus
                        : LuBaby;
                  return (
                    <button
                      key={addon.key}
                      type="button"
                      role="switch"
                      aria-checked={active}
                      onClick={() => toggleAddOn(addon.key)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all duration-200 cursor-pointer ${
                        active
                          ? "border-primary/40 bg-primary/5 shadow-sm"
                          : "border-borderColor bg-white hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-colors ${
                            active
                              ? "bg-primary/10 text-primary"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <AddOnIcon size={15} />
                        </span>
                        <span className="text-slate-700">{addon.label}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="text-xs font-medium text-slate-500">
                          +{formatPrice(addon.rate)}/day
                        </span>
                        <span
                          className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${
                            active ? "bg-primary" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${
                              active ? "left-4.5" : "left-0.5"
                            }`}
                          />
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 space-y-2 border-t border-borderColor pt-4 text-sm">
              <div className="flex justify-between gap-4 text-slate-600">
                <span>Duration</span>
                <span className="flex items-center gap-1.5">
                  <LuClock3 size={15} />
                  {days > 0 ? `${days} ${days === 1 ? "day" : "days"}` : "Select dates"}
                </span>
              </div>
              <div className="flex justify-between gap-4 text-slate-600">
                <span>Rental fee</span>
                <span>{formatPrice(rentalFee)}</span>
              </div>
              <div className="flex justify-between gap-4 text-slate-600">
                <span>Service fee (5%)</span>
                <span>{formatPrice(serviceFee)}</span>
              </div>
              {activeAddOns.map((addon) => (
                <div
                  key={addon.key}
                  className="flex justify-between gap-4 text-slate-600"
                >
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <LuCheck size={14} strokeWidth={3} />
                    {addon.label}
                  </span>
                  <span>+{formatPrice(addon.rate * days)}</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between gap-4 border-t border-borderColor pt-3 font-bold text-slate-900">
                <span>Total</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {!hasValidDates && (
              <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500">
                Select a pick-up and return date to continue.
              </p>
            )}

            <div className="mt-4 flex flex-col gap-2">
              <div className="relative">
                <span
                  aria-hidden="true"
                  className={`animate-pulse-glow pointer-events-none absolute -inset-0.5 rounded-xl ${
                    hasValidDates ? "" : "opacity-0"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleBook("visa")}
                  disabled={!hasValidDates}
                  className="relative inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
                >
                  <span className="grid h-5 w-7 place-items-center rounded-sm bg-white text-[9px] font-extrabold italic text-blue-700 shadow-inner">
                    VISA
                  </span>
                  Pay with VISA
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleBook("khqr")}
                disabled={!hasValidDates}
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
              >
                <span className="grid h-5 w-7 place-items-center rounded-sm bg-amber-400 text-slate-900 shadow-inner">
                  <LuQrCode size={14} strokeWidth={2.5} />
                </span>
                Pay with Bakong KHQR
              </button>
            </div>

            <div className="mt-4 border-t border-borderColor pt-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  What's included
                </h3>
                <ul className="mt-3 space-y-2">
                  {[
                    "Free Cancellation (up to 24h before pick-up)",
                    "Basic Collision Damage Waiver (CDW) included",
                    "Unlimited mileage",
                    "24/7 Roadside Assistance",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs leading-5 text-slate-600"
                    >
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                        <LuCheck size={10} strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Driver requirements
              </h3>
              <ul className="mt-3 space-y-2">
                <li className="flex items-start gap-2 text-xs leading-5 text-slate-600">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-600">
                    <LuCalendarCheck size={10} strokeWidth={2.5} />
                  </span>
                  Minimum age: 21+ years old
                </li>
                <li className="flex items-start gap-2 text-xs leading-5 text-slate-600">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-600">
                    <LuIdCard size={10} strokeWidth={2.5} />
                  </span>
                  Valid Driver's License &amp; Passport / National ID required
                  at pickup
                </li>
              </ul>
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <LuHeadset size={16} className="text-primary" />
                Need help?
              </h3>
              <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-slate-600">
                <LuPhone size={13} className="mt-0.5 shrink-0 text-primary" />
                Have questions about this vehicle? Call us at{" "}
                <a
                  href="tel:+85512345678"
                  className="font-semibold whitespace-nowrap text-primary hover:underline"
                >
                  +855 12 345 678
                </a>{" "}
                or chat with instant support.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-borderColor bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              Renter Feedback &amp; Ratings
            </h3>
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-3xl font-extrabold text-slate-900">4.9</p>
              <div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <LuStar
                      key={star}
                      size={14}
                      className="text-amber-400"
                      fill="currentColor"
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Based on 28 verified reviews
                </p>
              </div>
            </div>

            <ul className="mt-4 space-y-3">
              {RATING_BARS.map((bar) => (
                <li key={bar.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{bar.label}</span>
                    <span className="font-semibold text-slate-900">
                      {bar.value.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                      style={{ width: `${bar.value * 20}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-5 space-y-4 border-t border-borderColor pt-4">
              {REVIEWS.map((review) => (
                <article key={review.name}>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${review.color} text-xs font-bold text-white`}
                    >
                      {review.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                        {review.name}
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-600">
                          <LuCheck size={9} strokeWidth={3.5} />
                          Verified
                        </span>
                      </p>
                      <p className="text-xs text-slate-400">
                        {review.date}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-0.5">
                      {Array.from({ length: review.rating }).map((_, star) => (
                        <LuStar
                          key={star}
                          size={11}
                          className="text-amber-400"
                          fill="currentColor"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    "{review.text}"
                  </p>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default VehicleDetail;