import HeadTitle from "../../../components/shared/head-title/HeadTitle";
import { useEffect } from "react";
import FaqsTable from "../../../components/admin-components/faqs/FaqsTable";
import { useTranslation } from "react-i18next";

const Faqs = () => {
  const { t } = useTranslation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div>
      <title>{t("faqs.title")}</title>
      <meta name="description" content={t("faqs.description")} />

      <HeadTitle
        title={t("faqs.title")}
        //  description={t("faqs.description")}
      />
      <FaqsTable />
    </div>
  );
};

export default Faqs;
