// Base HTTP client for the Rental Company frontend.
// All services talk to the Spring Boot backend through this module.
//
// Set VITE_API_URL to the Spring Boot base URL (e.g. http://localhost:8080).
// Falls back to "/api" so the frontend works when served behind the backend.

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const API_ENDPOINTS = {
  vehicles: `${API_BASE_URL}/vehicles`,
  vehicleById: (id) => `${API_BASE_URL}/vehicles/${id}`,
  motorbikes: `${API_BASE_URL}/motorbikes`,
  bicycles: `${API_BASE_URL}/bicycles`,
  visaPayment: `${API_BASE_URL}/payments/visa`,
  khqrPayment: `${API_BASE_URL}/payments/khqr`,
  khqrPaymentStatus: (transactionId) =>
    `${API_BASE_URL}/payments/khqr/${transactionId}`,
};

export const request = async (path, options = {}) => {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options.headers || {}),
      },
    });
  } catch {
    // Network unreachable -> no backend. Callers fall back to mocks.
    return null;
  }

  const raw = await response.text().catch(() => null);
  let json = null;
  if (raw) {
    try {
      json = JSON.parse(raw);
    } catch {
      // Non-JSON body. While the backend is offline the dev server answers
      // /api/* with index.html (or a 404) -> treat as "no backend".
      json = null;
    }
  }

  if (!response.ok) {
    if (json === null) return null;
    const error = new Error(
      json.message || `Request failed (${response.status})`
    );
    error.status = response.status;
    error.data = json;
    throw error;
  }

  return json;
};