import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { readAuthToken } from "../../services/api";

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const { authReady } = useAuth();
  const token = readAuthToken();

  if (!authReady) return null;

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default RequireAuth;
