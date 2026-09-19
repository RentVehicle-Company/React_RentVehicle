import React from "react";

const Logo = ({ className = "" }) => {
  return (
    <img
      src="/assets/emm.png"
      alt="Rental Company"
      className={`h-10 w-auto object-contain cursor-pointer invert dark:invert-0 md:h-12 ${className}`}
    />
  );
};

export default Logo;