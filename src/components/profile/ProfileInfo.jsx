import React from "react";
import { LuBadgeCheck } from "react-icons/lu";

const ProfileInfo = ({ user }) => {
  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="bg-white border border-borderColor rounded-2xl p-6 flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-2xl font-semibold shrink-0">
        {initial}
      </div>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-slate-900 truncate">
          {user.name}
        </h2>
        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm text-slate-500">
          {user.verified && (
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
              <LuBadgeCheck size={14} />
              Verified
            </span>
          )}
          <span>Member since {user.memberSince}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;