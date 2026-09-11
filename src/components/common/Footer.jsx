import React from "react";
import { Link } from "react-router-dom";
import { LuAtSign, LuGlobe, LuShieldCheck } from "react-icons/lu";

const Footer = () => {
  return (
    <footer className="mt-8 border-t border-slate-300 bg-slate-200 text-slate-700">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.7fr_1fr_1fr_1fr] lg:px-16">
        <div>
          <Link to="/" className="text-xl font-bold text-slate-950">
            Rental Company
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
            Delivering premium mobility solutions for corporate and personal
            logistics across the globe. Precision in every mile.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-950">Product</h2>
          <nav className="mt-4 flex flex-col gap-3 text-sm">
            <Link to="/cars" className="hover:text-slate-950">
              Cars
            </Link>
            <Link to="/motorbikes" className="hover:text-slate-950">
              Motorbikes
            </Link>
            <Link to="/bicycles" className="hover:text-slate-950">
              Bicycles
            </Link>
          </nav>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-950">Support</h2>
          <nav className="mt-4 flex flex-col gap-3 text-sm">
            <a
              href="mailto:support@rentalcompany.com"
              className="hover:text-slate-950"
            >
              Support
            </a>
            <a
              href="mailto:contact@rentalcompany.com"
              className="hover:text-slate-950"
            >
              Contact Us
            </a>
            <a
              href="mailto:support@rentalcompany.com"
              className="hover:text-slate-950"
            >
              FAQ
            </a>
          </nav>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-950">Legal</h2>
          <nav className="mt-4 flex flex-col gap-3 text-sm">
            <a href="#terms" className="hover:text-slate-950">
              Terms of Service
            </a>
            <a href="#privacy" className="hover:text-slate-950">
              Privacy Policy
            </a>
            <a href="#cookies" className="hover:text-slate-950">
              Cookie Policy
            </a>
          </nav>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-slate-300 px-6 py-5 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
        <p>© 2024 Rental Company. All rights reserved.</p>
        <div className="flex items-center gap-4" aria-label="Company links">
          <LuGlobe size={16} />
          <LuAtSign size={16} />
          <LuShieldCheck size={16} />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
