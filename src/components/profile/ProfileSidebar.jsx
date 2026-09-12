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
    <div className="bg-white shadow-xl  rounded-2xl p-2 sm:p-4">
      <nav className="grid grid-cols-3 gap-1 lg:block lg:space-y-1">
        {sidebarItems.map(({ to, end, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-center text-[11px] leading-4 font-medium transition-colors lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:py-2.5 lg:text-left lg:text-sm ${
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
        className="col-span-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 lg:justify-start lg:gap-3 lg:py-2.5 lg:text-sm"
      >
        <LuLogOut size={18} />
        Logout
      </button>
    </div>
  );
};

export default ProfileSidebar;