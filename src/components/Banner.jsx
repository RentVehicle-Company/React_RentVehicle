import React from "react";
import { Link } from "react-router-dom";

const Banner = () => {
  return (
    <div className="mx-4 p-8 pt-10 bg-[#0F172A] max-w-6xl md:mx-auto rounded-2xl overflow-hidden">
      <div className="text-white">
        <h2 className="text-4xl font-semibold text-center">Ready to drive?</h2>
        <p className="text-slate-300 text-center mt-5 text-sm sm:text-base max-w-2xl mx-auto">
          Experience the freedom of the road with our meticulously maintained
          fleet and seamless booking process.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/cars"
            className="py-3 px-5 bg-white text-black rounded-md cursor-pointer hover:bg-slate-200 duration-200 transition-colors"
          >
            Browse Fleet
          </Link>
          <a
            href="mailto:corporate@rentalcompany.com"
            className="py-3 px-8 border border-white text-white rounded-md cursor-pointer hover:bg-white hover:text-black duration-200 transition-colors"
          >
            Contact Corporate
          </a>
        </div>
      </div>
    </div>
  );
};

export default Banner;
