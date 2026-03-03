import React, { useEffect } from "react";
import HowItWorkComponent from "../../../components/landing-components/home-components/howItWork/HowItWork";
import { useTranslation } from "react-i18next";
const HowItWork = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <title>{t("howItWorks.title")}</title>
      <meta name="description" content={t("howItWorks.metaDescription")} />
      <HowItWorkComponent />
    </div>
  );
};

export default HowItWork;
