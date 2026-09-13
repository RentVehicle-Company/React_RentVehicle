import React from "react";
import { Link } from "react-router-dom";
import { LuCar, LuRoute, LuTimer } from "react-icons/lu";
import Title from "./Title";
import Reveal from "./Reveal";
import { mockVehicles } from "../services/vehicleServices";
import { usePreferences } from "../context/PreferencesContext";

const TRIPS = [
  {
    title: "Phnom Penh to Kampot Scenic Route",
    distance: "150 km · ~3 hrs",
    category: "Luxury SUV",
    vehicleId: 3,
    description:
      "Cruise the coastal highway past riverside villages and pepper farms.",
  },
  {
    title: "Siem Reap Temple Tour",
    distance: "40 km loop · Full day",
    category: "SUV",
    vehicleId: 7,
    description:
      "Hop between Angkor's ancient temples in comfort all day long.",
  },
  {
    title: "Sihanoukville Beach Run",
    distance: "City to coast · 40 min",
    category: "Sports Car",
    vehicleId: 2,
    description:
      "Turn heads on the way to Otres Beach with the top down.",
  },
  {
    title: "Battambang Country Drive",
    distance: "290 km · ~5 hrs",
    category: "Sedan",
    vehicleId: 8,
    description:
      "A smooth, fuel-friendly cruise through rice paddies and quiet roads.",
  },
];

const RecommendedTrips = () => {
  const { formatPrice } = usePreferences();

  return (
    <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-16">
      <Title
        title="Recommended Trips & Rides"
        subTitle="Hand-picked routes paired with the perfect vehicle for each journey."
      />

      <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2">
        {TRIPS.map((trip, index) => {
          const recommended = mockVehicles.find(
            (vehicle) => vehicle.id === trip.vehicleId
          );
          return (
            <Reveal key={trip.title} delay={index * 100}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-borderColor bg-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md sm:flex-row">
                <div className="relative h-44 shrink-0 overflow-hidden sm:h-auto sm:w-44">
                  <img
                    src={recommended?.image}
                    alt={
                      recommended
                        ? `${recommended.brand} ${recommended.model}`
                        : trip.title
                    }
                    className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                    <LuCar size={11} />
                    {trip.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="flex items-start gap-2 text-base font-semibold text-slate-900">
                    <LuRoute size={17} className="mt-0.5 shrink-0 text-primary" />
                    {trip.title}
                  </h3>
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
                    <LuTimer size={13} />
                    {trip.distance}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {trip.description}
                  </p>
                  {recommended && (
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                      <span className="text-xs text-slate-600">
                        Recommended:{" "}
                        <span className="font-semibold text-slate-900">
                          {recommended.brand} {recommended.model}
                        </span>
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {formatPrice(recommended.price_per_day)}
                        <span className="font-normal text-slate-400">/day</span>
                      </span>
                    </div>
                  )}
                  <Link
                    to="/cars"
                    className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
                  >
                    View Fleet
                  </Link>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
};

export default RecommendedTrips;