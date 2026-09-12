import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuArrowLeft, LuEye, LuEyeOff, LuMail } from "react-icons/lu";

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

const Login = ({ initialMode = "login" }) => {
  const navigate = useNavigate();
  const otpRefs = useRef([]);
  const [mode, setMode] = useState(initialMode);
  const [registerStep, setRegisterStep] = useState("details");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loginValues, setLoginValues] = useState({ email: "", password: "" });
  const [registerValues, setRegisterValues] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setRegisterStep("details");
    setMessage("");
    setError("");
  };

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    setError("");
    localStorage.setItem(
      "rental-auth-user",
      JSON.stringify({ name: "John Doe" }),
    );
    navigate("/");
  };

  const handleRegisterSubmit = (event) => {
    event.preventDefault();
    setError("");
    setRegisterStep("otp");
    setMessage(`We sent a verification code to ${registerValues.email}.`);
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);
    setError("");
    if (digit && index < otp.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = (event) => {
    event.preventDefault();
    if (otp.join("").length !== 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }
    setMessage("Email verified successfully. Your account is ready.");
    localStorage.setItem(
      "rental-auth-user",
      JSON.stringify({ name: registerValues.name || "John Doe" }),
    );
    setRegisterStep("details");
    setMode("login");
    navigate("/");
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#bfc1c3] px-4 py-10">
      <button
        type="button"
        onClick={handleBack}
        className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-lg bg-white/70 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-white hover:text-slate-900"
      >
        <LuArrowLeft size={15} />
        Back to browsing
      </button>
      <section className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="grid grid-cols-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => changeMode("login")}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              mode === "login"
                ? "border-slate-700 text-slate-800"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => changeMode("register")}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              mode === "register"
                ? "border-slate-700 text-slate-800"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-1.5 block text-xs font-medium text-slate-600"
                >
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={loginValues.email}
                  onChange={(event) =>
                    setLoginValues({
                      ...loginValues,
                      email: event.target.value,
                    })
                  }
                  placeholder="alex@example.com"
                  className={fieldClass}
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="text-xs font-medium text-slate-600"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-[11px] text-slate-500 hover:text-slate-800"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginValues.password}
                    onChange={(event) =>
                      setLoginValues({
                        ...loginValues,
                        password: event.target.value,
                      })
                    }
                    placeholder="••••••••"
                    className={`${fieldClass} pr-10`}
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <LuEyeOff size={17} />
                    ) : (
                      <LuEye size={17} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-black py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Sign In
              </button>

              <AuthDivider />
              <GoogleButton />
            </form>
          ) : registerStep === "details" ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="register-name"
                  className="mb-1.5 block text-xs font-medium text-slate-600"
                >
                  Full Name
                </label>
                <input
                  id="register-name"
                  required
                  value={registerValues.name}
                  onChange={(event) =>
                    setRegisterValues({
                      ...registerValues,
                      name: event.target.value,
                    })
                  }
                  placeholder="Alex Morgan"
                  className={fieldClass}
                />
              </div>
              <div>
                <label
                  htmlFor="register-email"
                  className="mb-1.5 block text-xs font-medium text-slate-600"
                >
                  Email Address
                </label>
                <input
                  id="register-email"
                  type="email"
                  required
                  value={registerValues.email}
                  onChange={(event) =>
                    setRegisterValues({
                      ...registerValues,
                      email: event.target.value,
                    })
                  }
                  placeholder="alex@example.com"
                  className={fieldClass}
                />
              </div>
              <div>
                <label
                  htmlFor="register-password"
                  className="mb-1.5 block text-xs font-medium text-slate-600"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showRegisterPassword ? "text" : "password"}
                    required
                    minLength="8"
                    value={registerValues.password}
                    onChange={(event) =>
                      setRegisterValues({
                        ...registerValues,
                        password: event.target.value,
                      })
                    }
                    placeholder="At least 8 characters"
                    className={`${fieldClass} pr-10`}
                  />
                  <button
                    type="button"
                    aria-label={
                      showRegisterPassword ? "Hide password" : "Show password"
                    }
                    onClick={() =>
                      setShowRegisterPassword((visible) => !visible)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-700"
                  >
                    {showRegisterPassword ? (
                      <LuEyeOff size={17} />
                    ) : (
                      <LuEye size={17} />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-black py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Create Account
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-5">
              <button
                type="button"
                onClick={() => setRegisterStep("details")}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
              >
                <LuArrowLeft size={14} /> Back
              </button>
              <div className="text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <LuMail size={20} />
                </div>
                <h2 className="mt-3 text-base font-semibold text-slate-800">
                  Verify your email
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Enter the 6-digit code sent to
                  <br />
                  <span className="font-medium text-slate-700">
                    {registerValues.email}
                  </span>
                </p>
              </div>
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
                    className="h-11 w-10 rounded-lg border border-slate-300 bg-slate-50 text-center text-lg font-semibold text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                ))}
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-black py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Verify Email
              </button>
              <button
                type="button"
                onClick={() =>
                  setMessage(`A new code was sent to ${registerValues.email}.`)
                }
                className="block w-full text-center text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                Resend code
              </button>
            </form>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-center text-xs text-red-600">
              {error}
            </p>
          )}
          {message && (
            <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-center text-xs text-slate-600">
              {message}
            </p>
          )}
        </div>
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-center text-[11px] text-slate-400">
          Secured by DriveLink Shield™
        </div>
      </section>
    </main>
  );
};

const AuthDivider = () => (
  <div className="flex items-center gap-3 text-[11px] text-slate-400">
    <span className="h-px flex-1 bg-slate-200" />
    OR
    <span className="h-px flex-1 bg-slate-200" />
  </div>
);

const GoogleButton = () => (
  <button
    type="button"
    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-50 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-100"
  >
    <span className="font-bold text-blue-500">G</span> Continue with Google
  </button>
);

export default Login;
