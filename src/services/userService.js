// User profile service.
// Talks to the Spring Boot backend via api.js:
//   GET  /api/users/me                       -> fetch current user
//   PUT  /api/users/{id}                     -> update profile
//   POST /api/users/{id}/profile-image       -> upload profile photo (multipart)
// A localStorage cache keeps the profile usable while offline.

import { API_ENDPOINTS, request } from "./api.js";

const STORAGE_KEY = "rental-auth-user";

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

    const token = localStorage.getItem("rental-access-token");
    const response = await fetch(API_ENDPOINTS.userProfileImage(targetId), {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

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