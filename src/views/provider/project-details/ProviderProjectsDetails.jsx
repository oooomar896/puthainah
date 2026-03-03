import React, { useContext, useEffect, useState, useMemo } from "react";
import HeadTitle from "../../../components/admin-components/users-details/HeadTitle";
import ProjectListInfo from "../../../components/admin-components/projects/ProjectListInfo";
import { useParams } from "@/utils/useParams";
import { useSearchParams } from "@/utils/useSearchParams";
import {
  useGetProjectDetailsQuery,
  useProviderProjectStateMutation,
} from "../../../redux/api/projectsApi";
import {
  useGetDeliverablesQuery,
  useAddDeliverableMutation,
} from "../../../redux/api/ordersApi";
import { useSelector } from "react-redux";
import LoadingPage from "../../LoadingPage";
import NotFound from "../../not-found/NotFound";
import ProjectDescription from "../../../components/admin-components/projects/ProjectDescription";
import AttachmentsTable from "../../../components/admin-components/projects/AttachmentsTable";
import UploadAdminAttachments from "../../../components/shared/forms-end-project/UploadAdminAttachments";
import { FiveHoursTimer } from "./FiveHoursTimer";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import ProjectChat from "@/components/shared/ProjectChat";
import toast from "react-hot-toast";

const ProviderProjectsDetails = () => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);
  const userId = useSelector((state) => state?.auth?.userId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { id } = useParams();
  const searchParams = useSearchParams();
  const IsRejected = searchParams.get("IsRejected");
  const IsExpired = searchParams.get("IsExpired");
  const {
    data: projectData,
    isLoading: loadingProject,
    refetch,
  } = useGetProjectDetailsQuery({ id, params: { IsRejected, IsExpired } });

  const { data: deliverablesData, refetch: refetchDeliverables } = useGetDeliverablesQuery({ orderId: id });
  const [addDeliverable] = useAddDeliverableMutation();
  const [newDeliverable, setNewDeliverable] = useState({ title: "", description: "", url: "" });

  const startISO = projectData?.assignTime; // اختار اللي يناسبك

  const [statusId, setStatusId] = useState(null);

  useEffect(() => {
    setStatusId(projectData?.orderStatus?.id || projectData?.order_status_id);
  }, [projectData]);

  const [rejected, setRejected] = useState(false);
  const [ProviderProjectState, { isLoading: loadingCreateState }] =
    useProviderProjectStateMutation();

  const mappedData = useMemo(() => {
    if (!projectData) return null;
    return {
      ...projectData,
      orderNumber: projectData?.id?.substring(0, 8) || 'N/A',
      orderStatus: projectData?.status || {
        id: projectData.order_status_id,
        nameAr: projectData.status?.name_ar,
        nameEn: projectData.status?.name_en,
        code: projectData.status?.code // Include code
      },
      description: projectData?.request?.description || projectData?.order_title,
      startDate: projectData?.start_date || projectData?.request?.created_at || projectData?.created_at || null,
      endDate: projectData?.end_date || projectData?.completed_at || projectData?.updated_at || null,
      servicePricing: projectData?.payout ?? projectData?.request?.provider_quoted_price ?? null,
      services: projectData?.request?.service
        ? [{ titleAr: projectData.request.service.name_ar, titleEn: projectData.request.service.name_en }]
        : [],
      requester: { fullName: projectData?.request?.requester?.name || null },
      providers: projectData?.provider?.name ? [{ fullName: projectData.provider.name }] : [],
    };
  }, [projectData]);

  const handleAction = async (actionType) => {
    let targetStatusId;
    switch (actionType) {
      case "approve": targetStatusId = 18; break;
      case "reject": targetStatusId = 19; break;
      case "start": targetStatusId = 13; break;
      case "complete": targetStatusId = 15; break;
      default: return;
    }

    try {
      await ProviderProjectState({
        orderId: id,
        statusId: targetStatusId,
      }).unwrap();

      toast.success(t("orders.success") || "تمت العملية بنجاح");

      if (actionType === "reject") {
        setRejected(true);
      }

      refetch();
    } catch (error) {
      console.error("حدث خطأ أثناء تحديث حالة المشروع:", error);
      toast.error(t("orders.error") || "حدث خطأ أثناء تنفيذ الإجراء");
    }
  };

  if (loadingProject) {
    return <LoadingPage />;
  }

  if (!projectData || !mappedData) {
    return <NotFound />;
  }
  return (
    <div className="py-10 bg-gray-50/50 min-h-screen">
      <title>
        {t("providerProjectsDetails.projectDetails", {
          number: mappedData?.orderNumber,
        }) || `تفاصيل المشروع #${mappedData?.orderNumber}`}
      </title>
      <div className="container px-4 mx-auto max-w-7xl animate-fade-in">
        <div className="mb-8 p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-premium overflow-hidden relative group">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full -ml-20 -mb-20 blur-3xl group-hover:bg-secondary/10 transition-colors duration-700" />

          <div className="relative z-10">
            <HeadTitle
              title={t("providerProjectsDetails.projectDetails", {
                number: mappedData?.orderNumber,
              }) || `تفاصيل المشروع #${mappedData?.orderNumber}`}
              nav1={t("providerProjectsDetails.projectNav1") || "الرئيسية"}
              nav2={t("providerProjectsDetails.projectNav2") || "مشاريعي"}
              typeProject={
                lang === "ar"
                  ? mappedData?.orderStatus?.nameAr
                  : mappedData?.orderStatus?.nameEn
              }
              statusProject={mappedData?.orderStatus?.id}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mt-8">
          {/* Main Info */}
          <div className="lg:col-span-7 space-y-6 lg:space-y-8">
            <div className="glass-card p-1 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
              <div className="bg-white rounded-[2.2rem] overflow-hidden">
                <ProjectListInfo data={mappedData} />
              </div>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                </div>
                {t("providerProjectsDetails.description", "الوصف")}
              </h3>
              <ProjectDescription des={mappedData?.description} />
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-5 space-y-6 lg:space-y-8">
            {/* Action Buttons Box */}
            <div className="glass-card p-8 rounded-[2.5rem] border-2 border-primary/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              <h3 className="text-lg font-bold mb-6 shimmer-text inline-block">{t("providerProjectsDetails.actions", "الإجراءات")}</h3>

              <div className="flex flex-wrap items-center gap-4 relative z-10">
                {statusId === 17 && !rejected && (
                  <>
                    <div className="w-full mb-2">
                      <FiveHoursTimer startISO={startISO} durationHours={5} />
                    </div>
                    <button
                      onClick={() => handleAction("reject")}
                      disabled={loadingCreateState}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95"
                    >
                      {t("providerProjectsDetails.reject") || "رفض الطلب"}
                    </button>
                    <button
                      onClick={() => handleAction("approve")}
                      disabled={loadingCreateState}
                      className="flex-1 premium-gradient-primary text-white shadow-lg py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:shadow-blue-500/25"
                    >
                      {t("providerProjectsDetails.approve") || "قبول الطلب"}
                    </button>
                  </>
                )}

                {rejected && (
                  <div className="w-full text-center p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 font-bold animate-pulse">
                    {t("providerProjectsDetails.rejectedStatus") || "تم رفض الطلب"}
                  </div>
                )}

                {statusId === 18 && (
                  <button
                    onClick={() => handleAction("start")}
                    disabled={loadingCreateState}
                    className="w-full premium-gradient-warning text-white shadow-lg py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:shadow-yellow-500/40 border border-yellow-500/20"
                  >
                    {t("providerProjectsDetails.start") || "بدء العمل"}
                  </button>
                )}

                {statusId === 13 && (
                  <button
                    onClick={() => handleAction("complete")}
                    disabled={loadingCreateState}
                    className="w-full premium-gradient-success text-white shadow-lg py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:shadow-green-500/40 border border-green-500/20"
                  >
                    {t("providerProjectsDetails.complete") || "إكمال المشروع"}
                  </button>
                )}
              </div>
            </div>

            {/* Deliverables Box */}
            <div className="glass-card p-8 rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl border border-white/50">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                {t("providerProjectsDetails.deliverables", "التسليمات")}
              </h3>

              <div className="space-y-4 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                {(deliverablesData || []).length === 0 ? (
                  <div className="py-10 text-center text-gray-400 font-medium italic">
                    {t("providerProjectsDetails.noDeliverables", "لا يوجد تسليمات حالياً")}
                  </div>
                ) : (
                  (deliverablesData || []).map((d) => (
                    <div key={d.id} className="p-4 rounded-2xl bg-white/50 border border-gray-100 hover:border-primary/20 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-gray-800">{d.title}</div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${d.status === 'accepted' ? 'bg-green-100 text-green-600' :
                          d.status === 'rejected' ? 'bg-red-100 text-red-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                          {d.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-3 leading-relaxed">{d.description}</div>
                      {d.delivery_file_url && (
                        <a
                          className="inline-flex items-center gap-2 text-[11px] font-bold text-primary hover:underline"
                          href={d.delivery_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          {t("providerProjectsDetails.download", "تحميل الملف المصاحب")}
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add New Deliverable */}
              <div className="mt-8 space-y-4 pt-6 border-t border-gray-100/50">
                <div className="relative group">
                  <input
                    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:border-primary/50 transition-all duration-300 shadow-sm group-hover:shadow-md"
                    value={newDeliverable.title}
                    onChange={(e) => setNewDeliverable({ ...newDeliverable, title: e.target.value })}
                    placeholder={t("providerProjectsDetails.deliverableTitle", "عنوان التسليم (مثال: المسودة الأولى)")}
                  />
                </div>
                <textarea
                  className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:border-primary/50 transition-all duration-300 shadow-sm group-hover:shadow-md min-h-[100px]"
                  value={newDeliverable.description}
                  onChange={(e) => setNewDeliverable({ ...newDeliverable, description: e.target.value })}
                  placeholder={t("providerProjectsDetails.deliverableDesc", "وصف موجز لما تم إنجازه...")}
                />
                <input
                  className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:border-primary/50 transition-all duration-300 shadow-sm group-hover:shadow-md"
                  value={newDeliverable.url}
                  onChange={(e) => setNewDeliverable({ ...newDeliverable, url: e.target.value })}
                  placeholder={t("providerProjectsDetails.deliverableUrl", "رابط الملف (Google Drive, Dropbox, etc.)")}
                />
                <button
                  className="w-full premium-gradient-primary text-white py-4 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-primary/30 disabled:opacity-50"
                  disabled={!newDeliverable.title.trim()}
                  onClick={async () => {
                    const title = newDeliverable.title.trim();
                    if (!title) return;

                    if (!id || !projectData?.provider?.id) {
                      toast.error(t("common.error") || "Error: Missing Order/Provider ID");
                      return;
                    }

                    try {
                      await addDeliverable({
                        orderId: id,
                        providerId: projectData?.provider?.id,
                        title: title,
                        description: newDeliverable.description,
                        deliveryFileUrl: newDeliverable.url,
                      }).unwrap();

                      toast.success(t("providerProjectsDetails.addDeliverableSuccess") || "تم إضافة التسليم بنجاح");
                      setNewDeliverable({ title: "", description: "", url: "" });
                      refetchDeliverables();
                    } catch (error) {
                      console.error("Failed to add deliverable:", error);
                      toast.error(error?.data?.message || error?.message || t("providerProjectsDetails.addDeliverableError") || "حدث خطأ أثناء إضافة التسليم");
                    }
                  }}
                >
                  {t("providerProjectsDetails.addDeliverable", "تأكيد وإضافة التسليم")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        {projectData?.orderAttachments?.length > 0 && (
          <div className="mt-12 glass-card p-0 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl">
            <AttachmentsTable
              title={t("providerProjectsDetails.attachmentsTitle") || "المرفقات"}
              attachments={projectData?.orderAttachments}
            />
          </div>
        )}

        {/* Chat Section */}
        <div className="mt-12 mb-20 glass-card p-8 rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl">
          <ProjectChat
            orderId={id}
            userId={userId}
            title={t("providerProjectsDetails.messages", "المحادثة الفنية")}
          />
        </div>

        <div className="mt-12">
          <UploadAdminAttachments projectData={projectData} refetch={refetch} />
        </div>
      </div>
    </div>
  );
};

export default ProviderProjectsDetails;
