import React, { useEffect } from "react";
import RatesList from "../../../components/provider-components/our-rates/RatesList";
import { useTranslation } from "react-i18next";

const Reviews = () => {
    const { t } = useTranslation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="py-9">
      <title>{t("nav.rates")}</title>
      <div className="container">
        <div className="">
          <RatesList />
        </div>
      </div>
    </div>
  );
};

export default Reviews;
