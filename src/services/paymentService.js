// Payment service for VISA and Bakong KHQR.
// Talks to the Spring Boot backend via api.js.

import { API_ENDPOINTS, buildAuthHeaders, request } from "./api.js";
import { getCurrentUserId } from "./authServices.js";
import { loadCatalog, mapBooking } from "./bookingService.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const unwrapList = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

const safe = (promise) => promise.catch(() => []);

const formatPaymentDate = (payment, fallback) => {
  const date = new Date(payment?.paidAt || payment?.expiresAt || null);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  return fallback || "";
};

// GET /api/payments/my-payments — returns payments for the authenticated user's bookings.
// Backend filters by the token's user ID. Enriches with vehicle name for the Payments History table.
export const getMyPayments = async () => {
  const data = await request(API_ENDPOINTS.myPayments);

  if (data == null) {
    return [];
  }

  try {
    const allPayments = unwrapList(data);

    // Extract unique booking IDs from payments to fetch booking details for enrichment
    const bookingIds = [
      ...new Set(allPayments.map((p) => String(p.bookingId)).filter(Boolean)),
    ];

    // Fetch booking details for enrichment
    const bookingsData = await Promise.all(
      bookingIds.map((bookingId) =>
        safe(request(API_ENDPOINTS.bookingById(bookingId)))
      )
    );
    const bookings = bookingsData
      .map((d) => unwrapList(d))
      .filter((b) => b.length > 0)
      .map((b) => b[0]);

    const context = await loadCatalog(bookings);
    const enrichedById = new Map(
      bookings.map((b) => [String(b.id), mapBooking(b, context)]),
    );

    return allPayments.map((payment) => {
      const booking = enrichedById.get(String(payment.bookingId));
      const isPaid =
        String(payment.paymentStatus || "").toUpperCase() === "PAID";
      return {
        id: payment.bookingId,
        bookingId: payment.bookingId,
        startDate: formatPaymentDate(payment, booking?.startDate),
        vehicleName: booking?.vehicleName || "Vehicle",
        paymentMethod:
          payment.paymentMethod === "CASH" ? "Cash" : "Bakong KHQR",
        totalPrice: Number(payment.amount) || 0,
        paymentStatus: isPaid ? "PAID" : "UNPAID",
        transactionId: payment.transactionId,
        paymentReference: payment.paymentReference,
        currency: payment.currency,
      };
    });
  } catch (error) {
    if (error?.status || !(error instanceof TypeError)) throw error;
    return [];
  }
};

export const PAYMENT_METHODS = {
  visa: "VISA",
  khqr: "Bakong KHQR",
};

export const MERCHANT_NAME = "Rental Company";

const QR_TTL_MS = 7 * 60 * 1000;

const getPaymentQrImage = async (paymentId) => {
  if (!paymentId || String(paymentId).startsWith("mock_")) return null;

  const response = await fetch(API_ENDPOINTS.paymentQr(paymentId), {
    headers: buildAuthHeaders(),
  });
  if (!response.ok) {
    const error = new Error(`Could not load payment QR (HTTP ${response.status}).`);
    error.status = response.status;
    throw error;
  }

  const imageBlob = await response.blob();
  return URL.createObjectURL(imageBlob);
};

const generateTransactionId = () =>
  `TXN-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;

export const buildPaymentAmount = (booking = {}) => {
  const rentalFee = booking.rentalFee ?? booking.totalPrice ?? 0;
  const serviceFee = booking.serviceFee ?? 0;
  const total = booking.totalPrice ?? rentalFee + serviceFee;
  return { rentalFee, serviceFee, total };
};

const formatCardEnding = (number) =>
  `Visa ending ${String(number).replace(/\D/g, "").slice(-4)}`;

const isCardExpired = (month, year) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  return (
    year < now.getFullYear() ||
    (year === now.getFullYear() && month < currentMonth)
  );
};

export const processVisaPayment = async ({ booking = {}, card = {} } = {}) => {
  const digits = String(card.number || "").replace(/\D/g, "");
  const name = String(card.name || "").trim();
  const month = Number(card.expiryMonth);
  const year = Number(card.expiryYear);
  const cvv = String(card.cvv || "");

  if (!/^4\d{15}$/.test(digits)) {
    throw new Error("Please enter a valid 16-digit Visa card number.");
  }
  if (!name || name.length < 2) {
    throw new Error("Cardholder name is required.");
  }
  if (!month || !year || month < 1 || month > 12) {
    throw new Error("Please enter a valid expiry date.");
  }
  if (isCardExpired(month, year)) {
    throw new Error("This card has expired.");
  }
  if (!/^\d{3,4}$/.test(cvv)) {
    throw new Error("Please enter a valid CVV.");
  }

  const { total } = buildPaymentAmount(booking);

  const buildMockTransaction = () => ({
    success: true,
    transaction: {
      transactionId: generateTransactionId(),
      bookingId: booking.id,
      method: PAYMENT_METHODS.visa,
      card: formatCardEnding(digits),
      amount: total,
      status: "paid",
      paidAt: new Date().toISOString(),
    },
  });

  try {
    const data = await request(API_ENDPOINTS.visaPayment, {
      method: "POST",
      body: JSON.stringify({
        bookingId: booking.id,
        amount: total,
        card: {
          name,
          number: digits,
          expiryMonth: month,
          expiryYear: year,
          cvv,
        },
      }),
    });

    if (data && data.success === false) {
      throw new Error(data.message || "Payment was declined.");
    }
    if (data && data.transaction) return data;
    if (!data) return buildMockTransaction();
    return { success: true, transaction: data };
  } catch (error) {
    // Server-side rejections (validation, declined) surface to the form.
    if (error?.status || !(error instanceof TypeError)) throw error;

    // Backend offline -> mock success.
    await delay(1400);
    return buildMockTransaction();
  }
};

// POST /api/payments — creates a KHQR payment for an already-created backend
// booking and returns the PaymentResponseDTO carrying qrString + paymentStatus.
// Mock fallback is used when the backend is unreachable or the booking is a
// local record (no backendBookingId).
export const generateKhqrPayment = async ({ booking = {} } = {}) => {
  const bookingId = booking.backendBookingId;
  const { total } = buildPaymentAmount(booking);
  const now = new Date();
  const transactionId = generateTransactionId();

  const buildMockPayment = () => ({
    id: `mock_${Date.now()}`,
    paymentId: `mock_${Date.now()}`,
    bookingId,
    transactionId,
    paymentReference: `REF-${Date.now().toString(36).toUpperCase()}`,
    merchantName: MERCHANT_NAME,
    merchantId: "BAKONG-8864-2210",
    accountId: "rental@bakong.com",
    amount: total,
    currency: "USD",
    qrData: `KHQR|${transactionId}|${total}|${MERCHANT_NAME}`,
    qrString: `KHQR|${transactionId}|${total}|${MERCHANT_NAME}`,
    paymentStatus: "PENDING",
    status: "pending",
    expiresAt: new Date(now.getTime() + QR_TTL_MS).toISOString(),
  });

  if (!bookingId) {
    await delay(600);
    return buildMockPayment();
  }

  try {
    const data = await request(API_ENDPOINTS.payments, {
      method: "POST",
      body: JSON.stringify({
        bookingId,
        currency: booking.currency || "USD",
        paymentMethod: "KHQR",
      }),
    });

    // request() returns null on network unreachable and throws for non-2xx
    // responses.
    if (data == null) {
      await delay(600);
      return buildMockPayment();
    }
    if (data.success === false) {
      throw new Error(data.message || "Could not generate payment.");
    }
    if (data.id === undefined) {
      throw new Error("Could not generate payment.");
    }

    const paymentId = data.id;
    const qrImageUrl = await getPaymentQrImage(paymentId);
    const fallbackPayment = buildMockPayment();
    return {
      ...fallbackPayment,
      ...data,
      paymentId,
      transactionId: data.transactionId || fallbackPayment.transactionId,
      paymentStatus: data.paymentStatus || fallbackPayment.paymentStatus,
      qrImageUrl,
    };
  } catch (error) {
    // Network or server failure on a demo/local booking → gracefully fall back
    // to a mock QR so the standalone checkout page still works. Surface
    // client-side rejections (4xx) only when the booking was persisted on the
    // backend so real failures are never silently swallowed.
    if (!booking.backendBookingId) {
      await delay(600);
      return buildMockPayment();
    }
    throw error;
  }
};

// GET /api/payments/{id}/verify — resolves the live payment status. PAID means
// the customer has scanned and settled the QR; anything else (FAILED, EXPIRED)
// must surface as a failed payment. Legacy callers may pass transactionId.
export const verifyKhqrPayment = async ({
  paymentId,
  transactionId,
  booking = {},
} = {}) => {
  if (!paymentId || String(paymentId).startsWith("mock_")) {
    throw new Error("Please scan the QR code and complete payment first.");
  }

  const data = await request(API_ENDPOINTS.paymentVerify(paymentId));

  if (data == null) {
    throw new Error("Payment status could not be retrieved.");
  }
  if (data.success === false) {
    throw new Error(data.message || "Payment not verified.");
  }
  if (data.id === undefined) {
    throw new Error("Payment not found.");
  }

  return {
    ...data,
    paymentId: data.id,
    transactionId: data.transactionId || transactionId,
    paymentStatus: data.paymentStatus || data.status,
    method: PAYMENT_METHODS.khqr,
  };
};

// Human-readable label for a backend PaymentStatus enum value.
export const paymentStatusLabel = (status) =>
  String(status || "").toUpperCase() === "PAID"
    ? "Paid"
    : String(status || "").toUpperCase() === "FAILED"
      ? "Failed"
      : String(status || "").toUpperCase() === "EXPIRED"
        ? "Expired"
        : "Pending";
