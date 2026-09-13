import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LuCalendar,
  LuFuel,
  LuMapPin,
  LuPause,
  LuPlay,
  LuRotateCcw,
  LuSettings2,
  LuUsers,
  LuX,
} from "react-icons/lu";
import { assets } from "../assets/assets";
import { usePreferences } from "../context/PreferencesContext";

const GALLERY_IMAGES = [
  assets.car_image1,
  assets.car_image2,
  assets.car_image3,
  assets.car_image4,
  assets.main_car,
  assets.banner_car_image,
];

const VehicleQuickViewModal = ({ vehicle, onClose }) => {
  const { formatPrice, t } = usePreferences();
  const [viewMode, setViewMode] = useState("photo");
  const [frameIndex, setFrameIndex] = useState(0);
  const [spinning, setSpinning] = useState(true);

  const frames = [
    vehicle.image,
    ...GALLERY_IMAGES.filter((image) => image !== vehicle.image),
  ];

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

  const specs = [
    { icon: LuUsers, label: t("seats"), value: `${vehicle.seating_capacity} ${t("seats").toLowerCase()}` },
    { icon: LuFuel, label: t("fuel"), value: vehicle.fuel_type },
    { icon: LuSettings2, label: t("transmission"), value: vehicle.transmission },
    { icon: LuCalendar, label: t("year"), value: vehicle.year },
  ];

  return (
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

      <div className="relative w-full max-w-lg animate-fade-in overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="relative">
          {viewMode === "photo" ? (
            <img
              src={vehicle.image}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="h-52 w-full object-cover"
            />
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
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-600/90 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm">
              <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-white" />
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
            className="absolute right-4 top-4 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/90 text-slate-700 shadow-sm transition-colors hover:bg-white hover:text-slate-900"
          >
            <LuX size={18} />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                {vehicle.category}
              </p>
              <h2 className="mt-0.5 text-xl font-bold text-slate-900">
                {vehicle.brand} {vehicle.model}
              </h2>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <LuMapPin size={13} />
                {vehicle.location}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-slate-900">
                {formatPrice(vehicle.price_per_day)}
              </p>
              <p className="text-xs text-slate-500">{t("per_day_label")}</p>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {specs.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 px-2 py-3 text-center"
              >
                <Icon size={16} className="text-slate-500" />
                <dt className="text-[10px] uppercase tracking-wide text-slate-400">
                  {label}
                </dt>
                <dd className="text-xs font-semibold text-slate-900">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            {vehicle.description}
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <Link
              to={`/vehicles/${vehicle.id}`}
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-base font-bold text-white transition-colors hover:bg-primary-dull"
            >
              Proceed to Booking
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl border border-borderColor px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
            >
              {t("close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleQuickViewModal;