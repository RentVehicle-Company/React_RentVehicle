import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProfileSidebar from "../../components/profile/ProfileSidebar";
import BookingFilters from "../../components/profile/BookingFilters";
import BookingCard from "../../components/profile/BookingCard";
import CancelBookingModal from "../../components/profile/CancelBookingModal";
import {
  cancelBooking,
  getMyBookings,
} from "../../services/bookingService";
<<<<<<< HEAD
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const FILTER_MAP = {
  all: null,
  upcoming: ["confirmed"],
  active: ["active"],
  completed: ["completed"],
  cancelled: ["cancelled"],
};
=======
import { signOut } from "../../services/authServices";
>>>>>>> origin/dev

const Mybooking = () => {
  const { isAuthenticated, openAuth, logout } = useAuth();
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
<<<<<<< HEAD
    if (!isAuthenticated) return;
    setLoading(true);
=======
>>>>>>> origin/dev
    getMyBookings()
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
<<<<<<< HEAD
      .catch(() => setLoading(false));
  }, [isAuthenticated]);
=======
      .catch(() => {
        setError("We couldn't load your bookings right now. Please try again.");
        setLoading(false);
      });
  }, []);
>>>>>>> origin/dev

  const allowedStatuses = FILTER_MAP[filter];
  const filteredBookings =
    allowedStatuses === null
      ? bookings
<<<<<<< HEAD
      : bookings.filter((booking) => allowedStatuses.includes(booking.status));

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      const updated = await cancelBooking(cancelTarget.id);
      setBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b))
      );
      toast.success(
        "Booking cancelled",
        `Your ${updated.vehicleName} booking has been cancelled.`
      );
      setCancelTarget(null);
    } catch (err) {
      toast.error("Could not cancel booking", err?.message);
    }
  };

  const handleLogout = () => {
    logout();
=======
      : bookings.filter((booking) => {
          if (filter === "upcoming") {
            return ["pending", "confirmed"].includes(booking.status);
          }
          return booking.status === filter;
        });

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    const updated = await cancelBooking(cancelTarget.id);
    setBookings((prev) =>
      prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b))
    );
    setCancelTarget(null);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
>>>>>>> origin/dev
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white border border-borderColor rounded-2xl p-12 text-center">
          <p className="text-xl font-bold text-slate-900">Sign in required</p>
          <p className="mt-1 text-sm text-slate-500">
            Log in to view and manage your bookings.
          </p>
          <button
            type="button"
            onClick={() => openAuth("login")}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <aside className="lg:w-[210px] shrink-0">
          <ProfileSidebar onLogout={handleLogout} />
        </aside>

        <div className="flex-1 min-w-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              My Bookings
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage and track your reservations.
            </p>
          </div>

          <div className="mt-5">
            <BookingFilters active={filter} onChange={setFilter} />
          </div>

          <div className="mt-6">
            {loading ? (
              <p className="text-sm text-slate-500">Loading bookings...</p>
            ) : error ? (
              <div className="bg-white border border-borderColor rounded-2xl p-10 text-center">
                <p className="text-base font-semibold text-slate-900">
                  Something went wrong
                </p>
                <p className="text-sm text-slate-500 mt-1">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-block mt-5 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-black hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            ) : filteredBookings.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancelRequest={setCancelTarget}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-borderColor rounded-2xl p-10 text-center">
                <p className="text-base font-semibold text-slate-900">
                  No bookings found
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  You don't have any bookings in this category.
                </p>
                <Link
                  to="/cars"
                  className="inline-block mt-5 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-black hover:bg-slate-800 transition-colors"
                >
                  Browse Vehicles
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <CancelBookingModal
        booking={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
};

export default Mybooking;