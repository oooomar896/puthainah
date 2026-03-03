"use client";
import React, { useState, useContext, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Send, User, ChevronRight, AlertCircle, CheckCircle, Clock } from "lucide-react";

import Link from "next/link";
import { useGetTicketDetailsQuery } from "../../../redux/api/ticketApi";
import { useGetTicketMessagesQuery, useSendTicketMessageMutation } from "../../../redux/api/ticketMessagesApi";
import LoadingPage from "../../LoadingPage";
import { LanguageContext } from "@/context/LanguageContext";
import dayjs from "dayjs";

const TicketDetails = ({ ticketId }) => {
    const { t } = useTranslation();
    const { lang } = useContext(LanguageContext);

    const messagesEndRef = useRef(null);

    const userId = useSelector((state) => state.auth.userId);

    const { data: ticket, isLoading: isLoadingTicket, isError: isTicketError } = useGetTicketDetailsQuery(ticketId, { skip: !ticketId });
    const { data: messages, isLoading: isLoadingMessages, refetch, isError: isMessagesError } = useGetTicketMessagesQuery(ticketId, {
        pollingInterval: 5000, // Poll every 5s for new messages
        skip: !ticketId
    });
    const [sendMessage, { isLoading: isSending }] = useSendTicketMessageMutation();

    const [newMessage, setNewMessage] = useState("");

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        if (!ticketId) return; // Prevent sending if no ID
        try {
            await sendMessage({ ticketId, senderId: userId, message: newMessage }).unwrap();
            setNewMessage("");
            refetch();
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    if (isLoadingTicket) return <LoadingPage />;

    const messagesList = Array.isArray(messages) ? messages : (messages?.data || []);

    const getStatusColor = (code) => {
        switch (code) {
            case 'open': return "text-blue-600 bg-blue-50 border-blue-200";
            case 'closed': return "text-green-600 bg-green-50 border-green-200";
            default: return "text-orange-600 bg-orange-50 border-orange-200";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header / Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/tickets" className="hover:text-primary transition-colors flex items-center gap-1">
                        {t("ticket.pageTitle", "الدعم الفني")}
                    </Link>
                    <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                    <span className="font-semibold text-gray-900">#{ticket?.id?.slice(0, 8)}</span>
                </div>

                {/* Ticket Info Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 mb-2">{ticket?.title}</h1>
                            <p className="text-gray-600 text-sm leading-relaxed">{ticket?.description}</p>
                        </div>
                        <div className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(ticket?.status?.code)}`}>
                            {lang === 'ar' ? ticket?.status?.name_ar : ticket?.status?.name_en}
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {dayjs(ticket?.created_at).format('DD/MM/YYYY hh:mm A')}
                        </div>
                        {ticket?.related_order && (
                            <div className="flex items-center gap-1">
                                <span className="font-medium text-gray-500">{t("ticket.relatedOrder", "طلب مرتبط:")}</span>
                                #{ticket.related_order.id.slice(0, 8)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            {t("ticket.chatTitle", "المحادثة مع الدعم الفني")}
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                        {isLoadingMessages ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : messagesList.length === 0 ? (
                            <div className="text-center py-20 text-gray-400">
                                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>{t("ticket.noMessages", "لا توجد رسائل بعد. ابدأ المحادثة!")}</p>
                            </div>
                        ) : (
                            messagesList.map((msg) => {
                                const isMe = msg.sender_id === userId;
                                // Assuming Admin doesn't have the same ID as User. 
                                // If sender_id is NOT userId, it's Admin (or Support).
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                                        <div className={`flex max-w-[80%] ${isMe ? 'flex-row' : 'flex-row-reverse'} items-end gap-2`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border 
                                        ${isMe ? 'bg-gray-100 border-gray-200' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                                                {isMe ? <User className="w-4 h-4 text-gray-500" /> : <div className="text-xs font-bold">AD</div>}
                                            </div>
                                            <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                                        ${isMe
                                                    ? 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                                                    : 'bg-primary text-white rounded-br-none'
                                                }`}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                            <input
                                type="text"
                                className="flex-1 bg-transparent border-none outline-none px-2 text-sm text-gray-700 placeholder:text-gray-400"
                                placeholder={t("ticket.typeMessage", "اكتب رسالتك هنا...")}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                disabled={ticket?.status?.code === 'closed'}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isSending || !newMessage.trim() || ticket?.status?.code === 'closed'}
                                className="p-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-all shadow-sm"
                            >
                                {isSending ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5 rtl:rotate-180" />
                                )}
                            </button>
                        </div>
                        {ticket?.status?.code === 'closed' && (
                            <p className="text-xs text-red-500 mt-2 text-center text-center font-medium opacity-80">
                                {t("ticket.closedMessage", "هذه التذكرة مغلقة ولا يمكن إرسال رسائل جديدة.")}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetails;
