import React from "react";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";

const Register = () => {
  const navigate = useNavigate();
  return <AuthModal mode="register" onClose={() => navigate("/")} />;
};

export default Register;
=======
import Login from "./Login";

const Register = () => <Login initialMode="register" />;

export default Register;
>>>>>>> origin/dev
