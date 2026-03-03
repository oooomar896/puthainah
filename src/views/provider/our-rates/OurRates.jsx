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
    <div className="min-h-screen bg-gray-50/30">
      <title>{t("ourRates.title") || "تقييماتي"}</title>
      <meta name="description" content={t("ourRates.description") || "عرض تقييمات العملاء لخدماتك ومستوى الأداء"} />

      <div className="container mx-auto px-4 py-10 max-w-7xl">
        <div className="mb-8">
          <HeadTitle
            title={t("ourRates.title") || "تقييماتي"}
          />
          <p className="text-gray-500 mt-3 text-base">
            {t("ourRates.description") || "هنا يمكنك الاطلاع على تقييمات العملاء لمشاريعك السابقة وتعليقاتهم حول جودة الخدمة."}
          </p>
        </div>

        <RatesList />
      </div>
    </div>
  );
};

export default OurRates;
