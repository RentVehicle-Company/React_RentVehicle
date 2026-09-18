import React, { useEffect, useState } from "react";
import { LuImage } from "react-icons/lu";

// Renders <img> but degrades to a neutral placeholder whenever the src is
// missing or fails to load, so catalog cards never show blank/broken boxes —
// even when a backend image URL 404s or the API is unreachable.
const SafeImage = ({ src, alt = "", className = "", fallback }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return fallback != null ? (
      fallback
    ) : (
      <div
        aria-label={alt || "Vehicle"}
        className={`${className} grid place-items-center bg-slate-100 dark:bg-slate-700`}
      >
        <LuImage size={28} className="text-slate-300 dark:text-slate-500" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

export default SafeImage;