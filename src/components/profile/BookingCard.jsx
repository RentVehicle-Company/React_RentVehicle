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
  confirmed: { label: "Confirmed", className: "bg-green-100 text-green-700" },
<<<<<<< HEAD
  active: { label: "Active", className: "bg-blue-100 text-blue-700" },
=======
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700" },
>>>>>>> origin/dev
  completed: { label: "Completed", className: "bg-slate-200 text-slate-700" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700" },
};

const PAYMENT_CONFIG = {
  PAID: { label: "Paid", className: "bg-blue-100 text-blue-700" },
  UNPAID: { label: "Unpaid", className: "bg-red-100 text-red-600" },
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700" },
};

// Actions are driven by payment state: a paid booking is locked (no cancel).
const getActions = (booking) => {
  if (booking.paymentStatus === "PAID") return ["details"];
  if (booking.status === "cancelled") return ["details"];
  if (booking.status === "completed") return ["details", "bookAgain"];
<<<<<<< HEAD
  if (booking.status === "active") return ["details"];
=======
>>>>>>> origin/dev
  return ["details", "cancel"];
};

const BookingCard = ({ booking, onCancelRequest }) => {
  const navigate = useNavigate();
<<<<<<< HEAD
  const { formatAmount } = usePreferences();
  const status = STATUS_CONFIG[booking.status];
=======

  // Paid reservations read as "Confirmed" (or stay "Completed"/"Cancelled"),
  // never as the amber "Pending" placeholder.
  const isPaid = booking.paymentStatus === "PAID";
  const statusKey =
    isPaid && booking.status === "pending" ? "confirmed" : booking.status;
  const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
>>>>>>> origin/dev
  const payment = PAYMENT_CONFIG[booking.paymentStatus] || null;
  const actions = getActions(booking);
  const specs = booking.vehicleSpecs;
  const usingDelivery = booking.deliveryMethod === "delivery";

  return (
    <div className="bg-white shadow-lg  rounded-2xl overflow-hidden shadow-sm">
      <div className="relative h-28 bg-slate-100">
        <img
          src={booking.image}
          alt={booking.vehicleName}
          className="w-full h-full object-cover"
        />
<<<<<<< HEAD
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {status && (
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
            >
              {status.label}
            </span>
          )}
        </div>
=======
        <span
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
        >
          {status.label}
        </span>
>>>>>>> origin/dev
      </div>

      <div className="p-4 space-y-3">
        <h3 className="text-base font-semibold text-slate-900 truncate">
          {booking.vehicleName}
        </h3>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <LuCalendar size={16} className="shrink-0" />
          <span>
            {booking.startDate} - {booking.endDate}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          {usingDelivery ? (
            <LuTruck size={16} className="shrink-0 text-primary" />
          ) : (
            <LuMapPin size={16} className="shrink-0 text-primary" />
          )}
          <span className="truncate">
            {usingDelivery && (
              <span className="mr-1 text-slate-400">Delivered to</span>
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
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
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

        <div className="pt-3 border-t border-borderColor flex flex-wrap gap-2">
          {actions.includes("details") && (
            <button
              type="button"
              onClick={() => navigate(`/bookings/${booking.id}`)}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-slate-800 bg-white border border-borderColor hover:bg-slate-50 transition-colors cursor-pointer ${actions.length === 1 ? "flex-1" : ""}`}
            >
              View Details
            </button>
          )}
          {actions.includes("bookAgain") && (
            <button
              type="button"
              onClick={() => navigate("/cars")}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-800 bg-white border border-borderColor hover:bg-slate-50 transition-colors cursor-pointer"
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