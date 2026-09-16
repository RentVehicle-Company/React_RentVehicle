import React from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";

const Login = () => {
  const navigate = useNavigate();
  return <AuthModal mode="login" onClose={() => navigate("/")} />;
};

export default Login;