import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, animate } from "framer-motion";
import {
  LuCalendarDays,
  LuShieldCheck,
  LuTimer,
  LuZap,
} from "react-icons/lu";
import Title from "./Title";

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value]);

  return <>{display}</>;
}

const TIER_RATES = {
  Sports: 120,
  SUV: 90,
  Luxury: 180,
};

const VEHICLE_TIER = {
  bmw: "Sports",
  urus: "Luxury",
  raptor: "SUV",
};

const VEHICLE_NAMES = {
  bmw: "BMW M4 CSL",
  urus: "Lamborghini Urus",
  raptor: "Ford F-150 Raptor",
};

const ADD_ONS = [
  {
    key: "insurance",
    label: "Full Insurance",
    hint: "Collision & theft coverage",
    rate: 25,
    icon: LuShieldCheck,
  },
  {
    key: "protection",
    label: "Premium Protection",
    hint: "Priority roadside assistance",
    rate: 15,
    icon: LuZap,
  },
];

const PriceEstimator = ({ vehicle = null }) => {
  const [duration, setDuration] = useState(3);
  const [tier, setTier] = useState("Sports");
  const [addOns, setAddOns] = useState({ insurance: false, protection: true });

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    if (VEHICLE_TIER[vehicle]) setTier(VEHICLE_TIER[vehicle]);
  }, [vehicle]);

  const fillPct = ((duration - 1) / 13) * 100;

  const baseTotal = TIER_RATES[tier] * duration;
  const addOnTotal = ADD_ONS.reduce(
    (sum, addOn) => sum + (addOns[addOn.key] ? addOn.rate * duration : 0),
    0
  );
  const total = baseTotal + addOnTotal;

  const toggleAddOn = (key) =>
    setAddOns((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <section className="bg-slate-50 px-4 py-12 sm:px-6 sm:py-16 lg:px-16">
      <Title
        title="Rental Price Estimator"
        subTitle="Get an instant estimate for your perfect ride — adjust and watch the price update live."
      />

      <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-[1fr_320px]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -60px 0px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="rounded-2xl border border-borderColor bg-white p-6 shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="duration-slider"
                className="flex items-center gap-2 text-sm font-medium text-slate-700"
              >
                <LuCalendarDays size={16} className="text-primary" />
                Rental Duration
              </label>
              <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
                {duration} {duration === 1 ? "day" : "days"}
              </span>
            </div>
            <input
              id="duration-slider"
              type="range"
              min={1}
              max={14}
              step={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="mt-4 w-full cursor-pointer accent-primary"
              style={{
                background: `linear-gradient(90deg, #2563eb ${fillPct}%, #e2e8f0 ${fillPct}%)`,
                borderRadius: "9999px",
                height: "6px",
              }}
            />
            <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
              <span>1 day</span>
              <span>14 days</span>
            </div>
          </div>

          <div className="mt-6">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <LuTimer size={16} className="text-primary" />
              Vehicle Tier
            </span>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {Object.keys(TIER_RATES).map((key) => {
                const isActive = tier === key;
                return (
                  <motion.button
                    key={key}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    aria-pressed={isActive}
                    onClick={() => setTier(key)}
                    className={`relative cursor-pointer overflow-hidden rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "border-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-900"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="tier-active-pill"
                        className="absolute inset-0 bg-slate-900"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{key}</span>
                    <span
                      className={`relative z-10 mt-0.5 block text-[11px] font-normal ${
                        isActive ? "text-slate-300" : "text-slate-400"
                      }`}
                    >
                      ${TIER_RATES[key]}/day
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <LuShieldCheck size={16} className="text-primary" />
              Add-Ons
            </span>
            {ADD_ONS.map(({ key, label, hint, rate, icon: Icon }) => {
              const isActive = addOns[key];
              return (
                <motion.button
                  key={key}
                  type="button"
                  role="switch"
                  whileTap={{ scale: 0.99 }}
                  aria-checked={isActive}
                  onClick={() => toggleAddOn(key)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-all duration-200 ease-out hover:border-slate-900/40"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-lg transition-colors duration-200 ${
                        isActive
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <Icon size={18} />
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-slate-900">
                        {label}
                      </span>
                      <span className="block text-xs text-slate-400">
                        {hint} · ${rate}/day
                      </span>
                    </span>
                  </span>
                  <span
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                      isActive ? "bg-primary" : "bg-slate-200"
                    }`}
                  >
                    <motion.span
                      layout
                      transition={{ type: "spring", stiffness: 420, damping: 30 }}
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md ${
                        isActive ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "0px 0px -60px 0px" }}
          transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
          className="flex flex-col justify-between rounded-2xl bg-[#0F172A] p-6 text-white shadow-sm"
        >
          <div>
            <h3 className="text-sm font-medium uppercase tracking-wider text-slate-400">
              Price Estimate
            </h3>
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">
                  {TIER_RATES[tier]} × {duration} {duration === 1 ? "day" : "days"}
                </span>
                <span className="font-medium tabular-nums">${baseTotal}</span>
              </div>
              {ADD_ONS.filter((addOn) => addOns[addOn.key]).map((addOn) => (
                <div key={addOn.key} className="flex justify-between">
                  <span className="text-slate-400">{addOn.label}</span>
                  <span className="font-medium tabular-nums">
                    +${addOn.rate * duration}
                  </span>
                </div>
              ))}
              <div className="my-2 border-t border-slate-700" />
              <div className="flex items-end justify-between">
                <span className="text-slate-400">Estimated Total</span>
                <span
                  className="text-3xl font-bold tabular-nums text-white"
                  aria-live="polite"
                >
                  ${<AnimatedNumber value={total} />}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Inclusive of taxes and fees. Final price may vary at checkout.
              </p>
            </div>
          </div>

          {vehicle && VEHICLE_NAMES[vehicle] && (
            <div className="mb-5 rounded-xl border border-white/10 bg-white/10 p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Synced to your 3D model
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {VEHICLE_NAMES[vehicle]}
              </p>
              <p className="text-[11px] text-slate-400">
                {VEHICLE_TIER[vehicle]} tier auto-selected
              </p>
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setTier(VEHICLE_TIER[vehicle])}
                className="mt-2.5 w-full cursor-pointer rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:brightness-110"
              >
                Rent This Vehicle
              </motion.button>
            </div>
          )}

          <Link
            to="/cars"
            className="mt-6 block cursor-pointer rounded-xl bg-white px-6 py-3 text-center text-sm font-semibold text-slate-900 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-lg"
          >
            Proceed with Reservation
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PriceEstimator;