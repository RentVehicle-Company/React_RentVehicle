import React from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";

const Register = () => {
  const navigate = useNavigate();
  return <AuthModal mode="register" onClose={() => navigate("/")} />;
};

export default Register;