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
          <div className="max-w-[1000px] text-[#F1F1F1] leading-relaxed space-y-12 text-center md:text-right">
            {/* Intro */}
            <p className="text-lg md:text-2xl opacity-90 border-r-4 border-secondary/50 pr-6 mr-auto md:mr-0 max-w-3xl">
              {t("about.intro")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Vision & Mission */}
              <div className="space-y-4 bg-white/5 p-8 rounded-3xl border border-white/10">
                <h3 className="text-secondary font-black text-2xl md:text-3xl">{t("about.visionTitle")}</h3>
                <p className="text-base md:text-xl opacity-80">{t("about.visionText")}</p>
              </div>
              <div className="space-y-4 bg-white/5 p-8 rounded-3xl border border-white/10">
                <h3 className="text-secondary font-black text-2xl md:text-3xl">{t("about.missionTitle")}</h3>
                <p className="text-base md:text-xl opacity-80">{t("about.missionText")}</p>
              </div>
            </div>

            {/* Values */}
            <div className="space-y-4 bg-secondary/5 p-8 rounded-3xl border border-secondary/20">
              <h3 className="text-secondary font-black text-2xl md:text-3xl">{t("about.valuesTitle")}</h3>
              <p className="text-base md:text-xl opacity-80">{t("about.valuesText")}</p>
            </div>

            {/* Goals */}
            <div className="space-y-8">
              <h3 className="text-secondary font-black text-2xl md:text-3xl border-b border-white/10 pb-4 inline-block">{t("about.goalsTitle")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(t("about.goals", { returnObjects: true }) || []).map((goal, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-2 h-2 rounded-full bg-secondary mt-2 shrink-0"></div>
                    <p className="text-sm md:text-lg opacity-80">{goal}</p>
                  </div>
                ))}
              </div>
            </div>
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
