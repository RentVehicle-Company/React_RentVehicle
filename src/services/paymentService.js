// Payment service for VISA and Bakong KHQR.
// Talks to the Spring Boot backend via api.js; falls back to mock
// results while the backend is offline so the checkout flow keeps working.

import { API_ENDPOINTS, request } from "./api.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const PAYMENT_METHODS = {
  visa: "VISA",
  khqr: "Bakong KHQR",
};

export const MERCHANT_NAME = "Rental Company";

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

export const generateKhqrPayment = async ({ booking = {} } = {}) => {
  const { total } = buildPaymentAmount(booking);

  const now = new Date();
  const transactionId = generateTransactionId();

  const buildMockPayment = () => ({
    transactionId,
    merchantName: MERCHANT_NAME,
    merchantId: "BAKONG-8864-2210",
    accountId: "rental@bakong.com",
    amount: total,
    currency: "USD",
    qrData: `KHQR|${transactionId}|${total}|${MERCHANT_NAME}`,
    status: "pending",
    expiresAt: new Date(now.getTime() + 15 * 60 * 1000).toISOString(),
  });

  try {
    const data = await request(API_ENDPOINTS.khqrPayment, {
      method: "POST",
      body: JSON.stringify({ bookingId: booking.id, amount: total }),
    });

    if (data && data.success === false) {
      throw new Error(data.message || "Could not generate payment.");
    }

    const mock = buildMockPayment();
    return {
      ...mock,
      ...(data || {}),
      transactionId: data?.transactionId || mock.transactionId,
    };
  } catch (error) {
    if (error?.status || !(error instanceof TypeError)) throw error;

    await delay(600);
    return buildMockPayment();
  }
};

export const verifyKhqrPayment = async ({ transactionId, booking = {} } = {}) => {
  const { total } = buildPaymentAmount(booking);

  const buildMockResult = () => ({
    transactionId,
    bookingId: booking.id,
    method: PAYMENT_METHODS.khqr,
    amount: total,
    status: "paid",
    paidAt: new Date().toISOString(),
  });

  try {
    const data = await request(API_ENDPOINTS.khqrPaymentStatus(transactionId));

    if (data && data.success === false) {
      throw new Error(data.message || "Payment not verified.");
    }

    const mock = buildMockResult();
    return {
      ...mock,
      ...(data || {}),
      transactionId: data?.transactionId || mock.transactionId,
    };
  } catch (error) {
    if (error?.status || !(error instanceof TypeError)) throw error;

    await delay(2600);
    return buildMockResult();
  }
};