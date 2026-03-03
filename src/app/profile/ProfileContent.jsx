"use client";

import { useEffect, useState } from "react";
import WelcomeTitle from "@/components/landing-components/profile-components/welcomeTitle";
import DashboardInfo from "@/components/landing-components/profile-components/DashboardInfo";
import Services from "@/components/landing-components/profile-components/Services";
import RecentRequests from "@/components/landing-components/profile-components/RecentRequests";
import Messages from "@/components/landing-components/profile-components/Messages";
import Support from "@/components/landing-components/profile-components/Support";
import LoadingPage from "@/views/LoadingPage";
import UserData from "@/components/shared/profile-details/UserData";
import SuspendModal from "@/components/shared/suspend-modal/SuspendModal";
import AttachmentsTable from "@/components/admin-components/projects/AttachmentsTable";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import {
  Check,
  Clock,
  ListChecks,
  Play,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import ProfileModal from "@/components/shared/profile-modal/ProfileModal";
import { useRouter } from "next/navigation";

const ProfileContent = ({ requester, tickets, stats, recentOrders, pageNumber, pageSize }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [openSuspend, setOpenSuspend] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const handleRefresh = () => {
    router.refresh();
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pageNumber]);

  const projectStatistics = [
    {
      number: stats?.totalOrdersCount ?? 0,
      title: t("profile.stats.totalOrders"),
      icon: <Wallet className="w-5 h-5" />,
      color: "bg-blue-50",
      textColor: "text-blue-600",
      ic: true,
    },
    {
      number: stats?.waitingForApprovalOrdersCount ?? 0,
      title: t("profile.stats.waitingApproval"),
      icon: <Clock className="w-5 h-5" />,
      color: "bg-amber-50",
      textColor: "text-amber-600",
      ic: true,
    },
    {
      number: stats?.waitingToStartOrdersCount ?? 0,
      title: t("profile.stats.waitingStart"),
      icon: <Play className="w-5 h-5" />,
      color: "bg-indigo-50",
      textColor: "text-indigo-600",
      ic: true,
    },
    {
      number: stats?.ongoingOrdersCount ?? 0,
      title: t("profile.stats.ongoing"),
      icon: <ListChecks className="w-5 h-5" />,
      color: "bg-teal-50",
      textColor: "text-teal-600",
      ic: true,
    },
    {
      number: stats?.completedOrdersCount ?? 0,
      title: t("profile.stats.completed"),
      icon: <Check className="w-5 h-5" />,
      color: "bg-emerald-50",
      textColor: "text-emerald-600",
      ic: true,
    },
    {
      number: stats?.rejectedOrdersCount ?? 0,
      title: t("profile.stats.rejected") || "مرفوض",
      icon: <ShieldCheck className="w-5 h-5" />,
      color: "bg-rose-50",
      textColor: "text-rose-600",
      ic: true,
    },
  ];

  if (!requester?.id) {
    return (
      <div className="pt-6 pb-20 bg-gray-50/30 min-h-screen">
        <div className="container px-4 md:px-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center space-y-4">
            <h2 className="text-xl font-black text-gray-900">لا توجد بيانات بروفايل</h2>
            <p className="text-gray-500 text-sm">أكمل بياناتك لإنشاء سجل طالب خدمة.</p>
            <div className="flex items-center justify-center">
              <button
                onClick={() => setOpenEdit(true)}
                className="px-6 py-3 rounded-2xl bg-primary text-white font-black shadow-lg hover:bg-primary/90"
              >
                إكمال البيانات
              </button>
            </div>
            <ProfileModal open={openEdit} setOpen={setOpenEdit} data={requester} refetch={handleRefresh} />
          </div>
        </div>
      </div>
    );
  }


  const totalPages = Math.ceil((stats?.totalOrdersCount || 0) / pageSize);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    router.push(`/profile?PageNumber=${newPage}&PageSize=${pageSize}`);
  };

  return (
    <div className="pt-6 pb-20 bg-gray-50/30 min-h-screen">
      <title>{t("mobileMenu.myProfile")}</title>
      <meta name="description" content={t("profile.subtitle")} />
      <div className="container px-4 md:px-6">
        <div className="flex flex-col gap-10">
          {/* Top Section: Welcome & Actions */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WelcomeTitle
              name={requester?.name ?? requester?.fullName}
              joinAt={requester?.created_at}
              data={requester}
              onEdit={() => setOpenEdit(true)}
            />
          </m.div>

          {/* Stats Dashboard */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <DashboardInfo
              stats={projectStatistics}
              title={t("profile.dashboard") || "لوحة التحكم والإحصائيات"}
            />
          </m.div>

          {/* User Data Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <m.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <UserData data={requester} onEdit={() => setOpenEdit(true)} />
              </m.div>

              <div className="space-y-4">
                <RecentRequests orders={recentOrders} />

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      {t("common.page")} {pageNumber} {t("common.of")} {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(pageNumber - 1)}
                        disabled={pageNumber <= 1}
                        className="p-2 rounded-xl border border-gray-100 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5 flex-shrink-0 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handlePageChange(pageNumber + 1)}
                        disabled={pageNumber >= totalPages}
                        className="p-2 rounded-xl border border-gray-100 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5 flex-shrink-0 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Messages tickets={tickets} />
            </div>

            <div className="lg:col-span-1 space-y-8">
              <m.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {Array.isArray(requester?.attachments) && requester.attachments.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <AttachmentsTable attachments={requester.attachments} />
                  </div>
                )}
              </m.div>

              <Services />
              <Support />

              {/* Account Controls */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-4">{t("profile.accountControls") || "إعدادات الحساب"}</h4>
                <button
                  onClick={() => setOpenSuspend(true)}
                  className="w-full bg-rose-50 hover:bg-rose-100 py-3 px-4 rounded-2xl text-rose-600 font-bold flex items-center justify-center gap-2 transition-colors border border-rose-100"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {t("profile.suspendAccount")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <ProfileModal
          open={openEdit}
          setOpen={setOpenEdit}
          data={requester}
          refetch={handleRefresh}
        />
        <SuspendModal open={openSuspend} setOpen={setOpenSuspend} />
      </div>
    </div>
  );
};

export default ProfileContent;
