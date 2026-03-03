"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { tr as trHelper } from "@/utils/tr";
import { useGetTicketsByFiltersQuery, useCreateTicketsMutation } from "@/redux/api/ticketApi";
import { useGetTicketMessagesQuery, useSendTicketMessageMutation } from "@/redux/api/ticketMessagesApi";

export default function RequestChat({ requestId, orderId, userId, ticketOwnerId }) {
  const { t } = useTranslation();
  const tr = (k, f) => trHelper(t, k, f);
  const [createTicket, { isLoading: creating }] = useCreateTicketsMutation();

  const ownerId = ticketOwnerId || userId;

  const filters = useMemo(() => {
    const f = { user_id: ownerId };
    if (requestId) f.related_request_id = requestId;
    else if (orderId) f.related_order_id = orderId;
    return f;
  }, [ownerId, requestId, orderId]);

  const { data: tickets } = useGetTicketsByFiltersQuery(filters, { skip: !ownerId });
  const firstTicket = Array.isArray(tickets) ? tickets[0] : (tickets?.data?.[0] || null);
  const [ticketId, setTicketId] = useState(firstTicket?.id || null);
  const { data: messages, refetch: refetchMessages } = useGetTicketMessagesQuery(ticketId, { skip: !ticketId });
  const [sendMessage, { isLoading: sending }] = useSendTicketMessageMutation();
  const [text, setText] = useState("");

  const { useRealtimeSync } = require("@/hooks/useRealtimeSync");

  useRealtimeSync('ticket_messages', `ticket_id=eq.${ticketId}`, () => {
    console.log("New message via Realtime, refetching...");
    refetchMessages();
  });

  useEffect(() => {
    if (firstTicket?.id && !ticketId) setTicketId(firstTicket.id);
  }, [firstTicket, ticketId]);

  const rows = Array.isArray(messages) ? messages : (messages?.data || []);

  const ensureTicket = async () => {
    if (ticketId) return ticketId;
    const title = tr("tickets.chatTitle", "محادثة بخصوص الطلب") + ` #${String(requestId || orderId || "").slice(0, 8)}`;
    const payload = { userId: ownerId, relatedRequestId: requestId || null, relatedOrderId: orderId || null, title, description: "", statusId: 1 };
    const res = await createTicket(payload).unwrap();
    const id = res?.data?.id || res?.id;
    if (id) setTicketId(id);
    return id;
  };

  const handleSend = async () => {
    const msg = (text || "").trim();
    if (!msg) return;
    const id = await ensureTicket();
    if (!id) return;
    await sendMessage({ ticketId: id, senderId: userId, message: msg }).unwrap();
    setText("");
  };

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm" id="request-chat">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-gray-900">{tr("tickets.chatTitle", "محادثة مع الإدارة")}</h3>
        {!ticketId && (
          <button
            onClick={ensureTicket}
            disabled={creating}
            className="px-4 py-2 rounded-xl bg-primary text-white font-bold disabled:opacity-50"
          >
            {tr("tickets.startChat", "بدء محادثة")}
          </button>
        )}
      </div>
      <div className="h-64 overflow-y-auto space-y-3 border border-gray-100 rounded-xl p-4 bg-gray-50">
        {rows.length === 0 ? (
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
          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 bg-white"
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="px-6 py-2 rounded-xl bg-primary text-white font-black disabled:opacity-50"
        >
          {tr("tickets.send", "إرسال")}
        </button>
      </div>
    </div>
  );
}
