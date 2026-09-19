import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LuArrowLeft,
  LuChevronRight,
  LuCircleCheck,
  LuClock3,
  LuCog,
  LuFuel,
  LuHeadset,
  LuLock,
  LuMail,
  LuMapPin,
  LuPhone,
  LuScanLine,
  LuShieldCheck,
  LuUser,
  LuUsers,
  LuWallet,
  LuWifi,
  LuZap,
} from "react-icons/lu";
import { assets } from "../../assets/assets";
import { createBooking } from "../../services/bookingService";
import {
  generateKhqrPayment,
  MERCHANT_NAME,
  paymentStatusLabel,
  processVisaPayment,
  verifyKhqrPayment,
} from "../../services/paymentService";
import { getCachedUser } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const KHR_RATE = 4100;
const QR_EXPIRY_SECONDS = 7 * 60;
const QR_IMAGE_URL =
  "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=KHQR_SAMPLE_PAYMENT";

const getQrExpirySeconds = (expiresAt) => {
  if (!expiresAt) return QR_EXPIRY_SECONDS;

  const rawValue =
    typeof expiresAt === "number" ? expiresAt : Date.parse(expiresAt);
  const timestamp =
    typeof rawValue === "number" && rawValue < 1e12
      ? rawValue * 1000
      : rawValue;
  const remaining = Math.ceil((timestamp - Date.now()) / 1000);

  return Number.isFinite(remaining) && remaining > 0
    ? Math.min(remaining, QR_EXPIRY_SECONDS)
    : QR_EXPIRY_SECONDS;
};

const FALLBACK_BOOKING = {
  id: 123,
  vehicleName: "Mazda RX-7",
  subtitle: "2023 · 2.6L Twin-Turbo · Sports Coupe",
  image: assets.car_image1,
  pricePerDay: 55,
  rentalFee: 165,
  serviceFee: 5,
  securityDeposit: 0,
  totalPrice: 170,
  startDate: "05 Oct 2026",
  endDate: "07 Oct 2026",
  pickupDate: "05 Oct 2026, 10:00 AM",
  returnDate: "07 Oct 2026, 10:00 AM",
  pickupLocation: "Phnom Penh",
  transmission: "Manual",
  seating_capacity: 2,
  fuel_type: "Petrol",
  duration: 3,
  status: "confirmed",
  paymentStatus: "unpaid",
};

const inputClass =
  "w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass =
  "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

const getErrorMessage = (err) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.data?.message ||
  err?.data?.error ||
  err?.message ||
  "Payment failed. Please try again.";

const buildAmount = (booking = {}) => {
  const rentalFee = booking.rentalFee ?? booking.totalPrice ?? 0;
  const serviceFee = booking.serviceFee ?? 0;
  const securityDeposit = booking.securityDeposit ?? 0;
  const total = booking.totalPrice ?? rentalFee + serviceFee + securityDeposit;
  return { rentalFee, serviceFee, securityDeposit, total };
};

const formatUsd = (value) =>
  `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatCountdown = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60,
  ).padStart(2, "0")}`;

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

const VisaMark = ({ size = 20 }) => (
  <svg
    width={size}
    height={Math.round(size * 0.6)}
    viewBox="0 0 48 30"
    role="img"
    aria-label="Visa"
    className="shrink-0"
  >
    <rect width="48" height="30" rx="6" fill="#1a1f71" />
    <text
      x="24"
      y="20"
      textAnchor="middle"
      fontFamily="Outfit, sans-serif"
      fontSize="16"
      fontWeight="800"
      fontStyle="italic"
      letterSpacing="-0.5"
      fill="#ffffff"
    >
      VISA
    </text>
  </svg>
);

const MastercardMark = ({ size = 22 }) => (
  <svg
    width={size}
    height={Math.round(size * 0.68)}
    viewBox="0 0 36 24"
    role="img"
    aria-label="Mastercard"
    className="shrink-0"
  >
    <circle cx="13" cy="12" r="10" fill="#eb001b" />
    <circle cx="23" cy="12" r="10" fill="#f79e1b" />
    <path d="M18 4a10 10 0 0 1 0 16 10 10 0 0 1 0-16Z" fill="#ff5f00" />
  </svg>
);

const detectBrand = (number) => {
  const digits = String(number || "").replace(/\D/g, "");
  if (digits.startsWith("4")) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  return "generic";
};

const BRAND_STYLES = {
  visa: "from-[#1a1f71] via-[#2847a8] to-[#2b57c7]",
  mastercard: "from-[#eb001b] via-[#e4540d] to-[#f79e1b]",
  generic: "from-slate-600 via-slate-800 to-slate-900",
};

const maskCardNumber = (number) => {
  const digits = String(number || "")
    .replace(/\D/g, "")
    .slice(0, 16);
  const groups = Array.from({ length: 4 }, (_, i) =>
    digits.slice(i * 4, i * 4 + 4).padEnd(4, "•"),
  );
  return groups.join(" ");
};

const CreditCardPreview = ({ card, cardholder }) => {
  const brand = detectBrand(card.number);
  const displayNumber = maskCardNumber(card.number);
  const displayName = cardholder.trim().toUpperCase() || "YOUR NAME";
  const displayExpiry = card.expiry || "MM/YY";
  const showBrand = brand !== "generic";

  return (
    <div
      className={`relative aspect-[1.586] w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br ${BRAND_STYLES[brand]} p-5 shadow-2xl shadow-slate-900/25 ring-1 ring-white/25 transition-all duration-500 sm:p-6`}
    >
      <div className="pointer-events-none absolute -left-1/3 -top-1/2 h-[220%] w-[70%] -rotate-12 bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -right-1/4 -top-1/4 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative grid h-8 w-11 place-items-center rounded-md border border-amber-200/70 bg-gradient-to-br from-amber-100 to-amber-300">
              <span className="absolute inset-y-1.5 left-1.5 w-px bg-amber-700/40" />
              <span className="absolute inset-y-1.5 left-3 w-px bg-amber-700/40" />
            </span>
            <LuWifi size={20} className="rotate-90 text-white/70" />
          </div>
          {showBrand ? (
            brand === "visa" ? (
              <VisaMark size={42} />
            ) : (
              <MastercardMark size={44} />
            )
          ) : (
            <span className="rounded-md bg-white/15 px-2 py-1 text-[9px] font-semibold uppercase tracking-widest text-white/80">
              Debit
            </span>
          )}
        </div>

        <p className="font-mono text-base tracking-[0.16em] text-white/95 sm:text-xl">
          {displayNumber}
        </p>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-widest text-white/55">
              Card Holder
            </p>
            <p className="mt-0.5 truncate text-xs font-semibold uppercase tracking-wider text-white sm:text-sm">
              {displayName}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-white/55">
              Expires
            </p>
            <p className="mt-0.5 text-xs font-semibold tracking-widest text-white sm:text-sm">
              {displayExpiry}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentTab = ({ active, onClick, icon, label, disabled }) => (
  <button
    type="button"
    role="tab"
    aria-selected={active}
    disabled={disabled}
    onClick={onClick}
    title={
      disabled
        ? "Visa payments are temporarily unavailable. Please use KHQR (Bakong)."
        : undefined
    }
    className={`relative inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition-colors duration-200 sm:gap-2 sm:px-3 sm:text-sm ${
      disabled
        ? "cursor-not-allowed text-slate-400 dark:text-slate-500 opacity-60"
        : active
          ? "cursor-pointer text-slate-900 dark:text-white"
          : "cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-100"
    }`}
  >
    {active && (
      <motion.span
        layoutId="payment-tab-indicator"
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        className="absolute inset-0 z-0 rounded-lg bg-white dark:bg-slate-600 shadow-sm"
      />
    )}
    <span className="relative z-10 inline-flex items-center gap-2">
      {icon}
      {label}
      {disabled && <LuLock size={12} strokeWidth={2.5} />}
    </span>
  </button>
);

const SpecBadge = ({ icon, label }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-700/60 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
    <span className="text-slate-400">{icon}</span>
    <span className="min-w-0 truncate">{label}</span>
  </span>
);

const TRUST_BADGES = [
  { icon: LuLock, label: "256-Bit SSL Encryption" },
  { icon: LuZap, label: "Instant Booking Confirmation" },
  { icon: LuHeadset, label: "24/7 Support Guaranteed" },
];

const TrustBadges = () => (
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
    {TRUST_BADGES.map(({ icon: Icon, label }) => (
      <div
        key={label}
        className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-700/60 px-3.5 py-3"
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10">
          <Icon size={14} className="text-primary" />
        </span>
        <span className="text-[11px] font-medium leading-tight text-slate-600 dark:text-slate-300">
          {label}
        </span>
      </div>
    ))}
  </div>
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

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Bakong KHQR payment code"
    >
      <rect width={size} height={size} rx={12} fill="#f8fafc" />
      {cells.map((filled, index) => {
        if (!filled) return null;
        const row = Math.floor(index / QR_CELLS);
        const col = index % QR_CELLS;
        return (
          <rect
            key={index}
            x={(col + 1) * scale}
            y={(row + 1) * scale}
            width={scale * 0.94}
            height={scale * 0.94}
            rx={scale * 0.18}
          />
        );
      })}
    </svg>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user } = useAuth();

  const locationBooking = location.state?.booking || null;
  const backTo = location.state?.from || "/";
  const [booking] = useState(locationBooking || { ...FALLBACK_BOOKING });
  const amount = buildAmount(booking);
  const duration =
    booking.duration ||
    (booking.pricePerDay
      ? Math.max(1, Math.round(amount.rentalFee / booking.pricePerDay))
      : 1);

  const cachedUser = getCachedUser();
  const customer = {
    name: user?.name || cachedUser.name || "John Doe",
    email: user?.email || cachedUser.email || "john123@gmail.com",
    phone: cachedUser.phone || "+855 12 345 678",
  };
  const initials = customer.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const [method, setMethod] = useState("khqr");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [card, setCard] = useState({
    name: customer.name,
    number: "",
    expiry: "",
    cvv: "",
  });
  const [saveCard, setSaveCard] = useState(false);

  const [khqr, setKhqr] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [qrFailed, setQrFailed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(QR_EXPIRY_SECONDS);

  const subtitle =
    booking.subtitle ||
    `${duration} day${duration > 1 ? "s" : ""} · ${
      booking.pickupLocation || "Phnom Penh"
    }`;
  const pickupLabel = booking.pickupDate || booking.startDate;
  const dropoffLabel = booking.returnDate || booking.endDate;
  const khrAmount = Math.round(amount.total * KHR_RATE);
  const specs = booking.vehicleSpecs || {
    transmission: booking.transmission || "Manual",
    seating_capacity: booking.seating_capacity || 4,
    fuel_type: booking.fuel_type || "Petrol",
  };

  // The real QR is rendered from the backend qrString (a KHQR data payload),
  // falling back to the generated mock pattern while offline.
  const hasBackendPayment =
    Boolean(khqr?.paymentId || khqr?.id) &&
    !String(khqr?.paymentId || khqr?.id).startsWith("mock_");
  const qrImageUrl = khqr?.qrImageUrl || "";

  useEffect(() => {
    let mounted = true;
    generateKhqrPayment({ booking })
      .then((payment) => {
        if (!mounted) return;
        setKhqr(payment);
        setSecondsLeft(getQrExpirySeconds(payment.expiresAt));
      })
      .catch((err) => {
        if (!mounted) return;
        setError(getErrorMessage(err));
      });
    return () => {
      mounted = false;
    };
  }, [booking]);

  // Generates (or regenerates) the Bakong KHQR payment. Calling this when the
  // payment is missing or expired means the "Check Payment Status" action can
  // always fall back to a fresh QR instead of dead-ending on a stale one.
  const ensureQrPayment = async () => {
    if (khqr && secondsLeft > 0) return khqr;
    const payment = await generateKhqrPayment({ booking });
    setKhqr(payment);
    setSecondsLeft(getQrExpirySeconds(payment.expiresAt));
    return payment;
  };

  useEffect(() => {
    if (!khqr || !khqr.expiresAt) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [khqr]);

  const handleCardChange = (e) => {
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
    if (name === "expiry") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      setCard((prev) => ({
        ...prev,
        expiry: [digits.slice(0, 2), digits.slice(2)].filter(Boolean).join("/"),
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

  const buildBookingPayload = (paymentMethod) => ({
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
    rentalFee: amount.rentalFee,
    serviceFee: amount.serviceFee,
    totalPrice: amount.total,
    duration,
    addOns: booking.addOns,
    paymentStatus: "paid",
    paymentMethod,
  });

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    try {
      const [monthRaw, yearRaw] = card.expiry.split("/").map((p) => p.trim());
      const year = yearRaw?.length === 2 ? `20${yearRaw}` : yearRaw;
      const result = await processVisaPayment({
        booking,
        card: {
          name: card.name,
          number: card.number,
          expiryMonth: monthRaw,
          expiryYear: year,
          cvv: card.cvv,
        },
      });
      const created = await createBooking(buildBookingPayload("Visa"));
      setSuccess({
        booking: created,
        transaction: result.transaction,
      });
      toast.success(
        "Booking confirmed",
        `${created.vehicleName} — find it under My Bookings.`,
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  const handleKhqrVerify = async () => {
    setVerifying(true);
    setError(null);
    try {
      // Always work from a live payment: if generation hasn't happened yet or
      // the QR already expired, create a fresh one before verifying.
      const payment = await ensureQrPayment();
      const paymentId = payment?.paymentId || payment?.id;
      let result;
      for (let attempt = 0; attempt < 5; attempt += 1) {
        result = await verifyKhqrPayment({
          paymentId,
          transactionId: payment?.transactionId,
          booking,
        });
        const currentStatus = String(
          result.paymentStatus || result.status || "",
        ).toUpperCase();
        if (currentStatus !== "PENDING" || attempt === 4) break;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      const status = String(
        result.paymentStatus || result.status || "",
      ).toUpperCase();

      // Only a verified PAID payment confirms the booking. FAILED / EXPIRED
      // (or any other terminal state) must fail the checkout so the user is
      // never told to wait on an unsettled payment.
      if (status !== "PAID") {
        const reason =
          (status === "FAILED" &&
            (result.failureReason || "The payment was declined.")) ||
          (status === "EXPIRED" &&
            "The payment link expired before it was settled. Please retry.") ||
          `Payment status: ${paymentStatusLabel(status)}. Please complete the payment in your bank app and try again.`;
        throw new Error(reason);
      }

      // When the booking was already persisted by the backend (booking form
      // POST /api/bookings), don't create a duplicate local record.
      const created = booking.backendBookingId
        ? { ...booking, id: booking.backendBookingId }
        : await createBooking(buildBookingPayload("Bakong KHQR"));

      setSuccess({
        booking: created,
        transaction: {
          transactionId:
            result.transactionId ||
            payment.transactionId ||
            result.paymentReference,
          method: "Bakong KHQR",
          amount: Number(result.amount) || amount.total,
        },
      });
      toast.success(
        "Booking confirmed",
        `${created.vehicleName} — find it under My Bookings.`,
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-borderColor dark:border-slate-700 bg-white dark:bg-slate-800 px-4 sm:px-5 py-3 shadow-sm">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <LuArrowLeft size={18} />
          Back to Selection
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-borderColor dark:border-slate-700 bg-slate-50 dark:bg-slate-700/60 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <LuLock size={13} className="text-green-600" />
          Secure Checkout
        </span>
      </header>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Complete your payment to confirm your booking.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <LuShieldCheck size={14} className="text-primary" />
          Payments secured by 256-bit encryption
        </span>
      </div>

      <div className="mt-5 grid lg:grid-cols-[minmax(0,1.4fr)_minmax(330px,0.9fr)] gap-5 items-start">
        <section className="space-y-5">
          {success ? (
            <div className="bg-white dark:bg-slate-800 border border-borderColor dark:border-slate-700 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <LuCircleCheck size={28} className="text-green-600" />
                </div>
                <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
                  Payment Successful
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Your reservation is confirmed.
                </p>

                <div className="mt-6 w-full space-y-2 rounded-xl bg-slate-50 dark:bg-slate-700/60 p-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500 dark:text-slate-400">
                      Transaction ID
                    </span>
                    <span className="truncate font-mono text-xs text-slate-900 dark:text-slate-100">
                      {success.transaction.transactionId}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500 dark:text-slate-400">
                      Method
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {success.transaction.card || success.transaction.method}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500 dark:text-slate-400">
                      Amount
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatUsd(success.transaction.amount)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex w-full flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/bookings/${success.booking.id}`)}
                    className="w-full px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-dull transition-colors cursor-pointer"
                  >
                    View Booking
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="w-full px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-borderColor dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Back Home
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-slate-800 border border-borderColor dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <LuWallet size={20} className="text-primary" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Payment Method
                  </h2>
                </div>

                <div
                  role="tablist"
                  aria-label="Payment method"
                  className="mt-4 grid grid-cols-2 gap-1 rounded-xl border border-borderColor dark:border-slate-700 bg-slate-100 dark:bg-slate-700/60 p-1"
                >
                  <PaymentTab
                    active={false}
                    disabled
                    icon={<VisaMark size={18} />}
                    label="Credit / Debit Card"
                  />
                  <PaymentTab
                    active={method === "khqr"}
                    onClick={() => {
                      setMethod("khqr");
                      setError(null);
                    }}
                    icon={<BakongLogo size={18} />}
                    label="KHQR (Bakong)"
                  />
                </div>

                {booking.local && !success && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-xs text-amber-800 dark:text-amber-300">
                    <LuShieldCheck
                      size={16}
                      className="mt-0.5 shrink-0 text-amber-500 dark:text-amber-400"
                    />
                    <div>
                      <p className="font-bold">Development mode</p>
                      <p className="mt-0.5 leading-snug">
                        The backend booking could not be confirmed, so you're
                        continuing with a local demo booking. The Bakong KHQR
                        payment screen below still works — settle it to finish.
                      </p>
                    </div>
                  </div>
                )}

                {method === "card" ? (
                  <form onSubmit={handleCardSubmit} className="mt-5 space-y-4">
                    <div className="flex justify-center pt-1">
                      <CreditCardPreview
                        card={card}
                        cardholder={card.name || customer.name}
                      />
                    </div>
                    <p className="text-center text-[11px] text-slate-400">
                      Card preview — updates as you type
                    </p>
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
                        onChange={handleCardChange}
                        placeholder="1234 5678 9012 3456"
                        className={inputClass}
                        autoComplete="cc-number"
                      />
                    </div>

                    <div>
                      <label htmlFor="card-name" className={labelClass}>
                        Cardholder Name
                      </label>
                      <input
                        id="card-name"
                        name="name"
                        type="text"
                        value={card.name}
                        onChange={handleCardChange}
                        placeholder="Name on card"
                        className={inputClass}
                        autoComplete="cc-name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="card-expiry" className={labelClass}>
                          Expiry Date
                        </label>
                        <input
                          id="card-expiry"
                          name="expiry"
                          type="text"
                          inputMode="numeric"
                          value={card.expiry}
                          onChange={handleCardChange}
                          placeholder="MM/YY"
                          className={inputClass}
                          autoComplete="cc-exp"
                        />
                      </div>
                      <div>
                        <label htmlFor="card-cvv" className={labelClass}>
                          <span className="inline-flex items-center gap-1.5">
                            CVV
                            <span className="group relative inline-flex">
                              <button
                                type="button"
                                aria-label="What is CVV?"
                                className="grid h-4 w-4 cursor-pointer place-items-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500"
                              >
                                ?
                              </button>
                              <span
                                role="tooltip"
                                className="pointer-events-none absolute left-1/2 top-full z-30 mt-1.5 w-44 -translate-x-1/2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-center text-[10px] font-normal leading-snug text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                              >
                                The 3-4 digit security code on the back of your
                                card.
                              </span>
                            </span>
                          </span>
                        </label>
                        <input
                          id="card-cvv"
                          name="cvv"
                          type="password"
                          inputMode="numeric"
                          value={card.cvv}
                          onChange={handleCardChange}
                          placeholder="•••"
                          className={inputClass}
                          autoComplete="cc-csc"
                        />
                      </div>
                    </div>

                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300 select-none">
                      <input
                        type="checkbox"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="h-4 w-4 rounded border-borderColor dark:border-slate-700 text-primary accent-primary"
                      />
                      Save card for future bookings
                    </label>

                    <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/60 px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      <LuLock size={14} className="shrink-0 text-primary" />
                      Your payment information is encrypted and securely
                      processed.
                    </div>

                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full px-5 py-3 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-dull disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      {processing
                        ? "Processing..."
                        : `Pay ${formatUsd(amount.total)}`}
                    </button>

                    <TrustBadges />
                  </form>
                ) : (
                  <div className="mt-5 space-y-5">
                    <div className="flex items-center gap-3">
                      <BakongLogo size={42} />
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">
                          Bakong KHQR
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Scan with your Bakong app
                        </p>
                      </div>
                      <span className="ml-auto rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-primary">
                        Scan to Pay
                      </span>
                    </div>

                    <div className="rounded-2xl border-2 border-borderColor dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                      <div className="flex justify-center">
                        {!khqr ? (
                          <div className="flex h-[250px] w-[250px] flex-col items-center justify-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-400 dark:text-slate-500">
                            {error ? (
                              <>
                                <LuShieldCheck
                                  size={28}
                                  className="text-amber-400"
                                />
                                <span className="px-6 text-center">
                                  QR generation failed. Retry to display your
                                  Bakong code.
                                </span>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    setError(null);
                                    await ensureQrPayment().catch((err) =>
                                      setError(getErrorMessage(err)),
                                    );
                                  }}
                                  className="cursor-pointer rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-dull"
                                >
                                  Retry
                                </button>
                              </>
                            ) : (
                              "Generating QR code..."
                            )}
                          </div>
                        ) : qrFailed || !qrImageUrl ? (
                          <div className="flex h-[250px] w-[250px] items-center justify-center rounded-lg bg-slate-50 px-6 text-center text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            The secure Bakong QR code is unavailable. Please retry.
                          </div>
                        ) : (
                          <img
                            src={qrImageUrl}
                            alt="Bakong KHQR payment code"
                            width={250}
                            height={250}
                            onError={() => setQrFailed(true)}
                            className="h-[250px] w-[250px] rounded-lg"
                          />
                        )}
                      </div>
                      <div
                        className={`mt-4 flex items-center justify-center gap-2 text-sm font-medium ${
                          secondsLeft <= 60
                            ? "text-red-600"
                            : "text-slate-600 dark:text-slate-300"
                        }`}
                        aria-live="polite"
                      >
                        <LuClock3 size={15} />
                        QR expires in {formatCountdown(secondsLeft)}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-primary px-5 py-5 text-center text-white">
                      <p className="text-xs font-medium uppercase tracking-wider text-blue-200">
                        Total Payment
                      </p>
                      <p className="mt-1 text-2xl font-bold">
                        {formatUsd(amount.total)} USD
                      </p>
                      <p className="mt-1 text-xs text-blue-200">
                        = KHR {khrAmount.toLocaleString("en-US")}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 dark:bg-slate-700/60 p-4 text-sm">
                      <div className="flex items-center justify-between gap-3 text-slate-600 dark:text-slate-300">
                        <span>Merchant</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {khqr?.merchantName || MERCHANT_NAME}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between gap-3 text-slate-600 dark:text-slate-300">
                        <span>Account</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          rental@bakong.com
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleKhqrVerify}
                      disabled={verifying || !hasBackendPayment}
                      className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-dull disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <LuScanLine size={17} />
                      {verifying
                        ? "Checking Payment Status..."
                        : !hasBackendPayment
                          ? "Preparing Payment..."
                        : "Check Payment Status"}
                    </button>

                    <TrustBadges />
                  </div>
                )}

                {error && (
                  <div className="mt-4 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                    {error}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-slate-800 border border-borderColor dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <LuUser size={18} className="text-primary" />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Customer Information
                    </h2>
                  </div>
                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                    Pre-filled
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-sm font-bold text-white">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {customer.name}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {customer.email}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/60 px-3.5 py-2.5 text-sm">
                    <LuMail size={15} className="shrink-0 text-slate-400" />
                    <span className="truncate text-slate-600 dark:text-slate-300">
                      {customer.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/60 px-3.5 py-2.5 text-sm">
                    <LuPhone size={15} className="shrink-0 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-300">
                      {customer.phone}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        <aside className="lg:sticky lg:top-6">
          <div className="overflow-hidden rounded-2xl border border-borderColor dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
            <div className="relative">
              <img
                src={booking.image}
                alt={booking.vehicleName}
                className="h-44 w-full object-cover"
              />
              <span className="absolute left-3 top-3 rounded-full bg-white/90 dark:bg-slate-900/90 px-2.5 py-1 text-xs font-semibold text-slate-900 dark:text-slate-100 backdrop-blur">
                {duration} Day{duration > 1 ? "s" : ""}
              </span>
            </div>
            <div className="p-5 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {booking.vehicleName}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>

              <div className="mt-3 grid grid-cols-3 gap-1.5">
                <SpecBadge
                  icon={<LuCog size={12} />}
                  label={specs.transmission}
                />
                <SpecBadge
                  icon={<LuUsers size={12} />}
                  label={`${specs.seating_capacity} Seats`}
                />
                <SpecBadge
                  icon={<LuFuel size={12} />}
                  label={specs.fuel_type}
                />
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-700/60 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Pick-up
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {pickupLabel}
                    </p>
                  </div>
                  <LuChevronRight className="shrink-0 text-slate-400" />
                  <div className="text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Drop-off
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {dropoffLabel}
                    </p>
                  </div>
                </div>
                <p className="mt-2 flex items-center gap-1.5 border-t border-borderColor dark:border-slate-700 pt-2 text-xs text-slate-500 dark:text-slate-400">
                  <LuMapPin size={13} />
                  {booking.pickupLocation || "Phnom Penh"}
                </p>
              </div>

              <div className="mt-5 border-t border-borderColor dark:border-slate-700 pt-3 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Price details
                </p>
                <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-700">
                  <div className="flex items-center justify-between gap-3 py-2.5 text-slate-600 dark:text-slate-300">
                    <span>
                      Daily rate ({formatUsd(booking.pricePerDay)}/day ×{" "}
                      {duration})
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {formatUsd(amount.rentalFee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5 text-slate-600 dark:text-slate-300">
                    <span>Security Deposit</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {formatUsd(amount.securityDeposit)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5 text-slate-600 dark:text-slate-300">
                    <span>Service Fee</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {formatUsd(amount.serviceFee)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 border-t border-borderColor dark:border-slate-700 pt-3">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Grand Total
                  </span>
                  <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                    {formatUsd(amount.total)}
                  </span>
                </div>

                <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-3 text-xs text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-100 dark:ring-emerald-500/20">
                  <LuShieldCheck
                    size={16}
                    className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                  />
                  <div>
                    <p className="font-bold">Rental Guarantee</p>
                    <p className="mt-0.5 leading-snug text-emerald-600/90 dark:text-emerald-400/90">
                      Best price guarantee — free cancellation within 24h, and
                      your security deposit is fully refunded after return.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
