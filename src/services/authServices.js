import { apiRequest } from "./api";

const post = (path, body) =>
  apiRequest(path, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const login = (credentials) => post("/api/auth/login", credentials);

export const register = (values) =>
  post("/api/auth/register", {
    name: values.name,
    email: values.email,
    password: values.password,
  });

export const verifyEmail = (email, otp) =>
  post("/api/auth/verify-email", { email, otp });

export const resendOtp = (email) => post("/api/auth/resend-otp", { email });

export const refreshToken = (refreshTokenValue) =>
  post("/api/auth/refresh", { refreshToken: refreshTokenValue });

export const logout = (refreshTokenValue) =>
  post("/api/auth/logout", { refreshToken: refreshTokenValue });

export const loginWithGoogle = (credential) =>
  post("/api/auth/google", { credential });

export const getAuthUser = (response, fallbackName = "John Doe") => {
  const user =
    response?.user || response?.data?.user || response?.data || response;
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
  localStorage.setItem("rental-auth-user", JSON.stringify(user));
  return user;
};
