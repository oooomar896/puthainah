import React, { useEffect } from "react";
import { useGetServicesQuery } from "../../../redux/api/servicesApi";
import LoadingPage from "../../LoadingPage";
import Services from "../../../components/landing-components/home-components/our-services/OurServices";
import { useTranslation } from "react-i18next";
import { PLATFORM_SERVICES } from "@/constants/servicesData";

const OurServices = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { data: services, isLoading } = useGetServicesQuery({});

  if (isLoading) {
    return <LoadingPage />;
  }
  return (
    <div>
      <title>{t("services.title")}</title>
      <meta name="description" content={t("services.description")} />
      <Services data={Array.isArray(services) && services.length > 0 ? services : PLATFORM_SERVICES} />
    </div>
  );
};

export default OurServices;
