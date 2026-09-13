const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem("rental-access-token");
  const headers = new Headers(options.headers || {});

  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const errorMessage =
      typeof data === "object" && data !== null
        ? data.message || data.error || "Request failed."
        : data || "Request failed.";
    throw new Error(errorMessage);
  }

  return data;
};
