import React, { useEffect, useState, useContext } from "react";
import Link from "next/link";
import { useGetTicketsQuery } from "../../../redux/api/ticketApi";
import LoadingPage from "../../LoadingPage";
import TicketModal from "../../../components/landing-components/profile-components/TicketModal";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { LanguageContext } from "@/context/LanguageContext";

const Tickets = () => {
  const role = useSelector((state) => state.auth.role);
  const { lang } = useContext(LanguageContext);

  const { t } = useTranslation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const userId = useSelector((state) => state.auth.userId);

  const [open, setOpen] = useState(false);

  const {
    data: tickets,
    refetch,
    isLoading: isLoadingTickets,
    isError,
    error
  } = useGetTicketsQuery(userId, { skip: !userId });

  useEffect(() => {
    if (role && userId) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, userId]);

  if (isLoadingTickets) {
    return <LoadingPage />;
  }

  if (isError) {
    console.error("Tickets error:", error);
    // Continue to render empty state or error message instead of being stuck
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <title>{t("ticket.pageTitle")}</title>
      <meta name="description" content={t("ticket.pageDescription")} />
      {/* Hero Section */}
      <div className="bg-primary text-white py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">{t("ticket.pageTitle")}</h1>
        <p className="text-lg font-medium">{t("ticket.pageDescription")}</p>
      </div>

      {/* Tickets Section */}
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {t("ticket.listTitle")}
          </h2>
          <button
            onClick={() => setOpen(true)}
            className="bg-primary text-white font-semibold py-2.5 px-6 rounded-xl shadow-md hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            {t("ticket.sendTicket")}
          </button>
        </div>

        <TicketModal open={open} setOpen={setOpen} refetch={refetch} />

        <div className="space-y-4">
          {tickets?.length > 0 ? (
            tickets.map((item) => (
              <Link
                key={item?.id}
                href={`/tickets/${item.id}`}
                className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all duration-300 block"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary shrink-0 transition-transform group-hover:scale-105">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" /></svg>
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h5 className="font-bold text-lg text-gray-800">
                      {item?.title}
                    </h5>
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] font-bold border
                        ${item.status?.code === 'open'
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : item.status?.code === 'closed'
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-orange-200 bg-orange-50 text-orange-700"
                        }`}
                    >
                      {lang === "ar" ? item.status?.name_ar : item.status?.name_en}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {item?.description}
                  </p>
                  <div className="mt-2 text-[10px] text-gray-400 font-medium">
                    {item.created_at ? dayjs(item.created_at).format("DD/MM/YYYY hh:mm A") : "-"}
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-bold">
                    {t("viewDetails") || "عرض التفاصيل"}
                    <span className="rtl:rotate-180">→</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
              </div>
              <p className="text-gray-500 text-lg font-bold mb-1">
                {t("ticket.noTicketsTitle")}
              </p>
              <p className="text-sm text-gray-400">
                {t("ticket.noTicketsDescription") || "لا توجد أي تذاكر مفتوحة حالياً"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tickets;
