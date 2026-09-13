import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { IoSearch } from "react-icons/io5";
import {
  LuCalendarDays,
  LuCheck,
  LuChevronDown,
  LuHistory,
  LuLightbulb,
  LuMapPin,
} from "react-icons/lu";
import HeroCarViewer from "./HeroCarViewer";
import { usePreferences } from "../context/PreferencesContext";

const CAR_SWATCH_COLORS = [
  { hex: "#39FF14", name: "Green (Verde Mantis)" },
  { hex: "#FFD700", name: "Yellow (Giallo Orion)" },
  { hex: "#FF5F00", name: "Orange (Arancio Borealis)" },
  { hex: "#00A2E8", name: "Blue (Blu Cepheus)" },
  { hex: "#1C1C1C", name: "Black (Nero Nemesis)" },
];

const CAMERA_VIEWS = [
  { key: "auto", label: "Auto" },
  { key: "front", label: "Front" },
  { key: "side", label: "Side" },
  { key: "three-quarter", label: "3/4 View" },
];

const VEHICLE_OPTIONS = [
  { key: "bmw", name: "BMW M4 CSL", type: "Sportscar" },
  { key: "urus", name: "Lamborghini Urus", type: "Super SUV" },
  { key: "raptor", name: "Ford F-150 Raptor", type: "Truck/Offroad" },
];

const VEHICLE_SPECS = {
  bmw: {
    topSpeed: 305,
    zeroToSixty: 3.7,
    horsepower: 543,
    drive: "RWD",
    powerPct: 88,
    accent: "#2563eb",
  },
  urus: {
    topSpeed: 305,
    zeroToSixty: 3.3,
    horsepower: 666,
    drive: "AWD",
    powerPct: 94,
    accent: "#f59e0b",
  },
  raptor: {
    topSpeed: 170,
    zeroToSixty: 5.3,
    horsepower: 450,
    drive: "4WD",
    powerPct: 70,
    accent: "#10b981",
  },
};

function CountUp({ value, decimals = 0 }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = value;
    if (from === value) return;
    const controls = animate(from, value, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Number(v.toFixed(decimals))),
    });
    return () => controls.stop();
  }, [value, decimals]);

  return <>{display}</>;
}

function HudStat({
  label,
  value,
  suffix = "",
  decimals = 0,
  pct = 100,
  accent = "#2563eb",
  className = "",
  showCount = true,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className={`pointer-events-none absolute z-20 hidden rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-left shadow-lg shadow-slate-900/5 backdrop-blur-md md:block ${className}`}
    >
      <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="mt-0.5 block text-lg font-bold tabular-nums text-slate-900">
        {showCount ? <CountUp value={value} decimals={decimals} /> : null}
        {suffix}
      </span>
      <span className="mt-2 block h-1.5 w-24 overflow-hidden rounded-full bg-slate-200/80">
        <motion.span
          className="block h-full rounded-full"
          style={{ backgroundColor: accent }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.12 }}
        />
      </span>
    </motion.div>
  );
}

const CITY_OPTIONS = [
  "Phnom Penh",
  "Siem Reap",
  "Sihanoukville",
  "Battambang",
  "Kampot",
];

const RECENT_STORAGE_KEY = "rental_recent_searches";
const AVG_DAILY_RATE = 90;

const ENGINE_SOUND_SRC = "/sounds/engine-sound.mp3";
const ENGINE_SOUND_LABELS = {
  bmw: "Inline-6",
  urus: "V8 Twin-Turbo",
  raptor: "EcoBoost V6",
};

const Hero = ({ selectedVehicle = "bmw", onSelectVehicle }) => {
  const navigate = useNavigate();
  const { formatPrice, t } = usePreferences();
  const today = new Date().toISOString().split("T")[0];
  const [selectedLocation, setSelectedLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [carColor, setCarColor] = useState("#FFD700");
  const [cameraView, setCameraView] = useState("auto");
  const [headlightsOn, setHeadlightsOn] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [enginePlaying, setEnginePlaying] = useState(false);
  const enginePlayingRef = useRef(false);
  const audioRef = useRef(null);

  useEffect(() => {
    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio();
      audioRef.current = audio;
    }
    audio.src = ENGINE_SOUND_SRC;
    audio.volume = 0.5;
    audio.preservesPitch = false;
    audio.onended = () => {
      enginePlayingRef.current = false;
      setEnginePlaying(false);
    };

    // Model switched: stop whatever engine clip was playing instead of
    // carrying the sound across to the newly selected car.
    audio.pause();
    audio.currentTime = 0;
    enginePlayingRef.current = false;
    // Mirror the freshly-switched model's audio state so the button unlights.
    // eslint-disable-next-line react/set-state-in-effect
    setEnginePlaying(false);

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audio.onended = null;
    };
  }, [selectedVehicle]);

  const toggleEngineSound = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (enginePlayingRef.current || !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
      enginePlayingRef.current = false;
      setEnginePlaying(false);
    } else {
      audio.volume = 0.5;
      audio.currentTime = 0;
      audio.play().catch(() => {
        enginePlayingRef.current = false;
        setEnginePlaying(false);
      });
      enginePlayingRef.current = true;
      setEnginePlaying(true);
    }
  };

  const startTs = new Date(`${pickupDate}T00:00:00`).getTime();
  const endTs = new Date(`${returnDate}T00:00:00`).getTime();
  const totalDays =
    pickupDate && returnDate && endTs > startTs
      ? Math.round((endTs - startTs) / 86400000)
      : 0;

  const persistRecentSearch = () => {
    const item = { location: selectedLocation, pickup: pickupDate, return: returnDate };
    if (!item.location && !item.pickup) return;
    setRecentSearches((prev) => {
      const next = [
        item,
        ...prev.filter(
          (p) =>
            !(
              p.location === item.location &&
              p.pickup === item.pickup &&
              p.return === item.return
            )
        ),
      ].slice(0, 5);
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    persistRecentSearch();
    const params = new URLSearchParams();
    if (selectedLocation) params.set("location", selectedLocation);
    if (pickupDate) params.set("pickup", pickupDate);
    if (returnDate) params.set("return", returnDate);
    navigate(`/cars?${params.toString()}`);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_STORAGE_KEY);
  };

  return (
    <section className="relative w-full flex flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mx-auto flex w-full flex-col items-center justify-center gap-6 text-center sm:gap-8">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl lg:text-4xl"
        >
          Find & Rent Your Next Ride in Minutes
        </motion.h1>

        <div className="animate-pulse-glow relative w-full max-w-4xl rounded-2xl p-[2px] md:rounded-full">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl md:rounded-full"
          >
            <span
              className="animate-spin-slow absolute -inset-[100%] aspect-square"
              style={{
                background:
                  "conic-gradient(from 0deg, rgba(37,99,235,0.15), #2563eb, #38bdf8, #2563eb, rgba(37,99,235,0.15))",
              }}
            />
          </span>
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="relative flex flex-col md:flex-row items-start md:items-center
                justify-between gap-4 rounded-2xl p-4 sm:p-5 md:rounded-full w-full bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)]"
          >
          <div className="grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-3 md:ml-4 md:gap-6">
            <div className="relative flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setIsLocationOpen((open) => !open)}
                aria-haspopup="listbox"
                aria-expanded={isLocationOpen}
                className="flex w-full cursor-pointer items-center justify-between gap-2 text-sm"
              >
                <span
                  className={
                    selectedLocation
                      ? "font-medium text-slate-900"
                      : "text-slate-400"
                  }
                >
                  {selectedLocation || t("pickup_location")}
                </span>
                <span className="flex items-center gap-1.5">
                  <LuMapPin
                    size={16}
                    className={selectedLocation ? "text-primary" : "text-slate-400"}
                  />
                  <LuChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${
                      isLocationOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>
              <p className="px-1 text-xs text-gray-500">
                {selectedLocation
                  ? `Pickup: ${selectedLocation}`
                  : "Select your pickup city"}
              </p>

              {isLocationOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsLocationOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    role="listbox"
                    aria-label="Pickup location"
                    className="absolute left-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-2xl"
                  >
                    <p className="border-b border-slate-100 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Choose pickup city
                    </p>
                    <ul className="max-h-64 overflow-y-auto p-1.5">
                      {CITY_OPTIONS.map((city) => {
                        const isSelected = selectedLocation === city;
                        return (
                          <li key={city}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => {
                                setSelectedLocation(city);
                                setIsLocationOpen(false);
                              }}
                              className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                                isSelected
                                  ? "bg-primary/10 font-medium text-primary"
                                  : "text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              <LuMapPin
                                size={15}
                                className={
                                  isSelected ? "text-primary" : "text-slate-400"
                                }
                              />
                              <span className="flex-1">{city}</span>
                              {isSelected && (
                                <LuCheck size={15} className="text-primary" />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    {selectedLocation && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLocation("");
                          setIsLocationOpen(false);
                        }}
                        className="w-full cursor-pointer border-t border-slate-100 px-4 py-2.5 text-center text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                      >
                        Clear location
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col text-start gap-2">
              <label htmlFor="pickup-date" className="text-sm font-medium">
                Pick-up Date
              </label>
              <input
                type="date"
                id="pickup-date"
                name="pickup-date"
                min={today}
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full text-sm text-gray-500"
              />
            </div>

            <div className="flex flex-col text-start gap-2">
              <label htmlFor="return-date" className="text-sm font-medium">
                Return Date
              </label>
              <input
                type="date"
                id="return-date"
                name="return-date"
                min={pickupDate || today}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full text-sm text-gray-500"
              />
            </div>
          </div>

          <div className="flex w-full flex-col md:w-auto">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-1 rounded-xl bg-black px-7 py-3 text-sm text-white transition-all duration-200 hover:bg-gray-800 active:scale-95 cursor-pointer md:w-auto md:rounded-full"
            >
              <IoSearch />
              Search
            </button>

            {totalDays > 0 && selectedLocation && (
              <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary md:hidden">
                <LuCalendarDays size={14} />
                {totalDays} {totalDays === 1 ? "day" : "days"} ·{" "}
                {formatPrice(totalDays * AVG_DAILY_RATE)}
              </div>
            )}
          </div>

          {totalDays > 0 && selectedLocation && (
            <div className="hidden items-center gap-2 border-t border-slate-100 pt-3 md:flex md:border-0 md:pt-0 md:pl-2">
              <div className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
                <LuCalendarDays size={14} />
                {totalDays} {totalDays === 1 ? "day" : "days"} ·{" "}
                {formatPrice(totalDays * AVG_DAILY_RATE)}
              </div>
            </div>
          )}
        </motion.form>
        </div>

        {recentSearches.length > 0 && (
          <div className="-mt-4 flex w-full max-w-4xl flex-wrap items-center justify-center gap-2 sm:-mt-5">
            <span className="inline-flex items-center gap-1 px-2 text-xs font-medium text-slate-500">
              <LuHistory size={13} />
              Recent:
            </span>
            {recentSearches.map((search, index) => (
              <button
                key={`${search.location}-${search.pickup}-${index}`}
                type="button"
                onClick={() => {
                  setSelectedLocation(search.location);
                  setPickupDate(search.pickup);
                  setReturnDate(search.return);
                }}
                className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 shadow-sm transition-colors hover:border-slate-900 hover:text-slate-900"
              >
                {search.location || "Anywhere"}
                {search.pickup && ` · ${search.pickup}`}
                {search.return && ` → ${search.return}`}
              </button>
            ))}
            <button
              type="button"
              onClick={clearRecent}
              className="cursor-pointer text-xs font-medium text-slate-400 underline-offset-2 transition-colors hover:text-slate-700 hover:underline"
            >
              Clear
            </button>
          </div>
        )}

        <div className="relative w-full">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[820px] max-w-[120vw] -translate-x-1/2 -translate-y-1/2 transition-colors duration-700"
          style={{
            color: carColor,
            backgroundImage:
              "radial-gradient(circle at 50% 55%, currentColor 0%, transparent 68%)",
            opacity: 0.16,
            filter: "blur(8px)",
          }}
        />
        <HudStat
          label="Top Speed"
          value={VEHICLE_SPECS[selectedVehicle].topSpeed}
          suffix=" km/h"
          pct={VEHICLE_SPECS[selectedVehicle].powerPct}
          accent={VEHICLE_SPECS[selectedVehicle].accent}
          className="left-2 top-10 sm:left-4"
        />
        <HudStat
          label="0-100 km/h"
          value={VEHICLE_SPECS[selectedVehicle].zeroToSixty}
          suffix=" s"
          decimals={1}
          pct={Math.max(40, 100 - VEHICLE_SPECS[selectedVehicle].zeroToSixty * 12)}
          accent={VEHICLE_SPECS[selectedVehicle].accent}
          className="right-2 top-10 sm:right-4"
        />
        <HudStat
          label="Horsepower"
          value={VEHICLE_SPECS[selectedVehicle].horsepower}
          suffix=" HP"
          pct={VEHICLE_SPECS[selectedVehicle].powerPct}
          accent={VEHICLE_SPECS[selectedVehicle].accent}
          className="bottom-6 left-2 sm:left-4"
        />
        <HudStat
          label="Drivetrain"
          value={0}
          suffix={VEHICLE_SPECS[selectedVehicle].drive}
          pct={65}
          accent={VEHICLE_SPECS[selectedVehicle].accent}
          showCount={false}
          className="bottom-6 right-2 sm:right-4"
        />

        <AnimatePresence>
          {enginePlaying && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="animate-float-slow pointer-events-none absolute bottom-4 right-3 z-20 hidden items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur md:flex"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-pulse-dot inline-flex h-full w-full rounded-full bg-emerald-400" />
              </span>
              🔊 {ENGINE_SOUND_LABELS[selectedVehicle]} Engine Active
            </motion.div>
          )}
        </AnimatePresence>

        <HeroCarViewer
          color={carColor}
          cameraView={cameraView}
          headlightsOn={headlightsOn}
          vehicle={selectedVehicle}
          onInteract={() => setCameraView("custom")}
        />
      </div>

      <motion.div
        className="-mt-2 flex flex-wrap items-center justify-center gap-2"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.28 }}
      >
        <div className="flex flex-wrap items-center justify-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          <span className="pl-2 pr-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Model
          </span>
          {VEHICLE_OPTIONS.map((vehicle) => {
            const isActive = selectedVehicle === vehicle.key;
            return (
              <button
                key={vehicle.key}
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelectVehicle?.(vehicle.key)}
                className={`relative cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 ease-out active:scale-95 ${
                  isActive
                    ? "text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="veh-active-pill"
                    className="absolute inset-0 rounded-full bg-primary shadow-sm"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 32,
                    }}
                  />
                )}
                <span className="relative z-10">{vehicle.name}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        className="-mt-2 flex flex-wrap items-center justify-center gap-2"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.36 }}
      >
        <div className="flex flex-wrap items-center justify-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          <span className="pl-2 pr-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            View
          </span>
          {CAMERA_VIEWS.map((view) => {
            const isActive = cameraView === view.key;
            return (
              <button
                key={view.key}
                type="button"
                aria-pressed={isActive}
                onClick={() => setCameraView(view.key)}
                className={`relative cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 ease-out active:scale-95 ${
                  isActive
                    ? "text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="cam-active-pill"
                    className="absolute inset-0 rounded-full bg-slate-900 shadow-sm"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 32,
                    }}
                  />
                )}
                <span className="relative z-10">{view.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-pressed={headlightsOn}
          onClick={() => setHeadlightsOn((on) => !on)}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium shadow-sm transition-all duration-200 ease-out active:scale-95 ${
            headlightsOn
              ? "animate-pulse-glow-amber border-amber-400 bg-amber-50 text-amber-600"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:text-slate-900"
          }`}
        >
          <LuLightbulb size={14} />
          {headlightsOn ? "Headlights On" : "Headlights"}
        </button>

        <button
          type="button"
          aria-pressed={enginePlaying}
          onClick={toggleEngineSound}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium shadow-sm transition-all duration-200 ease-out active:scale-95 ${
            enginePlaying
              ? "animate-pulse-glow border-primary bg-primary/10 text-primary"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:text-slate-900"
          }`}
        >
          {enginePlaying ? "🔊 Stop Sound" : "🔊 Engine Sound"}
        </button>
      </motion.div>

      <motion.div
        className="mt-2 flex flex-wrap items-center justify-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Car Color
        </span>
        {CAR_SWATCH_COLORS.map(({ hex, name }) => {
          const isActive = carColor === hex;
          return (
            <button
              key={hex}
              type="button"
              aria-label={`Set car color to ${name}`}
              title={name}
              aria-pressed={isActive}
              onClick={() => setCarColor(hex)}
              style={{ backgroundColor: hex }}
              className={`h-8 w-8 cursor-pointer rounded-full border-2 shadow-sm transition-all duration-200 ease-out hover:scale-110 active:scale-95 ${
                isActive
                  ? "scale-110 border-slate-900 ring-2 ring-slate-900/20"
                  : "border-slate-300"
              }`}
            />
          );
        })}
      </motion.div>
      </div>
    </section>
  );
};

export default Hero;