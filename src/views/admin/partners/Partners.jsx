import HeadTitle from "@/components/shared/head-title/HeadTitle";
import { useEffect } from "react";
import PartnersTable from "../../../components/admin-components/partners/PartnersTable";
import { useTranslation } from "react-i18next";

const Partners = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <title>{t("partners.title")}</title>
      <meta name="description" content={t("partners.description")} />
      <HeadTitle
        title={t("partners.titlePage")}
        // description={t("partners.description")}
      />
      <PartnersTable />
    </div>
  );
};

export default Partners;
