import React, { useEffect, useState } from "react";
import { LuCircleCheck } from "react-icons/lu";

const validate = (values) => {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = "Full name is required.";
  } else if (values.name.trim().length < 2) {
    errors.name = "Full name must be at least 2 characters.";
  }

  if (!values.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (values.phone.trim() && !/^\+?[\d\s()-]{6,}$/.test(values.phone.trim())) {
    errors.phone = "Please enter a valid phone number.";
  }

  return errors;
};

const inputClass =
  "w-full rounded-xl border border-borderColor bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder-slate-400 transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500";

const errorTextClass = "mt-1.5 text-xs text-red-600";

const ProfileForm = ({ user, onSave }) => {
  const [values, setValues] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setValues({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleCancel = () => {
    setValues({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
    });
    setErrors({});
    setSuccess(false);
    setSubmitError("");
    setEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setSuccess(false);
    setSubmitError("");
    try {
      await onSave(values);
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setSubmitError(error?.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-borderColor bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Profile Information
        </h3>
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setSuccess(false);
              setEditing(true);
            }}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dull"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="mt-5 grid md:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="profile-name"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Full Name
          </label>
          <input
            id="profile-name"
            name="name"
            type="text"
            value={values.name}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Your full name"
            className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-400`}
          />
          {errors.name && <p className={errorTextClass}>{errors.name}</p>}
        </div>

        <div>
          <label
            htmlFor="profile-email"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Email Address
          </label>
          <input
            id="profile-email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            disabled={!editing}
            placeholder="you@example.com"
            className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-400`}
          />
          {errors.email && <p className={errorTextClass}>{errors.email}</p>}
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="profile-phone"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Phone Number
          </label>
          <input
            id="profile-phone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange}
            disabled={!editing}
            placeholder="+855 12 345 678"
            className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-400`}
          />
          {errors.phone && <p className={errorTextClass}>{errors.phone}</p>}
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="profile-address"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Address
          </label>
          <input
            id="profile-address"
            name="address"
            type="text"
            value={values.address}
            onChange={handleChange}
            disabled={!editing}
            placeholder="123 Main Street, Phnom Penh"
            className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-400`}
          />
        </div>
      </div>

      {submitError && (
        <div className="mt-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {submitError}
        </div>
      )}

      {success && (
        <div className="mt-5 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
          <LuCircleCheck size={18} className="shrink-0" />
          Profile updated successfully.
        </div>
      )}

      {editing && (
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="cursor-pointer rounded-xl border border-borderColor bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </form>
  );
};

export default ProfileForm;
