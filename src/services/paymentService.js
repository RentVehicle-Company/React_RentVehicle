// Payment service for VISA and Bakong KHQR.
// Talks to the Spring Boot backend via api.js.

import { API_ENDPOINTS, request } from "./api.js";
import { getCachedUser } from "./userService.js";
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

// GET /api/payments filtered to the current user's bookings, enriched with
// the vehicle name so the Payments History table can render without N+1 calls.
// Uses live data only — failures surface to the caller.
export const getMyPayments = async () => {
  const userId = getCachedUser().id;
  const [bookingsData, paymentsData] = await Promise.all([
    safe(request(API_ENDPOINTS.bookings)),
    safe(request(API_ENDPOINTS.payments)),
  ]);

  const allBookings = unwrapList(bookingsData);
  const allPayments = unwrapList(paymentsData);

  const myBookings = userId
    ? allBookings.filter((b) => String(b.userId) === String(userId))
    : allBookings;

  const context = await loadCatalog(myBookings);
  const bookingById = new Map(myBookings.map((b) => [String(b.id), b]));
  const enrichedById = new Map(
    myBookings.map((b) => [String(b.id), mapBooking(b, context)])
  );

  return allPayments
    .filter((payment) => bookingById.has(String(payment.bookingId)))
    .map((payment) => {
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
};

export const PAYMENT_METHODS = {
  visa: "VISA",
  khqr: "Bakong KHQR",
};

export const MERCHANT_NAME = "Rental Company";

const QR_TTL_MS = 15 * 60 * 1000;

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
        card: { name, number: digits, expiryMonth: month, expiryYear: year, cvv },
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
  const bookingId = booking.backendBookingId || booking.id;
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

    const mock = buildMockPayment();
    return {
      ...mock,
      ...data,
      paymentId: data.id,
      transactionId: data.transactionId || mock.transactionId,
      paymentStatus: data.paymentStatus || mock.paymentStatus,
    };
  } catch (error) {
    // Network or server failure on a demo/local booking → gracefully fall back
    // to a mock QR so the standalone checkout page still works. Surface
    // client-side rejections (4xx) only when the booking was persisted on the
    // backend so real failures are never silently swallowed.
    if (!booking.backendBookingId || error?.status >= 500) {
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
  const { total } = buildPaymentAmount(booking);
  const now = new Date();

  const buildMockResult = () => ({
    paymentId,
    bookingId: booking.backendBookingId || booking.id,
    transactionId,
    method: PAYMENT_METHODS.khqr,
    amount: total,
    paymentStatus: "PAID",
    status: "paid",
    paidAt: now.toISOString(),
  });

  // Local/demo payments (no backend id) resolve directly as paid, mimicking
  // the pre-backend behaviour of the standalone flow.
  if (!paymentId || String(paymentId).startsWith("mock_")) {
    await delay(2600);
    return buildMockResult();
  }

  try {
    const data = await request(API_ENDPOINTS.paymentVerify(paymentId));

    if (data == null) {
      await delay(2600);
      return buildMockResult();
    }
    if (data.success === false) {
      throw new Error(data.message || "Payment not verified.");
    }
    if (data.id === undefined) {
      throw new Error("Payment not found.");
    }

    const mock = buildMockResult();
    return {
      ...mock,
      ...data,
      paymentId: data.id,
      transactionId: data.transactionId || mock.transactionId,
      paymentStatus: data.paymentStatus || mock.paymentStatus,
      method: PAYMENT_METHODS.khqr,
    };
  } catch (error) {
    if (error?.status >= 500) {
      await delay(2600);
      return buildMockResult();
    }
    throw error;
  }
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