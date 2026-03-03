"use client";
import React, { useEffect } from "react";
import HeadTitle from "../../../components/admin-components/users-details/HeadTitle";
import UserData from "../../../components/admin-components/users-details/UserData";
import { usePathname, useParams } from "next/navigation";
import {
  useGetProviderDetailsQuery,
  useGetRequesterDetailsQuery,
} from "../../../redux/api/usersDetails";
import LoadingPage from "../../LoadingPage";
import NotFound from "../../not-found/NotFound";
import AttachmentsTable from "../../../components/admin-components/projects/AttachmentsTable";
import Statistics from "@/components/admin-components/home/statistics/Statistics";
import { Wallet, Clock3, Check, Star, Ban } from "lucide-react"; // أيقونات افتراضية
import { useTranslation } from "react-i18next";
import { useGetProviderRequestsQuery } from "@/redux/api/ordersApi";

const ProviderRequestsSection = ({ providerId }) => {
  const { t, i18n } = useTranslation();
  const { data: providerRequests, isLoading } = useGetProviderRequestsQuery({
    providerId,
    PageNumber: 1,
    PageSize: 10,
  });
  if (isLoading) {
    return (
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="text-gray-400 text-sm">{t("common.loading") || "جاري التحميل..."}</div>
      </div>
    );
  }
  const isArabic = i18n?.language === "ar";
  const rows = Array.isArray(providerRequests) ? providerRequests : (providerRequests?.data || []);
  if (!rows || rows.length === 0) return null;
  return (
    <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h4 className="font-bold text-gray-800 text-sm mb-4">
        {t("userDetails.providerRequests") || "طلبات المزود"}
      </h4>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-500">
              <th className="text-right p-2">{t("requests.title") || "العنوان"}</th>
              <th className="text-right p-2">{t("requests.service") || "الخدمة"}</th>
              <th className="text-right p-2">{t("requests.city") || "المدينة"}</th>
              <th className="text-right p-2">{t("requests.status") || "الحالة"}</th>
              <th className="text-right p-2">{t("requests.createdAt") || "تاريخ الإنشاء"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((req) => (
              <tr key={req.id} className="border-t border-gray-100">
                <td className="p-2">{req.title}</td>
                <td className="p-2">
                  {req.service ? (isArabic ? req.service.name_ar : req.service.name_en) : "-"}
                </td>
                <td className="p-2">
                  {req.city ? (isArabic ? req.city.name_ar : req.city.name_en) : "-"}
                </td>
                <td className="p-2">
                  {req.status ? (isArabic ? req.status.name_ar : req.status.name_en) : "-"}
                </td>
                <td className="p-2">
                  {req.created_at ? new Date(req.created_at).toLocaleDateString(isArabic ? "ar-EG" : "en-US") : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UsersDetails = () => {
  const { t } = useTranslation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const pathname = usePathname();

  const isProvider = pathname.includes("/admin/provider");

  const { id } = useParams();

  const {
    data: providerData,
    refetch: refetchProviderDetails,
    isLoading: loadingProvider,
  } = useGetProviderDetailsQuery(id, { skip: !isProvider });

  const {
    data: requesterData,
    refetch: refetchRequesterDetails,
    isLoading: loadingRequester,
  } = useGetRequesterDetailsQuery(id, { skip: isProvider });

  if ((isProvider && loadingProvider) || (!isProvider && loadingRequester)) {
    return <LoadingPage />;
  }
  const data = isProvider ? providerData : requesterData;

  // Fallback data to allow UI development without backend connection
  const displayData = data || {
    id: id || "mock-id",
    name: "بيانات افتراضية (وضع التطوير)",
    email: "dev@example.com",
    phoneNumber: "0500000000",
    city: { nameAr: "الرياض", nameEn: "Riyadh", name_ar: "الرياض", name_en: "Riyadh" },
    entityType: { nameAr: "شركة", nameEn: "Company", name_ar: "شركة", name_en: "Company" },
    user: { is_blocked: false, email: "dev@example.com", phone: "0500000000" },
    profileStatus: { id: 201, nameAr: "نشط", nameEn: "Active" },
    attachments: []
  };

  if (!displayData) {
    return <NotFound />;
  }

  const financialStats = [
    {
      number: 0,
      title: t("userDetails.totalOrders"),
      icon: <Wallet />,
      color: "#F9FDF1",
      ic: true,
    },
    {
      number: 0,
      title: t("userDetails.waitingApproval"),
      icon: <Clock3 />,
      color: "#FFF7ED",
      ic: true,
    },
    {
      number: 0,
      title: t("userDetails.ongoingOrders"),
      icon: <Clock3 />,
      color: "#E0F2FE",
      ic: true,
    },
    {
      number: 0,
      title: t("userDetails.completedOrders"),
      icon: <Check />,
      color: "#DCFCE7",
      ic: true,
    },
    {
      number: 0,
      title: t("userDetails.rejectedOrders"),
      icon: <Ban />,
      color: "#FEE2E2",
      ic: true,
    },
    {
      number: 0,
      title: t("userDetails.averageRating"),
      icon: <Star />,
      color: "#FEF9C3",
      ic: true,
    },
  ];

  return (
    <div className="py-10">
      <title>
        {isProvider
          ? t("userDetails.providerDetails")
          : t("userDetails.requesterDetails")}
        nav1=
        {isProvider
          ? t("userDetails.manageProviders")
          : t("userDetails.manageRequesters")}
        nav2=
        {isProvider
          ? t("userDetails.providerDetails")
          : t("userDetails.requesterDetails")}
      </title>
      <div className="container">
        <HeadTitle
          title={
            isProvider
              ? t("userDetails.providerDetails")
              : t("userDetails.requesterDetails")
          }
          nav1={
            isProvider
              ? t("userDetails.manageProviders")
              : t("userDetails.manageRequesters")
          }
          nav2={
            isProvider
              ? t("userDetails.providerDetails")
              : t("userDetails.requesterDetails")
          }
        />
        <UserData
          data={displayData}
          refetch={
            isProvider ? refetchProviderDetails : refetchRequesterDetails
          }
        />
        <Statistics
          stats={financialStats}
          title={
            isProvider
              ? t("userDetails.providerStats")
              : t("userDetails.requesterStats")
          }
        />
        {Array.isArray(displayData?.attachments) && displayData.attachments.length > 0 && (
          <AttachmentsTable attachments={displayData.attachments} />
        )}
        {isProvider && <ProviderRequestsSection providerId={id} />}
      </div>
    </div>
  );
};

export default UsersDetails;
