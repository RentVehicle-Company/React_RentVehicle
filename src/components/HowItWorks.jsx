import React from "react";
import { LuCar, LuKey, LuMapPin } from "react-icons/lu";
import Title from "./Title";
import Reveal from "./Reveal";

const STEPS = [
  {
    number: "01",
    icon: LuMapPin,
    title: "Choose Location & Dates",
    text: "Pick your pickup city and rental dates in seconds — no sign-up required.",
  },
  {
    number: "02",
    icon: LuCar,
    title: "Pick Your Vehicle",
    text: "Browse our premium fleet and choose the perfect ride for your trip.",
  },
  {
    number: "03",
    icon: LuKey,
    title: "Drive Away",
    text: "Grab the keys, hit the road, and enjoy a hassle-free return.",
  },
];

const HowItWorks = () => {
  return (
    <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-16">
      <Title
        title="How It Works"
        subTitle="Renting a vehicle has never been easier — three simple steps and you're on the road."
      />

      <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-3 sm:gap-6">
        {STEPS.map(({ number, icon: Icon, title, text }, index) => (
          <Reveal key={number} delay={index * 100}>
            <div className="group relative h-full rounded-2xl border border-borderColor bg-white p-6 pt-7 text-center shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md">
              <span className="absolute left-4 top-4 text-2xl font-bold tracking-tight text-slate-100 transition-colors duration-200 group-hover:text-primary/20">
                {number}
              </span>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 ease-out group-hover:scale-110">
                <Icon size={22} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;