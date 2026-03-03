
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import { Check, Clock, DollarSign, UserCheck, CheckCircle2, AlertCircle } from "lucide-react";
import dayjs from "dayjs";

const RequestLifecycle = ({ request }) => {
    const { t } = useTranslation();
    const { lang } = useContext(LanguageContext);

    if (!request) return null;

    // Helper to format currency
    function formatPrice(price) {
        return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
            style: 'currency',
            currency: 'SAR',
            maximumFractionDigits: 0
        }).format(price);
    }

    // Helper to format date
    function formatDate(date) {
        if (!date) return null;
        return dayjs(date).format("DD/MM/YYYY");
    }

    // Status Checkers
    const isPriced = !!request.admin_price || !!request.servicePrice; // Assuming admin_price is the one
    const isPaid = request.payment_status === 'paid' || request.status?.code === 'paid' || [204, 11, 13, 15, 17, 18].includes(request.status_id);
    const isExecution = [11, 13, 15, 17, 18].includes(request.status_id) || request.provider_response === 'accepted';
    const isCompleted = request.status_id === 11 || request.status?.code === 'completed';

    // Steps Definition
    const steps = [
        {
            id: "new",
            label: "طلب جديد",
            icon: <Clock className="w-5 h-5" />,
            status: "completed", // Always valid if we see the request
            date: request.created_at,
            description: t("requestSteps.received", "تم استلام الطلب"),
        },
        {
            id: "priced",
            label: "مرحلة التسعير",
            icon: <DollarSign className="w-5 h-5" />,
            status: isPriced ? "completed" : "current",
            date: isPriced ? request.updated_at : null, // Approximate
            description: isPriced
                ? formatPrice(request.admin_price || request.servicePrice)
                : t("requestSteps.waitingPrice", "بانتظار التسعير"),
        },
        {
            id: "paid",
            label: "مرحلة الدفع",
            icon: <CheckCircle2 className="w-5 h-5" />,
            status: isPaid ? "completed" : (isPriced ? "current" : "pending"),
            date: isPaid ? (request.payment_date || request.updated_at) : null,
            description: isPaid
                ? t("requestSteps.paid", "تم الدفع")
                : t("requestSteps.waitingPayment", "بانتظار الدفع"),
        },
        {
            id: "execution",
            label: "مرحلة التنفيذ",
            icon: <UserCheck className="w-5 h-5" />,
            status: isExecution ? "completed" : (isPaid ? "current" : "pending"),
            date: isExecution ? (request.provider_assigned_at || request.updated_at) : null,
            description: isExecution
                ? (request.provider?.name ? `${t("requestSteps.with", "مع")} ${request.provider.name}` : t("requestSteps.processing", "جاري التنفيذ"))
                : t("requestSteps.waitingExecution", "قيد الانتظار"),
        },
        {
            id: "completed",
            label: "مكتمل",
            icon: <Check className="w-5 h-5" />,
            status: isCompleted ? "completed" : (isExecution ? "current" : "pending"),
            date: isCompleted ? (request.completed_at || request.updated_at) : null,
            description: isCompleted
                ? t("requestSteps.done", "تم الإنجاز")
                : "",
        }
    ];

    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 mb-8 overflow-hidden relative">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-0" />

            <h3 className="text-xl font-bold mb-10 text-gray-800 flex items-center gap-3 relative z-10">
                <span className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                    <CheckCircle2 className="w-6 h-6" />
                </span>
                {t("requestLifecycle.title") || "دورة حياة الطلب"}
            </h3>

            <div className="relative px-4">
                {/* Connecting Line - Background */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-gray-100 rounded-full -z-0 mx-10" />

                {/* Connecting Line - Progress (Green) */}
                {/* This would need dynamic width calculation based on "completed" steps count */}
                <div
                    className="absolute top-6 right-0 h-1 bg-green-500 rounded-full -z-0 mx-10 transition-all duration-1000 ease-out rtl:left-auto rtl:origin-right ltr:origin-left"
                    style={{
                        width: `${(steps.filter(s => s.status === 'completed').length / (steps.length - 1)) * 100}%`
                    }}
                />

                <div className="flex justify-between relative z-10 w-full">
                    {steps.map((step, idx) => {
                        const isCompleted = step.status === 'completed';
                        const isCurrent = step.status === 'current';
                        // const isPending = step.status === 'pending';

                        let circleClass = "bg-white border-2 border-gray-200 text-gray-300";
                        let ringClass = "";

                        if (isCompleted) {
                            circleClass = "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30";
                        } else if (isCurrent) {
                            circleClass = "bg-white border-2 border-blue-500 text-blue-500 animate-pulse";
                            ringClass = "ring-4 ring-blue-500/10";
                        }

                        return (
                            <div key={step.id} className="flex flex-col items-center relative group min-w-[100px]">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 z-20 ${circleClass} ${ringClass}`}>
                                    {isCompleted ? <Check className="w-6 h-6" strokeWidth={3} /> : step.icon}
                                </div>

                                <div className={`mt-4 text-center transition-all duration-300 flex flex-col items-center gap-1 ${isCurrent ? 'transform scale-105' : ''}`}>
                                    <span className={`text-sm font-bold ${isCompleted ? 'text-green-700' : (isCurrent ? 'text-blue-700' : 'text-gray-400')}`}>
                                        {step.label}
                                    </span>

                                    {step.description && (
                                        <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 max-w-[120px] truncate">
                                            {step.description}
                                        </span>
                                    )}

                                    {isCompleted && step.date && (
                                        <span className="text-[10px] text-gray-400 font-mono mt-1 dir-ltr">
                                            {formatDate(step.date)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default RequestLifecycle;
