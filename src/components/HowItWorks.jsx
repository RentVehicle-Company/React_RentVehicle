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

const ICON_CENTER_TOP = 52;

const HowItWorks = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <Title
          title="How It Works"
          subTitle="Renting a vehicle has never been easier — three simple steps and you're on the road."
        />

        <div className="relative mt-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-4 hidden border-t-2 border-dashed border-primary/30 md:block"
            style={{ top: ICON_CENTER_TOP }}
          />
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {STEPS.map(({ number, icon: Icon, title, text }, index) => (
              <Reveal key={number} delay={index * 100} className="h-full">
                <div className="group relative h-full overflow-hidden rounded-2xl border border-borderColor bg-white p-6 pt-7 text-center shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-blue-400 hover:shadow-lg hover:shadow-primary/10">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-4 top-0 h-0.5 rounded-full bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <span className="pointer-events-none absolute -right-1 -top-2 select-none text-5xl font-bold tracking-tighter text-slate-100/70 transition-colors duration-300 group-hover:text-primary/10">
                    {number}
                  </span>
                  <span className="absolute left-4 top-4 flex select-none items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-bold tracking-tight text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                    STEP {number}
                  </span>
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30 ring-1 ring-primary/20 transition-transform duration-300 ease-out group-hover:scale-110">
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
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;