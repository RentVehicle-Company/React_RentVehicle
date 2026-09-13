import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Title from "./Title";
import TiltCard from "./TiltCard";
import CarCard from "./vehicles/CarCard";
import { featuredVehicles } from "../services/vehicleServices";

const featuredCars = featuredVehicles;

const CATEGORY_FILTERS = [
  { label: "All", value: "All" },
  { label: "Sports Cars", value: "Sports Car" },
  { label: "Luxury", value: "Luxury SUV" },
  { label: "SUVs", value: "SUV" },
  { label: "Sedans", value: "Sedan" },
];

const FeaturedSection = ({
  vehicles = featuredCars,
  activeCategory = "All",
  onSelectCategory,
}) => {
  return (
    <section className="flex flex-col items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-16">
      <Title
        title="Featured Vehicles"
        subTitle="Explore our selection of premium vehicles available for your next adventure."
      />

      <motion.div
        className="mt-8 flex flex-wrap items-center justify-center gap-2"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -40px 0px" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        {CATEGORY_FILTERS.map((pill) => {
          const isActive = activeCategory === pill.value;
          return (
            <motion.button
              key={pill.value}
              type="button"
              onClick={() => onSelectCategory?.(pill.value)}
              aria-pressed={isActive}
              whileTap={{ scale: 0.92 }}
              className={`cursor-pointer rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-95 sm:text-sm ${
                isActive
                  ? "border-slate-900 bg-slate-900 text-white shadow-md"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
              }`}
            >
              {pill.label}
            </motion.button>
          );
        })}
      </motion.div>

      <div className="mt-10 grid w-full max-w-5xl grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((car, index) => (
          <motion.div
            key={car.id}
            className="w-full"
            initial={{ opacity: 0, y: 28, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -60px 0px" }}
            transition={{
              duration: 0.5,
              delay: index * 0.09,
              ease: "easeOut",
            }}
          >
            <TiltCard maxTilt={8} className="w-full">
              <CarCard car={car} />
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {vehicles.length === 0 && (
        <p className="mt-10 text-sm text-slate-500">
          No vehicles found in this category.
        </p>
      )}

      <Link
        to="/cars"
        className="mt-10 inline-block rounded-xl border-2 border-slate-900 px-8 py-3 text-sm font-semibold text-slate-900 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-900 hover:text-white"
      >
        Show All Vehicles
      </Link>
    </section>
  );
};

export default FeaturedSection;
