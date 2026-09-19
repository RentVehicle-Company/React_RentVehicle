import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProfileSidebar from "../../components/profile/ProfileSidebar";
import BookingFilters from "../../components/profile/BookingFilters";
import BookingCard from "../../components/profile/BookingCard";
import CancelBookingModal from "../../components/profile/CancelBookingModal";
import { cancelBooking, getMyBookings } from "../../services/bookingService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const FILTER_MAP = {
  all: null,
  upcoming: ["pending", "confirmed"],
  active: ["active"],
  completed: ["completed"],
  cancelled: ["cancelled"],
};

const Mybooking = () => {
  const { isAuthenticated, openAuth, logout } = useAuth();
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    getMyBookings()
      .then((data) => {
        setBookings(data);
        setLoading(false);
        setError("");
      })
      .catch((err) => {
        if (err?.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else if (err?.status === 403) {
          setError("You don't have permission to view bookings.");
        } else if (err instanceof TypeError || err?.message?.includes("fetch")) {
          setError("Unable to connect to the server. Please check your connection.");
        } else {
          setError("We couldn't load your bookings right now. Please try again.");
        }
        setLoading(false);
      });
  }, [isAuthenticated]);

  const allowedStatuses = FILTER_MAP[filter];
  const filteredBookings =
    allowedStatuses === null
      ? bookings
      : bookings.filter((booking) => allowedStatuses.includes(booking.status));

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      const updated = await cancelBooking(cancelTarget.id);
      setBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b)),
      );
      toast.success(
        "Booking cancelled",
        `Your ${updated.vehicleName} booking has been cancelled.`,
      );
      setCancelTarget(null);
    } catch (err) {
      toast.error("Could not cancel booking", err?.message);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="rounded-2xl border border-borderColor bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            Sign in required
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
              My Bookings
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage and track your reservations.
            </p>
          </div>

          <div className="mt-5">
            <BookingFilters active={filter} onChange={setFilter} />
          </div>

          <div className="mt-6">
            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading bookings...
              </p>
            ) : error ? (
              <div className="rounded-2xl border border-borderColor bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  Something went wrong
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {error}
                </p>
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
              <div className="rounded-2xl border border-borderColor bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  No bookings found
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
