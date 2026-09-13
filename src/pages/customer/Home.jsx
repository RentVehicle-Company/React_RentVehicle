import React, { useState } from "react";
import Hero from "../../components/Hero";
import HowItWorks from "../../components/HowItWorks";
import FeaturedSection from "../../components/FeaturedSection";
import WhyChooseUs from "../../components/WhyChooseUs";
import StatsBanner from "../../components/StatsBanner";
import Banner from "../../components/Banner";
import PriceEstimator from "../../components/PriceEstimator";
import Testimonial from "../../components/Testimonial";
import NewsletterBanner from "../../components/NewsletterBanner";
import Faq from "../../components/Faq";
import RecommendedTrips from "../../components/RecommendedTrips";
import { mockVehicles } from "../../services/vehicleServices";

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedVehicle, setSelectedVehicle] = useState("bmw");

  const filteredVehicles =
    activeCategory === "All"
      ? mockVehicles
      : mockVehicles.filter((car) => car.category === activeCategory);

  return (
    <>
      <Hero
        selectedVehicle={selectedVehicle}
        onSelectVehicle={setSelectedVehicle}
      />

      <HowItWorks />

      <FeaturedSection
        vehicles={filteredVehicles}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      <WhyChooseUs />
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-[#0F172A] shadow-sm">
          <StatsBanner flush />
          <div aria-hidden="true" className="mx-5 border-b border-slate-800 sm:mx-6" />
          <Banner flush />
        </div>
      </section>
      <PriceEstimator vehicle={selectedVehicle} />
      <Testimonial />
      <NewsletterBanner />
      <Faq />
      <RecommendedTrips />
    </>
  );
};

export default Home;
