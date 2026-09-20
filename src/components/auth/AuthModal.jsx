import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  LuArrowLeft,
  LuEye,
  LuEyeOff,
  LuLock,
  LuMail,
  LuUser,
} from "react-icons/lu";
import Logo from "../common/Logo";
import { useAuth } from "../../context/AuthContext";
import { resendOtp, verifyEmail } from "../../services/authServices";

const inputClass =
  "w-full rounded-xl border border-white/60 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 shadow-sm outline-none backdrop-blur-sm transition focus:border-primary focus:ring-2 focus:ring-primary/30";
const labelClass =
  "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300";

const getErrorMessage = (err) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.data?.message ||
  err?.data?.error ||
  err?.message ||
  "Something went wrong. Please try again.";

const AuthModal = ({ mode = "login", onClose }) => {
  const { login, register } = useAuth();
  const [formMode, setFormMode] = useState(mode);
  const [registerStep, setRegisterStep] = useState("details");
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormMode(mode);
    setRegisterStep("details");
    setOtp(["", "", "", "", "", ""]);
    setError(null);
    setMessage("");
  }, [mode]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formMode === "register" && values.name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (values.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setSubmitting(true);
    try {
      if (formMode === "register") {
        await register({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
        });
        setRegisterStep("otp");
        setMessage(`We sent a verification code to ${values.email.trim()}.`);
        return;
      } else {
        await login({
          email: values.email.trim(),
          password: values.password,
        });
      }
      onClose?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);
    setError(null);
    if (digit && index < otp.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await verifyEmail(values.email.trim(), code);
      await login({ email: values.email.trim(), password: values.password });
      onClose?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await resendOtp(values.email.trim());
      setMessage(`A new code was sent to ${values.email.trim()}.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (nextMode) => {
    setFormMode(nextMode);
    setError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={formMode === "login" ? "Log in" : "Create an account"}
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/50 dark:border-slate-700 bg-white/70 dark:bg-slate-900/80 shadow-2xl shadow-slate-900/20 backdrop-blur-2xl"
      >
        {/* Ambient blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <span className="animate-float absolute -left-16 -top-16 h-48 w-48 rounded-full bg-primary/25 blur-3xl" />
          <span className="animate-float-slow absolute -bottom-20 -right-12 h-52 w-52 rounded-full bg-indigo-500/25 blur-3xl" />
          <span className="absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full bg-sky-300/20 blur-3xl" />
        </div>

        <div className="relative px-6 pb-6 pt-7 sm:px-8">
          <div className="flex items-center justify-between gap-3">
            <Logo
              text="Rental Company"
              shortText="Rental"
              wordClassName="text-lg font-bold tracking-tight text-slate-950"
            />
            <span className="rounded-full bg-white/70 dark:bg-slate-700/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary ring-1 ring-primary/20 backdrop-blur">
              {registerStep === "otp"
                ? "Verify"
                : formMode === "login"
                  ? "Sign In"
                  : "Register"}
            </span>
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            {registerStep === "otp"
              ? "Verify your email"
              : formMode === "login"
                ? "Welcome back"
                : "Create your account"}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {registerStep === "otp"
              ? `Enter the 6-digit code sent to ${values.email}.`
              : formMode === "login"
                ? "Log in to manage your bookings and favorites."
                : "Sign up to start renting in minutes."}
          </p>

          {registerStep === "otp" ? (
            <form onSubmit={handleVerify} className="mt-5 space-y-4">
              <button
                type="button"
                onClick={() => {
                  setRegisterStep("details");
                  setError(null);
                  setMessage("");
                }}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
              >
                <LuArrowLeft size={14} /> Back
              </button>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      otpRefs.current[index] = element;
                    }}
                    value={digit}
                    onChange={(event) =>
                      handleOtpChange(index, event.target.value)
                    }
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    inputMode="numeric"
                    maxLength="1"
                    aria-label={`Verification digit ${index + 1}`}
                    className="h-11 w-10 rounded-lg border border-slate-300 bg-slate-50 text-center text-lg font-semibold text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Verifying..." : "Verify Email"}
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={submitting}
                className="block w-full text-center text-xs font-medium text-primary hover:underline disabled:opacity-60"
              >
                Resend code
              </button>
            </form>
          ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {formMode === "register" && (
              <div>
                <label htmlFor="auth-name" className={labelClass}>
                  Full Name
                </label>
                <div className="relative">
                  <LuUser
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="auth-name"
                    name="name"
                    type="text"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                    autoComplete="name"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className={labelClass}>
                Email
              </label>
              <div className="relative">
                <LuMail
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <LuLock
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={values.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete={
                    formMode === "login" ? "current-password" : "new-password"
                  }
                  className={inputClass}
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer"
            >
              {submitting
                ? formMode === "login"
                  ? "Logging in..."
                  : "Creating account..."
                : formMode === "login"
                  ? "Log In"
                  : "Create Account"}
            </button>
          </form>
          )}

          {message && (
            <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-center text-sm text-blue-700">
              {message}
            </p>
          )}

          {registerStep === "details" && <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
            {formMode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="cursor-pointer font-semibold text-primary hover:underline"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="cursor-pointer font-semibold text-primary hover:underline"
                >
                  Log In
                </button>
              </>
            )}
          </div>}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuthModal;
