/**
 * api/client.js
 *
 * Thin wrapper around fetch that:
 *  - points at the backend base URL (override via VITE_API_BASE_URL in .env)
 *  - attaches the JWT access token from localStorage automatically
 *  - throws on non-2xx so callers can just try/catch
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://spring-rentvehicle.onrender.com";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("accessToken"); // adjust key to whatever your auth flow stores

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "*/*",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message || message;
    } catch {
      // response wasn't JSON — keep the generic message
    }
    throw new Error(message);
  }

  // 204 No Content etc.
  if (res.status === 204) return null;
  return res.json();
}

export const get = (path) => apiFetch(path);
export const post = (path, body) =>
  apiFetch(path, { method: "POST", body: JSON.stringify(body) });
export const put = (path, body) =>
  apiFetch(path, { method: "PUT", body: JSON.stringify(body) });
export const del = (path) => apiFetch(path, { method: "DELETE" });