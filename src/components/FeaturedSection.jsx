import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Title from "./Title";
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
  const visibleVehicles = vehicles.slice(0, 6);
  const isEmpty = vehicles.length === 0;

  return (
    <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
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
                    ? "border-slate-900 dark:border-primary bg-slate-900 dark:bg-primary text-white shadow-md"
                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-900 dark:hover:border-primary hover:bg-slate-900 dark:hover:bg-primary hover:text-white"
                }`}
              >
                {pill.label}
              </motion.button>
            );
          })}
        </motion.div>

        <div className="mt-10 grid w-full grid-cols-1 md:grid-cols-3 gap-5 items-stretch justify-center justify-items-center">
          {visibleVehicles.map((car) => (
            <div key={car.id} className="flex h-full w-full justify-center">
              <CarCard car={car} />
            </div>
          ))}
        </div>

        {isEmpty && (
          <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No vehicles found in this category.
          </p>
        )}

        <div className="mt-10 text-center">
          <Link
            to="/cars"
            className="inline-block rounded-xl border-2 border-slate-900 dark:border-primary px-8 py-3 text-sm font-semibold text-slate-900 dark:text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-900 dark:hover:bg-primary hover:text-white"
          >
            Show All Vehicles
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
