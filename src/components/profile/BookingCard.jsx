import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LuBanknote,
  LuCalendar,
  LuMapPin,
  LuRotateCcw,
  LuSettings2,
  LuTruck,
  LuUsers,
} from "react-icons/lu";
import { usePreferences } from "../../context/PreferencesContext";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
  confirmed: {
    label: "Confirmed",
    className:
      "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  },
  active: {
    label: "Active",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  },
  completed: {
    label: "Completed",
    className:
      "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  },
};

const PAYMENT_CONFIG = {
  PAID: {
    label: "Paid",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  },
  UNPAID: {
    label: "Unpaid",
    className: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300",
  },
  PENDING: {
    label: "Pending",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
};

// Safe date formatting helper
const formatDateSafe = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return Number.isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

// Actions are driven by payment state: a paid booking is locked (no cancel).
const getActions = (booking) => {
  const rawStatus = String(booking.status || "pending").toLowerCase();
  if (booking.paymentStatus === "PAID") return ["details"];
  if (rawStatus === "cancelled") return ["details"];
  if (rawStatus === "completed") return ["details", "bookAgain"];
  if (rawStatus === "active") return ["details"];
  return ["details", "cancel"];
};

const BookingCard = ({ booking, onCancelRequest }) => {
  const navigate = useNavigate();
  const { formatAmount } = usePreferences();

  const rawStatus = String(booking.status || "pending").toLowerCase();
  const isPaid = booking.paymentStatus === "PAID";
  const statusKey = isPaid && rawStatus === "pending" ? "confirmed" : rawStatus;
  const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;

  const payment = PAYMENT_CONFIG[booking.paymentStatus] || null;
  const actions = getActions(booking);
  const specs = booking.vehicleSpecs;
  const usingDelivery = booking.deliveryMethod === "delivery";

  // Prefer the raw API timestamps so pickup and return dates are not reparsed
  // from a localized display string.
  const startDateDisplay = formatDateSafe(
    booking.pickupDateISO || booking.startDate || booking.pickupDate,
  );
  const endDateDisplay = formatDateSafe(
    booking.returnDateISO || booking.endDate || booking.returnDate,
  );

  // Image with fallback
  const vehicleImage = booking.image || "";
  const vehicleName = booking.vehicleName || "Vehicle";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="relative h-28 bg-slate-100 dark:bg-slate-800">
        {vehicleImage ? (
          <img
            src={vehicleImage}
            alt={vehicleName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-400">
            No image
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {status && (
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
            >
              {status.label}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">
          {vehicleName}
        </h3>

        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <LuCalendar size={16} className="shrink-0" />
          <span>
            {startDateDisplay} - {endDateDisplay}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          {usingDelivery ? (
            <LuTruck size={16} className="shrink-0 text-primary" />
          ) : (
            <LuMapPin size={16} className="shrink-0 text-primary" />
          )}
          <span className="truncate">
            {usingDelivery && (
              <span className="mr-1 text-slate-400 dark:text-slate-500">
                Delivered to
              </span>
            )}
            {booking.pickupLocation}
          </span>
        </div>

        {specs && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-0.5">
              {specs.category}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
              <LuSettings2 size={11} />
              {specs.transmission}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
              <LuUsers size={11} />
              {specs.seating_capacity}{" "}
              {specs.seating_capacity === 1 ? "rider" : "seats"}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <LuBanknote size={16} className="shrink-0" />
            <span>{formatAmount(booking.totalPrice)}</span>
          </div>
          {payment && (
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${payment.className}`}
            >
              {payment.label}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-borderColor pt-3 dark:border-slate-800">
          {actions.includes("details") && (
            <button
              type="button"
              onClick={() => navigate(`/bookings/${booking.id}`)}
              className={`cursor-pointer rounded-lg border border-borderColor bg-white px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 ${actions.length === 1 ? "flex-1" : ""}`}
            >
              View Details
            </button>
          )}
          {actions.includes("bookAgain") && (
            <button
              type="button"
              onClick={() => navigate("/cars")}
              className="cursor-pointer rounded-lg border border-borderColor bg-white px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <LuRotateCcw size={14} className="inline mr-1" />
              Book Again
            </button>
          )}
          {actions.includes("cancel") && (
            <button
              type="button"
              onClick={() => onCancelRequest(booking)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
