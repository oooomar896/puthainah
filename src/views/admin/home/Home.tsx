import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetAdminStatisticsQuery } from "@/redux/api/adminStatisticsApi";
import { useGetPaymentsQuery } from "@/redux/api/paymentApi";
import {
  Users,
  UserPlus,
  UserCheck,
  ClipboardList,
  Wallet,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";
import { tr as trHelper } from "@/utils/tr";
import { formatAmount } from "@/utils/format";

const Home = () => {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useGetAdminStatisticsQuery({});
  const { data: paymentsData } = useGetPaymentsQuery({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const tr = (key: string, fallback: string) => trHelper(t, key, fallback);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) return <TablePageSkeleton />;

  const totalAmountNum = typeof stats?.totalFinancialAmounts === "number" ? stats.totalFinancialAmounts : Number(stats?.totalFinancialAmounts || 0);
  const currencyLabel = tr("currency", "SAR");
  const mainStats = [
    {
      title: t("homeAdmin.users"),
      value: stats?.totalUsers || 0,
      icon: <Users className="w-6 h-6" />,
      color: "from-blue-600 to-indigo-600",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
      link: "/admin/requesters",
      subStats: [
        { label: t("homeAdmin.requesters"), value: stats?.totalRequesters || 0 },
        { label: t("homeAdmin.providers"), value: stats?.totalProviders || 0 },
      ]
    },
    {
      title: t("homeAdmin.requests"),
      value: stats?.totalRequests || 0,
      icon: <ClipboardList className="w-6 h-6" />,
      color: "from-emerald-600 to-teal-600",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      link: "/admin/requests",
      subStats: [
        { label: t("requests.stats.new") || "طلبات جديدة", value: stats?.newRequestsCount || 0 },
        { label: t("requests.stats.paid") || "طلبات مدفوعة", value: stats?.paidRequestsCount || 0 },
      ]
    },
    {
      title: t("projects.title") || "المشاريع",
      value: stats?.totalProjects || 0,
      icon: <Briefcase className="w-6 h-6" />,
      color: "from-amber-600 to-orange-600",
      lightColor: "bg-amber-50",
      textColor: "text-amber-600",
      link: "/admin/projects",
      subStats: [
        { label: t("homeAdmin.totalOrders"), value: stats?.totalOrders || 0 },
      ]
    },
    {
      title: t("homeAdmin.financialTransactions"),
      value: formatAmount(totalAmountNum, currencyLabel),
      icon: <Wallet className="w-6 h-6" />,
      color: "from-purple-600 to-pink-600",
      lightColor: "bg-purple-50",
      textColor: "text-purple-600",
      link: "/admin/payments",
      subStats: [
        { label: t("homeAdmin.totalAmount"), value: totalAmountNum || 0 },
      ]
    }
  ];

  return (
    <div className="p-6 md:p-10 space-y-10 min-h-screen bg-[#F8F9FA]">
      <title>{t("homeAdmin.title")}</title>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            {t("homeAdmin.title")}
            <span className="text-xl font-medium text-gray-400 bg-white px-4 py-1 rounded-2xl border border-gray-100 shadow-sm">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </h1>
          <p className="text-gray-500 font-medium max-w-2xl">
            {t("homeAdmin.description")}
          </p>
        </div>

        <div className="flex gap-3">
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("homeAdmin.performance") || "الأداء العام"}</p>
              <p className="text-lg font-black text-gray-900">+12.5%</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => (
          <Link href={stat.link} key={index} className="group relative bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden flex flex-col justify-between min-h-[280px]">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity blur-3xl rounded-full -mr-12 -mt-12`} />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className={`p-4 ${stat.lightColor} ${stat.textColor} rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                  {stat.icon}
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  {stat.title}
                </p>
                <p className="text-3xl font-black text-gray-900 leading-none">
                  {stat.value}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50 space-y-3 relative z-10">
              {stat.subStats.map((sub, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">{sub.label}</span>
                  <span className="font-bold text-gray-900">{sub.value}</span>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </section>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Mock or Actual */}
        <section className="lg:col-span-2 bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-150" />

          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-2xl font-black text-gray-900">{t("homeAdmin.activity") || "آخر النشاطات"}</h2>
            <button className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              {t("viewAll") || "عرض الكل"} <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-6 relative z-10">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-6 p-4 rounded-3xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                  #{item}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">
                    {item === 1 ? "طلب صيانة جديد من شركة الأمل" : item === 2 ? "اكتمال مشروع توريد مواد بناء" : "تسجيل مزود خدمة جديد: م. خالد"}
                  </p>
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3" /> منذ {item * 5} دقائق
                  </p>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  نشط
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-primary to-indigo-700 rounded-[40px] p-10 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mb-32 -mr-32" />
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 blur-2xl rounded-full -mt-16 -ml-16" />

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <Briefcase className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black leading-tight">
                {tr("homeAdmin.quickActions", "إجراءات سريعة")}
              </h2>
              <p className="text-white/70 font-medium">
                {tr("homeAdmin.quickActionsDesc", "إدارة العمليات اليومية بكفاءة عالية من خلال لوحة التحكم")}
              </p>
            </div>

            <div className="space-y-3">
              <button className="w-full bg-white text-primary font-black py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95">
                {tr("homeAdmin.generateReport", "إنشاء تقرير شهري")}
              </button>
              <button className="w-full bg-white/10 backdrop-blur-md text-white font-bold py-4 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                {tr("homeAdmin.contactSupport", "تواصل مع الدعم الفني")}
              </button>
            </div>
          </div>
        </section>

        <section className="lg:col-span-3 bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900">{tr("homeAdmin.wallet", "المحفظة")}</h2>
            <span className="text-sm font-bold text-gray-700">
              {tr("homeAdmin.totalAmount", "إجمالي المبالغ")}: {formatAmount(totalAmountNum, currencyLabel)}
            </span>
          </div>
          <div className="space-y-3">
            {(Array.isArray(paymentsData) ? paymentsData : (paymentsData?.data || [])).slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-gray-50">
                <div className="min-w-0">
                  <div className="font-bold text-gray-900 truncate">
                    {p.order?.order_title || p.request_id ? `${tr("homeAdmin.requestPayment", "دفعة طلب")} #${String(p.request_id).substring(0, 8)}` : tr("homeAdmin.payment", "دفعة")}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {new Date(p.created_at).toLocaleString("ar-EG")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-emerald-700">
                    {formatAmount(Number(p.amount || 0), p.currency || currencyLabel)}
                  </div>
                  <div className={`text-[11px] font-bold ${String(p.payment_status).includes("paid") ? "text-emerald-600" : "text-gray-500"}`}>
                    {p.payment_status || p.status || "pending"}
                  </div>
                </div>
              </div>
            ))}
            {(!paymentsData || (Array.isArray(paymentsData) ? paymentsData.length === 0 : (paymentsData?.data || []).length === 0)) && (
              <div className="text-gray-500 text-sm">{tr("homeAdmin.noPayments", "لا توجد معاملات مالية")}</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
