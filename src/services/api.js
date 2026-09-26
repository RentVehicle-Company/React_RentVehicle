const API_BASE_URL = "/api";

export { API_BASE_URL };

// Canonical localStorage keys — every auth/service module must read and
// write through this object so sessions never get mismatched or wiped.
// The token is mirrored under "token"/"authToken" too, so any component
// written against those keys never sees a blank value.
export const STORAGE_KEYS = {
  accessToken: "rental-access-token",
  refreshToken: "rental-refresh-token",
  user: "rental-auth-user",
  token: "token",
  authToken: "authToken",
};

// Rough sanity check that stops us sending garbage such as "undefined",
// "[object Object]" or a stray short value as a Bearer token. Backends reject
// malformed tokens with 401 even on public endpoints.
const isValidToken = (value) => {
  if (typeof value !== "string" || value.length < 10) return false;
  if (["undefined", "null", "NaN", "[object Object]"].includes(value)) {
    return false;
  }
  return true;
};

// Reads the token from any of the accepted keys so components written against
// "rental-access-token", "token" or "authToken" always see the same value.
// Returns null for blank or obviously corrupt entries.
export const readAuthToken = () => {
  const { accessToken, token, authToken } = STORAGE_KEYS;
  const value =
    localStorage.getItem(accessToken) ||
    localStorage.getItem(token) ||
    localStorage.getItem(authToken) ||
    null;
  return isValidToken(value) ? value : null;
};

// Clears every token/user key. Called on explicit sign-out and on a 401 that
// was returned FOR a request that actually sent a token.
export const clearAuthStorage = () => {
  const { accessToken, refreshToken, user, token, authToken } = STORAGE_KEYS;
  [accessToken, refreshToken, user, token, authToken].forEach((key) =>
    localStorage.removeItem(key),
  );
  localStorage.removeItem("rental_auth_session");
};

// Adds the Authorization header (Bearer token) when a usable token exists.
// Reads from the same keys login/AuthContext write to (see STORAGE_KEYS).
export const buildAuthHeaders = (headers = new Headers()) => {
  const token = readAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
};

export const API_ENDPOINTS = {
  vehicles: `${API_BASE_URL}/products`,
  vehicleById: (id) => `${API_BASE_URL}/products/${id}`,
  categories: `${API_BASE_URL}/categories`,
  motorbikes: `${API_BASE_URL}/motorbikes`,
  bicycles: `${API_BASE_URL}/bicycles`,
  visaPayment: `${API_BASE_URL}/payments/visa`,
  khqrPayment: `${API_BASE_URL}/payments/khqr`,
  khqrPaymentStatus: (transactionId) =>
    `${API_BASE_URL}/payments/khqr/${transactionId}`,
  currentUser: `${API_BASE_URL}/users/me`,
  users: `${API_BASE_URL}/users`,
  userById: (id) => `${API_BASE_URL}/users/${id}`,
  userProfileImage: (id) => `${API_BASE_URL}/users/${id}/profile-image`,
  authRegister: `${API_BASE_URL}/auth/register`,
  authLogin: `${API_BASE_URL}/auth/login`,
  authGoogle: `${API_BASE_URL}/auth/google`,
  authVerifyEmail: `${API_BASE_URL}/auth/verify-email`,
  authResendOtp: `${API_BASE_URL}/auth/resend-otp`,
  authForgotPassword: `${API_BASE_URL}/auth/forgot-password`,
  authResetPassword: `${API_BASE_URL}/auth/reset-password`,
  authRefresh: `${API_BASE_URL}/auth/refresh`,
  authLogout: `${API_BASE_URL}/auth/logout`,
  products: `${API_BASE_URL}/products`,
  productById: (id) => `${API_BASE_URL}/products/${id}`,
  productImages: (productId) => `${API_BASE_URL}/products/${productId}/images`,
  locations: `${API_BASE_URL}/locations`,
  bookings: `${API_BASE_URL}/bookings`,
  myBookings: `${API_BASE_URL}/bookings/my-bookings`,
  bookingById: (id) => `${API_BASE_URL}/bookings/${id}`,
  payments: `${API_BASE_URL}/payments`,
  myPayments: `${API_BASE_URL}/payments/my-payments`,
  paymentById: (id) => `${API_BASE_URL}/payments/${id}`,
  paymentQr: (id) => `${API_BASE_URL}/payments/${id}/qr`,
  paymentVerify: (id) => `${API_BASE_URL}/payments/${id}/verify`,
  paymentsByBooking: (bookingId) =>
    `${API_BASE_URL}/bookings/${bookingId}/payments`,
  adminDashboardStats: `${API_BASE_URL}/admin/dashboard-stats`,
  adminAnalyticsStats: `${API_BASE_URL}/admin/analytics-stats`,
};

export const request = async (path, options = {}) => {
  const headers = buildAuthHeaders(new Headers(options.headers || {}));
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

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
    // IMPORTANT: never clear auth storage here. A 401 can come from a
    // checkout/payment request, a bad token on a public listing, or any
    // upstream rejection — blindly wiping localStorage would silently log the
    // user out. Session invalidation is handled deliberately in AuthContext
    // only when GET /users/me confirms the token is actually invalid.
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

  // Some REST endpoints intentionally return 204. A caller can opt into a
  // success sentinel, while the default remains null for existing consumers.
  if (response.status === 204) return options.noContentValue ?? null;
  return data;
};

export const apiRequest = request;
