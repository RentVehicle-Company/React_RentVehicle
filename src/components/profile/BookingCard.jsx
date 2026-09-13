import React from "react";
import { useNavigate } from "react-router-dom";
import { LuBanknote, LuCalendar, LuRotateCcw } from "react-icons/lu";

const STATUS_CONFIG = {
  confirmed: { label: "Confirmed", className: "bg-green-100 text-green-700" },
  completed: { label: "Completed", className: "bg-slate-200 text-slate-700" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700" },
};

const PAYMENT_CONFIG = {
  paid: { label: "Paid", className: "bg-blue-100 text-blue-700" },
  unpaid: { label: "Unpaid", className: "bg-red-100 text-red-600" },
};

const getActions = (booking) => {
  if (booking.status === "cancelled") return ["details"];
  if (booking.status === "completed") return ["details", "bookAgain"];
  if (booking.paymentStatus === "unpaid") return ["details", "cancel"];
  return ["details", "cancel"];
};

const BookingCard = ({ booking, onCancelRequest }) => {
  const navigate = useNavigate();
  const status = STATUS_CONFIG[booking.status];
  const payment = PAYMENT_CONFIG[booking.paymentStatus] || null;
  const actions = getActions(booking);

  return (
    <div className="bg-white shadow-lg rounded-2xl overflow-hidden shadow-sm">
      <div className="relative h-28 bg-slate-100">
        <img
          src={booking.image}
          alt={booking.vehicleName}
          className="w-full h-full object-cover"
        />
        {status && (
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
          >
            {status.label}
          </span>
        )}
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

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <LuBanknote size={16} className="shrink-0" />
            <span>${booking.totalPrice.toFixed(2)}</span>
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
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-800 bg-white border border-borderColor hover:bg-slate-50 transition-colors cursor-pointer"
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
