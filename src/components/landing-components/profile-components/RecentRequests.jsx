"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import "dayjs/locale/en";

const RecentRequests = ({ orders }) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === "rtl";

    if (!orders || orders.length === 0) {
        return (
            <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-3M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <h3 className="font-black text-gray-900 text-xl mb-2">{t("profile.recentActivity") || "آخر النشاطات"}</h3>
                <p className="text-gray-400 font-medium mb-8 max-w-xs mx-auto">{t("profile.noRecentActivity") || "لا توجد طلبات سابقة لعرضها حالياً"}</p>
                <Link href="/request-service" className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:-translate-y-0.5 transition-all inline-block">
                    {t("profile.startNewRequest") || "طلب خدمة جديدة"}
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div>
                    <h3 className="font-black text-gray-900 text-xl">{t("profile.recentActivity") || "آخر النشاطات"}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">{t("profile.trackRequests") || "متابعة حالة طلباتك الأخيرة"}</p>
                </div>
                <Link href="/requests" className="text-primary font-black text-xs uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all">
                    {t("common.viewAll") || "عرض الكل"}
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t("common.service") || "الخدمة"}</th>
                            <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t("common.date") || "التاريخ"}</th>
                            <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t("common.status") || "الحالة"}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {orders.map((item) => {
                            const service = item.request?.service || item.service || null;
                            const serviceName = service?.[isRtl ? "name_ar" : "name_en"] || item.request?.title || item.title || "-";
                            const statusObj = item.status || item.request?.status || null;
                            const statusName = statusObj?.[isRtl ? "name_ar" : "name_en"] || t("common.status");
                            const createdAt = item.created_at || item.request?.created_at;

                            return (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-3M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{serviceName}</div>
                                                <div className="text-[10px] text-gray-400 font-mono mt-1 tracking-tighter">ID: {item.id?.substring(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-gray-500 font-medium whitespace-nowrap">
                                        {createdAt ? dayjs(createdAt).locale(isRtl ? "ar" : "en").format("DD MMM YYYY") : "-"}
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all
                                        ${statusObj?.code === 'approved' || statusObj?.code === 'completed'
                                                ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                                                : statusObj?.code === 'under_processing' || statusObj?.code === 'initially_approved' || statusObj?.code === 'priced'
                                                    ? "border-blue-100 bg-blue-50 text-blue-600"
                                                    : statusObj?.code === 'rejected'
                                                        ? "border-rose-100 bg-rose-50 text-rose-600"
                                                        : "border-gray-100 bg-gray-50 text-gray-500"
                                            }`}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                            {statusName}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentRequests;
