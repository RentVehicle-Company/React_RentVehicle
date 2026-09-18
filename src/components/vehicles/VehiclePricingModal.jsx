import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import {
  LuBadgePercent,
  LuCalendarRange,
  LuChevronRight,
  LuX,
} from "react-icons/lu";
import { usePreferences } from "../../context/PreferencesContext";
import CustomDatePicker from "../common/CustomDatePicker";

const DAY_MS = 86400000;
const DISCOUNT_DAYS = 3;
const DISCOUNT_PCT = 0.1;

const toISODate = (date) => date.toISOString().split("T")[0];

const VehiclePricingModal = ({ vehicle, onClose }) => {
  const location = useLocation();
  const { formatPrice, t } = usePreferences();
  const [pickupDate, setPickupDate] = useState(() => toISODate(new Date()));
  const [returnDate, setReturnDate] = useState(() =>
    toISODate(new Date(Date.now() + DAY_MS))
  );

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

  const { days, subtotal, discount, total, hasDiscount } = useMemo(() => {
    const start = new Date(`${pickupDate}T00:00:00`).getTime();
    const end = new Date(`${returnDate}T00:00:00`).getTime();
    const diff = Number.isFinite(end - start) ? (end - start) / DAY_MS : 1;
    const d = Math.max(1, Math.round(diff));
    const sub = d * vehicle.price_per_day;
    const disc = d >= DISCOUNT_DAYS ? sub * DISCOUNT_PCT : 0;
    return {
      days: d,
      subtotal: sub,
      discount: disc,
      total: sub - disc,
      hasDiscount: d >= DISCOUNT_DAYS,
    };
  }, [pickupDate, returnDate, vehicle.price_per_day]);

  return createPortal(
    <div
      className="fixed inset-0 z-[65] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${vehicle.brand} ${vehicle.model} pricing`}
    >
      <div
        className="absolute inset-0 animate-fade-in bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md animate-fade-in overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-2xl">
        <div className="relative h-28 bg-slate-900">
          <img
            src={vehicle.image}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              {vehicle.category}
            </p>
            <h2 className="text-lg font-bold text-white">
              {vehicle.brand} {vehicle.model}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close pricing"
            className="absolute right-3 top-3 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 transition-colors hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
          >
            <LuX size={16} />
          </button>
        </div>

        <div className="p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <LuCalendarRange size={16} className="text-primary" />
            {t("trip_duration")}
            {hasDiscount && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                <LuBadgePercent size={11} />
                {t("save_3plus", { pct: Math.round(DISCOUNT_PCT * 100) })}
              </span>
            )}
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("pickup")}
                </span>
                <CustomDatePicker
                  value={pickupDate}
                  min={toISODate(new Date())}
                  onChange={setPickupDate}
                  placeholder={t("pickup")}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("return")}
                </span>
                <CustomDatePicker
                  value={returnDate}
                  min={pickupDate}
                  onChange={setReturnDate}
                  placeholder={t("return")}
                />
              </label>
            </div>

          <div className="mt-4 space-y-2 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/60 p-4 text-sm">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>
                {formatPrice(vehicle.price_per_day)} × {days}{" "}
                {days === 1 ? "day" : "days"}
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {formatPrice(subtotal)}
              </span>
            </div>

            {hasDiscount && (
              <div className="flex items-center justify-between text-emerald-600">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <LuBadgePercent size={14} />
                  {t("save_3plus", { pct: Math.round(DISCOUNT_PCT * 100) })}
                </span>
                <span className="font-semibold">
                  -{formatPrice(discount)}
                </span>
              </div>
            )}

            {!hasDiscount && (
              <p className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <LuBadgePercent size={13} />
                {t("book_3plus_save", { pct: Math.round(DISCOUNT_PCT * 100) })}
              </p>
            )}

            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-2 text-base">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {t("est_cost")}
              </span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <Link
              to={`/vehicles/${vehicle.id}${location.search}`}
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-dull"
            >
              {t("book_now")}
              <LuChevronRight size={16} />
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

export default VehiclePricingModal;