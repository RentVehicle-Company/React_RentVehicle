import React, { useEffect, useState } from "react";
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
import {
  getFeaturedVehicles,
  mockVehicles,
} from "../../services/vehicleServices";

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedVehicle, setSelectedVehicle] = useState("bmw");
  const [featuredVehicles, setFeaturedVehicles] = useState([]);

  // Featured fleet comes from the backend (GET /api/products?isAvailable=true)
  // and falls back to the local mock fleet when the API is unreachable.
  useEffect(() => {
    let alive = true;
    getFeaturedVehicles()
      .then((data) => {
        if (alive) setFeaturedVehicles(data);
      })
      .catch(() => {
        if (alive) setFeaturedVehicles(mockVehicles.slice());
      });
    return () => {
      alive = false;
    };
  }, []);

  // As soon as real data arrives, drop the mock-only placeholder.
  const baseVehicles =
    featuredVehicles.length > 0 ? featuredVehicles : mockVehicles;

  const filteredVehicles =
    activeCategory === "All"
      ? baseVehicles
      : baseVehicles.filter(
          (car) =>
            String(car.category).toLowerCase() ===
            activeCategory.toLowerCase()
        );

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
