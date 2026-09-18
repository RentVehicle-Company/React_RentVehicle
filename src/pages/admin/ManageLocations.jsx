import React, { useEffect, useMemo, useState } from "react";
import {
  LuLoader,
  LuMapPin,
  LuPlus,
  LuPencil,
  LuSearch,
  LuTrash2,
  LuTriangleAlert,
  LuCircleCheck,
} from "react-icons/lu";
import { getLocations, createLocation, updateLocation, deleteLocation } from "../../services/vehicleServices";
import AddLocation from "./AddLocation";

const ManageLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (err) {
      console.error("Failed to fetch locations:", err);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (payload) => {
    try {
      if (modal?.mode === "edit" && modal?.location) {
        const updated = await updateLocation(modal.location.id, payload);
        setLocations(locations.map((loc) => (String(loc.id) === String(modal.location.id) ? updated : loc)));
        showToast("Location updated successfully");
      } else {
        const created = await createLocation(payload);
        setLocations([created, ...locations]);
        showToast("Location created successfully");
      }
      setModal(null);
    } catch (err) {
      console.error("Failed to save location:", err);
      showToast(err.message || "Failed to save location", "error");
    }
  };

  const handleDelete = async (location) => {
    const confirmed = window.confirm(
      `Delete location "${location.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(location.id);
    try {
      await deleteLocation(location.id);
      setLocations(locations.filter((loc) => String(loc.id) !== String(location.id)));
      showToast("Location deleted successfully");
    } catch (err) {
      console.error("Failed to delete location:", err);
      showToast(err.message || "Failed to delete location", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return locations;
    return locations.filter((location) => {
      const haystack = [
        location.name,
        location.city,
        location.address,
        location.latitude?.toString(),
        location.longitude?.toString(),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [locations, search]);

  return (
    <div className="overflow-hidden rounded-2xl border border-borderColor bg-white dark:border-slate-700 dark:bg-slate-800 shadow-sm relative">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm shadow-lg animate-slide-in ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {toast.type === "success" ? <LuCircleCheck size={18} /> : <LuTriangleAlert size={18} />}
          {toast.message}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-700 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Locations
            <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
              {locations.length} locations
            </span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Manage rental pickup and drop-off locations.
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
              placeholder="Search by name, city, address…"
              className="w-full rounded-xl border border-borderColor dark:border-slate-600 bg-white dark:bg-slate-700 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-64"
            />
          </div>
          <button
            type="button"
            onClick={() => setModal({ mode: "add" })}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
          >
            <LuPlus size={16} strokeWidth={2.5} />
            Add Location
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-y border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-700/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="px-5 py-3">Location</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Coordinates</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-14 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-400">
                    <LuLoader className="animate-spin" size={20} />
                    Loading locations...
                  </div>
                </td>
              </tr>
            ) : filtered.map((location) => {
              return (
                <tr
                  key={String(location.id)}
                  className="group border-b border-slate-100 dark:border-slate-700 transition-colors last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-700/40"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                        <LuMapPin size={18} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900 dark:text-white">
                          {location.name || "—"}
                        </p>
                        <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                          ID: {String(location.id)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {location.city || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <p className="truncate max-w-xs text-sm text-slate-500 dark:text-slate-400">
                      {location.address || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {location.latitude != null && location.longitude != null ? (
                      <>
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setModal({ mode: "edit", location })}
                        aria-label={`Edit ${location.name}`}
                        disabled={deletingId === location.id}
                        className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                      >
                        <LuPencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(location)}
                        aria-label={`Delete ${location.name}`}
                        disabled={deletingId === location.id}
                        className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        {deletingId === location.id ? (
                          <LuLoader className="animate-spin" size={15} />
                        ) : (
                          <LuTrash2 size={15} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-14 text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400">
                    {search ? <LuSearch size={20} /> : <LuMapPin size={20} />}
                  </span>
                  <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {search ? "No locations match your search" : "No locations yet"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {search
                      ? "Try a different keyword."
                      : "Add your first location to get started."}
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
          Showing {filtered.length} of {locations.length} locations
        </p>
      </div>

      {modal && (
        <AddLocation
          mode={modal.mode}
          location={modal.location}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ManageLocations;