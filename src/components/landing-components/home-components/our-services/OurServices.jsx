import React from "react";
import NumberBg from "../../../shared/numberBg/NumberBg";
import ServiceList from "./ServiceList";
import { useTranslation } from "react-i18next";

const OurServices = ({ data }) => {
  const { t } = useTranslation();
  return (
    <section
      id="services"
      className="relative services py-8 sm:py-10 md:py-12 lg:py-16 xl:py-20"
    >
      {/* المحتوى */}
      <div className="container relative z-20">
        <div className="flex flex-col lg:flex-row items-start justify-between text-center rtl:lg:text-right ltr:lg:text-left">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-snug lg:leading-[60px] lg:basis-[40%]">
            {t("services.title")}
          </h2>
          <p className="mt-3 text-sm text-gray-600 lg:basis-[50%] rtl:text-right ltr:text-left">
            {t("services.description")}
          </p>
        </div>

        {/* قائمة الخدمات */}
        <div className="mt-6">
          <ServiceList data={data} />
        </div>
      </div>
    </section>
  );
};

export default OurServices;
