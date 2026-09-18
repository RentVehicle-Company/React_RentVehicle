import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  LuChevronDown,
  LuImage,
  LuMapPin,
  LuTag,
  LuX,
  LuLoader,
  LuTriangleAlert,
  LuCircleCheck,
} from "react-icons/lu";
import { assets } from "../../assets/assets";
import { getCategories, getLocations, createVehicle } from "../../services/vehicleServices";
import { toBackendVehicleType } from "../../utils/vehicleTypeMap";

const inputClass =
  "w-full px-3.5 py-2.5 bg-white dark:bg-slate-700 border border-borderColor dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass = "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

const VEHICLE_TYPES = {
  car: {
    label: "Car",
    fuel: "Petrol",
    defaultImage: assets.car_image1,
    apiVehicleType: "car",
  },
  motorbike: {
    label: "Motorbike",
    fuel: "Petrol",
    defaultImage: assets.main_car,
    apiVehicleType: "motorbike",
  },
  bicycle: {
    label: "Bicycle",
    fuel: "Manual",
    defaultImage: assets.banner_car_image,
    apiVehicleType: "bicycle",
  },
};

const TRANSMISSION_OPTIONS = ["Automatic", "Manual", "Semi-Automatic", "CVT"];

const deriveType = (vehicle) => {
  if (!vehicle) return "car";
  if (vehicle.type) return vehicle.type;
  const cat = String(vehicle.category || "").toLowerCase();
  if (cat.includes("bike") || cat.includes("e-bike")) return "bicycle";
  if (
    ["scooter", "underbone", "touring", "sportbike", "cruiser"].some((c) =>
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
  const [category, setCategory] = useState(vehicle?.category || "");
  const [brand, setBrand] = useState(vehicle?.brand || "");
  const [model, setModel] = useState(vehicle?.model || "");
  const [price, setPrice] = useState(vehicle?.price_per_day ?? "");
  const [year, setYear] = useState(vehicle?.modelYear ?? vehicle?.year ?? 2025);
  const [seats, setSeats] = useState(vehicle?.seating_capacity ?? 4);
  const [transmission, setTransmission] = useState(
    vehicle?.transmission || "Automatic"
  );
  const [location, setLocation] = useState(vehicle?.location || "");
  const [engine, setEngine] = useState(vehicle?.engineCc ?? vehicle?.specs?.engine ?? "");
  const [horsepower, setHorsepower] = useState(
    vehicle?.specs?.horsepower ?? ""
  );
  const [topSpeed, setTopSpeed] = useState(vehicle?.topSpeed ?? vehicle?.specs?.topSpeed ?? "");
  const [imageUrl, setImageUrl] = useState(vehicle?.image || "");
  const [description, setDescription] = useState(vehicle?.description || "");
  const [available, setAvailable] = useState(
    vehicle ? Boolean(vehicle.isAvailable ?? vehicle.is_available) : true
  );

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const typeInfo = VEHICLE_TYPES[type];
  const previewImage = imageUrl.trim() || typeInfo.defaultImage;

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const data = await getCategories(toBackendVehicleType(typeInfo.apiVehicleType));
      setCategories(data);
      if (data.length > 0 && !category) {
        setCategory(data[0].name);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, [type]);

  const fetchLocations = useCallback(async () => {
    setLocationsLoading(true);
    try {
      const data = await getLocations();
      setLocations(data);
      if (data.length > 0 && !location) {
        setLocation(data[0].city || data[0].name || data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch locations:", err);
      setLocations([]);
    } finally {
      setLocationsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  useEffect(() => {
    if (categories.length > 0 && !categories.some((c) => c.name === category)) {
      setCategory(categories[0]?.name || "");
    }
  }, [categories]);

  const fuelType = vehicle?.fuelType ?? vehicle?.fuel_type ?? typeInfo.fuel;

  const adaptBackendVehicle = (v) => {
    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
    const categorySlugMap = Object.fromEntries(categories.map((c) => [c.id, c.slug]));
    const locationMap = Object.fromEntries(locations.map((l) => [l.id, l.city || l.name]));
    const PLACEHOLDER_IMAGE =
      "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23334155'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='20' fill='%2394a3b8' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

    return {
      id: v.id,
      brand: v.brand,
      model: v.model,
      image: v.image || PLACEHOLDER_IMAGE,
      images: v.images?.length ? v.images : [],
      year: v.modelYear,
      category: categoryMap[v.categoryId] ?? "Uncategorized",
      categorySlug: categorySlugMap[v.categoryId] ?? null,
      categoryId: v.categoryId,
      seating_capacity: v.seatingCapacity,
      fuel_type: v.fuelType,
      transmission: v.transmission,
      price_per_day: v.pricePerDay,
      location: locationMap[v.locationId] ?? "Unknown",
      description: v.description,
      is_available: v.isAvailable,
      engine_cc: v.engineCc,
      fuel_efficiency: v.fuelEfficiency,
      top_speed: v.topSpeed,
      gears: v.speeds,
      frame_material: v.material,
      wheel_size: v.wheelSize,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!brand.trim() || !model.trim()) {
      setError("Brand and Model are required");
      return;
    }
    if (!category) {
      setError("Please select a category");
      return;
    }
    if (!location) {
      setError("Please select a location");
      return;
    }

    const selectedCategory = categories.find((c) => c.name === category);
    const selectedLocation = locations.find(
      (l) => l.city === location || l.name === location || l.id === location
    );

    if (!selectedCategory) {
      setError("Invalid category selected");
      return;
    }
    if (!selectedLocation) {
      setError("Invalid location selected");
      return;
    }

    setSubmitting(true);

    const payload = {
      name: `${brand.trim()} ${model.trim()}`,
      brand: brand.trim(),
      model: model.trim(),
      modelYear: Math.max(1990, Number(year) || 2025),
      licensePlate: "",
      transmission,
      fuelType,
      seatingCapacity: Math.max(1, Number(seats) || 1),
      material: engine.trim() || (type === "bicycle" ? "Aluminum Frame" : ""),
      speeds: type === "bicycle" ? "21-Speed" : "",
      wheelSize: "",
      engineCc: type !== "bicycle" ? engine.trim() : "",
      fuelEfficiency: "",
      topSpeed: Number(topSpeed) || "",
      pricePerDay: Math.max(0, Number(price) || 0),
      description: description.trim() || "No description provided.",
      isAvailable: available,
      categoryId: selectedCategory.id,
      locationId: selectedLocation.id,
    };

    try {
      const createdVehicle = await createVehicle(payload);
      setSuccess(true);
      setTimeout(() => {
        onSave(adaptBackendVehicle(createdVehicle));
      }, 500);
    } catch (err) {
      console.error("Failed to create vehicle:", err);
      if (err.status === 401 || err.status === 403) {
        setError("Unauthorized: Please log in again as admin");
      } else if (err.status === 400) {
        setError(err.message || "Invalid input. Please check all fields.");
      } else if (err.status === 422) {
        setError(err.message || "Validation failed. Please check your input.");
      } else {
        setError(err.message || "Failed to create vehicle. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
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
            disabled={submitting}
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LuX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto px-6 py-5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-500 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-400 dark:[&::-webkit-scrollbar-thumb:hover]:bg-slate-500">
          {(error || success) && (
            <div
              className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
                success
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {success ? (
                <>
                  <LuCircleCheck size={18} />
                  Vehicle created successfully!
                </>
              ) : (
                <>
                  <LuTriangleAlert size={18} />
                  {error}
                </>
              )}
            </div>
          )}

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
                    disabled={submitting}
                    className={`cursor-pointer rounded-xl border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
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
                  {categoriesLoading ? (
                    <div className="flex items-center gap-2 text-slate-400">
                      <LuLoader className="animate-spin" size={16} />
                      Loading categories...
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="text-slate-400 text-sm">No categories found</div>
                  ) : (
                    <>
                      <select
                        id="addv-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={submitting}
                        className={`${inputClass} appearance-none pr-9 cursor-pointer`}
                        required
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <LuChevronDown
                        size={15}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </>
                  )}
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
                  disabled={submitting}
                  className={`${inputClass} appearance-none pr-9 cursor-pointer`}
                >
                  {TRANSMISSION_OPTIONS.map((t) => (
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
                  disabled={submitting}
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
                  disabled={submitting}
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
                    disabled={submitting}
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
                  disabled={submitting}
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
                  disabled={submitting}
                />
              </div>
              <div>
                <label htmlFor="addv-location" className={labelClass}>
                  Location
                </label>
                <div className="relative">
                  {locationsLoading ? (
                    <div className="flex items-center gap-2 text-slate-400">
                      <LuLoader className="animate-spin" size={16} />
                      Loading locations...
                    </div>
                  ) : locations.length === 0 ? (
                    <div className="text-slate-400 text-sm">No locations found</div>
                  ) : (
                    <>
                      <LuMapPin
                        size={14}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <select
                        id="addv-location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        disabled={submitting}
                        className={`${inputClass} appearance-none pl-9 pr-8 cursor-pointer`}
                        required
                      >
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.city || loc.name || loc.id}>
                            {loc.city || loc.name}
                          </option>
                        ))}
                      </select>
                      <LuChevronDown
                        size={14}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </>
                  )}
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
                    disabled={submitting}
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
                    disabled={submitting}
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
                  disabled={submitting}
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
                    disabled={submitting}
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
                disabled={submitting}
              />
            </div>

            {/* Availability toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={available}
              onClick={() => setAvailable((value) => !value)}
              disabled={submitting}
              className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-borderColor dark:border-slate-600 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
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
              disabled={submitting}
              className="cursor-pointer rounded-xl border border-borderColor dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer rounded-xl bg-slate-900 dark:bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-black dark:hover:bg-primary-dull hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && <LuLoader size={16} className="animate-spin" />}
              {mode === "edit" ? "Save Changes" : "Add Vehicle"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddVehicle;