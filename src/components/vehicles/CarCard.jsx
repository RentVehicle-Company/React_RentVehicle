import React from "react";
import { Link } from "react-router-dom";
import { LuFuel, LuMapPin, LuSettings2, LuUsers } from "react-icons/lu";
import { assets, dummyCarData } from "../../assets/assets";

const CarCard = ({ car = dummyCarData[0] }) => {
  return (
    <article className="w-full max-w-[280px] overflow-hidden rounded-xl border border-borderColor bg-white shadow-sm">
      <div className="flex  items-center justify-center bg-slate-100">
        <img
          src={car.image || assets.car_image1}
          alt={`${car.brand} ${car.model}`}
          className="h-[150px] w-full"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {car.brand} {car.model}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">{car.category}</p>
          </div>
          <p className="text-right text-xs font-semibold text-slate-900">
            ${car.price_per_day}
            <span className="block text-xs font-normal text-slate-500">
              /day
            </span>
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-2 border-t border-slate-100 pt-3 text-[11px] text-slate-600">
          <span className="inline-flex min-w-0 items-center gap-2">
            <LuUsers size={13} className="shrink-0 text-slate-500" />
            <span className="truncate">{car.seating_capacity} Seats</span>
          </span>
          <span className="inline-flex min-w-0 items-center gap-2">
            <LuFuel size={13} className="shrink-0 text-slate-500" />
            <span className="truncate">{car.fuel_type}</span>
          </span>
          <span className="inline-flex min-w-0 items-center gap-2">
            <LuSettings2 size={13} className="shrink-0 text-slate-500" />
            <span className="truncate">{car.transmission}</span>
          </span>
          <span className="inline-flex min-w-0 items-center gap-2">
            <LuMapPin size={13} className="shrink-0 text-slate-500" />
            <span className="truncate">{car.location}</span>
          </span>
        </div>
        <Link
          to="/cars"
          className="mt-4 block rounded-lg bg-black px-3 py-2 text-center text-xs font-medium text-white transition-colors hover:bg-slate-800"
        >
          View Vehicle
        </Link>
      </div>
    </article>
  );
};

export default CarCard;
