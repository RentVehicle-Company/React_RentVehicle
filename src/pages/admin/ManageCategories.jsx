import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuPencil,
  LuPlus,
  LuSearch,
  LuTrash2,
  LuTag,
  LuTruck,
  LuBike,
  LuCar,
  LuX,
} from "react-icons/lu";
import { useToast } from "../../context/ToastContext";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/categoryService";
import { LuLoader } from "react-icons/lu";
import AddCategory from "./AddCategory";
import { fromBackendVehicleType } from "../../utils/vehicleTypeMap";

const VEHICLE_TYPE_META = {
  car: {
    label: "Car",
    icon: LuCar,
    classes: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  motorbike: {
    label: "Motorbike",
    icon: LuBike,
    classes:
      "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  },
  bicycle: {
    label: "Bicycle",
    icon: LuTruck,
    classes:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
};

const TYPE_FILTERS = [
  { key: "all", label: "All" },
  { key: "car", label: "Cars" },
  { key: "motorbike", label: "Motorbikes" },
  { key: "bicycle", label: "Bicycles" },
];

const normalizeCategory = (category) => ({
  ...category,
  vehicleType: fromBackendVehicleType(category.vehicleType),
});

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const toast = useToast();

  const fetchCategoriesData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data.map(normalizeCategory));
    } catch (err) {
      toast.error("Could not load categories", err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategoriesData();
  }, [fetchCategoriesData]);

  const handleSave = async (payload) => {
    try {
      const isEditing = modal?.mode === "edit" && modal?.category;
      if (modal?.mode === "edit" && modal?.category) {
        await updateCategory(modal.category.id, payload);
      } else {
        await createCategory(payload);
      }
      setModal(null);
      await fetchCategoriesData();
      toast.success(
        isEditing ? "Category updated" : "Category created",
        isEditing
          ? "The category changes are now live."
          : "The new category is now available in the fleet forms.",
      );
    } catch (err) {
      toast.error("Category could not be saved", err.message);
      throw err;
    }
  };

  const handleDelete = (category) => setDeleteTarget(category);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const category = deleteTarget;
    setDeletingId(category.id);
    try {
      await deleteCategory(category.id);
      setDeleteTarget(null);
      await fetchCategoriesData();
      toast.success("Category deleted", `${category.name} was removed.`);
    } catch (err) {
      toast.error("Category could not be deleted", err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return categories.filter((category) => {
      if (typeFilter !== "all" && category.vehicleType !== typeFilter)
        return false;
      if (!query) return true;
      const haystack = [
        category.name,
        category.slug,
        category.vehicleType,
        category.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [categories, search, typeFilter]);

  const typeCounts = useMemo(
    () =>
      categories.reduce(
        (counts, cat) => {
          counts[cat.vehicleType] = (counts[cat.vehicleType] || 0) + 1;
          return counts;
        },
        { car: 0, motorbike: 0, bicycle: 0 },
      ),
    [categories],
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-borderColor bg-white dark:border-slate-700 dark:bg-slate-800 shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-700 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Categories
            <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
              {categories.length} categories
            </span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Manage vehicle categories and their types.
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
              placeholder="Search by name, slug, type…"
              className="w-full rounded-xl border border-borderColor dark:border-slate-600 bg-white dark:bg-slate-700 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-64"
            />
          </div>
          <button
            type="button"
            onClick={() => setModal({ mode: "add" })}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
          >
            <LuPlus size={16} strokeWidth={2.5} />
            Add Category
          </button>
        </div>
      </div>

      {/* Type filters */}
      <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
        {TYPE_FILTERS.map((filter) => {
          const active = typeFilter === filter.key;
          const count =
            filter.key === "all"
              ? categories.length
              : typeCounts[filter.key] || 0;
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
                  active
                    ? "bg-white/20"
                    : "bg-white dark:bg-slate-600 text-slate-500 dark:text-slate-300"
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
        <table className="w-full min-w-175 text-left text-sm">
          <thead>
            <tr className="border-y border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-700/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="px-5 py-3">Category</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Vehicle Type</th>
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-14 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-400">
                    <LuLoader className="animate-spin" size={20} />
                    Loading categories...
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((category) => {
                const meta =
                  VEHICLE_TYPE_META[category.vehicleType] ||
                  VEHICLE_TYPE_META.car;
                const Icon = meta.icon;
                return (
                  <tr
                    key={String(category.id)}
                    className="group border-b border-slate-100 dark:border-slate-700 transition-colors last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-700/40"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                          <LuTag size={18} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900 dark:text-white">
                            {category.name}
                          </p>
                          <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                            ID: {String(category.id)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-slate-600 dark:text-slate-400">
                      {category.slug}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.classes}`}
                      >
                        <Icon size={12} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="truncate max-w-xs text-sm text-slate-500 dark:text-slate-400">
                        {category.description || "—"}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setModal({ mode: "edit", category })}
                          aria-label={`Edit ${category.name}`}
                          disabled={deletingId === category.id}
                          className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                        >
                          <LuPencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          aria-label={`Delete ${category.name}`}
                          disabled={deletingId === category.id}
                          className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          {deletingId === category.id ? (
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
                    {search ? <LuSearch size={20} /> : <LuTag size={20} />}
                  </span>
                  <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {search
                      ? "No categories match your search"
                      : "No categories yet"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {search
                      ? "Try a different keyword or filter."
                      : "Add your first category to get started."}
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
          Showing {filtered.length} of {categories.length} categories
        </p>
      </div>

      <AnimatePresence>
        {modal && (
          <AddCategory
            mode={modal.mode}
            category={modal.category}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

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
              aria-labelledby="delete-category-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start gap-3 px-6 pb-2 pt-6">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-500/15 text-red-400">
                  <LuTrash2 size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 id="delete-category-title" className="text-lg font-bold">
                    Delete category?
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

export default ManageCategories;
