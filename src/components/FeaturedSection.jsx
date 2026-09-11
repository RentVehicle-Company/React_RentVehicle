import React from "react";
import Title from "./Title";
import CarCard from "./vehicles/CarCard";
import { dummyCarData } from "../assets/assets";

const FeaturedSection = () => {
  return (
    <section className="flex flex-col items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-16">
      <div>
        <Title
          title="Featured Vehicles"
          subTitle="Explore our selection o premium vehicles available for your next adventure."
        />
      </div>

      <div className="mt-10 grid w-full max-w-5xl grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {dummyCarData.slice(0, 3).map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedSection;
