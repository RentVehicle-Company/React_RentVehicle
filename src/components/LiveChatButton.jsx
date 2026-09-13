import React from "react";
import { LuMessageCircle } from "react-icons/lu";

const LiveChatButton = () => {
  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3">
      <span className="animate-float-slow hidden rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-md sm:block">
        Chat with Support
      </span>
      <a
        href="https://wa.me/85512345678?text=Hi%2C%20I%20have%20a%20question%20about%20renting%20a%20vehicle."
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with support on WhatsApp"
        className="animate-float-slow relative grid h-13 w-13 cursor-pointer place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:-translate-y-1 hover:bg-emerald-600 hover:shadow-xl"
        style={{ animationDelay: "-1.5s" }}
      >
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-30" />
        <LuMessageCircle size={26} className="relative" />
      </a>
    </div>
  );
};

export default LiveChatButton;