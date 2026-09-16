import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LuColumns2, LuX } from "react-icons/lu";
import {
  ALL_MOCK_VEHICLES,
  isBicycle,
  isMotorbike,
} from "../services/vehicleServices";
import { usePreferences } from "./PreferencesContext";
import { useToast } from "./ToastContext";

const MAX_COMPARE = 3;

const CompareContext = createContext(null);

// oxlint-disable-next-line react/only-export-components
export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return context;
};

const getVehicleType = (vehicle) =>
  isBicycle(vehicle)
    ? "bicycle"
    : isMotorbike(vehicle)
      ? "motorbike"
      : "car";

const SPEC_ROW_BUILDERS = {
  car: [
    "price_per_day",
    "horsepower",
    "acceleration",
    "drivetrain",
    "seats",
    "location",
  ],
  motorbike: [
    "price_per_day",
    "engine_cc",
    "transmission",
    "fuel_efficiency",
    "top_speed",
    "location",
  ],
  bicycle: [
    "price_per_day",
    "frame",
    "gears",
    "wheel_size",
    "vehicle_type",
    "location",
  ],
};

const getSpecCell = (label, vehicle, type, formatPrice, t) => {
  if (!SPEC_ROW_BUILDERS[type].includes(label)) return "—";
  const specs = vehicle.specs ?? {};
  switch (label) {
    case "price_per_day":
      return formatPrice(vehicle.price_per_day);
    case "horsepower":
      return `${specs.horsepower ?? vehicle.horsepower ?? 15} HP`;
    case "acceleration":
      return `${specs.acceleration ?? 8.6} s`;
    case "drivetrain":
      return specs.drive ?? "—";
    case "seats":
      return `${vehicle.seating_capacity ?? 1} ${t("seats").toLowerCase()}`;
    case "engine_cc":
      return `${specs.displacementCc ?? vehicle.engine_cc ?? 125} cc`;
    case "transmission":
      return specs.transmission ?? vehicle.transmission ?? "Automatic";
    case "fuel_efficiency":
      return `${specs.fuelEfficiency ?? vehicle.fuel_efficiency ?? 45} km/l`;
    case "top_speed":
      return `${specs.topSpeed ?? vehicle.top_speed ?? 18} km/h`;
    case "frame":
      return specs.frame ?? vehicle.frame_material ?? "Aluminum";
    case "gears":
      return specs.gears ?? vehicle.gears ?? "Single-Speed";
    case "wheel_size":
      return specs.wheelSize ?? vehicle.wheel_size ?? "26 inch";
    case "vehicle_type":
      return specs.driveType ?? vehicle.fuel_type ?? "Manual";
    case "location":
      return vehicle.location;
    default:
      return "—";
  }
};

const buildSpecRows = (vehicles, formatPrice, t) => {
  if (!vehicles.length) return [];
  const primary = SPEC_ROW_BUILDERS[getVehicleType(vehicles[0])];
  const labels = [...primary];
  vehicles.forEach((vehicle) => {
    const type = getVehicleType(vehicle);
    SPEC_ROW_BUILDERS[type].forEach((label) => {
      if (!labels.includes(label)) labels.push(label);
    });
  });

  return labels.map((label) => ({
    label: label === "location" ? t("location") : t(label),
    cells: vehicles.map((vehicle) =>
      getSpecCell(label, vehicle, getVehicleType(vehicle), formatPrice, t)
    ),
  }));
};

const CompareModal = ({
  vehicles,
  onClose,
  onRemove,
  formatPrice,
  t,
}) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const rows = useMemo(
    () => buildSpecRows(vehicles, formatPrice, t),
    [vehicles, formatPrice, t]
  );

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Compare vehicles"
    >
      <div
        className="absolute inset-0 animate-fade-in bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-3xl animate-fade-in overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <LuColumns2 size={18} className="text-primary" />
            {t("compare_specs")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close compare"
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
          >
            <LuX size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-28 px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t("vehicle")}
                  </th>
                  {vehicles.map((vehicle) => (
                    <th
                      key={vehicle.id}
                      className="px-3 py-2 text-center align-top"
                    >
                      <div className="relative">
                        <img
                          src={vehicle.image}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="mx-auto h-20 w-full rounded-lg object-cover"
                        />
                        <span className="mt-2 block text-sm font-semibold text-slate-900">
                          {vehicle.brand} {vehicle.model}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemove(vehicle.id)}
                          className="absolute -right-1 -top-1 grid h-5 w-5 cursor-pointer place-items-center rounded-full bg-slate-900 text-white transition-colors hover:bg-slate-700"
                          aria-label={`Remove ${vehicle.brand} ${vehicle.model}`}
                        >
                          <LuX size={11} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label}>
                    <td className="border-t border-slate-100 px-3 py-3 text-left text-xs font-medium text-slate-500">
                      {row.label}
                    </td>
                    {row.cells.map((cell, index) => (
                      <td
                        key={index}
                        className="border-t border-slate-100 px-3 py-3 text-center font-semibold text-slate-900"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const CompareDrawer = ({
  vehicles,
  onRemove,
  onClear,
  onOpenModal,
  formatPrice,
  t,
}) => {
  const show = vehicles.length > 0;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto w-full max-w-4xl px-3 pb-3 sm:px-4 sm:pb-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 pr-1.5"
                >
                  <img
                    src={vehicle.image}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="h-9 w-14 rounded-l-lg object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatPrice(vehicle.price_per_day)} {t("per_day")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(vehicle.id)}
                    aria-label={`${t("remove")} ${vehicle.brand} ${vehicle.model}`}
                    className="grid h-5 w-5 cursor-pointer place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-900"
                  >
                    <LuX size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClear}
                className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
              >
                {t("clear_all")}
              </button>
              <button
                type="button"
                onClick={onOpenModal}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95"
              >
                <LuColumns2 size={14} />
                {t("compare_now")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CompareProvider = ({ children }) => {
  const [compareIds, setCompareIds] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const { formatPrice, t } = usePreferences();
  const toast = useToast();

  const compareVehicles = compareIds
    .map((id) => ALL_MOCK_VEHICLES.find((vehicle) => vehicle.id === id))
    .filter(Boolean);

  const toggleCompare = (id) => {
    if (compareIds.includes(id)) {
      setCompareIds((prev) => prev.filter((item) => item !== id));
      return;
    }
    if (compareIds.length >= MAX_COMPARE) {
      toast.error(
        "Compare limit reached",
        "You can compare up to 3 vehicles at a time."
      );
      return;
    }
    const vehicle = ALL_MOCK_VEHICLES.find((item) => item.id === id);
    toast.success(
      `Added ${vehicle?.brand ?? ""} ${vehicle?.model ?? ""} to compare`,
      `${compareIds.length + 1} of ${MAX_COMPARE} vehicles selected`
    );
    setCompareIds((prev) =>
      prev.includes(id) ? prev : [...prev, id]
    );
  };

  const removeCompare = (id) =>
    setCompareIds((prev) => prev.filter((item) => item !== id));

  const clearCompare = () => setCompareIds([]);

  const isCompared = (id) => compareIds.includes(id);

  return (
    <CompareContext.Provider
      value={{
        compareIds,
        compareVehicles,
        toggleCompare,
        removeCompare,
        clearCompare,
        isCompared,
        setCompareOpen,
      }}
    >
      {children}
      <CompareDrawer
        vehicles={compareVehicles}
        onRemove={removeCompare}
        onClear={clearCompare}
        onOpenModal={() => setCompareOpen(true)}
        formatPrice={formatPrice}
        t={t}
      />
      {compareOpen && compareVehicles.length > 0 && (
        <CompareModal
          vehicles={compareVehicles}
          onClose={() => setCompareOpen(false)}
          onRemove={removeCompare}
          formatPrice={formatPrice}
          t={t}
        />
      )}
    </CompareContext.Provider>
  );
};