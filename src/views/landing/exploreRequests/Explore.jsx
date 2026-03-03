import React, { useEffect, useState } from "react";
import ExploreRequests from "../../../components/landing-components/ExploreRequests/ExploreRequests";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabaseClient";

const Explore = () => {
  const { t } = useTranslation();
  const [requestsStats, setRequestsStats] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count, error } = await supabase
          .from("requests")
          .select("*", { count: "exact", head: true });

        if (error) throw error;

        setRequestsStats({
          totalRequests: count || 0,
          totalRequestsRequesters: 0,
          projectsDiagnosisRequests: 0,
          consultationsRequests: 0,
          maintenanceContractsRequests: 0,
          trainingRequests: 0,
          projectsSupervisionRequests: 0,
          executionContractsRequests: 0,
          projectsManagementRequests: 0,
          wholesaleSupplyRequests: 0,
        });
      } catch (err) {
        console.error("Error fetching requests stats:", err);
        setRequestsStats({
          totalRequests: 0,
          totalRequestsRequesters: 0,
          projectsDiagnosisRequests: 0,
          consultationsRequests: 0,
          maintenanceContractsRequests: 0,
          trainingRequests: 0,
          projectsSupervisionRequests: 0,
          executionContractsRequests: 0,
          projectsManagementRequests: 0,
          wholesaleSupplyRequests: 0,
        });
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="py-9">
      <title>{t("explore.metaTitle")}</title>
      <meta name="description" content={t("explore.metaDescription")} />
      <div className="container">
        <div className="grid grid-cols-2">
          <div className="col-span-2">
            <ExploreRequests stats={requestsStats} />
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
