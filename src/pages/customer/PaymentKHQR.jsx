import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LuArrowLeft,
  LuCircleCheck,
  LuClock3,
  LuCopy,
  LuMapPin,
  LuQrCode,
  LuScanLine,
  LuStore,
  LuTruck,
} from "react-icons/lu";
import { assets } from "../../assets/assets";
import { createBooking } from "../../services/bookingService";
import {
  buildPaymentAmount,
  MERCHANT_NAME,
  verifyKhqrPayment,
} from "../../services/paymentService";
import { useToast } from "../../context/ToastContext";
import { usePreferences } from "../../context/PreferencesContext";

const QR_IMAGE_URL =
  "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=KHQR_SAMPLE_PAYMENT";

const FALLBACK_BOOKING = {
  id: 1,
  vehicleName: "BMW X5",
  image: assets.car_image1,
  startDate: "20 Aug 2026",
  endDate: "23 Aug 2026",
  pickupLocation: "Phnom Penh",
  pricePerDay: 300,
  rentalFee: 885,
  serviceFee: 15,
  totalPrice: 900,
  status: "confirmed",
  paymentStatus: "UNPAID",
};

const STATUS_BADGE = {
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-slate-200 text-slate-700",
  cancelled: "bg-red-100 text-red-700",
};

const HOW_TO_PAY = [
  {
    step: 1,
    title: "Open Bakong or Mobile Banking App",
    text: "Launch the Bakong app or your preferred mobile banking app.",
  },
  {
    step: 2,
    title: "Scan the QR code",
    text: "Tap Scan / Pay and point the camera at the code below.",
  },
  {
    step: 3,
    title: "Confirm the payment",
    text: "Check the amount, authorise the transfer, then tap confirm.",
  },
];

const buildPaymentInfo = (booking) => {
  const { total } = buildPaymentAmount(booking);
  return {
    transactionId: `TXN-${Date.now().toString(36).toUpperCase()}${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`,
    merchantName: MERCHANT_NAME,
    accountId: "rental@bakong.com",
    amount: total,
  };
};

const BakongLogo = ({ size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    role="img"
    aria-label="Bakong logo"
    className="shrink-0"
  >
    <defs>
      <linearGradient id="bakong-gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#1e3a8a" />
      </linearGradient>
    </defs>
    <rect width="40" height="40" rx="9" fill="url(#bakong-gradient)" />
    <text
      x="20"
      y="21"
      textAnchor="middle"
      fontSize="12"
      fontWeight="800"
      fill="#ffffff"
      fontFamily="Outfit, sans-serif"
      letterSpacing="0.2"
    >
      bakong
    </text>
  </svg>
);

const QR_CELLS = 25;

const buildQrCells = (seed) => {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  let state = hash >>> 0;
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };

  const cells = [];
  for (let row = 0; row < QR_CELLS; row += 1) {
    for (let col = 0; col < QR_CELLS; col += 1) {
      const isFinder =
        (row < 7 && col < 7) ||
        (row < 7 && col > QR_CELLS - 8) ||
        (row > QR_CELLS - 8 && col < 7);
      let filled = false;

      if (isFinder) {
        const r = row > QR_CELLS - 8 ? row - (QR_CELLS - 7) : row;
        const c = col > QR_CELLS - 8 ? col - (QR_CELLS - 7) : col;
        const ring = r === 0 || r === 6 || c === 0 || c === 6;
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        filled = ring || core;
      } else {
        filled = next() > 0.52;
      }

      cells.push(filled);
    }
  }
  return cells;
};

const QrCodeMock = ({ seed, size = 250 }) => {
  const cells = useMemo(() => buildQrCells(seed), [seed]);
  const scale = size / (QR_CELLS + 2);
  const modules = [];

  cells.forEach((filled, index) => {
    if (!filled) return;
    const row = Math.floor(index / QR_CELLS);
    const col = index % QR_CELLS;
    modules.push(
      <rect
        key={index}
        x={(col + 1) * scale}
        y={(row + 1) * scale}
        width={scale * 0.94}
        height={scale * 0.94}
        rx={scale * 0.18}
      />
    );
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Bakong KHQR payment code"
    >
      <rect width={size} height={size} rx={12} fill="#f8fafc" />
      {modules}
    </svg>
  );
};

const PaymentKHQR = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { formatAmount } = usePreferences();
  const locationBooking = location.state?.booking || null;

  const [booking] = useState(locationBooking || { ...FALLBACK_BOOKING });
  const [payment] = useState(() => buildPaymentInfo(booking));
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [qrFailed, setQrFailed] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    setError(null);
    try {
      await verifyKhqrPayment({
        transactionId: payment.transactionId,
        booking,
      });
      const { rentalFee, serviceFee, total } = buildPaymentAmount(booking);
      await createBooking({
        vehicleName: booking.vehicleName,
        image: booking.image,
        startDate: booking.startDate,
        endDate: booking.endDate,
        pickupDate: booking.pickupDate,
        returnDate: booking.returnDate,
        pickupLocation: booking.pickupLocation || "Phnom Penh",
        deliveryMethod: booking.deliveryMethod,
        deliveryFee: booking.deliveryFee,
        deliveryCity: booking.deliveryCity,
        deliveryDistrict: booking.deliveryDistrict,
        deliveryAddress: booking.deliveryAddress,
        pricePerDay: booking.pricePerDay,
        rentalFee,
        serviceFee,
        totalPrice: total,
        paymentStatus: "paid",
        paymentMethod: "Bakong KHQR",
      });
      toast.success(
        "Booking confirmed",
        `${booking.vehicleName} — find it under My Bookings.`
      );
      navigate("/bookings");
    } catch {
      setError("Payment could not be verified. Please try again.");
      setVerifying(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(payment.transactionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const amount = buildPaymentAmount(booking);
  const usingDelivery = booking.deliveryMethod === "delivery";
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
                <p className="text-xs text-slate-500">
                  {usingDelivery ? "Delivery Address" : "Pickup Location"}
                </p>
                <p className="mt-1 flex items-center gap-1.5 font-medium text-slate-900">
                  {usingDelivery ? (
                    <LuTruck size={15} className="shrink-0" />
                  ) : (
                    <LuMapPin size={15} />
                  )}
                  {booking.pickupLocation || booking.deliveryCity || "Phnom Penh"}
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

            <div className="mt-5 border-t border-borderColor pt-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payment breakdown
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between gap-4 text-slate-600">
                  <span>Price per day</span>
                  <span>{formatAmount(booking.pricePerDay)}</span>
                </div>
                <div className="flex justify-between gap-4 text-slate-600">
                  <span>Rental fee</span>
                  <span>{formatAmount(amount.rentalFee)}</span>
                </div>
                <div className="flex justify-between gap-4 text-slate-600">
                  <span>Service fee</span>
                  <span>{formatAmount(amount.serviceFee)}</span>
                </div>
                {booking.deliveryFee > 0 && (
                  <div className="flex justify-between gap-4 text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <LuTruck size={14} />
                      Delivery fee
                    </span>
                    <span>{formatAmount(booking.deliveryFee)}</span>
                  </div>
                )}
                <div className="mt-3 flex justify-between gap-4 border-t border-borderColor pt-3 font-bold text-slate-900">
                  <span>Total</span>
                  <span>{formatAmount(amount.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border border-borderColor rounded-2xl p-5 sm:p-6 shadow-sm self-start">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <BakongLogo />
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Bakong KHQR
                </h2>
                <p className="text-xs text-slate-500">
                  Scan with your Bakong app
                </p>
              </div>
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-primary">
              Scan to Pay
            </span>
          </div>

          <div className="mt-5 flex justify-center">
            <div className="rounded-2xl border-2 border-borderColor bg-white p-4">
              {qrFailed ? (
                <QrCodeMock seed="KHQR_SAMPLE_PAYMENT" />
              ) : (
                <img
                  src={QR_IMAGE_URL}
                  alt="Bakong KHQR payment code"
                  width={250}
                  height={250}
                  onError={() => setQrFailed(true)}
                  className="h-auto w-full max-w-[250px]"
                />
              )}
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] font-medium text-slate-500">
                <LuQrCode size={13} className="text-primary" />
                Bakong KHQR code — scan to pay
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-primary px-4 py-4 text-center text-white">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-200">
              Total Payment
            </p>
            <p className="mt-1 text-3xl font-bold">{formatAmount(amount.total)}</p>
            <p className="mt-0.5 text-[11px] text-blue-200">
              Due via Bakong KHQR — VAT and fees included
            </p>
          </div>

          <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
            <div className="flex justify-between gap-3 text-slate-600">
              <span>Rental fee</span>
              <span>{formatAmount(amount.rentalFee)}</span>
            </div>
            <div className="flex justify-between gap-3 text-slate-600">
              <span>Service fee</span>
              <span>{formatAmount(amount.serviceFee)}</span>
            </div>
            {booking.deliveryFee > 0 && (
              <div className="flex justify-between gap-3 text-slate-600">
                <span className="flex items-center gap-1.5">
                  <LuTruck size={14} />
                  Delivery fee
                </span>
                <span>{formatAmount(booking.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between gap-3 border-t border-borderColor pt-2 font-bold text-slate-900">
              <span>Total due</span>
              <span>{formatAmount(amount.total)}</span>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              How to pay
            </p>
            <ol className="mt-3 space-y-3">
              {HOW_TO_PAY.map((item) => (
                <li key={item.step} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {item.step}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-5 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-500">
                <LuStore size={15} />
                Merchant
              </span>
              <span className="font-medium text-slate-900">
                {payment.merchantName}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Account</span>
              <span className="font-medium text-slate-900">
                {payment.accountId}
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-borderColor p-4">
            <p className="text-xs text-slate-500">Transaction ID</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="truncate font-mono text-xs text-slate-900">
                {payment.transactionId}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-dull transition-colors cursor-pointer"
              >
                {copied ? <LuCircleCheck size={14} /> : <LuCopy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <LuClock3 size={13} />
            Code expires in 15 minutes after generation.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6">
            <button
              type="button"
              onClick={handleVerify}
              disabled={verifying}
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dull shadow-lg shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <LuScanLine size={18} />
              {verifying ? "Confirming Payment..." : "I have paid — Confirm Payment"}
            </button>
            <p className="mt-3 text-center text-xs text-slate-500">
              After authorising the transfer, confirm to finalise your booking.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PaymentKHQR;