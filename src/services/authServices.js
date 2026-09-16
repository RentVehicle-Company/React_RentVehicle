// Auth service.
// Talks to the Spring Boot backend via api.js:
//   POST /api/auth/register   -> {name, email, password}            -> {message}
//   POST /api/auth/login      -> {email, password}                  -> AuthResponseDTO
//   POST /api/auth/google     -> {idToken}                          -> AuthResponseDTO
//   POST /api/auth/verify-email -> {email, code}                    -> {message}
//   POST /api/auth/resend-otp -> ?email=...
//   POST /api/auth/refresh    -> {refreshToken}                     -> AuthResponseDTO
//   POST /api/auth/logout     -> Authorization: Bearer <token>
// User profile endpoints are wired in userService.js. Auth relies on the
// live backend only — no demo/fallback accounts.

import { API_ENDPOINTS, apiRequest } from "./api";
import { mapUser } from "./userService";

const notifyAuthChange = () => {
  window.dispatchEvent(new CustomEvent("rental-auth-change"));
};

const post = (path, body) =>
  apiRequest(path, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const login = async (credentials) => {
  const email = credentials.email.trim().toLowerCase();
  return post(API_ENDPOINTS.authLogin, { ...credentials, email });
};

export const register = (values) =>
  post(API_ENDPOINTS.authRegister, {
    name: values.name,
    email: values.email,
    password: values.password,
  });

export const verifyEmail = (email, code) =>
  post(API_ENDPOINTS.authVerifyEmail, { email, code });

export const resendOtp = (email) =>
  apiRequest(`${API_ENDPOINTS.authResendOtp}?email=${encodeURIComponent(email)}`);

export const refreshToken = (refreshTokenValue) =>
  post(API_ENDPOINTS.authRefresh, { refreshToken: refreshTokenValue });

export const logout = () => {
  const token =
    localStorage.getItem("rental-refresh-token") ||
    localStorage.getItem("rental-access-token");
  return apiRequest(API_ENDPOINTS.authLogout, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

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

export const storeAuthSession = (response, fallbackName) => {
  const accessToken =
    response?.accessToken || response?.token || response?.data?.accessToken;
  const refreshTokenValue =
    response?.refreshToken || response?.data?.refreshToken;

  if (accessToken) {
    localStorage.setItem("rental-access-token", accessToken);
  }
  if (refreshTokenValue) {
    localStorage.setItem("rental-refresh-token", refreshTokenValue);
  }

  const user = getAuthUser(response, fallbackName);

  if (!user || !(user.id !== undefined || user.name)) return null;

  localStorage.setItem("rental-auth-user", JSON.stringify(user));
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
  localStorage.removeItem("rental-access-token");
  localStorage.removeItem("rental-refresh-token");
  localStorage.removeItem("rental-auth-user");
  notifyAuthChange();
};