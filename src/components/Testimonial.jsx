import React from "react";
import { LuStar } from "react-icons/lu";
import { assets } from "../assets/assets";
import Reveal from "./Reveal";

const testimonials = [
  {
    name: "Emma Rodriguez",
    location: "Barcelona, Spain",
    image: assets.testimonial_image_1,
    quote:
      "Exceptional service and attention to detail. Everything was handled professionally and efficiently from start to finish. Highly recommended!",
  },
  {
    name: "Liam Johnson",
    location: "New York, USA",
    image: assets.testimonial_image_2,
    quote:
      "I'm truly impressed by the quality and consistency. The entire process was smooth, and the results exceeded all expectations. Thank you!",
  },
  {
    name: "Sophia Lee",
    location: "Seoul, South Korea",
    image: assets.testimonial_image_1,
    quote:
      "Fantastic experience! From start to finish, the team was professional, responsive, and genuinely cared about delivering great results.",
  },
];

const Testimonial = () => {
  return (
    <section className="bg-slate-50 px-4 py-12 sm:px-6 sm:py-16 lg:px-16 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            What Our Customers Say
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Discover why discerning travelers choose Rental Company for their
            luxury accommodations around the world.
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm sm:text-sm">
            <span className="flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: 1 }).map((_, index) => (
                <LuStar key={index} size={16} fill="currentColor" />
              ))}
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              4.9 out of 5 stars
            </span>
            based on 1,200+ verified customer reviews
          </span>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 100}>
              <article className="rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {testimonial.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
                <div
                  className="mt-3 flex gap-0.5 text-blue-600"
                  aria-label="5 out of 5 stars"
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <LuStar key={index} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  “{testimonial.quote}”
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
