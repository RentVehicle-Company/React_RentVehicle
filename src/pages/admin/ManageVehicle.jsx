import React, { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  LuMapPin,
  LuPencil,
  LuPlus,
  LuSearch,
  LuTrash2,
  LuWrench,
} from "react-icons/lu";
import { usePreferences } from "../../context/PreferencesContext";
import {
  isBicycle,
  isMotorbike,
} from "../../services/vehicleServices";
import AddVehicle from "./AddVehicle";

const classify = (vehicle) => {
  if (vehicle.type === "bicycle" || isBicycle(vehicle)) return "bicycle";
  if (vehicle.type === "motorbike" || isMotorbike(vehicle)) return "motorbike";
  return "car";
};

const TYPE_META = {
  car: { label: "Car", classes: "bg-blue-50 text-blue-600" },
  motorbike: { label: "Motorbike", classes: "bg-orange-50 text-orange-600" },
  bicycle: { label: "Bicycle", classes: "bg-emerald-50 text-emerald-600" },
};

const TYPE_FILTERS = [
  { key: "all", label: "All" },
  { key: "car", label: "Cars" },
  { key: "motorbike", label: "Motorbikes" },
  { key: "bicycle", label: "Bicycles" },
];

const ManageVehicle = ({ vehicles = [], onChange }) => {
  const { formatPrice } = usePreferences();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modal, setModal] = useState(null);

  const nextId = useMemo(
    () =>
      vehicles.reduce((max, vehicle) => Math.max(max, Number(vehicle.id) || 0), 0) +
      1,
    [vehicles]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return vehicles.filter((vehicle) => {
      if (typeFilter !== "all" && classify(vehicle) !== typeFilter) return false;
      if (!query) return true;
      const haystack = [
        vehicle.brand,
        vehicle.model,
        vehicle.category,
        vehicle.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [vehicles, search, typeFilter]);

  const completeTypeCount = useMemo(
    () =>
      vehicles.reduce((counts, vehicle) => {
        counts[classify(vehicle)] += 1;
        return counts;
      }, { car: 0, motorbike: 0, bicycle: 0 }),
    [vehicles]
  );

  const updateList = (next) => onChange?.(next);

  const handleSave = (payload) => {
    if (modal?.mode === "edit" && modal?.vehicle) {
      const current = modal.vehicle;
      updateList(
        vehicles.map((vehicle) =>
          String(vehicle.id) === String(current.id)
            ? { ...current, ...payload, id: current.id }
            : vehicle
        )
      );
    } else {
      updateList([{ ...payload, id: nextId }, ...vehicles]);
    }
    setModal(null);
  };

  const handleDelete = (vehicle) => {
    const confirmed = window.confirm(
      `Delete ${vehicle.brand} ${vehicle.model} from the fleet?`
    );
    if (!confirmed) return;
    updateList(
      vehicles.filter((item) => String(item.id) !== String(vehicle.id))
    );
  };

  const handleToggle = (vehicle) => {
    updateList(
      vehicles.map((item) =>
        String(item.id) === String(vehicle.id)
          ? { ...item, is_available: !item.is_available }
          : item
      )
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-borderColor bg-white dark:border-slate-700 dark:bg-slate-800 shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-700 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Fleet Catalogue
            <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
              {vehicles.length} vehicles
            </span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Cars, motorbikes and bicycles across all locations.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <LuSearch
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, category, city…"
              className="w-full rounded-xl border border-borderColor dark:border-slate-600 bg-white dark:bg-slate-700 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-64"
            />
          </div>
          <button
            type="button"
            onClick={() => setModal({ mode: "add" })}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
          >
            <LuPlus size={16} strokeWidth={2.5} />
            Add New Vehicle
          </button>
        </div>
      </div>

      {/* Type filters */}
      <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
        {TYPE_FILTERS.map((filter) => {
          const active = typeFilter === filter.key;
          const count =
            filter.key === "all"
              ? vehicles.length
              : completeTypeCount[filter.key];
          return (
            <button
              key={filter.key}
              type="button"
              aria-pressed={active}
              onClick={() => setTypeFilter(filter.key)}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? "bg-slate-900 dark:bg-primary text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              {filter.label}
              <span
                className={`rounded-full px-1.5 text-[10px] font-bold ${
                  active ? "bg-white/20" : "bg-white dark:bg-slate-600 text-slate-500 dark:text-slate-300"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-y border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-700/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="px-5 py-3">Vehicle</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Rate / day</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((vehicle) => {
              const meta = TYPE_META[classify(vehicle)];
              const available = Boolean(vehicle.is_available);
              return (
                <tr
                  key={String(vehicle.id)}
                  className="group border-b border-slate-100 dark:border-slate-700 transition-colors last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-700/40"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={vehicle.image}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="h-12 w-16 shrink-0 rounded-lg border border-borderColor dark:border-slate-600 object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900 dark:text-white">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                          {vehicle.category} ·{" "}
                          {vehicle.year || "—"} · #
                          {String(vehicle.id)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.classes}`}
                    >
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    {formatPrice(vehicle.price_per_day)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <LuMapPin size={13} className="text-slate-400 dark:text-slate-500" />
                      {vehicle.location}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={available}
                      onClick={() => handleToggle(vehicle)}
                      title={
                        available
                          ? "Currently available — click to set maintenance"
                          : "Under maintenance — click to make available"
                      }
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 transition-colors ${
                        available
                          ? "bg-emerald-50 text-emerald-600 ring-emerald-200 hover:bg-emerald-100"
                          : "bg-amber-50 text-amber-600 ring-amber-200 hover:bg-amber-100"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          available ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                      />
                      {available ? "Available" : "Maintenance"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setModal({ mode: "edit", vehicle })}
                        aria-label={`Edit ${vehicle.brand} ${vehicle.model}`}
                        className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                      >
                        <LuPencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(vehicle)}
                        aria-label={`Delete ${vehicle.brand} ${vehicle.model}`}
                        className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <LuTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400">
                    {search ? <LuSearch size={20} /> : <LuWrench size={20} />}
                  </span>
                  <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {search ? "No vehicles match your search" : "No vehicles yet"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {search
                      ? "Try a different keyword or filter."
                      : "Add your first vehicle to the fleet."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-700 px-5 py-3.5">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Showing {filtered.length} of {vehicles.length} vehicles
        </p>
        <p className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <LuWrench size={13} />
          Maintenance vehicles are hidden from new bookings
        </p>
      </div>

      <AnimatePresence>
        {modal && (
          <AddVehicle
            mode={modal.mode}
            vehicle={modal.vehicle}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageVehicle;