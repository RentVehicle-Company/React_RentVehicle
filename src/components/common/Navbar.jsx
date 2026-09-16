import React, { useState, useEffect } from "react";
import { LuBell, LuMenu, LuX } from "react-icons/lu";
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { usePreferences } from "../../context/PreferencesContext";

const Navbar = () => {
  const location = useLocation();
  const { t } = usePreferences();
  const [activeTab, setActiveTab] = useState(location.pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Dynamic user auth state getter
  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("rental-auth-user")) || null;
    } catch {
      return null;
    }
  };

  const [authUser, setAuthUser] = useState(getStoredUser);

  const navLinks = [
    { name: t("nav_home"), path: "/" },
    { name: t("nav_cars"), path: "/cars" },
    { name: t("nav_motorbikes"), path: "/motorbikes" },
    { name: t("nav_bicycles"), path: "/bicycles" },
  ];

  // Listen for route changes and localStorage updates
  useEffect(() => {
    setActiveTab(location.pathname);
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleAuthChange = () => setAuthUser(getStoredUser());
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("rental-auth-change", handleAuthChange);
    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("rental-auth-change", handleAuthChange);
    };
  }, []);

  const closeMenu = (path) => {
    setActiveTab(path);
    setMenuOpen(false);
  };

  const getUserInitials = (name) => {
    if (!name) return "JD";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="print:hidden">
      <nav className="bg-slate-50 text-slate-900 rounded-t-2xl px-4 sm:px-8 py-3 sm:py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center cursor-pointer">
            <Link
              to="/"
              onClick={() => closeMenu("/")}
              className="flex items-center cursor-pointer"
            >
              <Logo
                text="Rental Company"
                shortText="Rental"
                wordClassName="text-lg sm:text-xl font-bold tracking-tight text-slate-950"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => closeMenu(link.path)}
                className={`cursor-pointer relative py-1 text-sm font-medium transition-colors duration-200 ${
                  activeTab === link.path
                    ? "text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {link.name}
                {activeTab === link.path && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-slate-900" />
                )}
              </Link>
            ))}
          </div>

          {/* Right Action Items (Auth vs Guest) */}
          <div className="flex items-center gap-4 sm:gap-6">
            {authUser ? (
              <>
                <button
                  type="button"
                  aria-label="Notifications"
                  className="relative cursor-pointer text-slate-500 hover:text-slate-700 sm:block"
                >
                  <LuBell size={20} />
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-slate-50" />
                </button>
                
                <span className="hidden h-8 w-px bg-slate-200 sm:block" />
                
                <Link
                  to="/profile"
                  onClick={() => closeMenu("/profile")}
                  className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    {getUserInitials(authUser?.name)}
                  </span>
                  <span className="hidden leading-tight sm:block">
                    <span className="block text-sm font-semibold text-slate-800">
                      {authUser?.name || "John Doe"}
                    </span>
                    <span className="block text-xs text-slate-400 capitalize">
                      {authUser?.role || "Customer"}
                    </span>
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => closeMenu("/login")}
                  className="hidden cursor-pointer text-sm font-medium text-slate-900 transition-colors hover:text-slate-600 sm:block"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => closeMenu("/register")}
                  className="hidden cursor-pointer rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 sm:block sm:px-5"
                >
                  Register
                </Link>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              className="md:hidden p-2 text-slate-900 cursor-pointer"
            >
              {menuOpen ? <LuX size={22} /> : <LuMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden mt-3 border-t border-slate-200 pt-3">
            <div className="grid grid-cols-1 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => closeMenu(link.path)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                    activeTab === link.path
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {authUser ? (
                <Link
                  to="/profile"
                  onClick={() => closeMenu("/profile")}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 flex items-center justify-between"
                >
                  <span>My Profile</span>
                  <span className="text-xs text-slate-400">({authUser.name})</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => closeMenu("/login")}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => closeMenu("/register")}
                    className="rounded-lg bg-black px-3 py-2.5 text-center text-sm font-medium text-white hover:bg-slate-800"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;