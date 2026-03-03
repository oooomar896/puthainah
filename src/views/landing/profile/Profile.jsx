import { useEffect, useState } from "react";
import WelcomeTitle from "../../../components/landing-components/profile-components/welcomeTitle";
import DashboardInfo from "../../../components/landing-components/profile-components/DashboardInfo";
import Services from "../../../components/landing-components/profile-components/Services";
import Messages from "../../../components/landing-components/profile-components/Messages";
import Support from "../../../components/landing-components/profile-components/Support";
import RecentRequests from "../../../components/landing-components/profile-components/RecentRequests";
import { useGetUserOrdersQuery } from "../../../redux/api/ordersApi";
import Link from "next/link";
import { useGetRequesterByUserIdQuery } from "../../../redux/api/usersDetails";
import { useSelector } from "react-redux";
import LoadingPage from "../../LoadingPage";
import UserData from "../../../components/shared/profile-details/UserData";
import SuspendModal from "../../../components/shared/suspend-modal/SuspendModal";
import AttachmentsTable from "../../../components/admin-components/projects/AttachmentsTable";
import { useGetTicketsQuery } from "../../../redux/api/ticketApi";
import { useGetRequesterStatisticsQuery } from "../../../redux/api/projectsApi";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

import {
  Check,
  Clock,
  ListChecks,
  Play,
  ShieldCheck,
  Wallet,
} from "lucide-react";

const Profile = () => {
  const { t } = useTranslation();
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [openSuspend, setOpenSuspend] = useState(false);
  const userId = useSelector((state) => state.auth.userId);
  const { data: requesterDataResult, refetch, isLoading } = useGetRequesterByUserIdQuery(userId, { skip: !userId });
  const data = Array.isArray(requesterDataResult) ? requesterDataResult[0] : requesterDataResult;
  useEffect(() => {
    const createdAt = data?.creationTime || data?.creation_time || data?.created_at;
    if (createdAt) {
      try {
        const date = new Date(createdAt);
        setFormattedDate(
          date.toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        );
      } catch {
        setFormattedDate("");
      }
    } else {
      setFormattedDate("");
    }
  }, [data]);
  const { data: userOrders } = useGetUserOrdersQuery({
    PageNumber: 1,
    PageSize: 5,
    requesterId: data?.id
  }, { skip: !data?.id });
  const {
    data: tickets,
    refetch: refetchTickets,
    isLoading: isLoadingTickets,
  } = useGetTicketsQuery(userId, { skip: !userId });
  const { data: projectsStats } = useGetRequesterStatisticsQuery({ requesterId: data?.id }, { skip: !data?.id });

  const projectStatistics = [
    {
      number: projectsStats?.totalRequests ?? 0,
      title: t("profile.stats.totalRequests") || "إجمالي الطلبات",
      icon: <Wallet />,
      color: "#F9FDF1",
      ic: true,
    },
    {
      number: projectsStats?.newRequests ?? 0,
      title: t("profile.stats.newRequests") || "طلبات جديدة",
      icon: <Clock />,
      color: "#FFF4E5",
      ic: true,
    },
    {
      number: projectsStats?.pricedRequests ?? 0,
      title: t("profile.stats.priced") || "بانتظار الموافقة",
      icon: <Play />,
      color: "#F0F7FF",
      ic: true,
    },
    {
      number: projectsStats?.totalOrders ?? 0,
      title: t("profile.stats.totalOrders") || "إجمالي المشاريع",
      icon: <ListChecks />,
      color: "#EAF9F0",
      ic: true,
    },
    {
      number: projectsStats?.ongoing ?? 0,
      title: t("profile.stats.ongoing") || "قيد التنفيذ",
      icon: <Check />,
      color: "#F1F1FD",
      ic: true,
    },
    {
      number: projectsStats?.completed ?? 0,
      title: t("profile.stats.completed") || "مكتملة",
      icon: <ShieldCheck />,
      color: "#FDF6F1",
      ic: true,
    },
  ];

  if (isLoading || !data || isLoadingTickets) {
    return <LoadingPage />;
  }
  return (
    <div className="pt-6">
      <title>{t("mobileMenu.myProfile")}</title>
      <meta name="description" content={t("profile.subtitle")} />
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex flex-col xl:gap-8 lg:gap-6 md:gap-5 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <WelcomeTitle
                  name={data?.name ?? data?.fullName}
                  joinAt={data?.creationTime}
                  data={data}
                  refetch={refetch}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <UserData data={data} refetch={refetch} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <DashboardInfo
                  stats={projectStatistics}
                  title={t("profile.dashboard")}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                <RecentRequests orders={userOrders?.data || []} />
              </motion.div>
              <Services />
              <Messages tickets={tickets} />
              <Support refetch={refetchTickets} />
            </div>

            <SuspendModal open={openSuspend} setOpen={setOpenSuspend} />
            {/* تاريخ الاشتراك */}
            <div className="w-fit mt-4">
              <div className="border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-2 text-sm font-bold text-gray-500 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                {t("profile.joinedSince", { date: formattedDate })}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <AttachmentsTable attachments={data?.attachments} />
            </div>
            <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <button
                onClick={() => setOpenSuspend(true)}
                className="w-full bg-red-600 py-2 px-4 rounded-lg text-white font-medium flex items-center justify-center gap-2"
              >
                {t("profile.suspendAccount")}
              </button>
            </div>
            <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h4 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                {t("profile.quickActions") || "إجراءات سريعة"}
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <Link href="/request-service" className="group flex items-center justify-between w-full bg-primary/[0.03] text-primary border border-primary/10 hover:bg-primary hover:text-white transition-all duration-300 rounded-xl px-4 py-3 font-bold text-sm">
                  <span className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    {t("navSeeker.postRequest") || "طلب خدمة جديدة"}
                  </span>
                  <span className="rtl:rotate-180 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
                <Link href="/requests" className="group flex items-center justify-between w-full bg-gray-50 text-gray-700 border border-gray-100 hover:bg-gray-800 hover:text-white transition-all duration-300 rounded-xl px-4 py-3 font-bold text-sm">
                  <span className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
                    {t("navSeeker.explore") || "تصفح طلباتي"}
                  </span>
                  <span className="rtl:rotate-180 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
                <Link href="/support" className="group flex items-center justify-between w-full bg-gray-50 text-gray-700 border border-gray-100 hover:bg-gray-800 hover:text-white transition-all duration-300 rounded-xl px-4 py-3 font-bold text-sm">
                  <span className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    {t("navSeeker.support") || "الدعم الفني"}
                  </span>
                  <span className="rtl:rotate-180 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
