import React, { useEffect, useState } from "react";
import { LuMenu, LuSun, LuMoon, LuX } from "react-icons/lu";
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";
import AuthModal from "../auth/AuthModal";
import { useAuth } from "../../context/AuthContext";
import { usePreferences } from "../../context/PreferencesContext";
import { useTheme } from "../../context/ThemeContext";

const Navbar = () => {
  const location = useLocation();
  const { t } = usePreferences();
  const { user, isAuthenticated, openAuth, closeAuth, authOpen } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(location.pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = user?.name || user?.username || "User";
  const initials = displayName[0]?.toUpperCase() || "U";

  const navLinks = [
    { name: t("nav_home"), path: "/" },
    { name: t("nav_cars"), path: "/cars" },
    { name: t("nav_motorbikes"), path: "/motorbikes" },
    { name: t("nav_bicycles"), path: "/bicycles" },
    { name: t("nav_about"), path: "/about" },
  ];

  useEffect(() => {
    setActiveTab(location.pathname);
    setMenuOpen(false);
  }, [location.pathname]);

  const closeMenu = (path) => {
    setActiveTab(path);
    setMenuOpen(false);
  };

  return (
    <div className="sticky top-0 z-50 print:hidden">
      <header className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Logo */}
          <div className="flex-1 flex justify-start">
            <Link
              to="/"
              onClick={() => closeMenu("/")}
              className="flex items-center cursor-pointer"
            >
              <Logo />
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center justify-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => closeMenu(link.path)}
                className={`cursor-pointer relative py-1 text-sm font-medium transition-colors duration-200 ${
                  activeTab === link.path
                    ? "text-slate-900 dark:text-white font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {link.name}
                {activeTab === link.path && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-slate-900" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right: Actions (Theme Toggle, Login, Register) */}
          <div className="flex-1 flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-600"
            >
              {theme === "dark" ? <LuSun size={17} /> : <LuMoon size={17} />}
            </button>
            {isAuthenticated ? (
              <Link
                to="/profile"
                onClick={() => closeMenu("/profile")}
                aria-label="Open profile"
                className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1.5 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 sm:px-3"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                  {initials}
                </span>
                <span className="hidden max-w-[9rem] truncate text-sm font-medium text-slate-900 dark:text-white lg:block">
                  {displayName}
                </span>
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className="hidden sm:block cursor-pointer text-sm font-medium text-slate-900 dark:text-white hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {t("login")}
                </button>
                <button
                  type="button"
                  onClick={() => openAuth("register")}
                  className="hidden sm:block cursor-pointer bg-black dark:bg-primary text-white text-sm font-medium px-4 sm:px-5 py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-primary-dull transition-colors"
                >
                  {t("register")}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={
                menuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={menuOpen}
              className="md:hidden p-2 text-slate-900 dark:text-slate-100 cursor-pointer"
            >
              {menuOpen ? <LuX size={22} /> : <LuMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden mt-3 border-t border-slate-200 dark:border-slate-700 pt-3">
            <div className="grid grid-cols-2 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => closeMenu(link.path)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                    activeTab === link.path
                      ? "bg-slate-900 dark:bg-primary text-white"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {!isAuthenticated && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      openAuth("login");
                    }}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    {t("login")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      openAuth("register");
                    }}
                    className="rounded-lg bg-black dark:bg-primary px-3 py-2.5 text-center text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-primary-dull"
                  >
                    {t("register")}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {authOpen && <AuthModal mode={authOpen.mode} onClose={closeAuth} />}
    </div>
  );
};

export default Navbar;
