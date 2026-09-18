import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LuCalendarDays,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const pad = (n) => String(n).padStart(2, "0");

const toISODate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const formatValue = (iso) => {
  if (!iso) return "";
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const CustomDatePicker = ({
  id,
  name,
  value = "",
  min,
  max,
  onChange,
  placeholder = "Select a date",
  className = "",
}) => {
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);

  const todayISO = useMemo(() => toISODate(new Date()), []);

  const [view, setView] = useState(() => {
    const base = value ? new Date(`${value}T00:00:00`) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const minMs = min ? new Date(`${min}T00:00:00`).getTime() : null;
  const maxMs = max ? new Date(`${max}T00:00:00`).getTime() : null;

  const minView = useMemo(() => {
    if (!min) return null;
    const base = new Date(`${min}T00:00:00`);
    return new Date(base.getFullYear(), base.getMonth(), 1);
  }, [min]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  while (cells.length < 42) cells.push(null);

  const canGoPrev = !minView || view.getTime() > minView.getTime();

  const isDisabled = (day) => {
    const ts = new Date(year, month, day).getTime();
    if (minMs && ts < minMs) return true;
    if (maxMs && ts > maxMs) return true;
    return false;
  };

  const shiftMonth = (offset) => {
    setView((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const handleSelect = (day) => {
    if (isDisabled(day)) return;
    onChange(toISODate(new Date(year, month, day)));
    setOpen(false);
  };

  const handleTriggerClick = () => {
    if (!open) {
      const base = value ? new Date(`${value}T00:00:00`) : new Date();
      setView(new Date(base.getFullYear(), base.getMonth(), 1));
    }
    setOpen((prev) => !prev);
  };

  const todayMs = new Date(`${todayISO}T00:00:00`).getTime();
  const todayDisabled =
    (minMs && todayMs < minMs) || (maxMs && todayMs > maxMs);

  const handleQuickToday = () => {
    if (todayDisabled) return;
    onChange(todayISO);
    setOpen(false);
  };

  const handleQuickClear = () => {
    onChange("");
    setOpen(false);
  };

  const triggerClasses =
    `flex h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 text-left text-sm outline-none transition ` +
    `focus:border-primary focus:ring-2 focus:ring-primary/30 ` +
    `dark:focus:border-primary ` +
    (open
      ? "border-primary bg-slate-50 dark:border-primary dark:bg-slate-700/60"
      : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-700/60") +
    ` ${className}`;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        name={name}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={handleTriggerClick}
        className={triggerClasses}
      >
        <span
          className={
            value
              ? "min-w-0 truncate font-medium text-slate-900 dark:text-white"
              : "min-w-0 truncate text-slate-500 dark:text-slate-400"
          }
        >
          {value ? formatValue(value) : placeholder}
        </span>
        <LuCalendarDays
          size={16}
          className={`shrink-0 transition-colors duration-150 ${
            open
              ? "text-primary"
              : value
                ? "text-primary/80"
                : "text-slate-400"
          }`}
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Pick a date"
          className="absolute left-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] animate-pop-in overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-md"
        >
          <div className="flex items-center justify-between gap-2 px-1">
            <button
              type="button"
              aria-label="Previous month"
              disabled={!canGoPrev}
              onClick={() => shiftMonth(-1)}
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-full p-1 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <LuChevronLeft size={16} />
            </button>
            <p className="text-sm font-bold text-white">
              {view.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-full p-1 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <LuChevronRight size={16} />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-0.5 text-center">
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className="py-1 text-xs font-medium text-slate-400"
              >
                {day}
              </span>
            ))}
          </div>

          <div className="mt-0.5 grid grid-cols-7 gap-0.5">
            {cells.map((day, index) => {
              if (day === null) {
                return <span key={`blank-${index}`} className="h-9 w-full" />;
              }
              const iso = toISODate(new Date(year, month, day));
              const disabled = isDisabled(day);
              const selected = iso === value;
              const isToday = iso === todayISO;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  aria-pressed={selected}
                  onClick={() => handleSelect(day)}
                  className={`relative flex h-9 w-full items-center justify-center rounded-lg text-sm transition-all duration-150 ${
                    disabled
                      ? "cursor-not-allowed text-slate-600 opacity-40"
                      : selected
                        ? "scale-105 bg-gradient-to-tr from-blue-600 to-indigo-500 font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                        : isToday
                          ? "border-2 border-blue-500 font-bold text-blue-400 hover:bg-slate-800/80 hover:text-white"
                          : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  {day}
                  {isToday && !selected && (
                    <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-blue-400" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-slate-700/60 pt-3">
            <button
              type="button"
              onClick={handleQuickToday}
              disabled={todayDisabled}
              className="cursor-pointer rounded-lg bg-blue-600/20 px-3 py-1.5 text-xs font-semibold text-blue-400 transition-all hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleQuickClear}
              disabled={!value}
              className="cursor-pointer rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition-all hover:bg-rose-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;