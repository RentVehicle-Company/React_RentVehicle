import React from "react";
import { NavLink } from "react-router-dom";
import { LuCalendar, LuCreditCard, LuLogOut, LuUser } from "react-icons/lu";

const sidebarItems = [
  { to: "/profile", label: "My Profile", icon: LuUser, end: true },
  { to: "/bookings", label: "My Bookings", icon: LuCalendar },
  { to: "/payments", label: "Payments History", icon: LuCreditCard, end: true },
];

const ProfileSidebar = ({ onLogout }) => {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-2 sm:p-4">
      <nav className="grid grid-cols-3 gap-1 lg:block lg:space-y-1">
        {sidebarItems.map(({ to, end, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-w-0 flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3 w-full px-1 sm:px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-center lg:text-left transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-slate-900 hover:bg-slate-100"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={isActive ? "text-white" : "text-slate-700"}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="col-span-3 h-px bg-borderColor my-1 lg:my-3" />

      <button
        type="button"
        onClick={onLogout}
        className="col-span-3 flex items-center justify-center lg:justify-start gap-2 lg:gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
      >
        <LuLogOut size={18} />
        Logout
      </button>
    </div>
  );
};

export default ProfileSidebar;