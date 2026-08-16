import React from "react";

const Banner = () => {
  return (
    <div
      className="p-8 pt-10 bg-[#0F172A] max-w-6xl md:mx-auto rounded-2xl overflow-hidden"
    >
      <div className="text-white">
        <h2 className="text-4xl font-semibold text-center">Ready to drive?</h2>
        <p className="text-gray-500 text-center mt-6 text-[20px]">
          Experience the freedom of the road with our meticulously maintained
          fleet and seamless booking process.
        </p>
        <div className="mt-13 flex justify-center gap-7">
          <button className="py-3 px-5 bg-white text-black rounded-md cursor-pointer hover:bg-[#0F172A] hover:text-white duration-200 hover:border-1 transition-all">
            Browse Fleet
          </button>
          <button className="py-3 px-8 border border-1 border-white text-white rounded-md cursor-pointer hover:bg-white hover:text-black duration-200 transition-all">
            Contact Corporate
          </button>
        </div>
      </div>
    </div>
  );
};

export default Banner;
