"use client";
import React, { useEffect } from "react";
import {
  useGetTicketDetailsQuery,
  useUpdateTicketStatusMutation,
} from "../../../redux/api/ticketApi";
import { useParams } from "next/navigation";
import HeadTitle from "../../../components/admin-components/users-details/HeadTitle";
import TicketsDetailsComponent from "../../../components/admin-components/tickets/TicketsDetails";
import LoadingPage from "../../LoadingPage";
import { useTranslation } from "react-i18next";

const TicketsDetails = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { id } = useParams();
  const { data: ticket, isLoading, refetch } = useGetTicketDetailsQuery(id, { skip: !id });
  const status = ticket?.ticketStatus?.id;
  const [onToggleStatus, { isLoading: isLoadingUpdate }] =
    useUpdateTicketStatusMutation();
  const handleToggle = async () => {
    try {
      await onToggleStatus({
        body: status === 1000 ? 1001 : 1000,
        id: id,
      }).unwrap();
      // ممكن تعمل toast هنا لو حبيت
      refetch();
    } catch (err) {
      console.error(err);
    }
  };
  if (isLoading) {
    return <LoadingPage />;
  }
  return (
    <div className="py-10">
      <title>{t("ticketsDetails.title")}</title>
      <div className="container">
        <HeadTitle
          title={t("ticketsDetails.title")}
          nav1={t("ticketsDetails.nav1")}
          nav2={t("ticketsDetails.nav2")}
        />
        <TicketsDetailsComponent
          ticket={ticket}
          onToggleStatus={handleToggle}
          loading={isLoadingUpdate}
        />
      </div>
    </div>
  );
};

export default TicketsDetails;
