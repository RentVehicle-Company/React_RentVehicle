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
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
          aria-label="Close"
        >
          <LuX size={20} />
        </button>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Cancel Booking?
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Are you sure you want to cancel this booking for{" "}
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {booking.vehicleName}
          </span>
          ?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-borderColor bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
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
