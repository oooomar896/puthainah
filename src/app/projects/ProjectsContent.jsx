"use client";

import React, { useEffect } from "react";
import ProjectsTable from "@/components/admin-components/projects/ProjectsTable";
import { useTranslation } from "react-i18next";

const ProjectsContent = ({ stats, requesterId }) => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="py-9">
      <title>{t("nav.projects")}</title>
      <meta name="description" content={t("navProvider.myProjects")} />
      <div className="container">
        <div className="">
          <div className="">
            <ProjectsTable stats={stats} requesterId={requesterId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsContent;
