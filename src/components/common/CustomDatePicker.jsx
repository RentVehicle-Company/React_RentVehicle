import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  variant = "default",
}) => {
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);

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
    const handleClose = () => setOpen(false);
    const handleKeyDown = (event) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
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
    if (open) {
      setCoords(null);
      setOpen(false);
      return;
    }
    const base = value ? new Date(`${value}T00:00:00`) : new Date();
    setView(new Date(base.getFullYear(), base.getMonth(), 1));
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      setOpen(true);
      return;
    }
    const menuWidth = 320;
    const menuHeight = 344;
    const margin = 8;
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const openUp = spaceBelow < menuHeight && rect.top - margin > spaceBelow;
    const left = Math.max(
      margin,
      Math.min(rect.left, window.innerWidth - menuWidth - margin)
    );
    const top = openUp
      ? Math.max(margin, rect.top - menuHeight - margin)
      : rect.bottom + margin;
    setCoords({ left, top });
    setOpen(true);
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
    variant === "bar"
      ? `flex w-full cursor-pointer items-center justify-between gap-2 bg-transparent px-1 text-left text-sm text-slate-700 font-semibold outline-none placeholder-slate-400 dark:text-slate-200 ` +
        ` ${className}`
      : `flex h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-xl bg-slate-100 px-4 text-left text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-blue-500 md:rounded-full dark:bg-slate-800/80 dark:text-slate-100 ` +
        (open ? "ring-2 ring-blue-500 " : "") +
        ` ${className}`;

  const textClass =
    variant === "bar"
      ? value
        ? "min-w-0 truncate font-medium text-slate-900 dark:text-white"
        : "min-w-0 truncate text-slate-400"
      : value
        ? "min-w-0 truncate font-medium text-slate-900 dark:text-white"
        : "min-w-0 truncate text-slate-500 dark:text-slate-400";

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
          className={textClass}
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

      {open &&
        coords &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[95]"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div
              role="dialog"
              aria-label="Pick a date"
              style={{ left: coords.left, top: coords.top }}
              className="fixed z-[100] w-80 animate-pop-in overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 text-left text-slate-800 shadow-2xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
          <div className="flex items-center justify-between gap-2 px-1">
            <button
              type="button"
              aria-label="Previous month"
              disabled={!canGoPrev}
              onClick={() => shiftMonth(-1)}
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-full p-1 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <LuChevronLeft size={16} />
            </button>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {view.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-full p-1 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <LuChevronRight size={16} />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-0.5 text-center">
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className="py-1 text-xs font-medium text-slate-500 dark:text-slate-400"
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
                        ? "cursor-not-allowed text-slate-300 opacity-40 dark:text-slate-600"
                        : selected
                          ? "scale-105 bg-gradient-to-tr from-blue-600 to-indigo-500 font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                          : isToday
                            ? "border-2 border-blue-500 font-bold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800/80 dark:hover:text-white"
                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/80 dark:hover:text-white"
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

          <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
            <button
              type="button"
              onClick={handleQuickToday}
              disabled={todayDisabled}
              className="cursor-pointer rounded-lg bg-blue-600/10 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-all hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-blue-600/20 dark:text-blue-400"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleQuickClear}
              disabled={!value}
              className="cursor-pointer rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-all hover:bg-rose-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-rose-500/20 dark:text-rose-400"
            >
              Clear
            </button>
          </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
};

export default CustomDatePicker;