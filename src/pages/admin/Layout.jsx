import React, { useEffect, useState } from "react";
import { LuArrowLeft, LuCar, LuChartPie, LuLayoutDashboard, LuShieldCheck, LuChartColumn, LuTag, LuUsers, LuMapPin } from "react-icons/lu";
import { Link } from "react-router-dom";
import { getVehicles } from "../../services/vehicleServices";
import Dashboard from "./Dashboard";
import ManageVehicle from "./ManageVehicle";
import ManageCategories from "./ManageCategories";
import ManageUsers from "./ManageUsers";
import ManageLocations from "./ManageLocations";
import Analytics from "./Analytics";

const STORAGE_KEY = "rental_admin_vehicles";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LuLayoutDashboard },
  { key: "vehicles", label: "Manage Vehicles", icon: LuCar },
  { key: "categories", label: "Categories", icon: LuTag },
  { key: "users", label: "Manage Users", icon: LuUsers },
  { key: "locations", label: "Locations", icon: LuMapPin },
  { key: "analytics", label: "Analytics", icon: LuChartColumn },
];

const Layout = () => {
  const [activeTab, setActiveTab] = useState("vehicles");
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // ➕ បន្ថែម useEffect ថ្មីនេះ — fetch ពី backend ពេល component mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getVehicles()
      .then((data) => {
        if (!cancelled) setVehicles(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
    } catch {
      // keep in-memory when storage is unavailable
    }
  }, [vehicles]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <div className="sticky top-6 space-y-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white"
            >
              <LuArrowLeft size={14} />
              Back to site
            </Link>

            <div className="overflow-hidden rounded-2xl border border-borderColor dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
              <div className="relative bg-slate-900 dark:bg-slate-950 px-5 py-6">
                <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-blue-600/30 blur-2xl" />
                <div className="relative">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm">
                    <LuShieldCheck size={20} />
                  </span>
                  <h1 className="mt-3 text-lg font-bold text-white">
                    Admin Panel
                  </h1>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Fleet management console
                  </p>
                </div>
              </div>

              <nav className="p-3">
                <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Management
                </p>
                <ul className="space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = activeTab === item.key;
                    return (
                      <li key={item.key}>
                        <button
                          type="button"
                          onClick={() => setActiveTab(item.key)}
                          aria-pressed={active}
                          className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                            active
                              ? "bg-primary/10 text-primary"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          <Icon size={17} />
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            <div className="rounded-2xl border border-blue-100 dark:border-slate-700 bg-gradient-to-br from-blue-50/80 to-indigo-50/60 dark:from-slate-700/50 dark:to-slate-700/30 p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <LuChartPie size={14} className="text-primary" />
                Fleet snapshot
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Manage pricing, availability and the vehicle catalogue in one
                place. Changes persist locally until the backend goes live.
              </p>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Admin
              </p>
              <h2 className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">
                {activeTab === "dashboard"
                  ? "Dashboard"
                  : activeTab === "analytics"
                    ? "Analytics"
                    : activeTab === "categories"
                      ? "Categories"
                      : activeTab === "users"
                        ? "User Management"
                        : activeTab === "locations"
                          ? "Locations"
                          : "Vehicle Management"}
              </h2>
            </div>
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-200 sm:inline-flex">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-emerald-500" />
              System online
            </span>
          </div>

          {activeTab === "dashboard" ? (
            <Dashboard vehicles={vehicles} />
          ) : activeTab === "analytics" ? (
            <Analytics vehicles={vehicles} />
          ) : activeTab === "categories" ? (
            <ManageCategories />
          ) : activeTab === "users" ? (
            <ManageUsers />
          ) : activeTab === "locations" ? (
            <ManageLocations />
          ) : (
            <ManageVehicle vehicles={vehicles} onChange={setVehicles} />
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout;