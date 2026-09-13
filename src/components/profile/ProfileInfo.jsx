import React from "react";
import { useRef, useState } from "react";
import { LuBadgeCheck, LuCamera } from "react-icons/lu";

const ProfileInfo = ({ user, onPhotoChange }) => {
  const fileInputRef = useRef(null);
  const [photoError, setPhotoError] = useState("");
  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Photo must be smaller than 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoError("");
      onPhotoChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white border border-borderColor rounded-2xl p-6 flex items-center gap-4">
      <div className="relative shrink-0">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-2xl font-semibold text-slate-500">
          {user.image ? (
            <img
              src={user.image}
              alt={`${user.name} profile`}
              className="h-full w-full object-cover"
            />
          ) : (
            initial
          )}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Change profile photo"
          className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-sm transition-colors hover:bg-primary-dull"
        >
          <LuCamera size={14} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoSelect}
          className="hidden"
        />
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
        {photoError && (
          <p className="mt-1 text-xs text-red-600">{photoError}</p>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;
