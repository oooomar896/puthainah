import React from "react";
import more from "@/assets/icons/moreabout.svg";
import Link from "next/link";
import { useLocation } from "@/utils/useLocation";
import { useTranslation } from "react-i18next";

const AboutComponent = () => {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div
      className="relative py-5 sm:py-6 md:py-8 lg:py-10 xl:py-16 bg-primary"
      id="about-us"
    >
      <div className="container">
        <div className="content text-white flex flex-col items-center justify-center xl:gap-14 lg:gap-12 md:gap-8 sm:gap-6 gap-4 relative z-20">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-4xl xl:text-6xl font-bold">
            {t("about.title")}
          </h2>
          <div className="max-w-[750px] text-[#F1F1F1] leading-loose space-y-6">
            {/* Detailed sections removed as per user request */}
          </div>

          {location.pathname === "/" && (
            <Link
              href={"/about-us"}
              className="w-fit flex items-center rounded-3xl border-[1.5px] px-2 sm:px-3 md:px-4 py-1 md:py-2 lg:py-3 mt-6 sm:mt-8 md:mt-10 lg:mt-16 xl:mt-[100px] relative z-20"
            >
              <img src={typeof more === "string" ? more : (more?.src || "")} alt={t("about.more")} loading="lazy" decoding="async" />
              <span className="text-white font-bold text-sm md:text-base xl:text-lg">
                {t("about.more")}
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutComponent;
