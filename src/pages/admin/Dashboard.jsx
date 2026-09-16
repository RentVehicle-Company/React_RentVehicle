import React, { useMemo } from "react";
import {
  LuBoxes,
  LuCircleCheck,
  LuGauge,
  LuWrench,
} from "react-icons/lu";
import { usePreferences } from "../../context/PreferencesContext";

const STATUS_META = {
  car: { label: "Cars", classes: "bg-blue-50 text-blue-600", bar: "bg-blue-500" },
  motorbike: {
    label: "Motorbikes",
    classes: "bg-orange-50 text-orange-600",
    bar: "bg-orange-500",
  },
  bicycle: {
    label: "Bicycles",
    classes: "bg-emerald-50 text-emerald-600",
    bar: "bg-emerald-500",
  },
};

const Dashboard = ({ vehicles = [] }) => {
  const { formatPrice } = usePreferences();

  const classify = (vehicle) => {
    if (vehicle.type === "bicycle") return "bicycle";
    if (vehicle.type === "motorbike") return "motorbike";
    const cat = String(vehicle.category || "").toLowerCase();
    if (cat.includes("bike") || cat.includes("e-bike")) return "bicycle";
    if (
      ["scooter", "underbone", "touring", "sportbike", "cruiser"].some((c) =>
        cat.includes(c)
      )
    ) {
      return "motorbike";
    }
    return "car";
  };

  const stats = useMemo(() => {
    const available = vehicles.filter((vehicle) => vehicle.is_available).length;
    const maintenance = vehicles.length - available;
    const avgRate = vehicles.length
      ? vehicles.reduce((sum, vehicle) => sum + Number(vehicle.price_per_day || 0), 0) /
        vehicles.length
      : 0;
    const byType = vehicles.reduce((acc, vehicle) => {
      const type = vehicle.type || "car";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    const byCategory = vehicles.reduce((acc, vehicle) => {
      const key = classify(vehicle);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return { available, maintenance, avgRate, byType, byCategory };
  }, [vehicles]);

  const cards = [
    {
      label: "Total Vehicles",
      value: vehicles.length,
      icon: LuBoxes,
      accent: "bg-blue-500",
    },
    {
      label: "Available",
      value: stats.available,
      icon: LuCircleCheck,
      accent: "bg-emerald-500",
    },
    {
      label: "In Maintenance",
      value: stats.maintenance,
      icon: LuWrench,
      accent: "bg-amber-500",
    },
    {
      label: "Average Rate / day",
      value: formatPrice(Math.round(stats.avgRate)),
      icon: LuGauge,
      accent: "bg-indigo-500",
    },
  ];

  const total = Math.max(1, vehicles.length);

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-borderColor bg-white dark:border-slate-700 dark:bg-slate-800 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {card.label}
                </p>
                <span
                  className={`grid h-9 w-9 place-items-center rounded-xl ${card.accent} text-white shadow-sm`}
                >
                  <Icon size={17} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-borderColor bg-white dark:border-slate-700 dark:bg-slate-800 p-5 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Fleet Breakdown
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Distribution across vehicle types
          </p>
          <div className="mt-5 space-y-4">
            {Object.entries(STATUS_META).map(([key, meta]) => {
              const count = stats.byCategory[key] || 0;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                      <span className={`h-2 w-2 rounded-full ${meta.bar}`} />
                      {meta.label}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {count} · {pct}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div
                      className={`h-full rounded-full ${meta.bar} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-borderColor bg-white dark:border-slate-700 dark:bg-slate-800 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quick Actions</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Common fleet management tasks
          </p>
          <ul className="mt-4 space-y-2.5">
            {[
              { label: "Vehicle rate", hint: "Edit per-day pricing" },
              { label: "Availability", hint: "Toggle maintenance status" },
              { label: "Add vehicle", hint: "Register a new unit" },
            ].map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-700/50 px-3.5 py-3"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white dark:bg-slate-600 text-primary shadow-sm">
                  <LuGauge size={15} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">{item.hint}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
            Use the <span className="font-semibold text-slate-600 dark:text-slate-300">Manage Vehicles</span>{" "}
            tab to perform these actions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;