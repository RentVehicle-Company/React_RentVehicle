import React from "react";

const filters = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const BookingFilters = ({ active, onChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => {
        const isActive = filter.id === active;
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              isActive
                ? "bg-black text-white"
                : "bg-transparent text-slate-700 hover:bg-slate-100"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
};

export default BookingFilters;