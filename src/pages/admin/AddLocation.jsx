import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  LuLoader,
  LuMapPin,
  LuTriangleAlert,
  LuCircleCheck,
  LuX,
} from "react-icons/lu";

const inputClass =
  "w-full px-3.5 py-2.5 bg-white dark:bg-slate-700 border border-borderColor dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass =
  "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

const AddLocation = ({ mode = "add", location, onClose, onSave }) => {
  const [name, setName] = useState(location?.name || "");
  const [address, setAddress] = useState(location?.address || "");
  const [city, setCity] = useState(location?.city || "");
  const [latitude, setLatitude] = useState(location?.latitude ?? "");
  const [longitude, setLongitude] = useState(location?.longitude ?? "");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!name.trim()) {
      setError("Location name is required");
      return;
    }
    if (!city.trim()) {
      setError("City is required");
      return;
    }
    if (
      latitude !== "" &&
      (isNaN(latitude) || latitude < -90 || latitude > 90)
    ) {
      setError("Latitude must be between -90 and 90");
      return;
    }
    if (
      longitude !== "" &&
      (isNaN(longitude) || longitude < -180 || longitude > 180)
    ) {
      setError("Longitude must be between -180 and 180");
      return;
    }

    setSubmitting(true);

    const payload = {
      name: name.trim(),
      address: address.trim() || "",
      city: city.trim(),
      latitude: latitude === "" ? null : Number(latitude),
      longitude: longitude === "" ? null : Number(longitude),
    };

    try {
      await onSave(payload);
      setSuccess(true);
    } catch (err) {
      console.error(`Failed to ${mode} location:`, err);
      if (err.status === 401 || err.status === 403) {
        setError("Unauthorized: Please log in again as admin");
      } else if (err.status === 400) {
        setError(err.message || "Invalid input. Please check all fields.");
      } else if (err.status === 409) {
        setError("A location with this name already exists");
      } else if (err.status === 422) {
        setError(err.message || "Validation failed. Please check your input.");
      } else {
        setError(
          err.message || `Failed to ${mode} location. Please try again.`,
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
      className="fixed inset-0 z-90 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm"
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
              {mode === "edit" ? "Edit Location" : "Add New Location"}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {mode === "edit"
                ? `Update ${location?.name || ""} location`
                : "Create a new rental location"}
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
                  Location {mode === "edit" ? "updated" : "created"}{" "}
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
              <label htmlFor="addl-name" className={labelClass}>
                Location Name
              </label>
              <input
                id="addl-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Downtown Branch"
                className={inputClass}
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="addl-city" className={labelClass}>
                City
              </label>
              <div className="relative">
                <LuMapPin
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="addl-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Phnom Penh"
                  className={`${inputClass} pl-9`}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="addl-address" className={labelClass}>
                Address (Optional)
              </label>
              <textarea
                id="addl-address"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, landmark, etc."
                className={`${inputClass} resize-none`}
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="addl-latitude" className={labelClass}>
                  Latitude
                </label>
                <input
                  id="addl-latitude"
                  type="number"
                  step="0.000001"
                  min="-90"
                  max="90"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 11.5564"
                  className={inputClass}
                  disabled={submitting}
                />
              </div>
              <div>
                <label htmlFor="addl-longitude" className={labelClass}>
                  Longitude
                </label>
                <input
                  id="addl-longitude"
                  type="number"
                  step="0.000001"
                  min="-180"
                  max="180"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 104.9282"
                  className={inputClass}
                  disabled={submitting}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Coordinates are optional. Leave empty to use city center defaults.
            </p>
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
              {mode === "edit" ? "Save Changes" : "Add Location"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddLocation;
