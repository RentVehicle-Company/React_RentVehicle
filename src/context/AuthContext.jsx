import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  clearSession,
  getStoredAuthUser,
  login as loginWithBackend,
  persistSession,
  registerUser,
  signOut,
  storeAuthSession,
} from "../services/authServices";
import { clearAuthStorage, readAuthToken } from "../services/api";
import { getCurrentUser } from "../services/userService";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

// oxlint-disable-next-line react/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authOpen, setAuthOpen] = useState(null);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const token = readAuthToken();
      const storedUser = getStoredAuthUser();

      if (!token) {
        if (mounted) {
          setUser(null);
          setAuthReady(true);
        }
        return;
      }

      if (storedUser && mounted) setUser(storedUser);

      try {
        const currentUser = await getCurrentUser();
        if (mounted) setUser(currentUser);
      } catch (error) {
        // A 401 from GET /users/me is the authoritative signal that the token
        // is invalid — so THIS is the only place a session is wiped. HTTP
        // errors elsewhere (checkout 401s, stale tokens on public endpoints)
        // never log the user out. Network outages keep the cached session.
        if (error?.status === 401 && mounted) {
          clearAuthStorage();
          setUser(null);
          window.dispatchEvent(new CustomEvent("rental-auth-change"));
        }
      } finally {
        if (mounted) setAuthReady(true);
      }
    };

    const syncStoredSession = () => {
      setUser(readAuthToken() ? getStoredAuthUser() : null);
      setAuthReady(true);
    };

    restoreSession();
    window.addEventListener("storage", syncStoredSession);
    window.addEventListener("rental-auth-change", syncStoredSession);

    return () => {
      mounted = false;
      window.removeEventListener("storage", syncStoredSession);
      window.removeEventListener("rental-auth-change", syncStoredSession);
    };
  }, []);

  const login = useCallback(
    async (credentials) => {
      const response = await loginWithBackend(credentials);
      const session = storeAuthSession(
        response,
        credentials.email.split("@")[0],
      );
      if (!session) {
        throw new Error(
          "Login succeeded but no user session was returned. Please try again.",
        );
      }
      setUser(session);
      toast.success(
        `Welcome back, ${session.name.split(" ")[0]}!`,
        "You are now signed in.",
      );
      return session;
    },
    [toast],
  );

  const register = useCallback(
    async (data) => {
      const session = await registerUser(data);
      const token = readAuthToken();
      if (session && token) {
        setUser(session);
        toast.success(
          `Account created, ${session.name.split(" ")[0]}!`,
          "You are now signed in.",
        );
      } else {
        toast.success(
          `Account created${session?.name ? `, ${session.name.split(" ")[0]}` : ""}!`,
          "Please verify your email to finish signing up.",
        );
      }
      return session;
    },
    [toast],
  );

  const logout = useCallback(() => {
    signOut();
    clearSession();
    setUser(null);
    toast.info("Signed out", "You have been logged out successfully.");
  }, [toast]);

  const openAuth = useCallback((mode = "login") => setAuthOpen({ mode }), []);
  const closeAuth = useCallback(() => setAuthOpen(null), []);

  const updateUser = useCallback(async (updates) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...updates };
      persistSession(next);
      return next;
    });
    return updates;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateUser,
      openAuth,
      closeAuth,
      authOpen,
      authReady,
    }),
    [
      user,
      login,
      register,
      logout,
      updateUser,
      openAuth,
      closeAuth,
      authOpen,
      authReady,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
