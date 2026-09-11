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
  "w-full px-4 py-2.5 bg-white border border-borderColor rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

const errorTextClass = "mt-1.5 text-xs text-red-600";

const ProfileForm = ({ user, onSave }) => {
  const [values, setValues] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setValues({
      name: user.name,
      email: user.email,
      phone: user.phone,
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
    });
    setErrors({});
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setSuccess(false);
    try {
      await onSave(values);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-borderColor rounded-2xl p-6"
    >
      <h3 className="text-base font-semibold text-slate-900">
        Profile Information
      </h3>

      <div className="mt-5 grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="profile-name" className="block text-sm font-medium text-slate-700 mb-1.5">
            Full Name
          </label>
          <input
            id="profile-name"
            name="name"
            type="text"
            value={values.name}
            onChange={handleChange}
            placeholder="Your full name"
            className={inputClass}
          />
          {errors.name && <p className={errorTextClass}>{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="profile-email" className="block text-sm font-medium text-slate-700 mb-1.5">
            Email Address
          </label>
          <input
            id="profile-email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={inputClass}
          />
          {errors.email && <p className={errorTextClass}>{errors.email}</p>}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="profile-phone" className="block text-sm font-medium text-slate-700 mb-1.5">
            Phone Number
          </label>
          <input
            id="profile-phone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange}
            placeholder="+855 12 345 678"
            className={inputClass}
          />
          {errors.phone && <p className={errorTextClass}>{errors.phone}</p>}
        </div>
      </div>

      {success && (
        <div className="mt-5 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
          <LuCircleCheck size={18} className="shrink-0" />
          Profile updated successfully.
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-white border border-borderColor hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-black hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;