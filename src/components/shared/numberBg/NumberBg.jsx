import React from "react";

const NumberBg = ({ number = "01" }) => {
  return <div className="text-[100px] md:text-[150px] lg:text-[200px] xl:text-[280px] font-semibold select-none">{number}</div>;
};

export default NumberBg;
