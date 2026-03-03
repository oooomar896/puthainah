const HeadTitle = ({ title, description = "" }) => {
  return (
    <div className="py-5">
      <div className="container">
        <div className="flex flex-col gap-2">
          <h2 className="font-medium text-xs md:text-base lg:text-lg xl:text-xl text-[#1A71F6] leading-5">
            {title}
          </h2>
          <p className="text-xs md:text-sm lg:text-base font-normal text-[#808080] leading-4">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeadTitle;
