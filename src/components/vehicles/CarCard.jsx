import React from "react";
import { Link } from "react-router-dom";
import { LuCalendarDays, LuMapPin } from "react-icons/lu";
import { assets, dummyCarData } from "../../assets/assets";

const CarCard = ({ car = dummyCarData[0] }) => {
  return (
    <article className="overflow-hidden rounded-2xl border border-borderColor bg-white shadow-sm">
      <div className="flex h-48 items-center justify-center bg-slate-100 p-4">
        <img
          src={car.image || assets.car_image1}
          alt={`${car.brand} ${car.model}`}
          className="h-full w-full object-contain"
        />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {car.brand} {car.model}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{car.category}</p>
          </div>
          <p className="text-right text-sm font-semibold text-slate-900">
            ${car.price_per_day}
            <span className="block text-xs font-normal text-slate-500">
              /day
            </span>
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <LuMapPin size={14} />
            {car.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <LuCalendarDays size={14} />
            {car.year}
          </span>
        </div>
        <Link
          to="/cars"
          className="mt-5 block rounded-xl bg-black px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          View Vehicle
        </Link>
      </div>
    </article>
  );
};

export default CarCard;
