import React, { useEffect, useState } from "react";
import ProjectsTable from "../../../components/admin-components/projects/ProjectsTable";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabaseClient";
import { useSelector } from "react-redux";

const Projects = () => {
  const { t } = useTranslation();
  const [projectsStats, setProjectsStats] = useState(null);
  const userId = useSelector((state) => state.auth.userId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count, error } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true });

        if (error) throw error;

        setProjectsStats({
          totalOrdersCount: count || 0,
          inProgressOrdersCount: 0, // You might want to fetch real counts here if possible
          completedOrdersCount: 0,
          cancelledOrdersCount: 0,
        });
      } catch (err) {
        console.error("Error fetching projects stats:", err);
        setProjectsStats({
          totalOrdersCount: 0,
          inProgressOrdersCount: 0,
          completedOrdersCount: 0,
          cancelledOrdersCount: 0,
        });
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="py-9">
      <title>{t("nav.projects")}</title>
      <meta name="description" content={t("navProvider.myProjects")} />
      <div className="container">
        <div className="">
          <div className="">
            <ProjectsTable stats={projectsStats} requesterId={userId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
