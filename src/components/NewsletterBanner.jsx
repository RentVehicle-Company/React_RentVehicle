import React, { useState } from "react";
import { motion } from "framer-motion";
import { LuSparkles } from "react-icons/lu";

const NewsletterBanner = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <section className="px-4 sm:px-6 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "0px 0px -60px 0px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-10 shadow-lg sm:px-10 sm:py-12"
      >
        <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
          <div className="max-w-md">
            <span className="animate-float-slow inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
              <LuSparkles size={14} />
              Limited-time offer
            </span>
            <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
              Get 15% Off Your First Ride
            </h2>
            <p className="mt-2 text-sm leading-6 text-blue-100">
              Subscribe to our VIP newsletter for exclusive discounts and new
              fleet updates.
            </p>
          </div>

          {subscribed ? (
            <div className="w-full max-w-sm rounded-2xl bg-white/15 px-6 py-5 text-left ring-1 ring-white/20">
              <p className="text-sm font-semibold text-white">You're in! 🎉</p>
              <p className="mt-1 text-sm text-blue-100">
                Your 15% discount code is on its way to {email}. Check your
                inbox.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex w-full max-w-sm flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                aria-label="Email address"
                className="w-full flex-1 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm text-white placeholder-blue-200/70 outline-none transition-colors focus:border-white focus:bg-white/15"
              />
              <button
                type="submit"
                className="shrink-0 cursor-pointer rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-800 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
              >
                Claim Discount
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default NewsletterBanner;