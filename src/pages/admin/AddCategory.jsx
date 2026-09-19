import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  LuChevronDown,
  LuX,
  LuLoader,
  LuTriangleAlert,
  LuCircleCheck,
} from "react-icons/lu";
import { createCategory, updateCategory } from "../../services/vehicleServices";
import {
  toBackendVehicleType,
  fromBackendVehicleType,
  getVehicleTypeOptions,
} from "../../utils/vehicleTypeMap";

const inputClass =
  "w-full px-3.5 py-2.5 bg-white dark:bg-slate-700 border border-borderColor dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass =
  "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

const VEHICLE_TYPE_OPTIONS = getVehicleTypeOptions();

const AddCategory = ({ mode = "add", category, onClose, onSave }) => {
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [vehicleType, setVehicleType] = useState(
    fromBackendVehicleType(category?.vehicleType || "car"),
  );
  const [description, setDescription] = useState(category?.description || "");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }
    if (!slug.trim()) {
      setError("Slug is required");
      return;
    }
    if (!vehicleType) {
      setError("Vehicle type is required");
      return;
    }

    setSubmitting(true);

    const payload = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      vehicleType: toBackendVehicleType(vehicleType),
      description: description.trim() || "",
    };

    try {
      if (mode === "edit" && category) {
        await updateCategory(category.id, payload);
      } else {
        await createCategory(payload);
      }
      setSuccess(true);
      setTimeout(() => {
        onSave(payload);
      }, 500);
    } catch (err) {
      console.error(`Failed to ${mode} category:`, err);
      if (err.status === 401 || err.status === 403) {
        setError("Unauthorized: Please log in again as admin");
      } else if (err.status === 400) {
        setError(err.message || "Invalid input. Please check all fields.");
      } else if (err.status === 409) {
        setError("A category with this slug already exists");
      } else if (err.status === 422) {
        setError(err.message || "Validation failed. Please check your input.");
      } else {
        setError(
          err.message || `Failed to ${mode} category. Please try again.`,
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {mode === "edit" ? "Edit Category" : "Add New Category"}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {mode === "edit"
                ? `Update ${category?.name || ""} category`
                : "Create a new vehicle category"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            disabled={submitting}
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LuX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          {(error || success) && (
            <div
              className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
                success
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {success ? (
                <>
                  <LuCircleCheck size={18} />
                  Category {mode === "edit" ? "updated" : "created"}{" "}
                  successfully!
                </>
              ) : (
                <>
                  <LuTriangleAlert size={18} />
                  {error}
                </>
              )}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="addc-name" className={labelClass}>
                Category Name
              </label>
              <input
                id="addc-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sports Car"
                className={inputClass}
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="addc-slug" className={labelClass}>
                Slug (URL identifier)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  /
                </span>
                <input
                  id="addc-slug"
                  type="text"
                  value={slug}
                  onChange={(e) =>
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                  }
                  placeholder="e.g. sports-car"
                  className={`${inputClass} pl-8`}
                  required
                  disabled={submitting}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                Lowercase, hyphens only. Used in URLs.
              </p>
            </div>

            <div>
              <label htmlFor="addc-vehicle-type" className={labelClass}>
                Vehicle Type
              </label>
              <div className="relative">
                <select
                  id="addc-vehicle-type"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  disabled={submitting}
                  className={`${inputClass} appearance-none pr-9 cursor-pointer`}
                  required
                >
                  {VEHICLE_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <LuChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="addc-description" className={labelClass}>
                Description (Optional)
              </label>
              <textarea
                id="addc-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this category…"
                className={`${inputClass} resize-none`}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-700 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="cursor-pointer rounded-xl border border-borderColor dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer rounded-xl bg-slate-900 dark:bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-black dark:hover:bg-primary-dull hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && <LuLoader size={16} className="animate-spin" />}
              {mode === "edit" ? "Save Changes" : "Add Category"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddCategory;
