import React, { useEffect } from "react";
import HeadTitle from "@/components/shared/head-title/HeadTitle";
import TicketsTable from "../../../components/admin-components/tickets/TicketsTable";
import { useTranslation } from "react-i18next";

const Tickets = () => {
  const { t } = useTranslation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div>
      <title>{t("tickets.title")}</title>
      <meta name="description" content={t("tickets.description")} />
      <HeadTitle
        title={t("tickets.title")}
        // description={t("tickets.description")}
      />
      <TicketsTable />
    </div>
  );
};

export default Tickets;
