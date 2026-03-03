"use client";
import React, { useContext, useEffect } from "react";
import Link from "next/link";
import HeadTitle from "../../../components/admin-components/users-details/HeadTitle";
import RequestDetailsInfo from "../../../components/admin-components/requests/RequestDetails";
import { useParams } from "next/navigation";
import LoadingPage from "../../LoadingPage";
import NotFound from "../../not-found/NotFound";
import { useGetRequestDetailsQuery, useGetAttachmentsByGroupKeyQuery } from "../../../redux/api/ordersApi";
import AdminAttachmentForm from "../../../components/request-service-forms/AdminAttachmentForm";
import RequestAttachment from "../../../components/request-service-forms/RequestAttachment";
import AdminCompleteRequest from "../../../components/request-service-forms/AdminCompleteRequest";
import AdminPricingPanel from "../../../components/request-service-forms/AdminPricingPanel";
import AdminAssignProviderPanel from "../../../components/request-service-forms/AdminAssignProviderPanel";
import RequestLifecycle from "../../../components/admin-components/requests/RequestLifecycle";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";

const RequestDetails = () => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const {
    data: requestData,
    refetch: refetchRequesterDetails,
    isLoading: loadingRequester,
  } = useGetRequestDetailsQuery(id);

  const { data: attachmentsData } = useGetAttachmentsByGroupKeyQuery(
    requestData?.attachments_group_key || requestData?.attachmentsGroupKey,
    { skip: !requestData?.attachments_group_key && !requestData?.attachmentsGroupKey }
  );

  const data = requestData;
  const attachments = attachmentsData || [];
  const firstApprove = requestData?.requestStatus?.id === 7 || null;
  const finalApprove = requestData?.requestStatus?.id === 207 || null;

  if (loadingRequester) {
    return <LoadingPage />;
  }

  if (!data) {
    return <NotFound />;
  }

  return (
    <div className="py-10 bg-[#f9fafb] min-h-screen">
      <title>{t("requestDetails.title")}</title>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Breadcrumbs */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <Link href="/admin/requests" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-primary transition-colors gap-2 group">
              <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              {t("requestDetails.back") || "العودة للطلبات"}
            </Link>

            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-black text-gray-900">{t("requestDetails.title")}</h1>
              <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-500 shadow-sm">#{data?.id?.split('-')[0]}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{t("requestDetails.nav1")}</span>
              <span className="text-gray-300">/</span>
              <span>{t("requestDetails.nav2")}</span>
              <span className="text-gray-300">/</span>
              <span className="text-primary font-bold">{lang === "ar" ? data?.requestStatus?.nameAr : data?.requestStatus?.nameEn}</span>
            </div>
          </div>

          <HeadTitle
            title="" // Hidden here as we used custom h1
            nav1=""
            nav2=""
            type=""
            status={data?.requestStatus?.id}
            hideTitle={true}
            hideBreadcrumbs={true}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

          {/* Main Info Columns (8 cols) */}
          <div className="xl:col-span-8 space-y-8">
            <RequestLifecycle request={data} />
            <RequestDetailsInfo data={data} refetch={refetchRequesterDetails} />
            <RequestAttachment request={data} attachments={attachments} requestId={data?.id} onDeleted={() => refetchRequesterDetails()} />

            {firstApprove && (
              <AdminAttachmentForm data={data} refetch={refetchRequesterDetails} />
            )}

            {finalApprove && (
              <AdminCompleteRequest data={data} refetch={refetchRequesterDetails} />
            )}
          </div>

          {/* Sidebar Actions (4 cols) */}
          <div className="xl:col-span-4 space-y-6 sticky top-6">
            {/* Pricing Panel */}
            <div className="transform transition-all duration-300 hover:-translate-y-1">
              <AdminPricingPanel refetch={refetchRequesterDetails} />
            </div>

            {/* Provider Assignment */}
            <div className="transform transition-all duration-300 hover:-translate-y-1">
              <AdminAssignProviderPanel data={data} refetch={refetchRequesterDetails} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
