import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProfileSidebar from "../../components/profile/ProfileSidebar";
import BookingFilters from "../../components/profile/BookingFilters";
import BookingCard from "../../components/profile/BookingCard";
import CancelBookingModal from "../../components/profile/CancelBookingModal";
import {
  cancelBooking,
  getMyBookings,
} from "../../services/bookingService";

const Mybooking = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    getMyBookings().then((data) => {
      setBookings(data);
      setLoading(false);
    });
  }, []);

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter(
          (booking) => booking.status === filter
        );

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    const updated = await cancelBooking(cancelTarget.id);
    setBookings((prev) =>
      prev.map((b) => (b.id === updated.id ? updated : b))
    );
    setCancelTarget(null);
  };

  const handleLogout = () => {
    // connect to the auth service once authentication is implemented
  };

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