const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const API_ENDPOINTS = {
  vehicles: `${API_BASE_URL}/vehicles`,
  vehicleById: (id) => `${API_BASE_URL}/vehicles/${id}`,
  motorbikes: `${API_BASE_URL}/motorbikes`,
  bicycles: `${API_BASE_URL}/bicycles`,
  visaPayment: `${API_BASE_URL}/payments/visa`,
  khqrPayment: `${API_BASE_URL}/payments/khqr`,
  khqrPaymentStatus: (transactionId) =>
    `${API_BASE_URL}/payments/khqr/${transactionId}`,
  currentUser: `${API_BASE_URL}/users/me`,
  userById: (id) => `${API_BASE_URL}/users/${id}`,
  userProfileImage: (id) => `${API_BASE_URL}/users/${id}/profile-image`,
  authRegister: `${API_BASE_URL}/auth/register`,
  authLogin: `${API_BASE_URL}/auth/login`,
  authGoogle: `${API_BASE_URL}/auth/google`,
  authVerifyEmail: `${API_BASE_URL}/auth/verify-email`,
  authResendOtp: `${API_BASE_URL}/auth/resend-otp`,
  authRefresh: `${API_BASE_URL}/auth/refresh`,
  authLogout: `${API_BASE_URL}/auth/logout`,
  products: `${API_BASE_URL}/products`,
  productById: (id) => `${API_BASE_URL}/products/${id}`,
  productImages: (productId) => `${API_BASE_URL}/products/${productId}/images`,
  locations: `${API_BASE_URL}/locations`,
  bookings: `${API_BASE_URL}/bookings`,
  bookingById: (id) => `${API_BASE_URL}/bookings/${id}`,
  payments: `${API_BASE_URL}/payments`,
  paymentsByBooking: (bookingId) => `${API_BASE_URL}/bookings/${bookingId}/payments`,
};

export const request = async (path, options = {}) => {
  const token = localStorage.getItem("rental-access-token");
  const headers = new Headers(options.headers || {});

  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers,
    });
  } catch {
    // Network unreachable -> no backend. Callers fall back to mocks.
    return null;
  }

  const raw = await response.text().catch(() => null);
  let data = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      // Non-JSON body. While the backend is offline the dev server answers
      // /api/* with index.html (or a 404) -> treat as "no backend".
      data = raw;
    }
  }

  if (!response.ok) {
    if (data === null) return null;
    const errorMessage =
      typeof data === "object" && data !== null
        ? data.message || data.error || `Request failed (${response.status})`
        : data || `Request failed (${response.status})`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const apiRequest = request;