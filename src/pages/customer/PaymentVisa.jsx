import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  LuArrowLeft,
  LuClock3,
  LuCreditCard,
  LuDownload,
  LuLock,
  LuMapPin,
  LuShieldCheck,
} from "react-icons/lu";
import { assets } from "../../assets/assets";
import { getBookingById } from "../../services/bookingService";
import {
  buildPaymentAmount,
  processVisaPayment,
} from "../../services/paymentService";

const FALLBACK_BOOKING = {
  id: 123,
  vehicleName: "Mazda RX-7",
  image: assets.car_image1,
  startDate: "05 Oct 2026",
  endDate: "07 Oct 2026",
  pickupLocation: "Phnom Penh",
  pricePerDay: 85,
  rentalFee: 165,
  serviceFee: 5,
  totalPrice: 170,
  status: "confirmed",
  paymentStatus: "unpaid",
};

const STATUS_BADGE = {
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-slate-200 text-slate-700",
  cancelled: "bg-red-100 text-red-700",
};

const inputClass =
  "w-full px-4 py-2.5 bg-white border border-borderColor rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

const formatMoney = (value) => `$${Number(value).toFixed(2)}`;

const PaymentVisa = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locationBooking = location.state?.booking || null;
  const [booking, setBooking] = useState(locationBooking);
  const [loading, setLoading] = useState(!locationBooking);
  const [processing, setProcessing] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState(null);
  const [card, setCard] = useState({
    name: "",
    number: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  useEffect(() => {
    if (locationBooking) return;
    let mounted = true;

    getBookingById(bookingId || 1)
      .catch(() => ({
        ...FALLBACK_BOOKING,
        id: Number(bookingId) || FALLBACK_BOOKING.id,
      }))
      .then((data) => {
        if (mounted) {
          setBooking(data);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [bookingId, locationBooking]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError(null);

    if (name === "number") {
      const digits = value.replace(/\D/g, "").slice(0, 16);
      setCard((prev) => ({
        ...prev,
        number: digits.replace(/(.{4})/g, "$1 ").trim(),
      }));
      return;
    }
    if (name === "expiryMonth") {
      setCard((prev) => ({
        ...prev,
        expiryMonth: value.replace(/\D/g, "").slice(0, 2),
      }));
      return;
    }
    if (name === "expiryYear") {
      setCard((prev) => ({
        ...prev,
        expiryYear: value.replace(/\D/g, "").slice(0, 4),
      }));
      return;
    }
    if (name === "cvv") {
      setCard((prev) => ({
        ...prev,
        cvv: value.replace(/\D/g, "").slice(0, 4),
      }));
      return;
    }

    setCard((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    try {
      const result = await processVisaPayment({ booking, card });
      setTransaction(result.transaction);
    } catch (err) {
      setError(err?.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadReceipt = () => {
    const receipt = [
      "Rental Company",
      "VISA Payment Receipt",
      "",
      `Booking ID: BK-${String(booking.id).padStart(6, "0")}`,
      `Vehicle: ${booking.vehicleName}`,
      `Dates: ${booking.startDate} - ${booking.endDate}`,
      `Payment Method: ${transaction.method} (${transaction.card})`,
      "Status: Paid",
      `Total Paid: ${formatMoney(transaction.amount)}`,
      `Transaction ID: ${transaction.transactionId}`,
      "",
      "Thank you for your booking!",
    ].join("\n");

    const blob = new Blob([receipt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `visa-receipt-${booking.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8 text-sm text-slate-500">
        Loading payment...
      </div>
    );
  }

  const amount = buildPaymentAmount(booking);
  const duration = booking.pricePerDay
    ? Math.max(1, Math.round(amount.rentalFee / booking.pricePerDay))
    : 1;
  const statusBadge = STATUS_BADGE[booking.status] || STATUS_BADGE.confirmed;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link
        to="/payments"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
      >
        <LuArrowLeft size={18} />
        Back to Payments
      </Link>

      <div className="mt-5 grid lg:grid-cols-[minmax(0,1.4fr)_minmax(330px,0.9fr)] gap-5">
        <section className="bg-white border border-borderColor rounded-2xl overflow-hidden shadow-sm self-start">
          <div className="relative">
            <div className="flex items-center justify-center bg-slate-100 overflow-hidden">
              <img
                src={booking.image}
                alt={booking.vehicleName}
                className="h-48 w-full object-cover"
              />
            </div>
            <span
              className={`absolute right-4 top-3 z-10 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge}`}
            >
              {booking.status}
            </span>
          </div>

          <div className="p-5 sm:p-6">
            <h1 className="text-xl font-bold text-slate-900">
              {booking.vehicleName}
            </h1>

            <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">Pickup Location</p>
                <p className="mt-1 flex items-center gap-1.5 font-medium text-slate-900">
                  <LuMapPin size={15} />
                  {booking.pickupLocation || "Phnom Penh"}
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
                <p className="text-xs text-slate-500">Start Date</p>
                <p className="mt-1 font-medium text-slate-900">
                  {booking.startDate}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">End Date</p>
                <p className="mt-1 font-medium text-slate-900">
                  {booking.endDate}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2 border-t border-borderColor pt-4 text-sm">
              <div className="flex justify-between gap-4 text-slate-600">
                <span>Price per day</span>
                <span>{formatMoney(booking.pricePerDay)}</span>
              </div>
              <div className="flex justify-between gap-4 text-slate-600">
                <span>Rental fee</span>
                <span>{formatMoney(amount.rentalFee)}</span>
              </div>
              <div className="flex justify-between gap-4 text-slate-600">
                <span>Service fee</span>
                <span>{formatMoney(amount.serviceFee)}</span>
              </div>
              <div className="mt-3 flex justify-between gap-4 border-t border-borderColor pt-3 font-bold text-slate-900">
                <span>Total</span>
                <span>{formatMoney(amount.total)}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border border-borderColor rounded-2xl p-5 sm:p-6 shadow-sm self-start">
          {transaction ? (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <LuShieldCheck size={26} className="text-green-600" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-900">
                Payment Successful
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your reservation is confirmed.
              </p>

              <div className="mt-6 w-full space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Transaction ID</span>
                  <span className="truncate font-mono text-xs text-slate-900">
                    {transaction.transactionId}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Method</span>
                  <span className="font-medium text-slate-900">
                    {transaction.card}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-semibold text-slate-900">
                    {formatMoney(transaction.amount)}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex w-full flex-col gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/bookings/${booking.id}`)}
                  className="w-full px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-dull transition-colors cursor-pointer"
                >
                  View Booking
                </button>
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-white border border-borderColor hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <LuDownload size={15} />
                  Download Receipt
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Back Home
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center gap-2">
                <LuCreditCard size={20} className="text-primary" />
                <h2 className="text-lg font-bold text-slate-900">
                  VISA Card Payment
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Enter your card details below. Your information is encrypted and
                secure.
              </p>

              <div>
                <label htmlFor="card-name" className={labelClass}>
                  Cardholder Name
                </label>
                <input
                  id="card-name"
                  name="name"
                  type="text"
                  value={card.name}
                  onChange={handleChange}
                  placeholder="Name on card"
                  className={inputClass}
                  autoComplete="cc-name"
                />
              </div>

              <div>
                <label htmlFor="card-number" className={labelClass}>
                  Card Number
                </label>
                <input
                  id="card-number"
                  name="number"
                  type="text"
                  inputMode="numeric"
                  value={card.number}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                  className={inputClass}
                  autoComplete="cc-number"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="card-expiry-month" className={labelClass}>
                    Expiry
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      id="card-expiry-month"
                      name="expiryMonth"
                      type="text"
                      inputMode="numeric"
                      value={card.expiryMonth}
                      onChange={handleChange}
                      placeholder="MM"
                      className={inputClass}
                    />
                    <input
                      id="card-expiry-year"
                      name="expiryYear"
                      type="text"
                      inputMode="numeric"
                      value={card.expiryYear}
                      onChange={handleChange}
                      placeholder="YYYY"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="card-cvv" className={labelClass}>
                    CVV
                  </label>
                  <input
                    id="card-cvv"
                    name="cvv"
                    type="password"
                    inputMode="numeric"
                    value={card.cvv}
                    onChange={handleChange}
                    placeholder="•••"
                    className={inputClass}
                    autoComplete="cc-csc"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <LuLock size={13} />
                  Secure 256-bit encrypted
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  VISA
                </span>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full px-5 py-3 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-dull disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {processing
                  ? "Processing..."
                  : `Pay ${formatMoney(amount.total)}`}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};

export default PaymentVisa;