import { API_ENDPOINTS, request } from "./api.js";

const unwrapResponse = (response) => response?.data ?? response;

export const getDashboardStats = async () => {
  const response = await request(API_ENDPOINTS.adminDashboardStats);
  if (!response) throw new Error("Dashboard statistics are unavailable.");
  return unwrapResponse(response);
};

export const getAnalyticsStats = async () => {
  const response = await request(API_ENDPOINTS.adminAnalyticsStats);
  if (!response) throw new Error("Analytics statistics are unavailable.");
  return unwrapResponse(response);
};
