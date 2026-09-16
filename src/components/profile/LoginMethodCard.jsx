import React from "react";
import { LuMail } from "react-icons/lu";

const methods = [
  {
    id: "email",
    label: "Email & Password",
    description: "Your account uses standard email authentication.",
    icon: LuMail,
  },
];

const LoginMethodCard = () => {
  return (
    <div className="rounded-2xl border border-borderColor bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
        Login Method
      </h3>
      <div className="mt-4 space-y-3">
        {methods.map(({ id, label, description, icon: Icon }) => (
          <div
            key={id}
            className="flex items-start gap-3 rounded-xl border border-borderColor bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800"
          >
            <Icon
              size={18}
              className="mt-0.5 shrink-0 text-slate-600 dark:text-slate-400"
            />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {label}
              </p>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoginMethodCard;
