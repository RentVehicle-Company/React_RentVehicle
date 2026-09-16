import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LuArrowRight,
  LuBike,
  LuCheck,
  LuCircleDot,
  LuEye,
  LuHeart,
  LuLayers,
  LuPlus,
  LuSettings2,
} from "react-icons/lu";
import VehicleQuickViewModal from "../VehicleQuickViewModal";
import { useCompare } from "../../context/CompareContext";
import { usePreferences } from "../../context/PreferencesContext";
import { useWishlist } from "../../hooks/useWishlist";

const BikeCard = ({ bike }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showQuickView, setShowQuickView] = useState(false);
  const { isCompared, toggleCompare } = useCompare();
  const { formatPrice, t } = usePreferences();
  const { isWishlisted, toggleWishlist } = useWishlist();

  if (!bike) return null;

  const compared = isCompared(bike.id);
  const wishlisted = isWishlisted(bike.id);

  const specs = bike.specs ?? {};
  const frame = bike.frame_material ?? specs.frame ?? "Aluminum";
  const gears = bike.gears ?? specs.gears ?? "Single-Speed";
  const driveType = bike.fuel_type ?? specs.driveType ?? "Manual";
  const wheelSize = bike.wheel_size ?? specs.wheelSize ?? "26 inch";

  return (
    <article
      className={`group w-full max-w-[280px] overflow-hidden rounded-xl border bg-white dark:bg-slate-800 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/15 ${
        compared ? "border-primary ring-2 ring-primary/20" : "border-borderColor dark:border-slate-700"
      }`}
    >
      <div className="relative flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-700">
        <img
          src={bike.image}
          alt={`${bike.brand} ${bike.model}`}
          className="h-[150px] w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
        {bike.is_available && (
          <span className="absolute left-3 top-3 z-10 inline-flex max-w-[70%] items-center gap-1.5 rounded-full bg-emerald-600/90 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm backdrop-blur-sm">
            <span className="animate-pulse-dot h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
            <span className="truncate">
              {t("available_in", { location: bike.location })}
            </span>
          </span>
        )}

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[5] -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:translate-x-full group-hover:opacity-100"
        />

        <motion.button
          type="button"
          aria-pressed={wishlisted}
          aria-label={
            wishlisted
              ? `${t("remove")} ${bike.brand} ${bike.model}`
              : `Save ${bike.brand} ${bike.model}`
          }
          onClick={() => toggleWishlist(bike.id)}
          whileTap={{ scale: 0.8 }}
          className="absolute right-3 top-3 z-20 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={wishlisted ? "on" : "off"}
              initial={{ scale: 0.3, rotate: -35, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              <LuHeart
                size={18}
                className={
                  wishlisted ? "fill-red-500 text-red-500" : "text-slate-500 dark:text-slate-400"
                }
              />
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {bike.brand} {bike.model}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{bike.category}</p>
          </div>
          <p className="text-right text-xs font-semibold text-slate-900 dark:text-white">
            {formatPrice(bike.price_per_day)}
            <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">
              {t("per_day")}
            </span>
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-2 border-t border-slate-100 dark:border-slate-700 pt-3 text-[11px] text-slate-600 dark:text-slate-300">
          <span className="inline-flex min-w-0 items-center gap-2">
            <LuLayers size={13} className="shrink-0 text-slate-500 dark:text-slate-400" />
            <span className="truncate">{frame}</span>
          </span>
          <span className="inline-flex min-w-0 items-center gap-2">
            <LuSettings2 size={13} className="shrink-0 text-slate-500 dark:text-slate-400" />
            <span className="truncate">{gears}</span>
          </span>
          <span className="inline-flex min-w-0 items-center gap-2">
            <LuBike size={13} className="shrink-0 text-slate-500 dark:text-slate-400" />
            <span className="truncate">{driveType}</span>
          </span>
          <span className="inline-flex min-w-0 items-center gap-2">
            <LuCircleDot size={13} className="shrink-0 text-slate-500 dark:text-slate-400" />
            <span className="truncate">{wheelSize}</span>
          </span>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setShowQuickView(true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-center text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary active:scale-95 cursor-pointer"
          >
            <LuEye size={14} className="shrink-0 text-primary" />
            {t("quick_view")}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/vehicles/${bike.id}${location.search}`)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-black px-3 py-2.5 text-center text-xs font-semibold text-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-800 active:scale-95 cursor-pointer"
          >
            {t("view_vehicle")}
            <LuArrowRight size={14} className="shrink-0" />
          </button>
        </div>
        <button
          type="button"
          aria-pressed={compared}
          onClick={() => toggleCompare(bike.id)}
          className={`mt-2 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-center text-xs font-medium transition-all duration-200 ease-out active:scale-95 ${
            compared
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-dashed border-borderColor dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:text-white dark:hover:text-white"
          }`}
        >
          {compared ? (
            <>
              <LuCheck size={14} />
              {t("in_compare")}
            </>
          ) : (
            <>
              <LuPlus size={14} />
              {t("compare")}
            </>
          )}
        </button>
        <p className="mt-1.5 text-center text-[10px] text-slate-400">
          {t("add_to_compare_hint", { category: "bicycles" })}
        </p>
      </div>
      {showQuickView && (
        <VehicleQuickViewModal
          vehicle={bike}
          onClose={() => setShowQuickView(false)}
        />
      )}
    </article>
  );
};

export default BikeCard;