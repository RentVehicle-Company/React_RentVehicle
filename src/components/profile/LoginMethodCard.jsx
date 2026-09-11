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
    <div className="bg-white border border-borderColor rounded-2xl p-6">
      <h3 className="text-base font-semibold text-slate-900">Login Method</h3>
      <div className="mt-4 space-y-3">
        {methods.map(({ id, label, description, icon: Icon }) => (
          <div
            key={id}
            className="flex items-start gap-3 bg-slate-50 border border-borderColor rounded-xl p-4"
          >
            <Icon size={18} className="text-slate-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-900">{label}</p>
              <p className="text-sm text-slate-500 mt-0.5">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoginMethodCard;