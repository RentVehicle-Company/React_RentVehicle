import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuCircleCheck,
  LuInfo,
  LuTriangleAlert,
  LuX,
} from "react-icons/lu";

const ToastContext = createContext(null);

// oxlint-disable-next-line react/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

const TOAST_STYLES = {
  success: {
    icon: LuCircleCheck,
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
  },
  error: {
    icon: LuTriangleAlert,
    accent: "text-red-600",
    bg: "bg-red-50",
    ring: "ring-red-200",
  },
  warning: {
    icon: LuTriangleAlert,
    accent: "text-amber-600",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
  },
  info: {
    icon: LuInfo,
    accent: "text-primary",
    bg: "bg-blue-50",
    ring: "ring-blue-200",
  },
};

const ToastItem = ({ toast, onDismiss }) => {
  const config = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className={`pointer-events-auto flex w-full items-start gap-3 rounded-2xl border border-white/60 bg-white/85 px-4 py-3 shadow-xl shadow-slate-900/10 ring-1 ${config.ring} backdrop-blur-xl`}
      data-toast={toast.type}
      role="status"
      aria-live="polite"
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${config.bg} ${config.accent}`}
      >
        <Icon size={17} />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-semibold leading-tight text-slate-900">
          {toast.message}
        </p>
        {toast.description && (
          <p className="mt-0.5 text-xs leading-snug text-slate-500">
            {toast.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="mt-0.5 shrink-0 cursor-pointer rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <LuX size={14} />
      </button>
    </motion.div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (type, message, description) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev.slice(-4), { id, type, message, description }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const toast = useMemo(
    () => ({
      success: (message, description) => push("success", message, description),
      error: (message, description) => push("error", message, description),
      warning: (message, description) => push("warning", message, description),
      info: (message, description) => push("info", message, description),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[120] flex w-[min(92vw,360px)] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};