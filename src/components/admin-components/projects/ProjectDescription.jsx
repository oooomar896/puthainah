import React from "react";
import { useTranslation } from "react-i18next";

const ProjectDescription = ({ des }) => {
  const { t } = useTranslation();
  return (
    <section className="flex flex-col gap-3">
      <h4 className="font-bold text-xs md:text-sm">
        {t("projects.orderDescription")}
      </h4>
      <div className="rounded-xl border bg-[#FCFBFC] py-5 px-3">
        <p className="text-[#959595] text-xs md:text-sm">"{des}"</p>
      </div>
    </section>
  );
};

export default ProjectDescription;
