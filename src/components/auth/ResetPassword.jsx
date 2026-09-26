import React, { useState } from "react";
import { LuArrowLeft, LuEye, LuEyeOff, LuLock, LuMail } from "react-icons/lu";
import { resetPassword } from "../../services/authServices";

const inputClass =
  "w-full rounded-xl border border-white/60 bg-white/80 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white dark:placeholder-slate-400";

const ResetPassword = ({ email = "", onBack, onSuccess }) => {
  const [values, setValues] = useState({
    email,
    code: "",
    newPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const trimmedEmail = values.email.trim();
    const trimmedCode = values.code.trim();
    const trimmedPassword = values.newPassword.trim();

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (trimmedCode.length !== 6) {
      setError("Please enter the 6-digit reset code.");
      return;
    }

    if (trimmedPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(trimmedEmail, trimmedCode, trimmedPassword);
      setMessage("Your password has been reset successfully.");
      onSuccess?.();
    } catch (requestError) {
      setError(requestError.message || "Unable to reset your password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-5 space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
      >
        <LuArrowLeft size={14} /> Back
      </button>

      <div className="text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
          <LuLock size={20} />
        </div>
        <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
          Reset Password
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter the code sent to your email and create a new password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="reset-email"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Email
          </label>
          <div className="relative">
            <LuMail
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="reset-email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="reset-code"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            6-Digit Code
          </label>
          <input
            id="reset-code"
            name="code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={values.code}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                code: event.target.value.replace(/\D/g, "").slice(0, 6),
              }))
            }
            placeholder="123456"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="new-password"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            New Password
          </label>
          <div className="relative">
            <LuLock
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="new-password"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              value={values.newPassword}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((show) => !show)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-white"
            >
              {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-sm text-blue-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer"
        >
          {submitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
