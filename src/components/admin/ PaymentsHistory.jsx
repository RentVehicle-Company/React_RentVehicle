import React, { useState } from "react";
import { CreditCard, QrCode, ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_STYLES = {
  Paid: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Failed: "bg-red-100 text-red-700",
  Expired: "bg-neutral-200 text-neutral-600",
};

const SAMPLE_PAYMENTS = [
  {
    date: "20 Aug 2026",
    bookingId: "BK-1024",
    vehicle: "Mazda RX-7",
    method: "Visa **** 4242",
    methodType: "card",
    amount: "$165.00",
    status: "Paid",
    transactionId: "TXN-55921",
  },
  {
    date: "01 Jul 2026",
    bookingId: "BK-1005",
    vehicle: "Honda Civic",
    method: "Mastercard **** 1111",
    methodType: "card",
    amount: "$200.00",
    status: "Paid",
    transactionId: "TXN-44210",
  },
  {
    date: "15 Sep 2026",
    bookingId: "BK-1050",
    vehicle: "Ducati Monster",
    method: "KHQR",
    methodType: "qr",
    amount: "$55.00",
    status: "Pending",
    transactionId: "N/A",
  },
];

/**
 * PaymentsHistory
 *
 * Fully data-driven — pass real data fetched from the backend later:
 *
 *   <PaymentsHistory
 *     payments={paymentsFromApi}      // array, see shape in SAMPLE_PAYMENTS
 *     totalEntries={pageInfo.total}   // total row count (for the footer text)
 *     currentPage={pageInfo.page}     // 1-indexed current page
 *     totalPages={pageInfo.totalPages}
 *     onPageChange={(page) => fetchPayments(page)}
 *     onPayNow={(bookingId) => handlePayNow(bookingId)}
 *     onViewBooking={(bookingId) => navigate(`/bookings/${bookingId}`)}
 *   />
 *
 * If currentPage/onPageChange are omitted, the component manages page state
 * internally (useful for quick previews before the API is wired up).
 */
export default function PaymentsHistory({
  payments = SAMPLE_PAYMENTS,
  totalEntries = 12,
  currentPage,
  totalPages = 3,
  onPageChange,
  onPayNow,
  onViewBooking,
}) {
  const [internalPage, setInternalPage] = useState(1);
  const page = currentPage ?? internalPage;
  const setPage = (updater) => {
    const next = typeof updater === "function" ? updater(page) : updater;
    if (onPageChange) onPageChange(next);
    else setInternalPage(next);
  };

  const pageSize = payments.length || 3;
  const rangeStart = totalEntries === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalEntries);

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight">
        Payments
      </h1>
      <p className="text-neutral-500 mt-2 mb-6">
        Welcome back, here's what's happening today
      </p>

      <div className="rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        {payments.length === 0 ? (
          <div className="px-6 py-10 text-center text-neutral-400">
            No payments found.
          </div>
        ) : (
          <>
            {/* Table — desktop & tablet (md and up) */}
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 text-xs font-semibold tracking-wide">
                  <th className="text-left px-6 py-4">DATE</th>
                  <th className="text-left px-6 py-4">BOOKING ID</th>
                  <th className="text-left px-6 py-4">VEHICLE</th>
                  <th className="text-left px-6 py-4">PAYMENT METHOD</th>
                  <th className="text-left px-6 py-4">AMOUNT</th>
                  <th className="text-left px-6 py-4">STATUS</th>
                  <th className="text-left px-6 py-4">TRANSACTION ID</th>
                  <th className="text-right px-6 py-4">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr
                    key={p.bookingId}
                    className={`border-t border-neutral-100 ${
                      p.status === "Pending" ? "bg-orange-50/40" : ""
                    }`}
                  >
                    <td className="px-6 py-4 text-neutral-700">{p.date}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onViewBooking?.(p.bookingId)}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        {p.bookingId}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-neutral-700">{p.vehicle}</td>
                    <td className="px-6 py-4 text-neutral-700">
                      <span className="inline-flex items-center gap-2">
                        {p.methodType === "qr" ? (
                          <QrCode size={16} strokeWidth={2} className="text-neutral-500" />
                        ) : (
                          <CreditCard size={16} strokeWidth={2} className="text-neutral-500" />
                        )}
                        {p.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-900 font-semibold">
                      {p.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          STATUS_STYLES[p.status] || "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 italic">
                      {p.transactionId}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.status === "Pending" && (
                        <button
                          onClick={() => onPayNow?.(p.bookingId)}
                          className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Stacked cards — mobile only (below md) */}
            <div className="md:hidden flex flex-col divide-y divide-neutral-100">
              {payments.map((p) => (
                <div
                  key={p.bookingId}
                  className={`p-4 ${p.status === "Pending" ? "bg-orange-50/40" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <button
                        onClick={() => onViewBooking?.(p.bookingId)}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        {p.bookingId}
                      </button>
                      <div className="text-neutral-500 text-xs mt-0.5">{p.date}</div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        STATUS_STYLES[p.status] || "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-neutral-500">Vehicle</div>
                    <div className="text-neutral-700 text-right">{p.vehicle}</div>

                    <div className="text-neutral-500">Payment Method</div>
                    <div className="text-neutral-700 text-right">
                      <span className="inline-flex items-center gap-1.5 justify-end w-full">
                        {p.methodType === "qr" ? (
                          <QrCode size={14} className="text-neutral-500" />
                        ) : (
                          <CreditCard size={14} className="text-neutral-500" />
                        )}
                        {p.method}
                      </span>
                    </div>

                    <div className="text-neutral-500">Amount</div>
                    <div className="text-neutral-900 font-semibold text-right">
                      {p.amount}
                    </div>

                    <div className="text-neutral-500">Transaction ID</div>
                    <div className="text-neutral-500 italic text-right">
                      {p.transactionId}
                    </div>
                  </div>

                  {p.status === "Pending" && (
                    <button
                      onClick={() => onPayNow?.(p.bookingId)}
                      className="mt-3 w-full bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-neutral-100">
          <p className="text-sm text-neutral-500">
            Showing {rangeStart} to {rangeEnd} of {totalEntries} entries
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 disabled:opacity-40 hover:bg-neutral-50"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                  page === n
                    ? "bg-blue-700 text-white"
                    : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {n}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 disabled:opacity-40 hover:bg-neutral-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}