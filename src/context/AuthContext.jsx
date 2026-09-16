import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  clearSession,
  getSession,
  loginUser,
  logoutUser,
  persistSession,
  registerUser,
} from "../services/authServices";
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
  const [user, setUser] = useState(() => getSession());
  const [authOpen, setAuthOpen] = useState(null);

  const login = useCallback(
    async (credentials) => {
      const session = await loginUser(credentials);
      setUser(session);
      toast.success(
        `Welcome back, ${session.name.split(" ")[0]}!`,
        "You are now signed in."
      );
      return session;
    },
    [toast]
  );

  const register = useCallback(
    async (data) => {
      const session = await registerUser(data);
      setUser(session);
      toast.success(
        `Account created, ${session.name.split(" ")[0]}!`,
        "You are now signed in."
      );
      return session;
    },
    [toast]
  );

  const logout = useCallback(() => {
    logoutUser();
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
    }),
    [user, login, register, logout, updateUser, openAuth, closeAuth, authOpen]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};