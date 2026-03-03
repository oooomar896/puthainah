import HeadTitle from "../../../components/shared/head-title/HeadTitle";
import RatesList from "../../../components/provider-components/our-rates/RatesList";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const OurRates = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div>
      <title>{t("ourRates.title")}</title>
      <meta name="description" content={t("ourRates.description")} />
      <HeadTitle
        title={t("ourRates.title")}
        // description={t("ourRates.description")}
      />

      <RatesList />
    </div>
  );
};

export default OurRates;
