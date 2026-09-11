import React from "react";
import { LuX } from "react-icons/lu";

const CancelBookingModal = ({ booking, onClose, onConfirm }) => {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-lg p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <LuX size={20} />
        </button>

        <h3 className="text-lg font-semibold text-slate-900">
          Cancel Booking?
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Are you sure you want to cancel this booking for{" "}
          <span className="font-medium text-slate-700">{booking.vehicleName}</span>?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-borderColor hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Keep Booking
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer"
          >
            Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;