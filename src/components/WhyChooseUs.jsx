import React from "react";
import {
  LuBadgeDollarSign,
  LuHeadphones,
  LuRoute,
} from "react-icons/lu";
import Reveal from "./Reveal";
import TiltCard from "./TiltCard";

const FEATURES = [
  {
    icon: LuHeadphones,
    title: "24/7 Customer Support",
    text: "Instant assistance anytime, anywhere.",
  },
  {
    icon: LuBadgeDollarSign,
    title: "Transparent Pricing",
    text: "No hidden insurance or registration fees.",
  },
  {
    icon: LuRoute,
    title: "Flexible Pickups",
    text: "Doorstep delivery or express airport pickup.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="px-4 py-12 sm:px-6 sm:py-14 lg:px-16">
      <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-3 sm:gap-6">
        {FEATURES.map(({ icon: Icon, title, text }, index) => (
          <Reveal key={title} delay={index * 100}>
            <TiltCard className="group flex h-full flex-col items-center gap-3 rounded-2xl border border-borderColor bg-white p-6 text-center shadow-sm transition-all duration-200 ease-out hover:shadow-md">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-white shadow-sm transition-transform duration-200 ease-out group-hover:scale-110">
                <Icon size={22} />
              </span>
              <h3 className="text-base font-semibold text-slate-900">
                {title}
              </h3>
              <p className="text-sm leading-6 text-slate-500">{text}</p>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;