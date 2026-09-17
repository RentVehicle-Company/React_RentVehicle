import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import ManageBookings from "../../components/admin/Managebookings";

export default function ManageBookingsPage() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [loading, setLoading] = useState(false);

  const fetchBookings = useCallback(
    async (page = 1, overrides = {}) => {
      const nextFilters = { ...filters, ...overrides };
      setFilters(nextFilters);
      setLoading(true);
      try {
        // TODO: replace with your real Spring Boot endpoint, e.g.:
        // const res = await fetch(
        //   `/api/bookings?page=${page}&search=${nextFilters.search}&status=${nextFilters.status}`
        // );
        // const data = await res.json(); // ApiResponseDTO<PageResult<Booking>>
        // setBookings(data.data.content);
        // setPageInfo({ page, totalPages: data.data.totalPages, total: data.data.totalElements });

        // Placeholder so the page renders without a backend connected yet:
        setBookings([]);
        setPageInfo({ page, totalPages: 1, total: 0 });
      } catch (err) {
        console.error("Failed to load bookings:", err);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchBookings(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEditModal = (booking) => {
    // TODO: open your edit modal/drawer with this booking
    console.log("Edit booking:", booking);
  };

  const cancelBooking = async (id) => {
    // TODO: call DELETE/PATCH /api/bookings/{id}/cancel then refresh
    console.log("Cancel booking:", id);
    fetchBookings(pageInfo.page);
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-x-auto">
        <ManageBookings
          bookings={bookings}
          totalEntries={pageInfo.total}
          currentPage={pageInfo.page}
          totalPages={pageInfo.totalPages}
          onPageChange={(page) => fetchBookings(page)}
          onSearch={(term) => fetchBookings(1, { search: term })}
          onStatusFilter={(status) => fetchBookings(1, { status })}
          onView={(b) => navigate(`/admin/bookings/${b.id}`)}
          onEdit={(b) => openEditModal(b)}
          onCancel={(b) => cancelBooking(b.id)}
        />
      </main>
    </div>
  );
}
