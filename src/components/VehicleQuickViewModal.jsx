import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import {
  LuBike,
  LuCalendarHeart,
  LuCheck,
  LuChevronRight,
  LuCircleDot,
  LuCog,
  LuCompass,
  LuFuel,
  LuGauge,
  LuLayers,
  LuMapPin,
  LuPause,
  LuPlay,
  LuRotateCcw,
  LuSettings2,
  LuTimer,
  LuX,
  LuZap,
} from "react-icons/lu";
import { isAutomobile, isBicycle, isMotorbike } from "../services/vehicleServices";
import { usePreferences } from "../context/PreferencesContext";

// Builds a gallery from a vehicle's own primary image (crop variants), so the
// quick view never mixes in photos of other vehicles.
const buildGallery = (primary) => {
  if (!primary) return [];
  const gallery = [primary];
  if (primary.includes("unsplash.com")) {
    const base = primary.split("?")[0];
    const crops = [
      { fit: "crop", crop: "faces", w: 800, h: 600, q: 80 },
      { fit: "crop", crop: "entropy", w: 900, h: 500, q: 80 },
      { fit: "crop", w: 1000, h: 400, q: 80 },
      { fit: "crop", crop: "faces", w: 600, h: 800, q: 80 },
    ];
    for (let i = 0; i < crops.length; i++) {
      const p = new URLSearchParams(
        Object.entries(crops[i]).map(([k, v]) => [k, String(v)])
      );
      p.set("auto", "format");
      gallery.push(`${base}?${p.toString()}`);
    }
  }
  return gallery.slice(0, 6);
};

const CATEGORY_ACCELERATION = {
  "Sports Car": 4.4,
  Supercar: 3.3,
  "Luxury SUV": 5.8,
  SUV: 7.2,
  Sedan: 9.4,
  Hatchback: 10.8,
  Electric: 5.6,
  Truck: 8.4,
};

const estimateAcceleration = (vehicle) => {
  const base = CATEGORY_ACCELERATION[vehicle.category] ?? 8.6;
  const variation = (((vehicle.id % 5) - 2) * 0.3).toFixed(1);
  return Math.max(2.5, Math.round((base + Number(variation)) * 10) / 10);
};

const FEATURE_BADGES = [
  "GPS Navigation",
  "Bluetooth Audio",
  "Leather Seats",
  "Cruise Control",
  "Apple CarPlay",
  "360° Camera",
];

const deriveBadges = (vehicle, count = 4) => {
  const start = ((vehicle.id % FEATURE_BADGES.length) + FEATURE_BADGES.length) % FEATURE_BADGES.length;
  return [
    ...FEATURE_BADGES.slice(start),
    ...FEATURE_BADGES.slice(0, start),
  ].slice(0, count);
};

const VehicleQuickViewModal = ({ vehicle, onClose }) => {
  const location = useLocation();
  const { formatPrice, t } = usePreferences();
  const [viewMode, setViewMode] = useState("photo");
  const [activeImg, setActiveImg] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [spinning, setSpinning] = useState(true);

  const frames = vehicle.images?.length
    ? vehicle.images
    : buildGallery(vehicle.image);
  const badges = deriveBadges(vehicle);

  const deriveTiles = () => {
    const s = vehicle.specs ?? {};

    if (isBicycle(vehicle)) {
      return [
        {
          icon: LuLayers,
          label: "Frame",
          value: s.frame ?? vehicle.frame_material ?? "Aluminum",
          iconBox: "bg-emerald-100 text-emerald-600",
          hover: "hover:shadow-emerald-500/20",
        },
        {
          icon: LuSettings2,
          label: "Gears",
          value: s.gears ?? vehicle.gears ?? "Single-Speed",
          iconBox: "bg-teal-100 text-teal-600",
          hover: "hover:shadow-teal-500/20",
        },
        {
          icon: LuBike,
          label: "Type",
          value: s.driveType ?? vehicle.fuel_type ?? vehicle.category,
          iconBox: "bg-lime-100 text-lime-600",
          hover: "hover:shadow-lime-500/20",
        },
        {
          icon: LuCircleDot,
          label: "Wheel",
          value: s.wheelSize ?? vehicle.wheel_size ?? "26 inch",
          iconBox: "bg-green-100 text-green-600",
          hover: "hover:shadow-green-500/20",
        },
      ];
    }

    if (isMotorbike(vehicle)) {
      return [
        {
          icon: LuCog,
          label: "Engine",
          value: `${s.displacementCc ?? vehicle.engine_cc ?? 125} cc`,
          iconBox: "bg-orange-100 text-orange-600",
          hover: "hover:shadow-orange-500/20",
        },
        {
          icon: LuSettings2,
          label: "Transmission",
          value: s.transmission ?? vehicle.transmission ?? "Automatic",
          iconBox: "bg-yellow-100 text-yellow-600",
          hover: "hover:shadow-yellow-500/20",
        },
        {
          icon: LuFuel,
          label: "Efficiency",
          value: `${s.fuelEfficiency ?? vehicle.fuel_efficiency ?? 45} km/l`,
          iconBox: "bg-blue-100 text-blue-600",
          hover: "hover:shadow-blue-500/20",
        },
        {
          icon: LuGauge,
          label: "Top Speed",
          value: `${s.topSpeed ?? vehicle.top_speed ?? 110} km/h`,
          iconBox: "bg-cyan-100 text-cyan-600",
          hover: "hover:shadow-cyan-500/20",
        },
      ];
    }

    if (isAutomobile(vehicle)) {
      const liveSpecs = {
        topSpeed: s.topSpeed ?? vehicle.specs?.topSpeed ?? 200,
        acceleration:
          s.acceleration ??
          vehicle.specs?.acceleration ??
          estimateAcceleration(vehicle),
        horsepower: s.horsepower ?? vehicle.specs?.horsepower ?? 180,
        drive:
          s.drive ??
          (vehicle.transmission?.includes("All") ||
          vehicle.transmission?.includes("Auto")
            ? "AWD"
            : "FWD"),
      };
      return [
        {
          icon: LuTimer,
          label: "0-100 km/h",
          value: `${liveSpecs.acceleration} s`,
          iconBox: "bg-blue-100 text-blue-600",
          hover: "hover:shadow-blue-500/20",
        },
        {
          icon: LuGauge,
          label: "Top Speed",
          value: `${liveSpecs.topSpeed} km/h`,
          iconBox: "bg-cyan-100 text-cyan-600",
          hover: "hover:shadow-cyan-500/20",
        },
        {
          icon: LuZap,
          label: "Horsepower",
          value: `${liveSpecs.horsepower} HP`,
          iconBox: "bg-indigo-100 text-indigo-600",
          hover: "hover:shadow-indigo-500/20",
        },
        {
          icon: LuCompass,
          label: "Drivetrain",
          value: liveSpecs.drive,
          iconBox: "bg-sky-100 text-sky-600",
          hover: "hover:shadow-sky-500/20",
        },
      ];
    }

    return [];
  };

  const specs = deriveTiles();

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    if (viewMode !== "360" || !spinning) return;
    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, 350);
    return () => clearInterval(timer);
  }, [viewMode, spinning, frames.length]);

  if (!vehicle) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${vehicle.brand} ${vehicle.model} quick view`}
    >
      <div
        className="absolute inset-0 animate-fade-in bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg animate-fade-in overflow-hidden rounded-t-2xl bg-white dark:bg-slate-800 shadow-2xl sm:rounded-2xl">
        <div className="relative">
          {viewMode === "photo" ? (
            <div className="relative h-52 w-full overflow-hidden">
              <img
                src={frames[activeImg]}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="h-full w-full object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
              />
              <div className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-md">
                <LuRotateCcw size={11} className="animate-spin-slow" />
                Interactive 360° available
              </div>
            </div>
          ) : (
            <div className="relative h-52 w-full overflow-hidden bg-slate-900">
              <img
                src={frames[frameIndex]}
                alt=""
                className="h-full w-full object-cover opacity-90"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-slate-950/70 to-transparent p-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFrameIndex((prev) => (prev - 1 + frames.length) % frames.length)
                    }
                    aria-label="Previous frame"
                    className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
                  >
                    <LuRotateCcw size={14} />
                  </button>
                  <button
                    type="button"
                    aria-pressed={spinning}
                    onClick={() => setSpinning((on) => !on)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/40"
                  >
                    {spinning ? <LuPause size={13} /> : <LuPlay size={13} />}
                    {spinning ? "Auto" : "Play"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFrameIndex((prev) => (prev + 1) % frames.length)
                    }
                    aria-label="Next frame"
                    className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
                  >
                    <LuRotateCcw size={14} className="rotate-180" />
                  </button>
                </div>
                <span className="mt-1.5 text-[10px] text-white/70">
                  360° View · {frameIndex + 1}/{frames.length}
                </span>
              </div>
            </div>
          )}

          {vehicle.is_available && (
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg shadow-emerald-500/40 backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              {t("available_now")}
            </span>
          )}

          <div className="absolute bottom-3 left-4 flex gap-1">
            {[
              { key: "photo", label: "Photo" },
              { key: "360", label: "360° View" },
            ].map((tab) => {
              const isActive = viewMode === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setViewMode(tab.key)}
                  className={`cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold shadow-sm transition-colors ${
                    isActive
                      ? "bg-white text-slate-900"
                      : "bg-white/70 text-slate-600 hover:bg-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close quick view"
            className="absolute right-4 top-4 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 shadow-sm transition-colors hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
          >
            <LuX size={18} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 p-2">
          {frames.map((src, index) => (
            <button
              key={src + index}
              type="button"
              aria-label={`Photo ${index + 1}`}
              onClick={() => {
                setActiveImg(index);
                setViewMode("photo");
              }}
              className={`h-12 w-16 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-colors ${
                viewMode === "photo" && activeImg === index
                  ? "border-primary"
                  : "border-transparent hover:border-slate-300"
              }`}
            >
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                {vehicle.category}
              </p>
              <h2 className="mt-0.5 text-xl font-bold text-slate-900 dark:text-white">
                {vehicle.brand} {vehicle.model}
              </h2>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <LuMapPin size={13} />
                {vehicle.location}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {formatPrice(vehicle.price_per_day)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("per_day_label")}</p>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {specs.map(({ icon: Icon, label, value, iconBox, hover }) => (
              <div
                key={label}
                className={`group flex flex-col items-center gap-1.5 rounded-xl bg-white dark:bg-slate-700 px-2 py-3 text-center shadow-sm ring-1 ring-slate-100 dark:ring-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${hover}`}
              >
                <span
                  className={`grid h-8 w-8 place-items-center rounded-lg ${iconBox} transition-transform duration-200 group-hover:scale-110`}
                >
                  <Icon size={16} />
                </span>
                <dt className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {label}
                </dt>
                <dd className="text-xs font-semibold text-slate-900 dark:text-white">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-200"
              >
                <LuCheck size={12} className="text-primary" strokeWidth={3} />
                {badge}
              </span>
            ))}
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {vehicle.description}
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <div className="relative">
              <span
                aria-hidden="true"
                className="animate-pulse-glow pointer-events-none absolute -inset-1 rounded-xl"
              />
              <Link
                to={`/vehicles/${vehicle.id}${location.search}`}
                onClick={onClose}
                className="group relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dull px-5 py-3 text-base font-bold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary/40 active:scale-95"
              >
                <LuCalendarHeart size={18} />
                {t("book_now")}
                <LuChevronRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </div>
            <Link
              to={`/vehicles/${vehicle.id}${location.search}`}
              onClick={onClose}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary/30 bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:border-primary hover:bg-primary hover:text-white active:scale-95"
            >
              View Full Specs &amp; Book
              <LuChevronRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-borderColor dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {t("close")}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default VehicleQuickViewModal;