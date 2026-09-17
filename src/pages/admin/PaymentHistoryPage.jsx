import React, { useState, useEffect, useCallback } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import PaymentsHistory from "../../components/admin/PaymentsHistory";
import { get } from "../../api/client";
import { mapPaymentList, buildBookingsById } from "../../utils/adapters";

const PAGE_SIZE = 10;

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1, total: 0 });
  const [rawPayments, setRawPayments] = useState([]);
  const [bookingsById, setBookingsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial load: fetch payments + bookings once (both endpoints return
  // plain arrays with no pagination), then paginate client-side.
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [paymentsData, bookingsData] = await Promise.all([
          get("/api/payments"),
          get("/api/bookings"),
        ]);
        setRawPayments(paymentsData);
        setBookingsById(buildBookingsById(bookingsData));
      } catch (err) {
        console.error("Failed to load payments:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Re-slice into the current page whenever the raw data or page changes
  const applyPage = useCallback(
    (page) => {
      const { payments: pageItems, totalEntries, totalPages } = mapPaymentList(
        rawPayments,
        { bookingsById, page, pageSize: PAGE_SIZE }
      );
      setPayments(pageItems);
      setPageInfo({ page, totalPages, total: totalEntries });
    },
    [rawPayments, bookingsById]
  );

  useEffect(() => {
    if (rawPayments.length >= 0) applyPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawPayments, bookingsById]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-neutral-400">Loading payments…</div>
        ) : error ? (
          <div className="p-8 text-red-600">
            Failed to load payments: {error}
          </div>
        ) : (
          <PaymentsHistory
            payments={payments}
            totalEntries={pageInfo.total}
            currentPage={pageInfo.page}
            totalPages={pageInfo.totalPages}
            onPageChange={(page) => applyPage(page)}
            onPayNow={(bookingId) => {
              // TODO: call POST /api/payments/{id}/... or navigate to the
              // KHQR payment screen for this booking.
              console.log("Pay now:", bookingId);
            }}
            onViewBooking={(bookingId) => {
              // TODO: navigate(`/admin/bookings/${bookingId}`)
              console.log("View booking:", bookingId);
            }}
          />
        )}
      </main>
    </div>
  );
}