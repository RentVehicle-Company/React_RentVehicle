import { apiRequest } from "./api";

const DEMO_ACCOUNT = {
  email: "admin123@gmail.com",
  password: "12345",
  user: {
    id: 1,
    name: "Admin User",
    email: "admin123@gmail.com",
    phone: "+855 12 345 678",
    verified: true,
    memberSince: "Jan 2026",
    loginMethod: "Email & Password",
    role: "Customer",
  },
};

const post = (path, body) =>
  apiRequest(path, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const login = async (credentials) => {
  const email = credentials.email.trim().toLowerCase();

  if (
    email === DEMO_ACCOUNT.email &&
    credentials.password === DEMO_ACCOUNT.password
  ) {
    return {
      accessToken: "demo-rental-access-token",
      user: { ...DEMO_ACCOUNT.user },
    };
  }

  return post("/api/auth/login", { ...credentials, email });
};

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
