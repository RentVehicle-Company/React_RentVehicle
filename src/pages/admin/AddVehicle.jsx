import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LuChevronDown,
  LuImage,
  LuMapPin,
  LuTag,
  LuX,
} from "react-icons/lu";
import { assets, CAMBODIA_LOCATIONS } from "../../assets/assets";

const inputClass =
  "w-full px-3.5 py-2.5 bg-white dark:bg-slate-700 border border-borderColor dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass = "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

const CAR_CATEGORIES = [
  "Sports Car",
  "Supercar",
  "Luxury SUV",
  "SUV",
  "Sedan",
  "Hatchback",
  "Electric",
  "Truck",
];

const VEHICLE_TYPES = {
  car: {
    label: "Car",
    categories: CAR_CATEGORIES,
    fuel: "Petrol",
    defaultImage: assets.car_image1,
  },
  motorbike: {
    label: "Motorbike",
    categories: [
      "Scooter",
      "Underbone",
      "Touring",
      "Sportbike",
      "Cruiser",
    ],
    fuel: "Petrol",
    defaultImage: assets.main_car,
  },
  bicycle: {
    label: "Bicycle",
    categories: [
      "Mountain Bike",
      "Road Bike",
      "Hybrid / City Bike",
      "E-Bike / Electric",
    ],
    fuel: "Manual",
    defaultImage: assets.banner_car_image,
  },
};

const CITIES = CAMBODIA_LOCATIONS;

const deriveType = (vehicle) => {
  if (!vehicle) return "car";
  if (vehicle.type) return vehicle.type;
  const cat = String(vehicle.category || "").toLowerCase();
  if (cat.includes("bike") || cat.includes("e-bike")) return "bicycle";
  if (
    [ "scooter", "underbone", "touring", "sportbike", "cruiser" ].some((c) =>
      cat.includes(c)
    ) ||
    /cc|kawasaki|ducati|honda|yamaha/i.test(`${vehicle.brand || ""}`)
  ) {
    return "motorbike";
  }
  return "car";
};

const AddVehicle = ({ mode = "add", vehicle, onClose, onSave }) => {
  const [type, setType] = useState(() => deriveType(vehicle));
  const [category, setCategory] = useState(vehicle?.category || CAR_CATEGORIES[0]);
  const [brand, setBrand] = useState(vehicle?.brand || "");
  const [model, setModel] = useState(vehicle?.model || "");
  const [price, setPrice] = useState(vehicle?.price_per_day ?? "");
  const [year, setYear] = useState(vehicle?.year ?? 2025);
  const [seats, setSeats] = useState(vehicle?.seating_capacity ?? 4);
  const [transmission, setTransmission] = useState(
    vehicle?.transmission || "Automatic"
  );
  const [location, setLocation] = useState(vehicle?.location || "Phnom Penh");
  const [engine, setEngine] = useState(vehicle?.specs?.engine || "");
  const [horsepower, setHorsepower] = useState(
    vehicle?.specs?.horsepower ?? ""
  );
  const [topSpeed, setTopSpeed] = useState(vehicle?.specs?.topSpeed ?? "");
  const [imageUrl, setImageUrl] = useState(vehicle?.image || "");
  const [description, setDescription] = useState(vehicle?.description || "");
  const [available, setAvailable] = useState(
    vehicle ? Boolean(vehicle.is_available) : true
  );

  const typeInfo = VEHICLE_TYPES[type];
  const normalizedCategory = typeInfo.categories.includes(category)
    ? category
    : typeInfo.categories[0];

  const previewImage =
    imageUrl.trim() || typeInfo.defaultImage;

  const categoryOptions = useMemo(() => typeInfo.categories, [typeInfo]);

  useEffect(() => {
    if (!categoryOptions.includes(category)) {
      setCategory(categoryOptions[0]);
    }
  }, [category, categoryOptions]);

  const fuelType = vehicle?.fuel_type || typeInfo.fuel;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!brand.trim() || !model.trim()) return;
    const payload = {
      type,
      brand: brand.trim(),
      model: model.trim(),
      category: normalizedCategory,
      price_per_day: Math.max(0, Number(price) || 0),
      year: Math.max(1990, Number(year) || 2025),
      seating_capacity: Math.max(1, Number(seats) || 1),
      fuel_type: fuelType,
      transmission,
      location,
      description: description.trim() || `No description provided.`,
      image: previewImage,
      specs: {
        engine:
          engine.trim() ||
          (type === "bicycle" ? "Aluminum Frame" : "In-line Engine"),
        horsepower: Number(horsepower) || (type === "bicycle" ? 0.3 : 150),
        topSpeed: Number(topSpeed) || (type === "bicycle" ? 18 : 160),
        ...(type === "bicycle" ? { frame: "Aluminum", gears: "21-Speed" } : {}),
      },
      is_available: available,
    };
    onSave(payload);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {mode === "edit" ? "Edit Vehicle" : "Add New Vehicle"}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {mode === "edit"
                ? `Update ${vehicle?.brand || ""} ${vehicle?.model || ""}`
                : "Register a new vehicle to the fleet"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white"
          >
            <LuX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            {/* Vehicle type */}
            <div>
              <p className={labelClass}>Vehicle Type</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(VEHICLE_TYPES).map(([key, info]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={type === key}
                    onClick={() => setType(key)}
                    className={`cursor-pointer rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                      type === key
                        ? "border-primary/40 bg-primary/5 text-primary"
                        : "border-borderColor dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
                    }`}
                  >
                    {info.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category + name fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="addv-category" className={labelClass}>
                  Category
                </label>
                <div className="relative">
                  <select
                    id="addv-category"
                    value={normalizedCategory}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`${inputClass} appearance-none pr-9 cursor-pointer`}
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <LuChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="addv-transmission" className={labelClass}>
                  Transmission
                </label>
                <select
                  id="addv-transmission"
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className={`${inputClass} appearance-none pr-9 cursor-pointer`}
                >
                  {["Automatic", "Manual", "Semi-Automatic", "CVT"].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="addv-brand" className={labelClass}>
                  Brand / Make
                </label>
                <input
                  id="addv-brand"
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Toyota"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label htmlFor="addv-model" className={labelClass}>
                  Model
                </label>
                <input
                  id="addv-model"
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder={`e.g. ${typeInfo.label === "Bicycle" ? "Marlin 7" : "Camry"}`}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Rate + details */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <label htmlFor="addv-price" className={labelClass}>
                  Rate / day
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    $
                  </span>
                  <input
                    id="addv-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className={`${inputClass} pl-8`}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="addv-year" className={labelClass}>
                  Year
                </label>
                <input
                  id="addv-year"
                  type="number"
                  min="1990"
                  max="2030"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="addv-seats" className={labelClass}>
                  Seats
                </label>
                <input
                  id="addv-seats"
                  type="number"
                  min="1"
                  max="12"
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="addv-location" className={labelClass}>
                  Location
                </label>
                <div className="relative">
                  <LuMapPin
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    id="addv-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={`${inputClass} appearance-none pl-9 pr-8 cursor-pointer`}
                  >
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <LuChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Specs */}
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <LuTag size={13} className="text-primary" />
                Specs
              </p>
              <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label htmlFor="addv-engine" className={labelClass}>
                    Engine
                  </label>
                  <input
                    id="addv-engine"
                    type="text"
                    value={engine}
                    onChange={(e) => setEngine(e.target.value)}
                    placeholder={
                      type === "bicycle" ? "Aluminum Frame" : "e.g. 2.5L I4 / 125cc"
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="addv-hp" className={labelClass}>
                    Horsepower
                  </label>
                  <input
                    id="addv-hp"
                    type="number"
                    value={horsepower}
                    onChange={(e) => setHorsepower(e.target.value)}
                    placeholder="150"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="addv-top-speed" className={labelClass}>
                  Top Speed (km/h)
                </label>
                <input
                  id="addv-top-speed"
                  type="number"
                  value={topSpeed}
                  onChange={(e) => setTopSpeed(e.target.value)}
                  placeholder="180"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Image URL with live preview */}
            <div>
              <label htmlFor="addv-image" className={labelClass}>
                Image URL
              </label>
              <div className="flex items-start gap-3">
                <div className="relative min-w-0 flex-1">
                  <LuImage
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="addv-image"
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://… or leave empty for a default image"
                    className={`${inputClass} pl-9`}
                  />
                </div>
                <img
                  src={previewImage}
                  alt="Vehicle preview"
                  className="h-12 w-16 shrink-0 rounded-lg border border-borderColor object-cover"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                Leave empty to use the default {typeInfo.label.toLowerCase()} photo.
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="addv-desc" className={labelClass}>
                Description (Optional)
              </label>
              <textarea
                id="addv-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short summary of the vehicle experience…"
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Availability toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={available}
              onClick={() => setAvailable((value) => !value)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-borderColor dark:border-slate-600 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <span>
                <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {available ? "Available for rent" : "Under maintenance"}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {available
                    ? "Customers can book this vehicle immediately."
                    : "Hidden from booking while maintenance is in progress."}
                </span>
              </span>
              <span
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${
                  available ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${
                    available ? "left-4.5" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-700 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-borderColor dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-xl bg-slate-900 dark:bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-black dark:hover:bg-primary-dull hover:shadow-md"
            >
              {mode === "edit" ? "Save Changes" : "Add Vehicle"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddVehicle;