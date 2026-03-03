import React, { useContext, useEffect, useState } from "react";

import HeadTitle from "../../../components/admin-components/users-details/HeadTitle";
import RequestDetailsInfo from "../../../components/admin-components/requests/RequestDetails";
import { useRouter } from "next/navigation";
import LoadingPage from "../../LoadingPage";
import NotFound from "../../not-found/NotFound";
import {
  useGetRequestDetailsQuery,
  useRequesterRespondPriceMutation,
  useGetOrderByRequestQuery,
  useGetAttachmentsByGroupKeyQuery
} from "../../../redux/api/ordersApi";
import RequesterAttachmentForm from "../../../components/request-service-forms/RequesterAttachmentForm";
import RequestAttachment from "../../../components/request-service-forms/RequestAttachment";
import RequestStatusStepper from "../../../components/landing-components/request-service/RequestStatusStepper";
import { useTranslation } from "react-i18next";
import { tr as trHelper } from "@/utils/tr";
import RequestChat from "@/components/landing-components/request-service/RequestChat";
import { MessageCircle } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";
import PaymentForm from "../../../components/landing-components/request-service/PaymentForm";
import PaymentOptions from "../../../components/landing-components/request-service/PaymentOptions";
import ProjectDeliverables from "../../../components/landing-components/request-service/ProjectDeliverables";
import { formatCurrency } from "@/utils/currency";
import dayjs from "dayjs";

import { DetailPageSkeleton } from "../../../components/shared/skeletons/PageSkeleton";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";

import RequestRating from "../../../components/landing-components/request-service/RequestRating";
import { useGetRatingsQuery } from "../../../redux/api/ratingsApi";
import { useAdminCompleteRequestMutation } from "../../../redux/api/ordersApi";
import {
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Download,
  CreditCard,
  XCircle,
  Star,
  Share2,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import toast from "react-hot-toast";

const RequestDetails = ({ initialData, id }) => {
  const { t } = useTranslation();
  const tr = (k, f) => trHelper(t, k, f);
  const { lang } = useContext(LanguageContext);
  const [showPayment, setShowPayment] = useState(null);
  const router = useRouter();

  const requestId = initialData?.id || id;

  const {
    data: requestData,
    refetch: refetchRequesterDetails,
    isLoading: loadingRequester,
  } = useGetRequestDetailsQuery(requestId, { skip: !!initialData || !requestId });

  const { data: orderData } = useGetOrderByRequestQuery(requestId);

  const { data: attachmentsData } = useGetAttachmentsByGroupKeyQuery(
    requestData?.attachments_group_key || requestData?.attachmentsGroupKey,
    { skip: !requestData?.attachments_group_key && !requestData?.attachmentsGroupKey }
  );

  // Use orderData?.id if available for rating
  const effectiveOrderId = orderData?.id || requestData?.orderId || initialData?.orderId;

  const { data: ratingData, refetch: refetchRatings } = useGetRatingsQuery(
    { orderId: effectiveOrderId },
    { skip: !effectiveOrderId }
  );

  const [respondPrice] = useRequesterRespondPriceMutation();
  const [completeRequest, { isLoading: isCompleting }] = useAdminCompleteRequestMutation();
  const [adminData] = useState(null);

  // Realtime Subscriptions
  useRealtimeSync('requests', `id=eq.${requestId}`, () => {
    console.log("Request updated via Realtime, refetching...");
    refetchRequesterDetails();
  });

  useRealtimeSync('orders', `request_id=eq.${requestId}`, () => {
    console.log("Order updated via Realtime, reload might be needed...");
    // If we have a dedicated query for order, refetch it here or just page reload for safety
    window.location.reload();
  });

  const data = requestData || initialData || adminData;
  const attachments = attachmentsData || [];
  const userId = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user'))?.id : null;
  const handleChatScroll = () => {
    const el = typeof window !== "undefined" ? document.getElementById("request-chat") : null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const status = data?.status || data?.requestStatus;
  const statusCode = status?.code || "";
  const isCompleted = statusCode === "completed" || statusCode === "rated";
  const hasRating = ratingData && ratingData.length > 0;

  useEffect(() => {
    // Payment Logic: Show only if accepted and NOT paid
    if (data?.requester_accepted_price && data?.payment_status !== 'paid') {
      const amt = data?.admin_price ?? data?.servicePrice ?? data?.service?.price ?? data?.service?.base_price;
      if (typeof amt === "number" && Number.isFinite(amt) && amt > 0) {
        setShowPayment({
          amount: amt,
          consultationId: data?.id,
        });
      }
    } else {
      setShowPayment(null);
    }
  }, [data]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCompleteProject = async () => {
    if (!window.confirm(t("requestDetails.confirmCompletion") || "هل أنت متأكد من اكتمال المشروع واستلام كافة المتطلبات؟")) return;
    try {
      // Status ID for completed should be 11 (standard)
      await completeRequest({ requestId, statusId: 11 }).unwrap();
      toast.success(t("requestDetails.successComplete") || "تم إكمال المشروع بنجاح");
      refetchRequesterDetails();
    } catch {
      toast.error(t("common.error"));
    }
  };

  if (loadingRequester && !adminData) {
    return <DetailPageSkeleton />;
  }

  if (!data) {
    return <UnavailableDetails id={requestId} />;
  }

  return (
    <div className="py-10 bg-[#f9fafb] min-h-screen">
      <title>{t("requestDetails.title")}</title>
      <meta name="description" content={t("request.requestDescription")} />
      <div className="container px-4">
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm"
          >
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            {t("back") || "Back"}
          </button>

          {/* Quick Stats or ID */}
          <div className="text-[10px] font-mono font-black text-gray-300 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
            Request ID: {requestId?.substring(0, 8)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">{t("requestDetails.sidebarTitle") || "بيانات الطلب"}</h2>
              <p className="text-gray-400 text-sm mb-6">{t("requestDetails.sidebarDesc") || "ملخص تفاصيل ومعلومات الخدمة المطلوبة"}</p>

              <div className="space-y-4 pt-6 border-t border-gray-50">
                <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl">
                  <span className="text-gray-500 text-xs font-bold">{t("common.status") || "الحالة"}</span>
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                    {lang === "ar" ? (data?.status?.name_ar || data?.requestStatus?.nameAr) : (data?.status?.name_en || data?.requestStatus?.nameEn)}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl">
                  <span className="text-gray-500 text-xs font-bold">{t("common.date") || "التاريخ"}</span>
                  <span className="text-gray-900 text-xs font-black">{dayjs(data.created_at).format("DD/MM/YYYY")}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions / Help Sidebar */}
            <div className="bg-gradient-to-br from-[#1967AE] to-[#155490] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <h4 className="font-black text-lg mb-2 relative z-10">{t("common.needHelp") || "هل تحتاج مساعدة؟"}</h4>
              <p className="text-white/80 text-sm mb-6 relative z-10 font-medium">{t("common.supportDesc") || "فريقنا متواجد دائماً لخدمتك ومتابعة طلبك"}</p>
              <a href="/support" className="relative z-10 block w-full text-center bg-[#F3BF45] text-gray-900 py-3 rounded-xl font-black text-sm hover:bg-[#ffcf5c] transition-colors shadow-lg">
                {t("common.contactSupport") || "تواصل بالدعم الفني"}
              </a>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-6 overflow-hidden">
              <RequestStatusStepper status={status} providerResponse={data?.provider_response} />
            </div>

            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
              <RequestDetailsInfo data={data} refetch={refetchRequesterDetails} isClient={true} />
            </div>

            {/* Attachments - Now Fixed in Main Content per User Request */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8">
              <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
                {t("projects.attachments") || "مرفقات الطلب والملفات"}
              </h3>
              <RequestAttachment
                request={data}
                attachments={attachments}
                onDeleted={() => refetchRequesterDetails()}
                requestId={requestId}
              />
            </div>

            {/* Offer Section - Visible from 'priced' stage onwards */}
            {(data?.admin_price || data?.admin_notes || data?.admin_proposal_file_url) &&
              (['priced', 'waiting_payment', 'paid', 'provider_assigned', 'pending_delivery', 'under_review', 'completed', 'rated'].includes(statusCode) || data?.requestStatus?.id === 8) && (
                <div className="rounded-[40px] border border-gray-100 p-10 bg-white shadow-custom animate-fade-in-up">
                  <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-6">
                    <div className="text-xl text-gray-900 font-black flex items-center gap-3">
                      <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
                        <Star className="w-5 h-5 fill-current" />
                      </div>
                      {t("requestDetails.adminOffer") || "عرض السعر من الإدارة"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {typeof data?.admin_price === "number" && (
                      <div className="bg-[#1967AE]/5 p-6 rounded-[32px] border border-[#1967AE]/10">
                        <span className="text-[10px] font-black uppercase text-[#1967AE]/60 tracking-[0.2em] block mb-2">{t("pricing.total") || "السعر الإجمالي"}</span>
                        <div className="text-4xl font-black text-[#1967AE]">
                          {formatCurrency(Number(data.admin_price), lang)}
                        </div>
                      </div>
                    )}

                    {data?.admin_proposal_file_url && (
                      <a
                        href={data.admin_proposal_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col justify-center bg-gray-50 hover:bg-gray-100 p-6 rounded-[32px] border border-gray-100 transition-all group"
                      >
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] block mb-2">{t("pricing.proposal") || "ملخص العرض"}</span>
                        <div className="flex items-center gap-3 text-gray-900 font-black group-hover:text-[#1967AE] transition-colors">
                          <div className="p-2 bg-white rounded-xl shadow-sm">
                            <Download className="w-5 h-5" />
                          </div>
                          {t("requestDetails.downloadProposal") || "تحميل ملف العرض"}
                        </div>
                      </a>
                    )}
                  </div>

                  {data?.admin_notes && (
                    <div className="bg-gray-50/50 rounded-[32px] p-8 text-gray-600 leading-relaxed border border-gray-100 italic relative">
                      <div className="absolute top-4 left-4 opacity-10">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.899 14.899 16 16 16H19V10H14V4H20V16C20 18.209 18.209 20 16 20H14.017V21ZM5.017 21V20C3.359 20 2 18.641 2 17V4H8V16H5.017C5.017 17.101 5.899 18 7 18H8.017V21H5.017Z" /></svg>
                      </div>
                      {data.admin_notes}
                    </div>
                  )}
                </div>
              )}

            {/* Respond Action */}
            {data?.admin_price && !data?.requester_accepted_price && !data?.requester_rejection_reason && (statusCode === "priced" || data?.requestStatus?.id === 8) && (
              <div className="rounded-[40px] bg-[#1967AE] p-10 text-white shadow-2xl animate-fade-in-up relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="flex-1">
                    <h3 className="text-2xl font-black mb-3">{t("requestDetails.actionRequired") || "بانتظار قرارك النهائي"}</h3>
                    <p className="text-white/60 font-medium">{t("requestDetails.priceProposalDesc") || "يرجى مراجعة عرض السعر والموافقة عليه للانتقال لمرحلة الدفع وبدء العمل"}</p>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <button
                      className="flex-1 md:flex-none bg-gradient-to-r from-[#F3BF45] to-[#f5c960] hover:from-[#e0ae3b] hover:to-[#e0ae3b] text-gray-900 px-12 py-5 rounded-2xl font-black text-lg shadow-2xl hover:shadow-[#F3BF45]/30 transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                      onClick={async () => {
                        await respondPrice({ requestId, accepted: true, statusId: 21 }).unwrap();
                        toast.success(t("requestDetails.priceAccepted"));
                        refetchRequesterDetails();
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {t("common.accept") || "قبول العرض"}
                    </button>
                    <button
                      className="flex-1 md:flex-none bg-white/5 backdrop-blur-md text-white border border-white/10 px-8 py-5 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all hover:border-white/20"
                      onClick={async () => {
                        const reason = window.prompt(t("requestDetails.rejectReason") || "سبب الرفض؟");
                        if (reason) {
                          await respondPrice({ requestId, accepted: false, rejectionReason: reason, statusId: 10 }).unwrap();
                          refetchRequesterDetails();
                        }
                      }}
                    >
                      {t("common.reject") || "رفض"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Note */}
            {data?.requester_rejection_reason && (
              <div className="rounded-[32px] border border-red-100 bg-red-50/30 p-8 flex gap-6 items-center border-dashed">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shadow-sm shrink-0">
                  <XCircle className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-red-900 font-black text-xl mb-1">{t("requestDetails.youRejected") || "تم رفض العرض"}</p>
                  <p className="text-red-600/70 font-medium">{t("requestDetails.reason") || "السبب"}: {data.requester_rejection_reason}</p>
                </div>
              </div>
            )}

            {/* Payment Section - ONLY in 'waiting_payment' stage */}
            {showPayment && statusCode === 'waiting_payment' && !data?.payment_status?.includes('paid') && (
              <div className="bg-white rounded-[40px] shadow-custom border border-gray-100 p-10 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-secondary to-primary" />
                <div className="mb-10 text-center">
                  <div className="w-20 h-20 bg-[#1967AE]/5 text-[#1967AE] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CreditCard className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900">{tr("payment.title", "الدفع")}</h3>
                  <p className="text-gray-400 font-medium mt-2">{tr("payment.secure", "يرجى الدفع للمتابعة، معاملاتك آمنة ومحمية")}</p>
                </div>
                <PaymentOptions
                  amount={showPayment.amount}
                  requestId={showPayment.consultationId}
                  attachmentsGroupKey={data?.attachments_group_key || data?.attachmentsGroupKey}
                  refetch={refetchRequesterDetails}
                />
              </div>
            )}

            {/* Deliverables & Completion */}
            {(orderData?.id || data?.orderId) && (
              <div className="space-y-8">
                <ProjectDeliverables orderId={orderData?.id || data?.orderId} />

                {/* Completion Trigger for Seeker */}
                {statusCode === "under_review" && !isCompleted && (
                  <div className="bg-gradient-to-br from-[#1967AE] to-[#155490] rounded-[40px] p-10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black">{t("requestDetails.isDone") || "هل تم استلام العمل بنجاح؟"}</h3>
                      <p className="text-white/70 font-medium">{t("requestDetails.completeConfirmPrompt") || "إذا كنت راضياً عن النتائج، يرجى إغلاق المشروع للانتقال لمرحلة التقييم"}</p>
                    </div>
                    <button
                      onClick={handleCompleteProject}
                      disabled={isCompleting}
                      className="bg-white text-[#1967AE] px-12 py-5 rounded-2xl font-black text-xl shadow-2xl hover:scale-105 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCompleting ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t("common.loading")}
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {t("requestDetails.finishNow") || "إنهاء المشروع الآن"}
                        </>
                      )}
                    </button>
                  </div>
                )}
                {/* Chat - Visible only after some initial progress (Priced or later) */}
                {['priced', 'waiting_payment', 'paid', 'provider_assigned', 'pending_delivery', 'under_review', 'completed', 'rated'].includes(statusCode) && (
                  <RequestChat requestId={requestId} orderId={orderData?.id || data?.orderId} userId={userId} />
                )}
              </div>
            )}

            {/* Evaluation Phase */}
            {isCompleted && !hasRating && (
              <RequestRating
                orderId={effectiveOrderId}
                userId={userId}
                onRated={() => {
                  refetchRatings();
                  // Update status to 'rated' if available
                }}
              />
            )}

            {/* Show existing rating if any */}
            {hasRating && (
              <div className="bg-white rounded-[40px] border border-emerald-100 p-10 shadow-sm relative overflow-hidden text-center max-w-2xl mx-auto">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                <div className="relative z-10">
                  <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-3xl mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{t("rating.thanks") || "شكراً على تقييمك!"}</h3>
                  <p className="text-gray-400 font-medium mb-8">{t("rating.reviewedDesc") || "لقد قمت بتقييم هذه الخدمة مسبقاً، رأيك يساعدنا على الارتقاء دائماً"}</p>

                  <div className="flex items-center justify-center gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-6 h-6 ${s <= ratingData[0].rating_value ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  {ratingData[0].comment && (
                    <p className="italic text-gray-600 bg-gray-50 p-6 rounded-3xl border border-gray-100">"{ratingData[0].comment}"</p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      <button
        onClick={handleChatScroll}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:bg-primary/90 active:scale-95 transition"
        aria-label={tr("tickets.openChat", "الدردشة")}
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
};

export default RequestDetails;

const UnavailableDetails = ({ id }) => {
  const { t } = useTranslation();
  const [state, setState] = useState({ loading: true, exists: false });
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/requests/check-exists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const data = await res.json();
        setState({ loading: false, exists: !!data?.exists });
      } catch {
        setState({ loading: false, exists: false });
      }
    };
    if (id) check();
  }, [id]);
  if (state.loading) return <DetailPageSkeleton />;
  if (!state.exists) return <NotFound />;
  return (
    <div className="container mx-auto p-8">
      <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-6 text-yellow-800">
        <h3 className="text-lg font-bold mb-2">{t("error.boundary.title") || "حدث خطأ غير متوقع"}</h3>
        <p className="text-sm">{t("requestsUser.notAuthorized") || "لا تملك صلاحية عرض هذا الطلب"}</p>
        <div className="mt-4">
          <a href="/requests" className="px-4 py-2 bg-black text-white rounded-lg">
            {t("common.viewAll") || "عرض الطلبات"}
          </a>
        </div>
      </div>
    </div>
  );
};
