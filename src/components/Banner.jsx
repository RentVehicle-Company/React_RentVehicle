import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Banner = ({ flush = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative overflow-hidden ${
        flush
          ? "px-5 pb-10 sm:px-6 sm:pb-12"
          : "mx-4 max-w-5xl rounded-xl border border-slate-200 bg-slate-100 p-5 pt-6 sm:p-6 sm:pt-7 md:mx-auto dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <div
        aria-hidden="true"
        className="animate-ambient pointer-events-none absolute left-1/2 top-0 h-40 w-72 rounded-full bg-blue-600/30 blur-3xl"
      />
      <div className="pointer-events-none relative">
        <h2 className="animate-gradient-text bg-gradient-to-r from-blue-600 via-slate-900 to-blue-600 bg-clip-text bg-[length:200%_auto] text-center text-2xl font-semibold text-transparent dark:from-blue-300 dark:via-white dark:to-blue-300 sm:text-3xl">
          Ready to drive?
        </h2>
        <p className="mt-3 text-center text-xs text-slate-600 dark:text-slate-300 sm:text-sm max-w-xl mx-auto">
          Experience the freedom of the road with our meticulously maintained
          fleet and seamless booking process.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link
            to="/cars"
            className="group relative cursor-pointer overflow-hidden rounded-md bg-slate-900 py-2 px-4 text-xs text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-lg dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <span className="relative">Browse Fleet</span>
            <span className="animate-shimmer pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/70 to-transparent" />
          </Link>
          <a
            href="mailto:corporate@rentalcompany.com"
            className="group relative cursor-pointer overflow-hidden rounded-md border border-slate-900 py-2 px-5 text-xs text-slate-900 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-900 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-slate-900"
          >
            <span className="relative">Contact Corporate</span>
            <span className="animate-shimmer pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default Banner;