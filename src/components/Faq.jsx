import React from "react";
import { motion } from "framer-motion";
import { LuChevronDown } from "react-icons/lu";

const FAQ_ITEMS = [
  {
    question: "What documents do I need to rent a vehicle?",
    answer:
      "You'll need a valid driver's license, your passport or national ID, and a credit card to complete the reservation.",
  },
  {
    question: "Is insurance included in the daily rental rate?",
    answer:
      "Yes, basic liability insurance is included in the daily rate. Optional full coverage is available at checkout for added peace of mind.",
  },
  {
    question: "What is the cancellation and refund policy?",
    answer:
      "Enjoy free cancellation up to 24 hours before your scheduled pickup time. Cancellations made after that window may incur a fee.",
  },
  {
    question: "Can I pick up in Phnom Penh and drop off in another city?",
    answer:
      "Absolutely. One-way rentals are supported across all major locations, including Phnom Penh, Siem Reap, and more — just choose your drop-off city when booking.",
  },
];

const Faq = () => {
  const [openFaq, setOpenFaq] = React.useState(0);

  return (
    <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-16">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -60px 0px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
            Everything you need to know before hitting the road. Can't find
            your answer? Contact our support team.
          </p>
        </motion.div>

        <div className="mt-8 space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <motion.div
                key={item.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className={`overflow-hidden rounded-2xl border bg-white transition-all duration-200 ${
                  isOpen
                    ? "animate-pulse-glow border-primary/40 shadow-sm"
                    : "border-borderColor"
                }`}
              >
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="relative flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <motion.span
                    layout
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    className={`absolute left-0 top-1/2 hidden w-[3px] -translate-y-1/2 rounded-full bg-primary sm:block ${
                      isOpen ? "h-8" : "h-0"
                    }`}
                  />
                  <span className="text-sm font-semibold text-slate-900 sm:text-base">
                    {item.question}
                  </span>
                  <motion.span
                    aria-hidden="true"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 24 }}
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors duration-200 ${
                      isOpen
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <LuChevronDown size={16} />
                  </motion.span>
                </motion.button>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-6 text-slate-500">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Faq;