
"use client";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetProjectMessagesQuery, useAddProjectMessageMutation } from "@/redux/api/ordersApi";
import { Send, User } from "lucide-react";
import toast from "react-hot-toast";

const ProjectChat = ({ orderId, userId, title }) => {
    const { t } = useTranslation();
    const [newMessage, setNewMessage] = useState("");
    const { data: messagesData, refetch: refetchMessages } = useGetProjectMessagesQuery({ orderId, PageNumber: 1, PageSize: 50 });
    const [addMessage, { isLoading }] = useAddProjectMessageMutation();

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        console.log("Attempting to send message:", { orderId, userId, message: newMessage });

        if (!orderId || !userId) {
            console.error("Cannot send message: Missing orderId or userId", { orderId, userId });
            const missing = [];
            if (!orderId) missing.push("Order ID");
            if (!userId) missing.push("User ID");
            toast.error(`Error: Missing chat context (${missing.join(", ")})`);
            return;
        }

        try {
            await addMessage({ orderId, senderId: userId, message: newMessage }).unwrap();
            setNewMessage("");
            refetchMessages();
        } catch (error) {
            console.error("Failed to send message:", error);
            // toast.error(t("project.sendMessageError", "فشل إرسال الرسالة")); // Uncomment if you have this translation key
            toast.error("Fialed to send message: " + (error?.data?.message || error?.message || "Unknown error"));
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm h-full flex flex-col">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                {title || t("project.chat", "الرسائل / المحادثة")}
            </h3>

            <div className="flex-1 space-y-3 max-h-80 overflow-y-auto mb-4 p-2 bg-gray-50 rounded-lg">
                {(!messagesData || messagesData.length === 0) && (
                    <div className="text-center text-gray-400 text-xs py-10">
                        {t("project.noMessages", "لا توجد رسائل بعد")}
                    </div>
                )}

                {[...(messagesData || [])].reverse().map((m) => {
                    const isMe = m.sender_id === userId;
                    return (
                        <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {m.sender?.avatar_url ? (
                                        <img src={m.sender.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-3 h-3 text-gray-500" />
                                    )}
                                </div>
                                <div className={`p-2 rounded-2xl text-xs break-words px-3 py-2
                        ${isMe ? "bg-primary text-white rounded-br-none" : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"}
                    `}>
                                    {m.message}
                                </div>
                            </div>
                            <div className={`text-[10px] text-gray-400 mt-1 px-9`}>
                                {m.sender?.full_name || m.sender?.name || (isMe ? t("me", "أنا") : "-")} • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-auto flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <input
                    className="flex-1 bg-transparent border-none outline-none text-sm px-2"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t("project.writeMessage", "اكتب رسالتك هنا...")}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                />
                <button
                    className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    onClick={handleSendMessage}
                    disabled={isLoading || !newMessage.trim()}
                >
                    {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4 rtl:rotate-180" />}
                </button>
            </div>
        </div>
    );
};

export default ProjectChat;
