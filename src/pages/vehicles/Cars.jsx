import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuChevronLeft,
  LuChevronRight,
  LuSearch,
  LuSlidersHorizontal,
  LuX,
} from "react-icons/lu";
import { getVehicles } from "../../services/vehicleServices";
import CarCard from "../../components/vehicles/CarCard";

const PAGE_SIZE = 6;

const CATEGORY_OPTIONS = ["Sports Cars", "Luxury", "SUVs", "Sedans"];

const CATEGORY_FILTERS = {
  "Sports Cars": ["Sports Car", "Supercar"],
  Luxury: ["Luxury", "Luxury SUV"],
  SUVs: ["SUV"],
  Sedans: ["Sedan"],
};

const TRANSMISSION_OPTIONS = ["Automatic", "Manual", "Semi-Automatic"];

const PRICE_MIN = 50;
const PRICE_MAX = 500;

const inputClass =
  "w-full px-4 py-2.5 bg-white border border-borderColor rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

const Cars = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(
    searchParams.get("location") || ""
  );
  const [pickupDate, setPickupDate] = useState(
    searchParams.get("pickup") || ""
  );
  const [returnDate, setReturnDate] = useState(
    searchParams.get("return") || ""
  );
  const [categories, setCategories] = useState(() => {
    const cat = searchParams.get("category");
    return cat ? [cat] : [];
  });
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [transmission, setTransmission] = useState("all");
  const [sort, setSort] = useState("price-low");
  const [page, setPage] = useState(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    getVehicles().then((data) => {
      setVehicles(data);
      setLoading(false);
    });
  }, []);

  const locations = useMemo(
    () => [...new Set(vehicles.map((vehicle) => vehicle.location))],
    [vehicles]
  );

  const filtered = useMemo(() => {
    let list = vehicles;
    if (location) {
      list = list.filter((vehicle) => vehicle.location === location);
    }
    if (pickupDate || returnDate) {
      const start = pickupDate
        ? new Date(`${pickupDate}T00:00:00`).getTime()
        : 0;
      const end = returnDate
        ? new Date(`${returnDate}T23:59:59`).getTime()
        : Number.POSITIVE_INFINITY;
      list = list.filter((vehicle) => {
        if (
          !Array.isArray(vehicle.bookedDates) ||
          vehicle.bookedDates.length === 0
        ) {
          return true;
        }
        return !vehicle.bookedDates.some((date) => {
          const t = new Date(`${date}T00:00:00`).getTime();
          return t >= start && t <= end;
        });
      });
    }
    if (categories.length > 0) {
      const allowed = categories.flatMap((c) => CATEGORY_FILTERS[c] || []);
      list = list.filter((vehicle) => allowed.includes(vehicle.category));
    }
    if (maxPrice < PRICE_MAX) {
      list = list.filter((vehicle) => vehicle.price_per_day <= maxPrice);
    }
    if (transmission !== "all") {
      list = list.filter((vehicle) => vehicle.transmission === transmission);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((vehicle) =>
        `${vehicle.brand} ${vehicle.model} ${vehicle.category}`
          .toLowerCase()
          .includes(q)
      );
    }
    if (sort === "price-low") {
      list = [...list].sort((a, b) => a.price_per_day - b.price_per_day);
    } else if (sort === "price-high") {
      list = [...list].sort((a, b) => b.price_per_day - a.price_per_day);
    } else {
      list = [...list].sort((a, b) =>
        `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`)
      );
    }
    return list;
  }, [
    vehicles,
    location,
    pickupDate,
    returnDate,
    categories,
    maxPrice,
    transmission,
    query,
    sort,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const pageVehicles = filtered.slice(pageStart, pageEnd);

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    const items = [1];
    if (start > 2) items.push("left-ellipsis");
    for (let i = start; i <= end; i += 1) items.push(i);
    if (end < totalPages - 1) items.push("right-ellipsis");
    items.push(totalPages);
    return items;
  }, [totalPages, currentPage]);

  const toggleCategory = (label) => {
    setCategories((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
    setPage(1);
  };

  const badges = [];
  if (query.trim()) {
    badges.push({
      key: "query",
      label: `Search: "${query.trim()}"`,
      clear: () => {
        setQuery("");
        setPage(1);
      },
    });
  }
  if (location) {
    badges.push({
      key: "location",
      label: `Location: ${location}`,
      clear: () => {
        setLocation("");
        setPage(1);
      },
    });
  }
  if (pickupDate) {
    badges.push({
      key: "pickup",
      label: `Pickup: ${pickupDate}`,
      clear: () => {
        setPickupDate("");
        setPage(1);
      },
    });
  }
  if (returnDate) {
    badges.push({
      key: "return",
      label: `Return: ${returnDate}`,
      clear: () => {
        setReturnDate("");
        setPage(1);
      },
    });
  }
  categories.forEach((cat) =>
    badges.push({
      key: `category-${cat}`,
      label: `Category: ${cat}`,
      clear: () => toggleCategory(cat),
    })
  );
  if (transmission !== "all") {
    badges.push({
      key: "transmission",
      label: `Transmission: ${transmission}`,
      clear: () => {
        setTransmission("all");
        setPage(1);
      },
    });
  }
  if (maxPrice < PRICE_MAX) {
    badges.push({
      key: "price",
      label: `Max Price: $${maxPrice}/day`,
      clear: () => {
        setMaxPrice(PRICE_MAX);
        setPage(1);
      },
    });
  }

  const clearAll = () => {
    setSearchParams({}, { replace: true });
    setQuery("");
    setLocation("");
    setPickupDate("");
    setReturnDate("");
    setCategories([]);
    setMaxPrice(PRICE_MAX);
    setTransmission("all");
    setSort("price-low");
    setPage(1);
  };

  const renderFilters = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="car-search" className={labelClass}>
          Search vehicle
        </label>
        <div className="relative">
          <LuSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            id="car-search"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Brand, model or category"
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Category</label>
        <div className="space-y-2">
          {CATEGORY_OPTIONS.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={categories.includes(option)}
                onChange={() => toggleCategory(option)}
                className="h-4 w-4 rounded border-borderColor accent-primary cursor-pointer"
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className={labelClass}>Price / day</label>
          <span className="text-sm font-semibold text-slate-900">
            ${PRICE_MIN} – ${maxPrice}
          </span>
        </div>
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={5}
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(Number(e.target.value));
            setPage(1);
          }}
          className="w-full accent-primary cursor-pointer"
          aria-label={`Maximum price $${maxPrice}`}
        />
        <div className="mt-1 flex justify-between text-[11px] text-slate-400">
          <span>${PRICE_MIN}</span>
          <span>${PRICE_MAX}</span>
        </div>
      </div>

      <div>
        <label className={labelClass}>Transmission</label>
        <div className="space-y-1.5">
          {["all", ...TRANSMISSION_OPTIONS].map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700"
            >
              <input
                type="radio"
                name="transmission"
                value={option}
                checked={transmission === option}
                onChange={() => {
                  setTransmission(option);
                  setPage(1);
                }}
                className="h-4 w-4 accent-primary cursor-pointer"
              />
              {option === "all" ? "All" : option}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="car-location" className={labelClass}>
          Location
        </label>
        <select
          id="car-location"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setPage(1);
          }}
          className={inputClass}
        >
          <option value="">All Locations</option>
          {locations.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Rent a Car
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Browse our fleet and find the right vehicle for your trip.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block self-start">
          <div className="rounded-2xl border border-borderColor bg-white shadow-sm">
            <AnimatePresence initial={false}>
              {!sidebarCollapsed && (
                <motion.div
                  key="filters-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-borderColor px-5 py-4">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <LuSlidersHorizontal size={16} className="text-primary" />
                      Filters
                    </h2>
                    <button
                      type="button"
                      onClick={() => setSidebarCollapsed(true)}
                      aria-label="Collapse filters"
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <LuChevronLeft size={16} />
                    </button>
                  </div>
                  <div className="p-5">{renderFilters()}</div>
                </motion.div>
              )}
            </AnimatePresence>
            {sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                className="flex w-full items-center justify-between gap-2 px-5 py-4 text-sm font-semibold text-slate-900 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <LuSlidersHorizontal size={16} className="text-primary" />
                  Filters
                </span>
                {badges.length > 0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">
                    {badges.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-borderColor bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer lg:hidden"
              >
                <LuSlidersHorizontal size={15} />
                Filters
                {badges.length > 0 && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {badges.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSidebarCollapsed((prev) => !prev)}
                className="hidden items-center gap-2 rounded-xl border border-borderColor bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer lg:inline-flex"
              >
                <LuSlidersHorizontal size={15} />
                {sidebarCollapsed ? "Expand Filters" : "Collapse Filters"}
              </button>
            </div>

            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {filtered.length}
              </span>{" "}
              {filtered.length === 1 ? "Vehicle" : "Vehicles"}
            </p>

            <div className="ml-auto flex items-center gap-3">
              <label htmlFor="car-sort" className="sr-only">
                Sort by
              </label>
              <select
                id="car-sort"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className={`${inputClass} w-auto cursor-pointer`}
              >
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-az">Name A-Z</option>
              </select>
            </div>
          </div>

          {badges.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {badges.map((badge) => (
                <button
                  key={badge.key}
                  type="button"
                  onClick={badge.clear}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {badge.label}
                  <LuX size={12} className="text-slate-500" />
                </button>
              ))}
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-semibold text-primary hover:text-primary-dull transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}

          <div className="mt-6">
            {loading ? (
              <p className="text-sm text-slate-500">Loading vehicles...</p>
            ) : filtered.length > 0 ? (
              <>
                <motion.div
                  layout
                  className="grid grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 xl:grid-cols-3"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {pageVehicles.map((car, index) => (
                      <motion.div
                        key={car.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.97 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          transition: {
                            type: "spring",
                            stiffness: 320,
                            damping: 26,
                            delay: index * 0.05,
                          },
                        }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ layout: { duration: 0.35, ease: "easeOut" } }}
                        className="w-full max-w-[280px]"
                      >
                        <CarCard car={car} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {filtered.length > PAGE_SIZE && (
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs text-slate-500">
                      Showing {pageStart + 1}-
                      {Math.min(pageEnd, filtered.length)} of {filtered.length}{" "}
                      vehicles
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Previous page"
                        disabled={currentPage === 1}
                        onClick={() => setPage(currentPage - 1)}
                        className="rounded border border-borderColor p-1.5 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                      >
                        <LuChevronLeft size={14} />
                      </button>
                      {visiblePages.map((item, index) =>
                        item === "left-ellipsis" ||
                        item === "right-ellipsis" ? (
                          <span
                            key={`${item}-${index}`}
                            className="px-1 text-slate-400"
                          >
                            &hellip;
                          </span>
                        ) : (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setPage(item)}
                            className={`min-w-[32px] rounded px-2 py-1.5 text-xs font-medium transition cursor-pointer ${
                              item === currentPage
                                ? "bg-primary text-white"
                                : "border border-borderColor text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}
                      <button
                        type="button"
                        aria-label="Next page"
                        disabled={currentPage === totalPages}
                        onClick={() => setPage(currentPage + 1)}
                        className="rounded border border-borderColor p-1.5 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                      >
                        <LuChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white border border-borderColor rounded-2xl p-10 text-center">
                <p className="text-base font-semibold text-slate-900">
                  No vehicles found
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Try adjusting or clearing your search filters.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-block mt-5 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-black hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-slate-900/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto bg-white p-5 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <LuSlidersHorizontal size={18} className="text-primary" />
                  Filters
                  {badges.length > 0 && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">
                      {badges.length}
                    </span>
                  )}
                </h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filters"
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <LuX size={20} />
                </button>
              </div>
              {renderFilters()}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="mt-7 w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-dull cursor-pointer"
              >
                Show {filtered.length}{" "}
                {filtered.length === 1 ? "Vehicle" : "Vehicles"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cars;