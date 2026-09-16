import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  LuArrowLeft,
  LuClock3,
  LuDownload,
  LuMapPin,
  LuTruck,
  LuWalletCards,
} from "react-icons/lu";
import { getBookingById } from "../../services/bookingService";
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

const BookingDetails = () => {
  const { id } = useParams();
  const { formatAmount } = usePreferences();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getBookingById(id)
      .then((data) => {
        setBooking(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Booking not found.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8 text-sm text-slate-500">
        Loading booking...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Link
          to="/bookings"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <LuArrowLeft size={18} />
          Back to Bookings
        </Link>
        <div className="mt-6 bg-white border border-borderColor rounded-2xl p-10 text-center text-sm text-slate-500">
          {error}
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.confirmed;
  const rentalFee = booking.rentalFee ?? booking.totalPrice;
  const serviceFee = booking.serviceFee ?? 0;
  const usingDelivery = booking.deliveryMethod === "delivery";
  const duration = Math.max(1, Math.round(rentalFee / booking.pricePerDay));
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${booking.longitude - 0.04}%2C${booking.latitude - 0.03}%2C${booking.longitude + 0.04}%2C${booking.latitude + 0.03}&layer=mapnik&marker=${booking.latitude}%2C${booking.longitude}`;
  const hasCoords =
    Number.isFinite(Number(booking.latitude)) &&
    Number.isFinite(Number(booking.longitude));
  const googleMapsUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${booking.latitude},${booking.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        booking.pickupLocation || ""
      )}`;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link
        to="/bookings"
        className="print:hidden inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <LuArrowLeft size={18} />
        Back to Bookings
      </Link>

      <div className="receipt-content mt-5 grid lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.9fr)] gap-5">
        <section className="relative bg-white  border-borderColor rounded-2xl overflow-hidden shadow-sm">
          <span
            className={`absolute right-5 top-4 z-10 shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
          >
            {status.label}
          </span>
          <div className="grid sm:grid-cols-[minmax(180px,0.8fr)_minmax(0,1.2fr)] min-h-[210px]">
            <div className="relative flex min-h-74 items-center justify-center bg-slate-100 overflow-hidden">
              <img
                src={booking.image}
                alt={booking.vehicleName}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-5 sm:p-7 flex flex-col justify-center">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-xl font-bold text-slate-900">
                  {booking.vehicleName}
                </h1>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500">
                    {usingDelivery ? "Delivery Address" : "Pickup Location"}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 font-medium text-slate-900">
                    {usingDelivery ? <LuTruck size={15} /> : <LuMapPin size={15} />}
                    {booking.pickupLocation}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Duration</p>
                  <p className="mt-1 flex items-center gap-1.5 font-medium text-slate-900">
                    <LuClock3 size={15} />
                    {duration} Days
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Pickup Date</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {booking.pickupDate || booking.startDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Return Date</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {booking.returnDate || booking.endDate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border border-borderColor rounded-2xl p-5 sm:p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Payment Details</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4 text-slate-600">
              <span>Price per day</span>
              <span>{formatAmount(booking.pricePerDay)}</span>
            </div>
            <div className="flex justify-between gap-4 text-slate-600">
              <span>Rental fee</span>
              <span>{formatAmount(rentalFee)}</span>
            </div>
            <div className="flex justify-between gap-4 text-slate-600">
              <span>Service fee</span>
              <span>{formatAmount(serviceFee)}</span>
            </div>
            {usingDelivery && (
              <div className="flex justify-between gap-4 text-slate-600">
                <span className="flex items-center gap-1.5">
                  <LuTruck size={14} />
                  Delivery fee
                </span>
                <span>{formatAmount(booking.deliveryFee || 0)}</span>
              </div>
            )}
          </div>
          <div className="border-t border-borderColor mt-4 pt-4 flex justify-between gap-4 font-bold text-slate-900">
            <span>Total</span>
            <span>{formatAmount(booking.totalPrice)}</span>
          </div>
          <div className="mt-5 flex items-center justify-between gap-3 rounded-lg bg-slate-100 px-4 py-3 text-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <LuWalletCards size={18} className="text-red-700" />
              <span className="font-semibold">Bakong KHQR</span>
            </div>
            <span
              className={`font-medium ${
booking.paymentStatus === "PAID"
                  ? "text-blue-600"
                  : "text-red-600"
              }`}
            >
              {booking.paymentStatus === "PAID" ? "PAID" : "UNPAID"}
            </span>
          </div>
        </section>
      </div>

      <div className="print:hidden mt-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-900">Location</h2>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-borderColor text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          <LuDownload size={15} />
          Download Receipt
        </button>
      </div>

      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={`Open ${booking.pickupLocation} in Google Maps`}
        className="print:hidden mt-3 group relative block cursor-pointer overflow-hidden rounded-xl border border-borderColor bg-slate-100 transition-colors hover:border-primary/50"
      >
        <iframe
          title={`Map showing ${booking.pickupLocation}`}
          src={mapUrl}
          className="pointer-events-none w-full h-[280px] sm:h-[360px] border-0"
          loading="lazy"
        />
        <span className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm">
            <LuMapPin size={15} className="text-primary" />
            Open in Google Maps
          </span>
        </span>
      </a>
      <p className="print:hidden mt-2 text-xs text-slate-500">
        {booking.pickupLocation} | Lat: {booking.latitude}, Long:{" "}
        {booking.longitude}
      </p>
    </div>
  );
};

export default BookingDetails;
