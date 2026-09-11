import React, { useEffect } from "react";
import { useState } from "react";
import { LuMenu, LuX } from "react-icons/lu";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Cars", path: "/cars" },
    { name: "Motorbikes", path: "/motorbikes" },
    { name: "Bicycles", path: "/bicycles" },
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
    <div className="print:hidden">
      <nav className="bg-slate-50 text-slate-900 rounded-t-2xl px-4 sm:px-8 py-3 sm:py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center cursor-pointer">
            <Link
              to="/"
              onClick={() => closeMenu("/")}
              className="text-lg sm:text-xl font-bold tracking-tight text-slate-950"
            >
              <span className="sm:hidden">Rental</span>
              <span className="hidden sm:inline">Rental Company</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => closeMenu(link.path)}
                className={`cursor-pointer relative py-1 text-sm font-medium transition-colors duration-200 
                  ${
                    activeTab === link.path
                      ? "text-slate-900 font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                {link.name}
                {activeTab === link.path && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-900 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-6">
            <Link
              to="/login"
              onClick={() => closeMenu("/login")}
              className="hidden sm:block cursor-pointer text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/register"
              onClick={() => closeMenu("/register")}
              className="hidden sm:block cursor-pointer bg-black text-white text-sm font-medium px-4 sm:px-5 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Register
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={
                menuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={menuOpen}
              className="md:hidden p-2 text-slate-900 cursor-pointer"
            >
              {menuOpen ? <LuX size={22} /> : <LuMenu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden mt-3 border-t border-slate-200 pt-3">
            <div className="grid grid-cols-2 gap-1">
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
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
