import React from "react";
import { Link } from "react-router-dom";
import { LuAtSign, LuGlobe, LuShieldCheck } from "react-icons/lu";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="mt-10 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors duration-200">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="flex flex-col gap-6 border-b border-slate-200 dark:border-slate-800 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/"
              className="inline-flex items-center"
            >
              <Logo />
            </Link>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Delivering premium mobility solutions for corporate and personal
              logistics across the globe. Precision in every mile.
            </p>
          </div>
          <a
            href="mailto:support@rentalcompany.com"
            className="inline-flex w-fit rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:hover:border-slate-500 dark:hover:bg-slate-800"
          >
            Contact support
          </a>
        </div>

        <div className="grid grid-cols-2 gap-8 py-8 sm:grid-cols-3 lg:grid-cols-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Explore
            </h2>
            <nav className="mt-4 flex flex-col gap-3 text-sm">
              <Link
                to="/cars"
                className="transition-colors hover:text-slate-950 dark:hover:text-white"
              >
                Cars
              </Link>
              <Link
                to="/motorbikes"
                className="transition-colors hover:text-slate-950 dark:hover:text-white"
              >
                Motorbikes
              </Link>
              <Link
                to="/bicycles"
                className="transition-colors hover:text-slate-950 dark:hover:text-white"
              >
                Bicycles
              </Link>
            </nav>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Support
            </h2>
            <nav className="mt-4 flex flex-col gap-3 text-sm">
              <a
                href="mailto:support@rentalcompany.com"
                className="transition-colors hover:text-slate-950 dark:hover:text-white"
              >
                Support
              </a>
              <a
                href="mailto:contact@rentalcompany.com"
                className="transition-colors hover:text-slate-950 dark:hover:text-white"
              >
                Contact Us
              </a>
              <a
                href="mailto:support@rentalcompany.com"
                className="transition-colors hover:text-slate-950 dark:hover:text-white"
              >
                FAQ
              </a>
            </nav>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Legal
            </h2>
            <nav className="mt-4 flex flex-col gap-3 text-sm">
              <a
                href="#terms"
                className="transition-colors hover:text-slate-950 dark:hover:text-white"
              >
                Terms of Service
              </a>
              <a
                href="#privacy"
                className="transition-colors hover:text-slate-950 dark:hover:text-white"
              >
                Privacy Policy
              </a>
              <a
                href="#cookies"
                className="transition-colors hover:text-slate-950 dark:hover:text-white"
              >
                Cookie Policy
              </a>
            </nav>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-slate-800 pt-5 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Rental Company. All rights reserved.</p>
          <div className="flex items-center gap-4" aria-label="Company links">
            <span title="Global service">
              <LuGlobe size={16} />
            </span>
            <a href="mailto:contact@rentalcompany.com" title="Email us">
              <LuAtSign size={16} />
            </a>
            <span title="Secure service">
              <LuShieldCheck size={16} />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
