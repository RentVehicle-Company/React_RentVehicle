import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LuArrowRight,
  LuCheck,
  LuCog,
  LuEye,
  LuFuel,
  LuGauge,
  LuHeart,
  LuPlus,
  LuSettings2,
} from "react-icons/lu";
import VehicleQuickViewModal from "../VehicleQuickViewModal";
import SafeImage from "../common/SafeImage";
import { useCompare } from "../../context/CompareContext";
import { usePreferences } from "../../context/PreferencesContext";
import { useWishlist } from "../../hooks/useWishlist";

const MotoCard = ({ moto }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showQuickView, setShowQuickView] = useState(false);
  const { isCompared, toggleCompare } = useCompare();
  const { formatPrice, t } = usePreferences();
  const { isWishlisted, toggleWishlist } = useWishlist();

  if (!moto) return null;

  const compared = isCompared(moto.id);
  const wishlisted = isWishlisted(moto.id);

  const specs = moto.specs ?? {};
  const displacement = moto.engine_cc ?? specs.displacementCc ?? 125;
  const transmission = moto.transmission ?? specs.transmission ?? "Automatic";
  const efficiency = moto.fuel_efficiency ?? specs.fuelEfficiency ?? 50;
  const topSpeed = moto.top_speed ?? specs.topSpeed ?? 110;

  return (
    <article
      className={`group w-full max-w-[280px] overflow-hidden rounded-xl border bg-white dark:bg-slate-800 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/15 ${
        compared ? "border-primary ring-2 ring-primary/20" : "border-borderColor dark:border-slate-700"
      }`}
    >
      <div className="relative flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-700">
        <SafeImage
          src={moto.image}
          alt={`${moto.brand} ${moto.model}`}
          className="h-[150px] w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
        {moto.is_available && (
          <span className="absolute left-3 top-3 z-10 inline-flex max-w-[70%] items-center gap-1.5 rounded-full bg-emerald-600/90 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm backdrop-blur-sm">
            <span className="animate-pulse-dot h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
            <span className="truncate">
              {t("available_in", { location: moto.location })}
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
              ? `${t("remove")} ${moto.brand} ${moto.model}`
              : `Save ${moto.brand} ${moto.model}`
          }
          onClick={() => toggleWishlist(moto.id)}
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
              {moto.brand} {moto.model}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{moto.category}</p>
          </div>
          <p className="text-right text-xs font-semibold text-slate-900 dark:text-white">
            {formatPrice(moto.price_per_day)}
            <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">
              {t("per_day")}
            </span>
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-2 border-t border-slate-100 dark:border-slate-700 pt-3 text-[11px] text-slate-600 dark:text-slate-300">
          <span className="inline-flex min-w-0 items-center gap-2">
            <LuCog size={13} className="shrink-0 text-slate-500 dark:text-slate-400" />
            <span className="truncate">{displacement} cc</span>
          </span>
          <span className="inline-flex min-w-0 items-center gap-2">
            <LuSettings2 size={13} className="shrink-0 text-slate-500 dark:text-slate-400" />
            <span className="truncate">{transmission.replace("Automatic (CVT)", "Automatic")}</span>
          </span>
          <span className="inline-flex min-w-0 items-center gap-2">
            <LuFuel size={13} className="shrink-0 text-slate-500 dark:text-slate-400" />
            <span className="truncate">{efficiency} km/l</span>
          </span>
          <span className="inline-flex min-w-0 items-center gap-2">
            <LuGauge size={13} className="shrink-0 text-slate-500 dark:text-slate-400" />
            <span className="truncate">{topSpeed} km/h</span>
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
            onClick={() => navigate(`/vehicles/${moto.id}${location.search}`)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-black px-3 py-2.5 text-center text-xs font-semibold text-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-800 active:scale-95 cursor-pointer"
          >
            {t("view_vehicle")}
            <LuArrowRight size={14} className="shrink-0" />
          </button>
        </div>
        <button
          type="button"
          aria-pressed={compared}
          onClick={() => toggleCompare(moto.id)}
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
          {t("add_to_compare_hint", { category: "motorbikes" })}
        </p>
      </div>
      {showQuickView && (
        <VehicleQuickViewModal
          vehicle={moto}
          onClose={() => setShowQuickView(false)}
        />
      )}
    </article>
  );
};

export default MotoCard;