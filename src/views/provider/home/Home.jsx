import { useEffect } from "react";
import NewOrders from "../../../components/provider-components/home-components/new-orders/NewOrders";
import InvitationsList from "../../../components/provider-components/home-components/invitations/InvitationsList";
import HeadTitle from "../../../components/shared/head-title/HeadTitle";
import {
  ListChecks,
  Hourglass,
  Clock,
  Loader,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  CalendarX,
  Star,
  Mail,
} from "lucide-react";
import Statistics from "../../../components/admin-components/home/statistics/Statistics";
import BarchartStats from "../../../components/shared/barChart/BarChart";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useGetProviderStatisticsQuery } from "../../../redux/api/providerStatisticsApi";
import { useGetProviderByUserIdQuery } from "../../../redux/api/usersDetails";

const Home = () => {
  const { t } = useTranslation();
  const userId = useSelector((state) => state.auth.userId);

  // Get provider ID from user details using the auth userId (UUID)
  const { data: providerData } = useGetProviderByUserIdQuery(userId, { skip: !userId });
  const providerId = Array.isArray(providerData) ? providerData[0]?.id : providerData?.id;

  // Get provider statistics
  const { data: providerStats } = useGetProviderStatisticsQuery(
    providerId,
    { skip: !providerId }
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const ordersStatistics = [
    {
      number: providerStats?.totalOrdersCount ?? 0,
      title: t("providerHome.totalOrders"),
      icon: <ListChecks className="w-7 h-7" />,
      color: "#F0F4FF",
      ic: true,
    },
  ];

  const ordersStats = [
    {
      number: providerStats?.waitingForApprovalOrdersCount ?? 0,
      title: t("providerHome.waitingApproval"),
      icon: <Hourglass className="w-6 h-6" />,
      color: "#FFF8E1",
      ic: true,
    },
    {
      number: providerStats?.waitingToStartOrdersCount ?? 0,
      title: t("providerHome.waitingStart"),
      icon: <Clock className="w-6 h-6" />,
      color: "#E1F5FE",
      ic: true,
    },
    {
      number: providerStats?.ongoingOrdersCount ?? 0,
      title: t("providerHome.ongoing"),
      icon: <Loader className="w-6 h-6 animate-spin" />,
      color: "#E8F5E9",
      ic: true,
    },
    {
      number: providerStats?.completedOrdersCount ?? 0,
      title: t("providerHome.completed"),
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: "#F1F8E9",
      ic: true,
    },
    {
      number: providerStats?.rejectedOrdersCount ?? 0,
      title: t("providerHome.rejected"),
      icon: <XCircle className="w-6 h-6" />,
      color: "#FFEBEE",
      ic: true,
    },
    {
      number: providerStats?.serviceCompletedOrdersCount ?? 0,
      title: t("providerHome.serviceCompleted"),
      icon: <ShieldCheck className="w-6 h-6" />,
      color: "#E8EAF6",
      ic: true,
    },
    {
      number: providerStats?.expiredOrdersCount ?? 0,
      title: t("providerHome.expired"),
      icon: <CalendarX className="w-6 h-6" />,
      color: "#FFF3E0",
      ic: true,
    },
    {
      number: providerStats?.averageRating ?? 0,
      title: t("providerHome.averageRating"),
      icon: <Star className="w-6 h-6 fill-current" />,
      color: "#FFFDE7",
      ic: true,
    },
  ];
  return (
    <div className="min-h-screen bg-gray-50/30">
      <title>{t("providerHome.title") || "الرئيسية"}</title>
      <meta name="description" content={t("providerHome.description") || "لوحة التحكم الخاصة بمزود الخدمة"} />

      <div className="container mx-auto px-4 py-10 max-w-7xl animate-fade-in">
        <div className="mb-10 text-center lg:text-start relative group">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <HeadTitle
            title={t("providerHome.title") || "الرئيسية"}
          />
          <p className="text-gray-400 mt-2 text-sm font-medium tracking-wide">
            {t("providerHome.welcomeBack") || "أهلاً بك مجدداً في لوحة التحكم الخاصة بك"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Statistics Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-4 rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 premium-gradient-primary opacity-10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <Statistics
                stats={ordersStatistics}
                title={t("providerHome.statisticsTitle")}
              />
            </div>

            <div className="p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-premium relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-500">
                  <Star className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">{t("providerHome.rating") || "التقييم العام"}</h4>
                  <p className="text-3xl font-black text-gray-800">{providerStats?.averageRating || "5.0"}</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="h-full premium-gradient-warning" style={{ width: `${(providerStats?.averageRating || 5) * 20}%` }} />
              </div>
            </div>
          </div>

          {/* Bar Chart Section */}
          <div className="lg:col-span-8">
            <div className="glass-card p-8 rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <div className="w-2 h-8 bg-primary rounded-full" />
                  {t("providerHome.analytics") || "تحليلات الأداء"}
                </h3>
              </div>
              <div className="h-[400px]">
                <BarchartStats data={ordersStats} />
              </div>
            </div>
          </div>
        </div>

        {/* Invitations Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-8 px-4">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-200 hover:scale-110 transition-transform">
                <Mail className="w-7 h-7" />
              </span>
              {t("providerHome.invitations") || "دعوات العمل الجديدة"}
              {providerId && (
                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                  {t("providerHome.limitedOffer") || "عرض السعر محدد"}
                </span>
              )}
            </h2>
            <div className="h-1 flex-1 mx-6 bg-gray-100 rounded-full hidden md:block" />
          </div>

          <div className="glass-card p-2 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl">
            <div className="bg-white rounded-[2.2rem] overflow-hidden">
              <InvitationsList providerId={providerId} />
            </div>
          </div>
        </div>

        {/* New Orders Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-8 px-4">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-200 hover:scale-110 transition-transform">
                <ListChecks className="w-7 h-7" />
              </span>
              {t("providerHome.newOrders") || "الطلبات الجديدة"}
            </h2>
            <div className="h-1 flex-1 mx-6 bg-gray-100 rounded-full hidden md:block" />
          </div>

          <div className="glass-card p-2 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl">
            <div className="bg-white rounded-[2.2rem] overflow-hidden">
              <NewOrders />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
