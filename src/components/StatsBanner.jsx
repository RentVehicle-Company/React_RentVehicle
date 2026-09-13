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
      <span className="text-3xl font-bold tabular-nums text-white sm:text-4xl">
        {display}
      </span>
      <span className="text-sm text-slate-400">{label}</span>
    </motion.div>
  );
};

const StatsBanner = () => {
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

  return (
    <section className="px-4 sm:px-6 lg:px-16">
      <div
        ref={ref}
        className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-[#0F172A] py-6 shadow-sm sm:py-8"
      >
        <div className="grid grid-cols-2 divide-x divide-slate-800 sm:grid-cols-4 sm:divide-y-0">
          {STATS.map((stat, index) => (
            <StatItem
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              inView={inView}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBanner;