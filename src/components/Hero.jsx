import React, { useState } from "react";
import { CgSearch } from "react-icons/cg";
import { IoSearch } from "react-icons/io5";
import { assets } from "../assets/assets";

const Hero = () => {
  const cityList = ["Phnom Penh", "Seam Reap"];
  const [pickupLocation, setPickupLocation] = useState("");

  return (
    <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-16 lg:py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 text-center sm:gap-10">
        <h1 className="max-w-2xl text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl lg:text-4xl">
          Find & Rent Your Next Ride in Minutes
        </h1>

        <form
          action=""
          className="flex flex-col md:flex-row items-start md:items-center
                justify-between gap-4 rounded-2xl p-4 sm:p-5 md:rounded-full w-full max-w-4xl
        bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)]"
        >
          <div className="grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-3 md:ml-4 md:gap-6">
            <div className="flex flex-col text-start gap-2">
              <select
                name="pickup-location"
                id="pickup-location"
                required
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full text-sm"
              >
                <option value="">Pickup Location</option>
                {cityList.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <p className="px-1 text-xs text-gray-500">
                {pickupLocation ? pickupLocation : "Please select location"}
              </p>
            </div>

            <div className="flex flex-col text-start gap-2">
              <label htmlFor="pickup-date" className="text-sm font-medium">
                Pick-up Date
              </label>
              <input
                type="date"
                id="pickup-date"
                min={new Date().toISOString().split("T")[0]}
                className="w-full text-sm text-gray-500"
                required
              />
            </div>

            <div className="flex flex-col text-start gap-2">
              <label htmlFor="return-date" className="text-sm font-medium">
                Return Date
              </label>
              <input
                type="date"
                id="return-date"
                className="w-full text-sm text-gray-500"
                required
              />
            </div>
          </div>
          <button className="flex w-full items-center justify-center gap-1 rounded-xl bg-black px-7 py-3 text-sm text-white hover:bg-gray-800 cursor-pointer md:w-auto md:rounded-full">
            <IoSearch />
            Search
          </button>
        </form>

        <img
          src={assets.main_car}
          alt="car"
          className="h-auto max-h-44 w-auto max-w-full object-contain sm:max-h-56 lg:max-h-64"
        />
      </div>
    </section>
  );
};

export default Hero;
