// Mock authentication service backed by localStorage so the logged-in
// session and registered accounts persist across reloads.
//
// TODO: Replace with Spring Boot API call — POST /api/auth/login, /api/auth/register
//       and JWT-based session management via the httpOnly cookie / Bearer token.

const USERS_KEY = "rental_users";
const SESSION_KEY = "rental_auth_session";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const DEFAULT_USER = {
  id: "usr_demo",
  name: "John Doe",
  email: "john123@gmail.com",
  password: "demo1234",
  loginMethod: "Email & Password",
};

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

export const getRegisteredUsers = () => {
  const users = readJson(USERS_KEY, []);
  if (!users.some((u) => u.email.toLowerCase() === DEFAULT_USER.email)) {
    const seeded = [DEFAULT_USER, ...users];
    writeJson(USERS_KEY, seeded);
    return seeded;
  }
  return users;
};

export const getSession = () => {
  const session = readJson(SESSION_KEY, null);
  return session
    ? {
        id: session.id,
        name: session.name,
        email: session.email,
        loginMethod: session.loginMethod || "Email & Password",
      }
    : null;
};

export const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore storage failures
  }
};

export const persistSession = (user) => {
  writeJson(SESSION_KEY, sanitizeUser(user));
};

export const registerUser = async ({ name, email, password }) => {
  await delay(700);
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const users = getRegisteredUsers();

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error("An account with this email already exists. Try logging in.");
  }

  const user = {
    id: `usr_${Date.now().toString(36)}`,
    name: String(name || "").trim(),
    email: normalizedEmail,
    password: String(password || ""),
    loginMethod: "Email & Password",
  };

  writeJson(USERS_KEY, [user, ...users]);
  persistSession(user);
  return sanitizeUser({ ...user });
};

export const loginUser = async ({ email, password }) => {
  await delay(600);
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const users = getRegisteredUsers();
  const match = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!match || match.password !== String(password || "")) {
    throw new Error("Invalid email or password.");
  }

  persistSession(match);
  return sanitizeUser({ ...match });
};

export const logoutUser = async () => {
  await delay(200);
  clearSession();
};