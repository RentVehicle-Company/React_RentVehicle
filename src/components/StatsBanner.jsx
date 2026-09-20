import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  LuBadgeCheck,
  LuCarFront,
  LuHeadphones,
  LuUsers,
} from "react-icons/lu";

const STATS = [
  { icon: LuCarFront, value: 500, suffix: "+", label: "Premium Vehicles" },
  { icon: LuUsers, value: 50, suffix: "k+", label: "Happy Renters" },
  { icon: LuHeadphones, value: 24, suffix: "/7", label: "Customer Support" },
  { icon: LuBadgeCheck, value: 100, suffix: "%", label: "Transparent Pricing" },
];

const useCountUp = (target, inView, duration = 1600) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, duration]);

  return value;
};

const StatItem = ({ icon: Icon, value, suffix, label, inView, index }) => {
  const count = useCountUp(value, inView);
  const display = suffix === "k+" ? `${count}k+` : `${count}${suffix}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: "easeOut" }}
      className="flex flex-col items-center gap-2 px-4 py-6"
    >
      <span className="animate-float relative flex">
        <span className="animate-pulse-dot absolute inset-0 rounded-full bg-primary/30" />
        <Icon size={28} className="relative text-primary" />
      </span>
      <span className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white sm:text-4xl">
        {display}
      </span>
      <span className="text-sm text-slate-500 dark:text-slate-300">{label}</span>
    </motion.div>
  );
};

const StatsBanner = ({ flush = false }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const grid = (
    <div className="grid grid-cols-2 sm:grid-cols-4">
      {STATS.map((stat, index) => (
        <div key={stat.label} className="relative">
          {index % 2 === 0 && index < 3 && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-1/2 h-12 w-px -translate-y-1/2 bg-slate-200 dark:bg-slate-700/50 sm:hidden"
            />
          )}
          {index < 3 && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-1/2 hidden h-12 w-px -translate-y-1/2 bg-slate-200 dark:bg-slate-700/50 sm:block"
            />
          )}
          {index >= 2 && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-slate-200 dark:bg-slate-700/50 sm:hidden"
            />
          )}
          <StatItem
            icon={stat.icon}
            value={stat.value}
            suffix={stat.suffix}
            label={stat.label}
            inView={inView}
            index={index}
          />
        </div>
      ))}
    </div>
  );

  if (flush) {
    return (
      <div ref={ref} className="py-10 sm:py-12">
        {grid}
      </div>
    );
  }

  return (
    <section className="px-4 sm:px-6 lg:px-16">
      <div
        ref={ref}
        className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white py-10 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:py-12"
      >
        {grid}
      </div>
    </section>
  );
};

export default StatsBanner;