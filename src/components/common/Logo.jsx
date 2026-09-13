import React from "react";

const Logo = ({
  className = "",
  wordClassName = "text-xl font-bold tracking-tight text-slate-950",
  text = "Rental Company",
  shortText,
}) => {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/assets/image.png"
        alt="Rental Company Logo"
        className="h-8 w-auto object-contain rounded"
      />
      {shortText ? (
        <>
          <span className={`hidden sm:inline ${wordClassName}`}>{text}</span>
          <span className={`sm:hidden ${wordClassName}`}>{shortText}</span>
        </>
      ) : (
        <span className={wordClassName}>{text}</span>
      )}
    </span>
  );
};

export default Logo;