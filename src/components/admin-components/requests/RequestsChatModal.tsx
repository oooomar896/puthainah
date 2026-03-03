import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import RequestChat from "@/components/landing-components/request-service/RequestChat";
import { X } from "lucide-react";

interface RequestsChatModalProps {
    open: boolean;
    onClose: () => void;
    requestId: string | null;
    userId: string; // Admin User ID (Current User)
    ticketOwnerId: string; // Requester ID (Ticket Owner)
}

export default function RequestsChatModal({ open, onClose, requestId, userId, ticketOwnerId }: RequestsChatModalProps) {
    const { t } = useTranslation();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            className="relative z-50"
            style={{ direction: "rtl" }}
        >
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="relative sm:w-[600px] w-full py-4 px-6 transform overflow-hidden rounded-2xl bg-white text-right shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                            <h2 className="text-lg font-bold text-gray-800">
                                {t("tickets.chatTitle") || "محادثة الطلب"}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="w-full">
                            {requestId && (
                                <RequestChat
                                    requestId={requestId}
                                    userId={userId}
                                    ticketOwnerId={ticketOwnerId}
                                    orderId={null}
                                />
                            )}
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}
