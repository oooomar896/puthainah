import React from "react";

const HeadTitle = ({ title, nav1, nav2 }) => {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-bold text-2xl">{title}</h1>
      <div>
        <span className="text-[#898A8D] text-xs">{nav1}</span> &gt;{" "}
        <span className="text-primary text-xs">{nav2}</span>
      </div>
    </div>
  );
};

export default HeadTitle;
