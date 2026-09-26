import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuLoader,
  LuMapPin,
  LuPlus,
  LuPencil,
  LuSearch,
  LuTrash2,
  LuX,
} from "react-icons/lu";
import { useToast } from "../../context/ToastContext";
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../../services/locationService";
import AddLocation from "./AddLocation";

const ManageLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const toast = useToast();

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (err) {
      toast.error("Could not load locations", err.message);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleSave = async (payload) => {
    try {
      const isEditing = modal?.mode === "edit" && modal?.location;
      if (modal?.mode === "edit" && modal?.location) {
        await updateLocation(modal.location.id, payload);
      } else {
        await createLocation(payload);
      }
      setModal(null);
      await fetchLocations();
      toast.success(
        isEditing ? "Location updated" : "Location created",
        "The changes are now live in the rental locations list.",
      );
    } catch (err) {
      toast.error("Location could not be saved", err.message);
      throw err;
    }
  };

  const handleDelete = (location) => setDeleteTarget(location);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const location = deleteTarget;
    setDeletingId(location.id);
    try {
      await deleteLocation(location.id);
      setDeleteTarget(null);
      await fetchLocations();
      toast.success("Location deleted", `${location.name} was removed.`);
    } catch (err) {
      toast.error("Location could not be deleted", err.message);
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
        <table className="w-full min-w-175 text-left text-sm">
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
            ) : (
              filtered.map((location) => {
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
                      {location.latitude != null &&
                      location.longitude != null ? (
                        <>
                          {location.latitude.toFixed(4)},{" "}
                          {location.longitude.toFixed(4)}
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
              })
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-14 text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400">
                    {search ? <LuSearch size={20} /> : <LuMapPin size={20} />}
                  </span>
                  <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {search
                      ? "No locations match your search"
                      : "No locations yet"}
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

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-[#0b1329]/75 p-4 backdrop-blur-sm"
            onClick={() =>
              deletingId !== deleteTarget.id && setDeleteTarget(null)
            }
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.97 }}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-blue-900/40 bg-[#0b1329] text-white shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-location-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start gap-3 px-6 pb-2 pt-6">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-500/15 text-red-400">
                  <LuTrash2 size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 id="delete-location-title" className="text-lg font-bold">
                    Delete location?
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-blue-100/70">
                    Delete &quot;{deleteTarget.name}&quot;? This action cannot
                    be undone.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close delete confirmation"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deletingId === deleteTarget.id}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-blue-100/60 hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  <LuX size={17} />
                </button>
              </div>
              <div className="flex justify-end gap-2 border-t border-white/10 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deletingId === deleteTarget.id}
                  className="rounded-xl border border-blue-100/20 px-4 py-2.5 text-sm font-semibold text-blue-100 hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deletingId === deleteTarget.id}
                  className="inline-flex min-w-24 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                >
                  {deletingId === deleteTarget.id && (
                    <LuLoader className="animate-spin" size={15} />
                  )}
                  {deletingId === deleteTarget.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageLocations;
