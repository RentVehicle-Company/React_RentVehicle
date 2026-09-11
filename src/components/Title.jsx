import React from "react";

const Title = ({ title, subTitle, align }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center 
        ${align === "left" && "md:items-start md:text-left"}`}
    >
      <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
        {title}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-gray-500/90">{subTitle}</p>
    </div>
  );
};

export default Title;
