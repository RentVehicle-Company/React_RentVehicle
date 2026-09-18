// User profile service.
// Talks to the Spring Boot backend via api.js:
//   GET  /api/users/me                       -> fetch current user
//   PUT  /api/users/{id}                     -> update profile
//   POST /api/users/{id}/profile-image       -> upload profile photo (multipart)
// A localStorage cache keeps the profile usable while offline.

import {
  API_ENDPOINTS,
  STORAGE_KEYS,
  buildAuthHeaders,
  request,
} from "./api.js";

const STORAGE_KEY = STORAGE_KEYS.user;

let cachedUser = null;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const readCache = () => {
  const storedUser = localStorage.getItem(STORAGE_KEY);

  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (looksLikeUser(parsed)) {
        cachedUser = parsed;
        return { ...parsed };
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  return cachedUser ? { ...cachedUser } : {};
};

export const getCachedUser = () => readCache();

const persist = (user) => {
  cachedUser = { ...cachedUser, ...user };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedUser));
  return { ...cachedUser };
};

const formatMemberSince = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", { month: "short", year: "numeric" });
};

const looksLikeUser = (value) =>
  value && (value.id !== undefined || value.name || value.email);

export const mapUser = (response = {}) => {
  const raw = response?.data ?? response ?? {};
  if (!looksLikeUser(raw)) throw new Error("Invalid user response.");

  return {
    id: raw.id,
    name: raw.name ?? "",
    email: raw.email ?? "",
    phone: raw.phone ?? "",
    address: raw.address ?? "",
    verified: Boolean(raw.emailVerified),
    role: raw.role ?? "",
    memberSince: formatMemberSince(raw.createdAt),
    loginMethod: "Email & Password",
    image: raw.profileImage ?? "",
  };
};

export const getCurrentUser = async () => {
  const response = await request(API_ENDPOINTS.currentUser);
  return persist(mapUser(response));
};

// PUT /api/users/{id}. Requires a logged-in user; server rejections
// (validation/auth) surface to the UI.
export const updateCurrentUser = async (data = {}) => {
  if (!cachedUser.id) throw new Error("You must be logged in.");

  const payload = {
    name: data.name ?? cachedUser.name,
    email: data.email ?? cachedUser.email,
    address: data.address ?? cachedUser.address,
    phone: data.phone ?? cachedUser.phone,
  };

  try {
    const response = await request(API_ENDPOINTS.userById(cachedUser.id), {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return persist(mapUser(response));
  } catch (error) {
    if (error?.status || !(error instanceof TypeError)) throw error;

    await delay(300);
    return persist({ ...data });
  }
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

// POST /api/users/{id}/profile-image (multipart "file"). Falls back to a
// local data-URL preview when the backend is unreachable.
export const uploadProfileImage = async (id, file) => {
  const apply = async () => {
    const targetId = id ?? cachedUser.id;

    if (!targetId) {
      const dataUrl = await fileToDataUrl(file);
      return persist({ image: dataUrl });
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      API_ENDPOINTS.userProfileImage(targetId),
      {
        method: "POST",
        headers: buildAuthHeaders(),
        body: formData,
      },
    );

    const json = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(json?.message || "Profile image upload failed.");
      error.status = response.status;
      throw error;
    }

    return persist(mapUser(json));
  };

  try {
    return await apply();
  } catch (error) {
    if (error?.status || !(error instanceof TypeError)) throw error;

    const dataUrl = await fileToDataUrl(file);
    return persist({ image: dataUrl });
  }
};

// Admin-only: fetch all users
export const getAllUsers = async () => {
  try {
    const data = await request(API_ENDPOINTS.users);
    if (!data) throw new Error("Backend offline");
    const list = Array.isArray(data) ? data : (data?.data ?? []);
    return list.map(mapUser);
  } catch (err) {
    console.error("getAllUsers failed:", err);
    // Return empty array instead of crashing - UI will show "No users" state
    return [];
  }
};

// Admin-only: fetch all users with fallback mock data (for development)
export const getAllUsersWithFallback = async () => {
  const users = await getAllUsers();
  if (users.length > 0) return users;
  
  // Fallback mock data for development when backend is unreachable
  console.warn("Backend unavailable, using mock user data");
  return [
    { id: 1, name: "Admin User", email: "admin@example.com", phone: "+1234567890", role: "ADMIN", verified: true, memberSince: "Jan 2024", image: "" },
    { id: 2, name: "John Doe", email: "john@example.com", phone: "+1234567891", role: "USER", verified: true, memberSince: "Feb 2024", image: "" },
    { id: 3, name: "Jane Smith", email: "jane@example.com", phone: "+1234567892", role: "USER", verified: false, memberSince: "Mar 2024", image: "" },
  ];
};

// Admin-only: update user role
export const updateUserRole = async (id, role) => {
  const response = await request(API_ENDPOINTS.userById(id), {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
  if (!response) throw new Error("Failed to update user role");
  return mapUser(response);
};

// Admin-only: delete user
export const deleteUser = async (id) => {
  const response = await request(API_ENDPOINTS.userById(id), {
    method: "DELETE",
  });
  if (!response) throw new Error("Failed to delete user");
  return response;
};