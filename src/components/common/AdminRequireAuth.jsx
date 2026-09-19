import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCurrentUserRole } from "../../services/authServices";

const AdminRequireAuth = ({ children }) => {
  const location = useLocation();
  const { authReady, user } = useAuth();

  if (!authReady) return null;

  // Check if authenticated
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Check if user has ADMIN role from JWT (secure - not from localStorage)
  const role = getCurrentUserRole();
  const isAdmin = role === "ADMIN" || role === "ROLE_ADMIN";

  if (!isAdmin) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default AdminRequireAuth;