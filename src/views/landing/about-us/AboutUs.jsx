import React, { useEffect } from "react";
import AboutUsComponent from "@/components/landing-components/home-components/aboutUs/AboutUs";
import AboutComponent from "../../../components/landing-components/about/AboutComponent";
import { useTranslation } from "react-i18next";

const AboutUs = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <title>{t("about.metaTitle")}</title>
      <meta name="description" content={t("about.metaDescription")} />
      <AboutComponent />
    </div>
  );
};

export default AboutUs;
