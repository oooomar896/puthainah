import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import Link from "next/link";
import { LanguageContext } from "@/context/LanguageContext";
import { tr as trHelper } from "@/utils/tr";
import { MessageCircle } from "lucide-react";
import AdminTicketChat from "./AdminTicketChat";

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "open":
      return "text-green-600 bg-green-100 border border-green-300";
    case "closed":
      return "text-red-600 bg-red-100 border border-red-300";
    default:
      return "text-gray-600 bg-gray-100 border border-gray-300";
  }
};

const TicketsDetails = ({ ticket, onToggleStatus, loading }) => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);
  const tr = (key, fallback) => trHelper(t, key, fallback);

  const role = useSelector((state) => state.auth.role);

  const isOpen = ticket?.ticketStatus?.nameEn?.toLowerCase() === "open";
  const statusClass = getStatusColor(ticket?.ticketStatus?.nameEn);
  const handleChatScroll = () => {
    const el = typeof window !== "undefined" ? document.getElementById("ticket-chat") : null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md max-w-3xl mx-auto my-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {tr("tickets.ticket_details", "تفاصيل التذكرة")}
        </h2>
        {role === "Admin" && (
          <div className="flex items-center gap-2">
            <Link
              href="#ticket-chat"
              className="px-4 py-2 text-sm rounded-md font-semibold transition flex items-center justify-center gap-2 bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200"
            >
              <MessageCircle className="w-4 h-4" />
              {tr("tickets.openChat", "الدردشة")}
            </Link>
            <button
              onClick={onToggleStatus}
              disabled={loading}
              className={`px-4 py-2 text-sm rounded-md font-semibold transition flex items-center justify-center gap-2 ${
                isOpen
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-green-600 text-white hover:bg-green-700"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  <span>
                    {isOpen
                      ? tr("tickets.closing_ticket", "جاري إغلاق التذكرة")
                      : tr("tickets.opening_ticket", "جاري فتح التذكرة")}
                  </span>
                </>
              ) : isOpen ? (
                tr("tickets.close_ticket", "إغلاق التذكرة")
              ) : (
                tr("tickets.reopen_ticket", "إعادة فتح التذكرة")
              )}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600">{tr("tickets.user_name", "اسم المستخدم")}</p>
            <p className="text-base font-medium text-gray-900">
              {ticket?.user?.fullName || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              {tr("tickets.ticket_status", "حالة التذكرة")}
            </p>
            <span
              className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${statusClass}`}
            >
              {lang === "ar"
                ? ticket?.ticketStatus?.nameAr
                : ticket?.ticketStatus?.nameEn || "-"}
            </span>
          </div>
        </div>

        <hr className="my-4 border-gray-200" />

        <div>
          <p className="text-sm text-gray-600 mb-1">
            {tr("tickets.ticket_title", "عنوان التذكرة")}
          </p>
          <h3 className="text-lg font-semibold text-gray-800">
            {ticket?.title || "-"}
          </h3>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">
            {tr("tickets.ticket_description", "وصف التذكرة")}
          </p>
          <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
            {ticket?.description || tr("tickets.no_description", "لا يوجد وصف")}
          </p>
        </div>
      </div>
      <div className="mt-6" id="ticket-chat">
        <AdminTicketChat ticketId={ticket?.id} />
      </div>
      {role === "Admin" && (
        <button
          onClick={handleChatScroll}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:bg-primary/90 active:scale-95 transition"
          aria-label={tr("tickets.openChat", "الدردشة")}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default TicketsDetails;
