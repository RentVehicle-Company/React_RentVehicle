import React from "react";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/customer/Home";
import Cars from "./pages/vehicles/Cars";
import MotorBikes from "./pages/vehicles/MotorBikes";
import Bicycles from "./pages/vehicles/Bicycles";
import VehicleDetail from "./pages/vehicles/VehicleDetail";
import PaymentVisa from "./pages/customer/PaymentVisa";
import PaymentKHQR from "./pages/customer/PaymentKHQR";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import UserProfile from "./pages/customer/UserProfile";
import Mybooking from "./pages/customer/Mybooking";
import BookingDetails from "./pages/customer/BookingDetails";
import Payments from "./pages/customer/Payments";
import LiveChatButton from "./components/LiveChatButton";

const App = () => {
  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/vehicles/:id" element={<VehicleDetail />} />
          <Route path="/payment/visa" element={<PaymentVisa />} />
          <Route path="/payment/khqr" element={<PaymentKHQR />} />
          <Route path="/motorbikes" element={<MotorBikes />} />
          <Route path="/bicycles" element={<Bicycles />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/bookings" element={<Mybooking />} />
          <Route path="/bookings/:id" element={<BookingDetails />} />
          <Route path="/payments" element={<Payments />} />

          {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
        </Routes>
      </main>
      <Footer />
      <LiveChatButton />
    </>
  );
};

export default App;
