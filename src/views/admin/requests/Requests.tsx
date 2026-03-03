import React, { useEffect } from "react";
import RequestsTable from "@/components/admin-components/requests/RequestsTable";
import { useTranslation } from "react-i18next";
import { useGetRequestsStatisticsQuery } from "@/redux/api/adminStatisticsApi";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";
import { ClipboardList, Clock, CheckCircle2, XCircle, Wallet, MapPin } from "lucide-react";

const Requests = () => {
    const { t } = useTranslation();
    const {
        data: requestsStats,
        isLoading: statsLoading,
        isError: statsError,
        refetch: refetchStats
    } = useGetRequestsStatisticsQuery({});

    useEffect(() => {
        window.scrollTo(0, 0);
        refetchStats();
    }, [refetchStats]);

    if (statsLoading) {
        return <TablePageSkeleton />;
    }

    const statCards = [
        {
            title: t("requests.stats.total"),
            value: requestsStats?.totalRequestsCount || 0,
            icon: <ClipboardList className="w-6 h-6" />,
            color: "from-blue-500 to-blue-600",
            lightColor: "bg-blue-50",
            textColor: "text-blue-600",
        },
        {
            title: t("requests.stats.new"),
            value: requestsStats?.newRequestsCount || 0,
            icon: <Clock className="w-6 h-6" />,
            color: "from-indigo-500 to-indigo-600",
            lightColor: "bg-indigo-50",
            textColor: "text-indigo-600",
        },
        {
            title: t("requests.stats.priced"),
            value: requestsStats?.underProcessingRequestsCount || 0,
            icon: <Clock className="w-6 h-6" />,
            color: "from-amber-500 to-amber-600",
            lightColor: "bg-amber-50",
            textColor: "text-amber-600",
        },
        {
            title: t("requests.stats.waitingPayment"),
            value: requestsStats?.waitingForPaymentRequestsCount || 0,
            icon: <Wallet className="w-6 h-6" />,
            color: "from-rose-500 to-rose-600",
            lightColor: "bg-rose-50",
            textColor: "text-rose-600",
        },
    ];

    return (
        <div className="p-6 md:p-10 space-y-10 min-h-screen bg-[#F8F9FA]">
            <title>{t("requests.title")}</title>

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        {t("requests.title")}
                    </h1>
                    <p className="text-gray-500 flex items-center gap-2 font-medium">
                        <MapPin className="w-4 h-4 text-primary" />
                        {t("requests.description")}
                    </p>
                </div>
            </header>

            {/* Statistics Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="relative group bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-2 h-full bg-gradient-to-b ${stat.color} opacity-80`} />
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">
                                    {stat.title}
                                </p>
                                <p className="text-3xl font-black text-gray-900 leading-none">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`p-4 ${stat.lightColor} ${stat.textColor} rounded-2xl transition-transform duration-300 group-hover:scale-110 shadow-inner`}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {/* Table Section */}
            <main className="relative bg-white rounded-[40px] p-8 shadow-sm border border-gray-50 border-t-4 border-t-primary">
                {statsError && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center mb-6 font-medium">
                        {t("common.errorLoadingData")}
                    </div>
                )}

                <RequestsTable stats={requestsStats} />
            </main>
        </div>
    );
};

export default Requests;
