import React from "react";
import { Link } from "react-router-dom";

const Banner = () => {
  return (
    <div className="mx-4 max-w-5xl rounded-xl bg-[#0F172A] p-5 pt-6 sm:p-6 sm:pt-7 md:mx-auto overflow-hidden">
      <div className="text-white">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center">
          Ready to drive?
        </h2>
        <p className="text-slate-300 text-center mt-3 text-xs sm:text-sm max-w-xl mx-auto">
          Experience the freedom of the road with our meticulously maintained
          fleet and seamless booking process.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link
            to="/cars"
            className="py-2 px-4 bg-white text-black rounded-md text-xs cursor-pointer hover:bg-slate-200 duration-200 transition-colors"
          >
            Browse Fleet
          </Link>
          <a
            href="mailto:corporate@rentalcompany.com"
            className="py-2 px-5 border border-white text-white rounded-md text-xs cursor-pointer hover:bg-white hover:text-black duration-200 transition-colors"
          >
            Contact Corporate
          </a>
        </div>
      </div>
    </div>
  );
};

export default Banner;
