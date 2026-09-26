// Authentication helpers for the Spring Boot API and local session storage.
// Backend base URL + canonical storage keys live in ./api.js.

import {
  API_ENDPOINTS,
  STORAGE_KEYS,
  apiRequest,
  clearAuthStorage,
  readAuthToken,
} from "./api";
import { mapUser } from "./userService";
import {
  decodeJwt,
  getJwtRole,
  getJwtUserId,
  isTokenExpired,
} from "./jwtUtils";

// ---------------------------------------------------------------------------
// Local session storage — always written/read through STORAGE_KEYS so the
// navbar, profile page and RequireAuth stay in sync after navigation/refresh.
// ---------------------------------------------------------------------------

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode etc.) — stay in-memory only.
  }
};

const sanitizeUser = ({ password: _password, ...user }) => user;

export const getStoredAuthUser = () => {
  const storedUser = readJson(STORAGE_KEYS.user, null);
  if (!storedUser || typeof storedUser !== "object") return null;
  return storedUser;
};

// Persist the authenticated user under the single canonical key so profile
// edits survive refresh/navigation without dropping the session.
export const persistSession = (user) => {
  writeJson(STORAGE_KEYS.user, sanitizeUser(user));
};

export const clearSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.user);
    // Clean up the legacy key used by older builds.
    localStorage.removeItem("rental_auth_session");
  } catch {
    // ignore storage failures
  }
};

// ---------------------------------------------------------------------------
// Backend API auth helpers — Spring Boot backend at
// https://spring-rentvehicle.onrender.com/api (see VITE_API_URL in api.js)
// ---------------------------------------------------------------------------

const notifyAuthChange = () => {
  window.dispatchEvent(new CustomEvent("rental-auth-change"));
};

const post = (path, body) =>
  apiRequest(path, {
    method: "POST",
    body: JSON.stringify(body),
  });

const networkError = () =>
  new Error(
    "Unable to reach the server. Please check your connection and try again.",
  );

// POST /api/auth/login  { email, password }
export const login = async (credentials) => {
  const email = String(credentials.email || "")
    .trim()
    .toLowerCase();
  const response = await post(API_ENDPOINTS.authLogin, {
    email,
    password: credentials.password,
  });
  if (!response) throw networkError();
  return response;
};

// POST /api/auth/register  { name, email, password }
// Used by the full-page flow that then verifies the email via OTP.
export const register = async ({ name, email, password }) => {
  const response = await post(API_ENDPOINTS.authRegister, {
    name: String(name || "").trim(),
    email: String(email || "")
      .trim()
      .toLowerCase(),
    password: String(password || ""),
  });
  if (!response) throw networkError();
  return response;
};

// Register + best-effort auto-session: if the backend returns a token it is
// persisted immediately; otherwise only user info comes back (email-verification
// flow) and no session is created.
export const registerUser = async ({ name, email, password }) => {
  const response = await register({ name, email, password });
  const fallbackName =
    String(name || "")
      .trim()
      .split(" ")[0] || "New User";

  const accessToken =
    response?.accessToken || response?.token || response?.data?.accessToken;

  if (accessToken) {
    return storeAuthSession(response, fallbackName);
  }

  const user = getAuthUser(response, fallbackName);
  return user && (user.id !== undefined || user.name) ? user : null;
};

// POST /api/auth/forgot-password { email }
export const forgotPassword = async (email) => {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  const response = await post(API_ENDPOINTS.authForgotPassword, {
    email: normalizedEmail,
  });
  if (!response) throw networkError();
  return response;
};

// POST /api/auth/reset-password { email, code, newPassword }
export const resetPassword = async (email, code, newPassword) => {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  const normalizedCode = String(code || "").trim();
  const normalizedPassword = String(newPassword || "");

  const response = await post(API_ENDPOINTS.authResetPassword, {
    email: normalizedEmail,
    code: normalizedCode,
    newPassword: normalizedPassword,
  });
  if (!response) throw networkError();
  return response;
};

export const verifyEmail = (email, code) =>
  post(API_ENDPOINTS.authVerifyEmail, { email, code });

export const resendOtp = (email) =>
  apiRequest(
    `${API_ENDPOINTS.authResendOtp}?email=${encodeURIComponent(email)}`,
  );

export const refreshToken = (refreshTokenValue) =>
  post(API_ENDPOINTS.authRefresh, { refreshToken: refreshTokenValue });

export const logout = () =>
  apiRequest(API_ENDPOINTS.authLogout, { method: "POST" });

export const loginWithGoogle = (idToken) =>
  post(API_ENDPOINTS.authGoogle, { idToken });

const isBackendUser = (user) =>
  user &&
  (user.emailVerified !== undefined ||
    user.profileImage !== undefined ||
    user.createdAt !== undefined);

export const getAuthUser = (response, fallbackName = "John Doe") => {
  const user =
    response?.user || response?.data?.user || response?.data || response;

  if (isBackendUser(user)) {
    try {
      return mapUser(user);
    } catch {
      // ignore mapping failures and fall through to the passthrough below
    }
  }

  return {
    ...user,
    name: user?.name || user?.fullName || fallbackName,
    role: user?.role || "Customer",
  };
};

// Persist the token(s) + user returned by the backend under the canonical
// keys. Returns the mapped user, or null when no usable session exists.
export const storeAuthSession = (response, fallbackName) => {
  const accessToken =
    response?.accessToken || response?.token || response?.data?.accessToken;
  const refreshTokenValue =
    response?.refreshToken || response?.data?.refreshToken;

  if (accessToken) {
    // Mirror the token under every key components might read so a refresh or
    // navigation never finds a blank "token"/"authToken" entry.
    localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
    localStorage.setItem(STORAGE_KEYS.token, accessToken);
    localStorage.setItem(STORAGE_KEYS.authToken, accessToken);
  }
  if (refreshTokenValue) {
    localStorage.setItem(STORAGE_KEYS.refreshToken, refreshTokenValue);
  }

  const user = getAuthUser(response, fallbackName);

  if (!user || !(user.id !== undefined || user.name)) return null;

  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  notifyAuthChange();
  return user;
};

// Logs the user out: calls POST /api/auth/logout (fire-and-forget), then
// clears local auth state so protected pages and the navbar go back to guest.
export const signOut = async () => {
  try {
    await logout();
  } catch {
    // offline/server errors shouldn't block local sign-out
  }
  clearAuthStorage();
  notifyAuthChange();
};

// ---------------------------------------------------------------------------
// Secure role/identity helpers — decode JWT instead of trusting localStorage
// ---------------------------------------------------------------------------

// Get the current access token from storage
export const getAccessToken = () => readAuthToken();

// Decode and return the JWT payload (for debugging/inspection)
export const getJwtPayload = () => {
  const token = getAccessToken();
  return decodeJwt(token);
};

// Get the current user's role from the JWT (secure - from backend-issued token)
export const getCurrentUserRole = () => {
  const token = getAccessToken();
  return getJwtRole(token);
};

// Get the current user's ID from the JWT
export const getCurrentUserId = () => {
  const token = getAccessToken();
  return getJwtUserId(token);
};

// Check if the current user has ADMIN role (secure - from JWT)
export const isCurrentUserAdmin = () => {
  const role = getCurrentUserRole();
  return role === "ADMIN" || role === "ROLE_ADMIN";
};

// Check if the current user's token is valid and not expired
export const hasValidSession = () => {
  const token = getAccessToken();
  return token && !isTokenExpired(token);
};

// Fetch fresh user profile from backend (most secure - validates token server-side)
export const fetchCurrentUserProfile = async () => {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const response = await apiRequest(API_ENDPOINTS.currentUser);
    if (!response) return null;
    return mapUser(response);
  } catch (err) {
    console.error("Failed to fetch current user profile:", err);
    return null;
  }
};
