import React from "react";
import Hero from "../../components/Hero";
import FeaturedSection from "../../components/FeaturedSection";
import Banner from "../../components/Banner";
import Testimonial from "../../components/Testimonial";
import Footer from "../../components/common/Footer";

const Home = () => {
  return (
    <>
      <Hero />
      <FeaturedSection />
      <Banner />
      <Testimonial />
      <Footer />
    </>
  );
};

export default Home;
