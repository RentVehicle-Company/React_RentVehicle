import React, { useState } from "react";
import { LuArrowLeft, LuMail } from "react-icons/lu";
import { forgotPassword } from "../../services/authServices";

const inputClass =
  "w-full rounded-xl border border-white/60 bg-white/80 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-slate-600 dark:bg-slate-800/80 dark:text-white dark:placeholder-slate-400";

const ForgotPassword = ({ initialEmail = "", onBack, onContinue }) => {
  const [email, setEmail] = useState(initialEmail);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      await forgotPassword(trimmedEmail);
      setMessage(`A 6-digit reset code was sent to ${trimmedEmail}.`);
      onContinue?.(trimmedEmail);
    } catch (requestError) {
      setError(requestError.message || "Unable to send the reset code.");
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
          <LuMail size={20} />
        </div>
        <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
          Forgot Password
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter your email to receive a 6-digit reset code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="forgot-email"
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
              id="forgot-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className={`${inputClass} pl-10`}
            />
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
          {submitting ? "Sending code..." : "Send Reset Code"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
