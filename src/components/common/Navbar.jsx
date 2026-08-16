import React, { useEffect } from "react";
import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Cars", path: "/cars" },
    { name: "Motorbikes", path: "/motorbikes" },
    { name: "Bicycles", path: "/bicycles" },
  ];

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);
  return (
    <div className="">
      <nav className="bg-slate-50 text-slate-900 rounded-t-2xl px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center cursor-pointer">
            <Link
              to="/"
              onClick={() => setActiveTab("/")}
              className="text-xl font-bold tracking-tight text-slate-950"
            >
              Rental Company
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setActiveTab(link.path)}
                className={`cursor-pointer relative py-1 text-sm font-medium transition-colors duration-200 
                  ${activeTab === link.path
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
              onClick={()=>setActiveTab('/login')}
              className="cursor-pointer text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors"
            >
              Login In
            </Link>
            <Link
              to="/register"
              onClick={()=>setActiveTab('/register')}
              className="cursor-pointer bg-black text-white font-medium px-5 py-2 rounded-lg hover:text-neutral-800-600 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
