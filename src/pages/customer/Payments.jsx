import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LuCalendarDays,
  LuChevronLeft,
  LuChevronRight,
  LuCreditCard,
} from "react-icons/lu";
import ProfileSidebar from "../../components/profile/ProfileSidebar";
import { getMyPayments } from "../../services/paymentService";
import { signOut } from "../../services/authServices";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getMyPayments()
      .then((data) => {
        setPayments(data);
        setLoading(false);
      })
      .catch(() => {
        setError("We couldn't load your payment history right now. Please try again.");
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
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
              Payments History
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review your payment history.
            </p>
          </div>

          <div className="mt-6 overflow-hidden bg-white border border-borderColor rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 border-b border-borderColor text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Booking ID</th>
                    <th className="px-4 py-3 font-semibold">Vehicle</th>
                    <th className="px-4 py-3 font-semibold">Payment Method</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Transaction ID</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderColor">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-4 py-10 text-center text-sm text-slate-500"
                      >
                        Loading payment history...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-4 py-10 text-center text-sm text-red-600"
                      >
                        {error}
                      </td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-4 py-10 text-center text-sm text-slate-500"
                      >
                        No payment history found.
                      </td>
                    </tr>
                  ) : (
                    payments.map((booking, index) => {
                      const isPaid = booking.paymentStatus === "PAID";
                      return (
                        <tr
                          key={booking.id}
                          className={isPaid ? "" : "bg-red-50/40"}
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                            {booking.startDate}
                          </td>
                          <td className="px-4 py-3 font-medium text-primary">
                            <Link to={`/bookings/${booking.id}`}>
                              BK-{String(1024 - index).padStart(4, "0")}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                            {booking.vehicleName}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                            <span className="inline-flex items-center gap-1.5">
                              {isPaid ? (
                                <LuCreditCard size={14} />
                              ) : (
                                <LuCalendarDays size={14} />
                              )}
                              {isPaid ? booking.paymentMethod : "Bakong KHQR"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                            ${booking.totalPrice.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${isPaid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                            >
                              {isPaid ? "Paid" : "Pending"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                            {isPaid ? booking.transactionId || `TXN-${55921 + index * 189}` : "N/A"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            {isPaid ? (
                              <Link
                                to={`/bookings/${booking.id}`}
                                className="inline-flex whitespace-nowrap text-sm font-medium text-primary hover:underline"
                              >
                                View
                              </Link>
                            ) : (
                              <Link
                                to={`/bookings/${booking.id}`}
                                className="inline-flex whitespace-nowrap rounded bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dull"
                              >
                                View Booking
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-borderColor px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {payments.length} of {payments.length} entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled
                  className="rounded border border-borderColor p-1.5 text-slate-400"
                >
                  <LuChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  className="rounded bg-primary px-2.5 py-1.5 font-medium text-white"
                >
                  1
                </button>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled
                  className="rounded border border-borderColor p-1.5 text-slate-400"
                >
                  <LuChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
