"use client";

import React, { useEffect } from "react";
import RequestForm from "@/components/landing-components/request-service/RequestForm";
import RequestContent from "@/components/landing-components/request-service/RequestContent";
import LoadingPage from "@/views/LoadingPage";
import { useTranslation } from "react-i18next";
import { PLATFORM_SERVICES } from "@/constants/servicesData";

const RequestServiceContent = ({ services }) => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const effectiveServices = Array.isArray(services) && services.length > 0 ? services : PLATFORM_SERVICES.map(s => ({
    id: s.id,
    name_ar: s.name_ar,
    name_en: s.name_en,
    base_price: 0,
    is_active: true,
  }));

  return (
    <div className="relative min-h-screen mb-20">
      <title>{t("headerLanding.requestService")}</title>
      <div className="absolute top-0 left-0 w-full z-10 h-screen lg:h-[60vh] bg-bgSlide py-20"></div>
      <div className="container">
        <div className=" relative z-20 flex lg:flex-row flex-col-reverse gap-3 text-white pt-6 sm:pt-8 md:pt-10 lg:pt-16 xl:pt-20">
          <RequestForm services={effectiveServices} />
          <RequestContent />
        </div>
      </div>
    </div>
  );
};

export default RequestServiceContent;
