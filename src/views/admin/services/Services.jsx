import React, { useEffect } from "react";
import HeadTitle from "@/components/shared/head-title/HeadTitle";
import ServicesTable from "../../../components/admin-components/services/ServicesTable";
import { useTranslation } from "react-i18next";

const Services = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div>
      <title>{t("services.title")}</title>
      <meta name="description" content={t("services.description")} />
      <HeadTitle
        title={t("services.title")}
        // description={t("services.description")}
      />
      <ServicesTable />
    </div>
  );
};

export default Services;
