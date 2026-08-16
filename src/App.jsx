import React from "react";
import Navbar from "./components/common/Navbar";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/customer/Home";
import Cars from "./pages/vehicles/Cars";
import MotorBikes from "./pages/vehicles/MotorBikes";
import Bicycles from "./pages/vehicles/Bicycles";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

const App = () => {
  return (
    <>
      <Navbar />
      <main >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/motorbikes" element={<MotorBikes />} />
          <Route path="/bicycles" element={<Bicycles />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
        </Routes>
      </main>

    </>
  );
};

export default App;
