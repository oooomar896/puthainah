import React, { useEffect } from "react";
import HeadTitle from "@/components/shared/head-title/HeadTitle";
import ProjectsList from "../../../components/provider-components/our-projects/ProjectsList";
import { useTranslation } from "react-i18next";

const Projects = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const projectsStats = null;

  return (
    <div className="min-h-screen bg-gray-50/30">
      <title>{t("projects.pageTitle") || "مشاريعي"}</title>
      <meta name="description" content={t("projects.pageDescription") || "عرض وإدارة جميع مشاريعك الجارية والمكتملة"} />

      <div className="container mx-auto px-4 py-10 max-w-7xl">
        <div className="mb-8">
          <HeadTitle
            title={t("projects.pageTitle") || "مشاريعي"}
          />
          <p className="text-gray-500 mt-3 text-base">
            {t("projects.pageDescription") || "تابع تقدم مشاريعك، قم بتحديث الحالة، ورفع الملفات المطلوبة."}
          </p>
        </div>

        <ProjectsList stats={projectsStats} />
      </div>
    </div>
  );
};

export default Projects;
