"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { useGetDeliverablesQuery, useUpdateDeliverableStatusMutation } from "@/redux/api/ordersApi";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { FileText, Download, CheckCircle, XCircle, Clock } from "lucide-react";

const ProjectDeliverables = ({ orderId, isProvider = false }) => {
    const { t } = useTranslation();
    const { data: deliverables = [], isLoading, refetch } = useGetDeliverablesQuery({ orderId }, {
        skip: !orderId,
        pollingInterval: 10000
    });

    const [updateStatus, { isLoading: isUpdating }] = useUpdateDeliverableStatusMutation();

    const handleStatusUpdate = async (deliverableId, status, responseText) => {
        try {
            await updateStatus({
                deliverableId,
                status,
                requesterResponse: responseText // optional reason/note
            }).unwrap();
            toast.success(status === 'accepted' ? t("deliverables.accepted") : t("deliverables.rejected"));
            refetch();
        } catch {
            toast.error(t("common.error"));
        }
    };

    if (!orderId) return null;

    if (isLoading) return <div className="p-8 text-center text-gray-400 animate-pulse">{t("common.loading")}...</div>;

    if (deliverables.length === 0) {
        return (
            <div className="bg-gray-50/50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200 mt-8">
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">{t("deliverables.empty") || "لا توجد تسليمات حتى الآن"}</p>
                <p className="text-xs text-gray-400 mt-1">{t("deliverables.emptySub") || "سيقوم مزود الخدمة برفع الملفات هنا قريباً"}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-custom mt-8 overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-gray-50/50 to-white px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="font-black text-2xl text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <FileText className="w-6 h-6 text-primary" />
                        </div>
                        {t("deliverables.title") || "تسليمات وتطورات المشروع"}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1 ml-11 rtl:mr-11">{t("deliverables.subtitle") || "تابع تقدم العمل وحمل الملفات المسلمة"}</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-wider">{t("common.total") || "الإجمالي"}</span>
                    <span className="text-xl font-black text-primary">
                        {deliverables.length}
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 whitespace-nowrap w-16 text-center">#</th>
                            <th className="px-6 py-4 whitespace-nowrap">{t("common.title") || "المرحلة / العنوان"}</th>
                            <th className="px-6 py-4 whitespace-nowrap">{t("common.date") || "التاريخ"}</th>
                            <th className="px-6 py-4 whitespace-nowrap">{t("common.status") || "الحالة"}</th>
                            <th className="px-6 py-4 whitespace-nowrap">{t("common.attachments") || "المرفقات"}</th>
                            <th className="px-6 py-4 whitespace-nowrap">{t("common.actions") || "الإجراءات"}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {deliverables.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-5 align-top">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200">
                                        {index + 1}
                                    </div>
                                </td>
                                <td className="px-6 py-5 align-top">
                                    <h4 className="font-bold text-gray-900 text-base mb-1">{item.title}</h4>
                                    {item.description && (
                                        <p className="text-sm text-gray-500 line-clamp-2 hover:line-clamp-none transition-all duration-300 max-w-xs leading-relaxed">
                                            {item.description}
                                        </p>
                                    )}
                                    {item.requester_response && (
                                        <div className={`mt-3 p-3 rounded-xl text-xs w-fit max-w-xs animate-fade-in ${item.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                            }`}>
                                            <span className="font-bold block mb-1">{t("common.feedback") || "ملاحظات العميل"}:</span>
                                            <span className="italic">"{item.requester_response}"</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-5 align-top whitespace-nowrap text-sm text-gray-500 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-300" />
                                        <span className="dir-ltr">{dayjs(item.created_at).format("YYYY-MM-DD")}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 mr-6 dir-ltr">{dayjs(item.created_at).format("HH:mm")}</div>
                                </td>
                                <td className="px-6 py-5 align-top">
                                    <StatusBadge status={item.status} t={t} />
                                </td>
                                <td className="px-6 py-5 align-top">
                                    {item.delivery_file_url ? (
                                        <a
                                            href={item.delivery_file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-primary/5 hover:bg-primary/10 text-primary px-3 py-2 rounded-lg text-xs font-bold transition-all border border-primary/10 hover:border-primary/20"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            {t("common.download") || "تحميل"}
                                        </a>
                                    ) : (
                                        <span className="text-gray-300 text-xs italic">--</span>
                                    )}
                                </td>
                                <td className="px-6 py-5 align-top">
                                    {!isProvider && (item.status === 'pending' || item.status === 'under_review') ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                disabled={isUpdating}
                                                onClick={() => handleStatusUpdate(item.id, 'accepted')}
                                                title={t("common.accept") || "قبول"}
                                                className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition border border-emerald-100"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                            <button
                                                disabled={isUpdating}
                                                onClick={() => {
                                                    const reason = window.prompt(t("deliverables.rejectReason") || "سبب الرفض؟");
                                                    if (reason !== null) {
                                                        handleStatusUpdate(item.id, 'rejected', reason);
                                                    }
                                                }}
                                                title={t("common.reject") || "رفض"}
                                                className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition border border-rose-100"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-gray-300 text-xs">--</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const StatusBadge = ({ status, t }) => {
    const styles = {
        pending: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-100",
        under_review: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-100",
        accepted: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100",
        rejected: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-100",
    };

    const icons = {
        pending: <Clock className="w-3 h-3" />,
        under_review: <Clock className="w-3 h-3" />,
        accepted: <CheckCircle className="w-3 h-3" />,
        rejected: <XCircle className="w-3 h-3" />,
    };

    const labels = {
        pending: t("status.pending") || "قيد الانتظار",
        under_review: t("status.under_review") || "تحت المراجعة",
        accepted: t("status.accepted") || "مقبول",
        rejected: t("status.rejected") || "مرفوض",
    };

    return (
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ring-1 ring-inset ${styles[status] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
            {icons[status]}
            {labels[status] || status}
        </span>
    );
};

export default ProjectDeliverables;
