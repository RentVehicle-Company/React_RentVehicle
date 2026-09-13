import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Banner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-4 max-w-5xl rounded-xl bg-[#0F172A] p-5 pt-6 sm:p-6 sm:pt-7 md:mx-auto overflow-hidden relative"
    >
      <div
        aria-hidden="true"
        className="animate-ambient pointer-events-none absolute left-1/2 top-0 h-40 w-72 rounded-full bg-blue-600/30 blur-3xl"
      />
      <div className="pointer-events-none relative">
        <h2 className="animate-gradient-text bg-gradient-to-r from-blue-300 via-white to-blue-300 bg-clip-text bg-[length:200%_auto] text-center text-2xl font-semibold text-transparent sm:text-3xl">
          Ready to drive?
        </h2>
        <p className="text-slate-300 text-center mt-3 text-xs sm:text-sm max-w-xl mx-auto">
          Experience the freedom of the road with our meticulously maintained
          fleet and seamless booking process.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link
            to="/cars"
            className="group relative cursor-pointer overflow-hidden rounded-md bg-white py-2 px-4 text-xs text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-200 hover:shadow-lg hover:shadow-white/25"
          >
            <span className="relative">Browse Fleet</span>
            <span className="animate-shimmer pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/70 to-transparent" />
          </Link>
          <a
            href="mailto:corporate@rentalcompany.com"
            className="group relative cursor-pointer overflow-hidden rounded-md border border-white py-2 px-5 text-xs text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-black hover:shadow-lg hover:shadow-blue-400/30"
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