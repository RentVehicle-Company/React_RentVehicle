import React, { useEffect, useState } from "react";
import { LuBoxes, LuCircleCheck, LuGauge, LuWrench } from "react-icons/lu";
import { usePreferences } from "../../context/PreferencesContext";
import { getDashboardStats } from "../../services/adminService";

const STATUS_META = {
  car: {
    label: "Cars",
    classes: "bg-blue-50 text-blue-600",
    bar: "bg-blue-500",
  },
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

const Dashboard = () => {
  const { formatPrice } = usePreferences();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getDashboardStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err.message || "Unable to load dashboard statistics.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fleetBreakdown = stats?.fleetBreakdown || {};
  const getBreakdownCount = (key, label) =>
    Number(fleetBreakdown[key] ?? fleetBreakdown[label] ?? 0);

  const cards = [
    {
      label: "Total Vehicles",
      value: stats?.totalVehicles ?? 0,
      icon: LuBoxes,
      accent: "bg-blue-500",
    },
    {
      label: "Available",
      value: stats?.availableVehicles ?? 0,
      icon: LuCircleCheck,
      accent: "bg-emerald-500",
    },
    {
      label: "In Maintenance",
      value: stats?.maintenanceVehicles ?? 0,
      icon: LuWrench,
      accent: "bg-amber-500",
    },
    {
      label: "Average Rate / day",
      value: formatPrice(Math.round(Number(stats?.averageRatePerDay ?? 0))),
      icon: LuGauge,
      accent: "bg-indigo-500",
    },
  ];

  const total = Math.max(1, Number(stats?.totalVehicles ?? 0));

  if (loading)
    return (
      <p className="text-sm text-slate-500">Loading dashboard statistics...</p>
    );
  if (error)
    return (
      <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>
    );

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
              const count = getBreakdownCount(key, meta.label);
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
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Quick Actions
          </h3>
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
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    {item.hint}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
            Use the{" "}
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Manage Vehicles
            </span>{" "}
            tab to perform these actions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
