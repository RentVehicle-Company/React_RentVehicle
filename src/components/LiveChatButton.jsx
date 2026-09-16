import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuHeadset,
  LuMessageCircle,
  LuSend,
  LuUser,
  LuX,
  LuZap,
} from "react-icons/lu";

const QUICK_REPLIES = [
  "Pickup locations",
  "Insurance coverage",
  "Payment methods",
];

const WELCOME_MESSAGE = {
  role: "bot",
  text: "Hi there! 👋 I'm the Rental Company assistant. Ask me about pickup locations, insurance, or payment methods — or tap a quick question below.",
};

// Keyword -> automated answer matching. First rule wins.
const RESPONSE_RULES = [
  {
    keywords: ["pickup location", "pickup", "pick up", "location", "where", "delivery", "dropoff", "drop-off", "city"],
    reply:
      "Self pick-up is free at all our locations: Phnom Penh, Siem Reap, Sihanoukville and Kampot. 🚗 We also offer same-day delivery within Phnom Penh and Siem Reap for a small fee per day. Just pick a district when you book!",
  },
  {
    keywords: ["insurance", "cover", "cdw", "collision", "damage", "comprehensive", "deductible"],
    reply:
      "Every rental includes Basic Collision Damage Waiver (CDW) at no extra cost. 🛡️ For full peace of mind, add Comprehensive Insurance (+$15/day) which covers theft, windshield and reduces your excess to $0. A $200 hold is required at pickup.",
  },
  {
    keywords: ["payment", "pay", "visa", "khqr", "bakong", "credit", "card", "deposit", "refund"],
    reply:
      "We accept Visa credit/debit cards and Bakong KHQR. 💳 Pay securely at checkout — after that the reservation is confirmed instantly. There's a refundable security deposit of $200.00, returned within 24h after return.",
  },
  {
    keywords: ["available", "availability", "stock", "left", "book", "reserve", "confirm"],
    reply:
      "Availability varies per vehicle — each listing card shows live stock from its detail page. 🚙 Pick any date that suits you, reserve instantly, and get confirmation within seconds.",
  },
  {
    keywords: ["cancel", "cancellation", "refund policy", "change", "reschedule"],
    reply:
      "Good news: cancellation is free up to 24h before pickup! ⏰ After that, the first day's rental fee applies. You can reschedule any confirmed booking right from your dashboard.",
  },
  {
    keywords: ["id", "license", "document", "requirement", "require", "age", "passport"],
    reply:
      "You'll need a valid government-issued ID or passport, plus a valid driver's license for cars & motorbikes. 🪪 Minimum renter age is 21. You can upload your document during checkout!",
  },
  {
    keywords: ["hello", "hi", "hey", "help", "support", "agent", "human"],
    reply:
      "Hello! Great to see you. 😊 I can answer quick questions here, and our team is available at +855 12 345 678 or live chat for anything that needs a human touch.",
  },
];

const FALLBACK_REPLY =
  "Hmm, I'm not 100% sure about that one! 🤔 For detailed answers our support team is one tap away at +855 12 345 678. Meanwhile — try asking about pickup locations, insurance, or payment methods.";

let messageId = 0;
const nextMessageId = () => `msg_${Date.now()}_${messageId++}`;

const getReplyFor = (text) => {
  const lower = text.toLowerCase();
  const rule = RESPONSE_RULES.find(({ keywords }) =>
    keywords.some((keyword) => lower.includes(keyword))
  );
  return rule ? rule.reply : FALLBACK_REPLY;
};

const LiveChatButton = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: "welcome", role: "bot", text: WELCOME_MESSAGE.text },
  ]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  useEffect(() => {
    if (!open) {
      setDraft("");
      setTyping(false);
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
    }
  }, [open]);

  useEffect(() => () => {
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
  }, []);

  const push = (role, text, isTyping = false) => {
    const delayMs = isTyping ? 850 : 0;
    if (isTyping) {
      setTyping(true);
      typingTimer.current = window.setTimeout(() => {
        setTyping(false);
        setMessages((prev) => [
          ...prev,
          { id: nextMessageId(), role, text },
        ]);
      }, delayMs);
      return;
    }
    setMessages((prev) => [...prev, { id: nextMessageId(), role, text }]);
  };

  const send = (rawText) => {
    const text = String(rawText || "").trim();
    if (!text || typing) return;
    push("user", text);
    setDraft("");
    push("bot", getReplyFor(text), true);
  };

  return (
    <>
      {/* Chat popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed bottom-24 right-4 z-[90] flex w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 sm:right-5"
            role="dialog"
            aria-label="Chat with support"
          >
            {/* Header */}
            <div className="relative bg-slate-900 px-4 py-3.5">
              <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-emerald-500/25 blur-2xl" />
              <div className="flex items-center gap-3">
                <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-500 text-white shadow-md">
                  <LuHeadset size={19} />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">
                    Chat with Support
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-emerald-300">
                    <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-emerald-400" />
                    Online · replies instantly
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <LuX size={16} />
                </button>
              </div>
            </div>

            {/* Conversation */}
            <div className="h-[320px] space-y-3 overflow-y-auto bg-slate-50 p-4">
              {messages.map((message, index) => {
                const isBot = message.role === "bot";
                const showAvatar =
                  index === 0 ||
                  messages[index - 1].role !== message.role;
                return (
                  <div
                    key={message.id}
                    className={`flex items-end gap-2 ${
                      isBot ? "justify-start" : "justify-end"
                    }`}
                  >
                    {isBot && showAvatar && (
                      <span className="mb-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                        <LuHeadset size={13} />
                      </span>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                        isBot
                          ? "rounded-bl-md bg-white text-slate-700 ring-1 ring-slate-200"
                          : "rounded-br-md bg-blue-600 text-white"
                      }`}
                    >
                      {message.text}
                    </div>
                    {!isBot && showAvatar && (
                      <span className="mb-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-200 text-slate-500">
                        <LuUser size={13} />
                      </span>
                    )}
                  </div>
                );
              })}

              {typing && (
                <div className="flex items-end gap-2">
                  <span className="mb-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                    <LuHeadset size={13} />
                  </span>
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-3.5 py-3 shadow-sm ring-1 ring-slate-200">
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.1 }}
                      className="h-1.5 w-1.5 rounded-full bg-slate-400"
                    />
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.1, delay: 0.18 }}
                      className="h-1.5 w-1.5 rounded-full bg-slate-400"
                    />
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.1, delay: 0.36 }}
                      className="h-1.5 w-1.5 rounded-full bg-slate-400"
                    />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Quick replies */}
            <div className="flex flex-wrap gap-1.5 border-t border-slate-100 bg-white px-3 pt-3">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => send(reply)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                >
                  <LuZap size={10} />
                  {reply}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-slate-100 bg-white p-3">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send(draft);
                }}
                placeholder="Type your question…"
                className="h-10 flex-1 rounded-xl border border-borderColor bg-slate-50 px-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => send(draft)}
                disabled={!draft.trim() || typing}
                aria-label="Send message"
                className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 transition-all hover:bg-emerald-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <LuSend size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating action button */}
      <div className="fixed bottom-5 right-5 z-[95] flex items-center gap-3">
        <AnimatePresence>
          {!open && (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="animate-float-slow hidden rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-md sm:block"
            >
              Chat with Support
            </motion.span>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close chat with support" : "Open chat with support"}
          className={`relative grid h-13 w-13 cursor-pointer place-items-center rounded-full text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl active:scale-95 ${
            open
              ? "bg-slate-900 shadow-slate-900/30"
              : "bg-emerald-500 shadow-emerald-500/30 hover:bg-emerald-600"
          }`}
        >
          {!open && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-30" />
          )}
          {open ? <LuX size={24} /> : <LuMessageCircle size={24} className="relative" />}
        </button>
      </div>
    </>
  );
};

export default LiveChatButton;