import React, { useEffect } from "react";
import HeadTitle from "@/components/shared/head-title/HeadTitle";
import RatingsTable from "@/components/admin-components/ratings/RatingsTable";
import { useTranslation } from "react-i18next";

const Ratings = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  });

  return (
    <div>
      <title>{t("ratings.title") || "التقييمات"}</title>
      <meta
        name="description"
        content={t("ratings.description") || "إدارة التقييمات"}
      />
      <HeadTitle title={t("ratings.title") || "التقييمات"} />
      <RatingsTable />
    </div>
  );
};

export default Ratings;
