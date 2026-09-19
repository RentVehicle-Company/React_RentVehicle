import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  LuArrowRight,
  LuPlay,
  LuX,
  LuShieldCheck,
  LuSparkles,
  LuClock,
  LuQuote,
  LuChevronDown,
  LuUsers,
  LuFuel,
  LuWrench,
} from "react-icons/lu";

const ease = [0.22, 1, 0.36, 1];

const team = [
  {
    name: "BER",
    title: "Chief Creative Officer",
    image: "/team/BER.jpg",
    tag: "Vision",
    narrative:
      "I founded this platform because I believe mobility is the most honest form of freedom. Every day I walk our lots and watch people turn a simple key into a memory — a coastal drive at dawn, a mountain road with the windows down. My job is to make sure that feeling never grows routine. I obsess over the details you feel but rarely see: the scent of a freshly detailed cabin, the perfect pressure curve of a seat, the way headlights catch a city skyline at midnight. Behind every vehicle in our fleet is a decision engineered to make your journey feel authored, not merely arranged. When you rent from us, you are not a transaction — you are the protagonist of the story we spent a decade learning how to tell.",
  },
  {
    name: "David",
    title: "Head of Fleet Operations",
    image: "/team/david.jpg",
    tag: "Engineering",
    narrative:
      "I live in the maintenance bay — my office overlooks the lifts. My mandate is ruthless: a vehicle leaves our yard only when I would hand the keys to my own family. We run a 127-point inspection on every vehicle between rentals, we log every kilometre, and we tune each engine to factory spec before it ever meets a customer. But precision is only half the story. The other half is anticipation — knowing which tyre compound suits the wet season, which brake pads breathe on mountain descents, which suspension soaks up the country roads our drivers love. I oversee a team of master technicians who treat every car like it carries their name on the badge. Reliability is not a promise we make; it is a habit we keep, every single day.",
  },
  {
    name: "Lyhout",
    title: "Lead Systems Architect",
    image: "/team/lyhout.JPG",
    tag: "Technology",
    narrative:
      "Behind every seamless rental is a machine learning to know you. I designed the platform's nervous system — the booking engine, real-time fleet availability, dynamic pricing, and secure payment rails that move money across borders in milliseconds. My philosophy is calm technology: the best interface is the one you never think about. That means predictive search that learns your city, checkout that takes seconds instead of forms, and a system that surfaces the exact vehicle you want before you finish typing. I believe trust is built in fractions of a second and lost in one. So I engineer for the moment a thumb hovers over the Book Now button and make sure that click is the easiest, safest movement you make all day.",
  },
];

const values = [
  {
    icon: LuShieldCheck,
    title: "Radical Safety",
    text: "127-point inspections between every rental and 24/7 roadside assistance — trust is a promise we re-earn daily.",
  },
  {
    icon: LuSparkles,
    title: "Curated Excellence",
    text: "We hand-pick and pre-flight every vehicle so the fleet feels designed for you, not just parked in a lot.",
  },
  {
    icon: LuClock,
    title: "Traffic-Light Speed",
    text: "Book in seconds, collect in minutes — logistics precision that respects your plans.",
  },
];

const milestones = [
  { year: "2014", label: "Fleet Founded", sub: "Three cars, one warehouse, big ambition" },
  { year: "2017", label: "1,000th Rental", sub: "The city began to trust our keys" },
  { year: "2021", label: "Digital Booking", sub: "Platform-first reservations went live" },
  { year: "2024", label: "120+ Vehicle Fleet", sub: "Cars, motorbikes & bicycles under one roof" },
];

const faqs = [
  {
    q: "How does your 127-point inspection work?",
    a: "Between every single rental, each vehicle is lifted and put through a checklist covering fluids, tyres, brakes, suspension, electronics and cabin detail. No vehicle joins the active fleet until our Head of Fleet Operations signs it off — the standard we insist on for our own family.",
  },
  {
    q: "Where are your pickup locations?",
    a: "We operate across six cities, with airport and central depots in each. Every location is staffed by a team that briefs you on the vehicle, uploads the paperworkaine, and hands you keys that are ready to go — typically in under ten minutes.",
  },
  {
    q: "Can I book for several days to save?",
    a: "Yes. Multi-day bookings automatically unlock discounted per-day rates, and our calendar shows live availability so you can extend a trip without leaving the page — with priority roadside support included.",
  },
  {
    q: "How do payments work?",
    a: "We accept Visa and KHQR over encrypted rails in milliseconds. Card details are tokenized and never stored on our servers, so every transaction is as private as it is instant.",
  },
];

export default function About() {
  const [openMember, setOpenMember] = useState(null);
  const [accordion, setAccordion] = useState(0);

  useEffect(() => {
    if (openMember) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openMember]);

  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true, margin: "-80px" });

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
  };
  const item = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
  };

  return (
    <div className="overflow-x-hidden bg-black text-slate-100">
      {/* HERO — narrative split layout */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/25 blur-[140px]" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-[-10%] h-[420px] w-[520px] rounded-full bg-indigo-700/20 blur-[130px]" />
        <div aria-hidden className="pointer-events-none absolute right-[-12%] top-1/3 h-[380px] w-[420px] rounded-full bg-amber-500/10 blur-[130px]" />

        <div className="relative z-10 mx-auto grid min-h-[92vh] w-full max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:px-10">
          <motion.div variants={container} initial="hidden" animate={heroInView ? "show" : "hidden"} className="relative z-10">
            <motion.span variants={item} className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-300">
              <LuSparkles size={13} />
              The Story Behind the Keys
            </motion.span>

            <motion.h1 variants={item} className="mt-7 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
              Our Vision.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
                Our Vehicles.
              </span>
              <br />
              Your Adventure.
            </motion.h1>

            <motion.p variants={item} className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              We exist to make freedom effortless. Every vehicle in our fleet is hand-selected,
              meticulously inspected, and prepared by a team that believes mobility should feel like
              a privilege — not a process. Whether it is a coastal drive or a city sprint, we move
              you with precision, safety, and care.
            </motion.p>

            <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-4">
              <Link to="/cars" className="group inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:bg-blue-500">
                Explore the Fleet
                <LuArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#advisory" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10">
                Meet the Leaders
              </a>
            </motion.div>

            <motion.div variants={item} className="mt-12 grid max-w-xl grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-7">
              {[["10+", "Years of Service"], ["120+", "Vehicles in Fleet"], ["6", "Cities Served"]].map(([num, label]) => (
                <div key={label} className="px-4 first:pl-0">
                  <p className="text-3xl font-extrabold text-white">{num}</p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={heroInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.9, ease, delay: 0.2 }}
            className="relative z-10"
          >
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
              <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black shadow-2xl shadow-blue-950/50">
                <div className="absolute inset-0 animate-float-slow">
                  <img src="/team/BER.jpg" alt="Cinematic drive with our fleet" className="h-full w-full object-cover opacity-60 grayscale-[0.3]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                </div>
                <div className="absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent_30%,rgba(59,130,246,0.25)_48%,rgba(251,191,36,0.18)_52%,transparent_70%)]" />

                <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
                  <span className="h-2 w-2 animate-pulse-glow rounded-full bg-emerald-400" />
                  RENTAL COMPANY
                </div>
                <div className="absolute right-5 top-5 rounded-full border border-amber-400/30 bg-black/50 px-3.5 py-1.5 text-[11px] font-semibold text-amber-300 backdrop-blur-md">
                  EST. 2014
                </div>

                <div className="absolute inset-x-5 bottom-6">
                  <h3 className="text-lg font-bold text-white">Own the Open Road</h3>
                  <p className="mt-1 text-xs text-slate-300">A slow-motion look at life behind our wheel.</p>
                  <button type="button" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-slate-900 transition-transform hover:scale-105">
                    <LuPlay size={14} fill="currentColor" />
                    Watch the Journey
                  </button>
                </div>
              </div>

              <div className="absolute -left-6 top-1/4 hidden rounded-2xl border border-white/10 bg-black/70 p-4 shadow-xl shadow-black/50 backdrop-blur-md md:block">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600/20 text-blue-400"><LuShieldCheck size={20} /></div>
                  <div>
                    <p className="text-sm font-bold text-white">127-pt Inspection</p>
                    <p className="text-[11px] text-slate-400">Every rental, every time</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 bottom-16 hidden rounded-2xl border border-white/10 bg-black/70 p-4 shadow-xl shadow-black/50 backdrop-blur-md md:block">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20 text-amber-400"><LuFuel size={20} /></div>
                  <div>
                    <p className="text-sm font-bold text-white">24/7 Support</p>
                    <p className="text-[11px] text-slate-400">Roadside &amp; in-app</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      </section>

      {/* VALUES — pulsing narrative blocks */}
      <section className="relative py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">What We Stand For</p>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">Driven by Values That Travel With You</h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease, delay: i * 0.12 }}
                className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 p-7"
              >
                <div aria-hidden className="absolute inset-0 animate-pulse-glow opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.25),transparent_65%)]" />
                <div className="relative">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600/15 text-blue-400 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <v.icon size={22} />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-white">{v.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{v.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ADVISORY BOARD — the Architects of Your Journey */}
      <section id="advisory" className="relative py-24">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-800/20 blur-[150px]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-300">
                <LuUsers size={14} /> Advisory Board
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                The Architects of Your Journey
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                Three specialists, one shared obsession: making our fleet feel as considered as your plans.
                Tap a portrait to read the story behind the station.
              </p>
            </div>
          </div>

          <div className="mt-14 grid gap-7 md:grid-cols-3">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease, delay: i * 0.1 }}
                className="group relative h-[440px] cursor-pointer overflow-hidden rounded-[2rem] bg-slate-950"
                onClick={() => setOpenMember(member)}
              >
                <img src={member.image} alt={member.name} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent transition-colors duration-700 group-hover:from-[#0b1437] group-hover:via-[#0a1128]/70" />
                <span className="absolute left-5 top-5 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-md">
                  {member.tag}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-300">{member.title}</p>
                  <h3 className="mt-1.5 text-2xl font-extrabold text-white">{member.name}</h3>
                  <p className="mt-2 max-h-0 overflow-hidden text-[13px] leading-relaxed text-slate-300 opacity-0 transition-all duration-700 group-hover:mt-3 group-hover:max-h-24 group-hover:opacity-100">
                    {member.title === "Chief Creative Officer"
                      ? "A decade turning mobility into memory."
                      : member.title === "Head of Fleet Operations"
                        ? "Ruthless standards behind every key."
                        : "Calm technology that never thinks twice."}
                  </p>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-slate-900 transition-all hover:bg-blue-600 hover:text-white"
                  >
                    View Narrative
                    <LuArrowRight size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MILESTONES */}
      <section className="relative py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-400">Milestones</p>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">A Roadmap Written Mile by Mile</h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {milestones.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease, delay: i * 0.08 }}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50 p-6"
              >
                <div aria-hidden className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-600/10 blur-2xl" />
                <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-300">{m.year}</p>
                <p className="mt-1 text-sm font-bold text-white">{m.label}</p>
                <p className="mt-1 text-xs text-slate-400">{m.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-300">Questions, Answered</p>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">Everything You're Wondering</h2>
          </div>
          <div className="mt-12 space-y-3">
            {faqs.map((f, i) => {
              const open = accordion === i;
              return (
                <motion.div
                  key={f.q}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease, delay: i * 0.05 }}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50"
                >
                  <button
                    type="button"
                    onClick={() => setAccordion(open ? -1 : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-sm font-semibold text-white sm:text-base">{f.q}</span>
                    <LuChevronDown className={`shrink-0 text-slate-400 transition-transform duration-300 ${open ? "rotate-180 text-amber-300" : ""}`} />
                  </button>
                  <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm leading-relaxed text-slate-400">{f.a}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="relative overflow-hidden py-28">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <LuQuote className="mx-auto text-amber-300/60" size={40} />
          <blockquote className="mt-6 text-2xl font-bold leading-snug text-white sm:text-3xl">
            "Mobility is more than transport. It is the prologue to every memory you will make."
          </blockquote>
          <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-slate-400">
            — The Founders of Rental Company
          </p>
          <Link to="/cars" className="mt-10 inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:bg-blue-500">
            Start Your Own Story
            <LuWrench size={16} className="rotate-45" />
          </Link>
        </div>
      </section>

      {/* NARRATIVE MODAL */}
      <AnimatePresence>
        {openMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            onClick={() => setOpenMember(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.97 }}
              transition={{ duration: 0.4, ease }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950"
            >
              <div aria-hidden className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-blue-600/20 blur-[100px]" />
              <button
                type="button"
                onClick={() => setOpenMember(null)}
                aria-label="Close narrative"
                className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/50 text-slate-200 backdrop-blur-md transition-colors hover:bg-white/10"
              >
                <LuX size={16} />
              </button>
              <div className="relative flex p-8 sm:p-10">
                <div className="hidden h-64 w-44 shrink-0 sm:block">
                  <img src={openMember.image} alt={openMember.name} className="h-full w-full rounded-3xl border border-white/10 object-cover" />
                </div>
                <div className="flex-1">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-300">
                    {openMember.tag} · {openMember.title}
                  </span>
                  <h3 className="mt-2 text-3xl font-extrabold text-white">{openMember.name}</h3>
                  <p className="mt-4 max-h-[38vh] overflow-y-auto pr-2 text-sm leading-loose text-slate-300">
                    {openMember.narrative}
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpenMember(null)}
                    className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold text-slate-900 transition-colors hover:bg-blue-600 hover:text-white"
                  >
                    Close Narrative
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
