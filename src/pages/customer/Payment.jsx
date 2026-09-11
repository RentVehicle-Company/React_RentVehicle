import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LuArrowLeft, LuCreditCard, LuQrCode } from "react-icons/lu";
import PaymentMethodSelector from "../../components/payment/PaymentMethodSelector";
import CreditCardForm from "../../components/payment/CreditCardForm";
import PaymentSuccess from "../../components/payment/PaymentSuccess";
import PaymentFailure from "../../components/payment/PaymentFailure";
import BakongKHQRPanel from "../../components/payment/BakongKHQRPanel";
import { getBookingById } from "../../services/bookingService";

const FALLBACK_BOOKING = {
  id: 123,
  vehicleName: "Mazda RX-7",
  startDate: "05/10/2026",
  endDate: "05/12/2026",
  totalPrice: 170,
  status: "confirmed",
  paymentStatus: "unpaid",
};

const DASHBOARD_STEPS = ["select", "card", "khqr", "success", "failed"];

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("select");
  const [paymentMethod, setPaymentMethod] = useState({
    label: "Bakong KHQR",
    icon: LuQrCode,
  });

  useEffect(() => {
    getBookingById(bookingId)
      .then((data) => {
        setBooking(data);
        setLoading(false);
      })
      .catch(() => {
        setBooking({ ...FALLBACK_BOOKING, id: Number(bookingId) || FALLBACK_BOOKING.id });
        setLoading(false);
      });
  }, [bookingId]);

  const handleSelectMethod = (methodId) => {
    if (methodId === "khqr") {
      setPaymentMethod({ label: "Bakong KHQR", icon: LuQrCode });
      setStep("khqr");
    } else {
      setPaymentMethod({ label: "Credit / Debit Card", icon: LuCreditCard });
      setStep("card");
    }
  };

  const handleCardSuccess = (cardInfo) => {
    setPaymentMethod(cardInfo);
    setStep("success");
  };

  const handleDownloadReceipt = () => {
    const receipt = [
      "Rental Company",
      "Payment Receipt",
      "",
      `Booking ID: BK-${String(booking.id).padStart(6, "0")}`,
      `Vehicle: ${booking.vehicleName}`,
      `Dates: ${booking.startDate} - ${booking.endDate}`,
      `Payment Method: ${paymentMethod.label}`,
      "Status: Paid",
      `Total Paid: $${booking.totalPrice.toFixed(2)}`,
      "",
      "Thank you for your booking!",
    ].join("\n");

    const blob = new Blob([receipt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payment-receipt-${booking.id}.txt`;
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

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link
        to="/bookings"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
      >
        <LuArrowLeft size={18} />
        Back to Bookings
      </Link>

      <div className="mt-6 max-w-lg mx-auto">
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-borderColor bg-slate-50 px-4 py-3">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Test controls
          </span>
          {DASHBOARD_STEPS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                step === s
                  ? "bg-black text-white"
                  : "bg-white border border-borderColor text-slate-600 hover:bg-slate-100"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {step === "select" && (
          <PaymentMethodSelector
            amount={booking.totalPrice}
            onSelect={handleSelectMethod}
          />
        )}

        {step === "card" && (
          <CreditCardForm
            booking={booking}
            onSuccess={handleCardSuccess}
            onFailure={() => setStep("failed")}
          />
        )}

        {step === "khqr" && (
          <BakongKHQRPanel
            booking={booking}
            onSuccess={() => setStep("success")}
            onBack={() => setStep("select")}
          />
        )}

        {step === "success" && (
          <PaymentSuccess
            booking={booking}
            paymentLabel={paymentMethod.label}
            paymentIcon={paymentMethod.icon}
            onViewBooking={() => navigate(`/bookings/${booking.id}`)}
            onDownloadReceipt={handleDownloadReceipt}
            onBackHome={() => navigate("/")}
          />
        )}

        {step === "failed" && (
          <PaymentFailure
            onTryAgain={() => setStep("select")}
            onOtherMethod={() => setStep("select")}
            onBackToBooking={() => navigate(`/bookings/${booking.id}`)}
          />
        )}
      </div>
    </div>
  );
};

export default Payment;