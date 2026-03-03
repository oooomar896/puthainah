"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { tr as trHelper } from "@/utils/tr";
import { useGetTicketMessagesQuery, useSendTicketMessageMutation } from "@/redux/api/ticketMessagesApi";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

export default function AdminTicketChat({ ticketId }) {
  const { t } = useTranslation();
  const tr = (k, f) => trHelper(t, k, f);
  // Conditional fetching: skip if no ticketId
  const { data: messages, isLoading } = useGetTicketMessagesQuery(ticketId, { skip: !ticketId });
  const [sendMessage, { isLoading: isSending }] = useSendTicketMessageMutation();
  const adminId = useSelector((state) => state.auth.userId);
  const [text, setText] = useState("");

  const rows = Array.isArray(messages) ? messages : (messages?.data || []);

  const handleSend = async () => {
    const msg = (text || "").trim();
    if (!msg) return;
    if (!ticketId) {
      toast.error(tr("tickets.error_no_id", "خطأ: المعرف غير موجود"));
      return;
    }
    try {
      await sendMessage({ ticketId, senderId: adminId, message: msg }).unwrap();
      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error?.data?.message || tr("tickets.send_error", "فشل الإرسال"));
    }
  };

  if (!ticketId) {
    // Return simpler UI or null if no ticket yet
    return (
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 opacity-50">
        <h3 className="text-lg font-black text-gray-900 mb-4">{tr("tickets.chatTitle", "محادثة مع طالب الخدمة")}</h3>
        <div className="text-center text-sm text-gray-400 py-10">
          {tr("tickets.loading_details", "جاري تحميل بيانات التذكرة...")}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
      <h3 className="text-lg font-black text-gray-900 mb-4">{tr("tickets.chatTitle", "محادثة مع طالب الخدمة")}</h3>
      <div className="h-64 overflow-y-auto space-y-3 border border-gray-100 rounded-xl p-4 bg-gray-50">
        {isLoading ? (
          <div className="text-gray-500 text-sm">{tr("common.loading", "جاري التحميل")}</div>
        ) : rows.length === 0 ? (
          <div className="text-gray-500 text-sm">{tr("tickets.noMessages", "لا توجد رسائل")}</div>
        ) : (
          rows.map((m) => (
            <div key={m.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
                {(m.sender?.email || "").slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500">{m.sender?.email || tr("tickets.user", "مستخدم")}</div>
                <div className="px-3 py-2 rounded-xl bg-white border border-gray-100 text-gray-900">{m.message}</div>
                <div className="text-[10px] text-gray-400 mt-1">{new Date(m.created_at).toLocaleString("ar-EG")}</div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={tr("tickets.typeMessage", "اكتب رسالة...")}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 bg-white"
        />
        <button
          onClick={handleSend}
          disabled={isSending || !text.trim() || !ticketId}
          className="px-6 py-2 rounded-xl bg-primary text-white font-black disabled:opacity-50"
        >
          {tr("tickets.send", "إرسال")}
        </button>
      </div>
    </div>
  );
}
