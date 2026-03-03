import dayjs from "dayjs";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import { formatCurrency } from "@/utils/currency";
import {
  User,
  FileText,
  Calendar,
  Hash,
  Tag,
  DollarSign,
  FileCheck,
  UserCheck,
  Clock,
  Info,
  CheckCircle,
  XCircle
} from "lucide-react";

const DetailItem = ({ icon, label, value, subValue, highlight, variant = "default" }) => {
  const variants = {
    default: "bg-white border-gray-100 hover:border-primary/20",
    highlight: "bg-primary/5 border-primary/10",
    gold: "bg-secondary/5 border-secondary/10"
  };

  return (
    <div className={`flex flex-col gap-3 p-5 rounded-3xl border transition-all duration-300 group hover:shadow-lg ${variants[variant] || variants.default}`}>
      <div className="flex items-center gap-3 text-sm text-gray-500 font-medium group-hover:text-primary transition-colors">
        <div className={`p-2.5 rounded-2xl transition-colors shadow-sm ${variant === 'highlight' ? 'bg-white text-primary' :
          variant === 'gold' ? 'bg-white text-secondary' :
            'bg-gray-50 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'
          }`}>
          {icon}
        </div>
        {label}
      </div>
      <div className="text-gray-900 font-bold text-lg px-1 leading-snug">
        {value || <span className="text-gray-300 italic text-sm">--</span>}
        {subValue && <div className="mt-1.5">{subValue}</div>}
      </div>
    </div>
  );
};

const RequestDetails = ({ data, isClient = false }) => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);

  const fullName =
    data?.fullName ||
    data?.requester?.full_name ||
    data?.requester?.name ||
    "-";
  const creationTime = data?.creationTime || data?.created_at;
  const description = data?.description || "";
  const requestNumber = data?.requestNumber || data?.id;
  const requestStatus = data?.requestStatus || data?.status || null;
  const pricingNotes = data?.admin_notes || data?.pricingNotes || data?.pricing_notes || "";
  const price = data?.admin_price ?? data?.provider_price ?? data?.servicePrice ?? data?.service?.price ?? data?.service?.base_price ?? data?.amount ?? null;
  const proposalUrl = data?.admin_proposal_file_url || null;

  // Hide provider info for client
  const providerAssignedAt = !isClient ? (data?.provider_assigned_at || null) : null;
  const providerName = !isClient ? (data?.provider?.name || (data?.provider_id ? String(data.provider_id).slice(0, 8) + "..." : null)) : null;

  const joiningDateFormatted = dayjs(creationTime).format("DD/MM/YYYY hh:mm A");

  const SectionTitle = ({ title, icon }) => (
    <div className="flex items-center gap-2 mb-6 text-gray-800">
      <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
      {icon && <span className="text-secondary">{icon}</span>}
      <h3 className="text-lg font-black">{title}</h3>
    </div>
  );

  return (
    <section className="py-2 animate-fade-in-up">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden relative">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-white shadow-custom flex items-center justify-center text-primary border border-gray-100 shrink-0">
              <Hash className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">{t("requestDetails.title", "تفاصيل الطلب")}</h2>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-base text-gray-500 font-mono bg-gray-50 px-3 py-1 rounded-xl border border-gray-200">
                  #{String(requestNumber).substring(0, 8)}...
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold border shadow-sm ${['priced', 'paid', 'completed', 'rated'].includes(requestStatus?.code)
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'bg-primary/5 text-primary border-primary/10'
                  }`}>
                  {lang === "ar"
                    ? (requestStatus?.name_ar || requestStatus?.nameAr)
                    : (requestStatus?.name_en || requestStatus?.nameEn)
                  }
                </span>
              </div>
            </div>
          </div>

          {price && (
            <div className="bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-custom flex items-center gap-4 min-w-[200px]">
              <div className="w-12 h-12 rounded-full bg-[#1967AE]/5 flex items-center justify-center text-[#1967AE]">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t("request.price", "قيمة الطلب")}</span>
                <span className="text-3xl font-black text-[#1967AE] font-mono leading-tight mt-1">
                  {formatCurrency(price, lang)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 md:p-10 space-y-10">

          {/* Section 1: Basic Info */}
          <div>
            <SectionTitle title={t("requestDetails.basicInfo", "البيانات الأساسية")} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem
                icon={<User className="w-5 h-5" />}
                label={t("request.name", "اسم مقدم الطلب")}
                value={fullName}
              />
              <DetailItem
                icon={<Calendar className="w-5 h-5" />}
                label={t("request.registrationDate", "تاريخ الطلب")}
                value={<span suppressHydrationWarning className="dir-ltr block text-right">{joiningDateFormatted}</span>}
              />
            </div>
          </div>

          {/* Section 2: Provider & Offer Info (if available) */}
          {(providerName || providerAssignedAt || proposalUrl) && (
            <div>
              <SectionTitle title={t("requestDetails.executionDetails", "تفاصيل التنفيذ")} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providerName && (
                  <DetailItem
                    icon={<UserCheck className="w-5 h-5" />}
                    label={t("request.provider", "مزوّد الخدمة")}
                    variant="highlight"
                    value={
                      <div className="flex flex-col gap-2">
                        <span>{providerName}</span>
                        {data?.provider_response && (
                          <span className={`inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-lg text-[10px] font-bold ${data.provider_response === 'accepted'
                            ? 'bg-emerald-100 text-emerald-700'
                            : data.provider_response === 'rejected'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                            }`}>
                            {data.provider_response === 'accepted' ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                {t("AdminAssignProvider.accepted", "تم القبول")}
                              </>
                            ) : data.provider_response === 'rejected' ? (
                              <>
                                <XCircle className="w-3 h-3" />
                                {t("AdminAssignProvider.rejected", "تم الرفض")}
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" />
                                {t("AdminAssignProvider.pending", "بانتظار الرد")}
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    }
                  />
                )}

                {providerAssignedAt && (
                  <DetailItem
                    icon={<Clock className="w-5 h-5" />}
                    label={t("request.providerAssignedAt", "تاريخ التعيين")}
                    value={<span suppressHydrationWarning className="dir-ltr block text-right">{dayjs(providerAssignedAt).format("DD/MM/YYYY hh:mm A")}</span>}
                  />
                )}

                {proposalUrl && (
                  <DetailItem
                    icon={<FileCheck className="w-5 h-5" />}
                    label={t("request.proposalFile", "ملف العرض الفني")}
                    variant="gold"
                    value={
                      <a
                        href={proposalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-bold underline transition-colors"
                      >
                        {t("common.download", "تحميل الملف")}
                        <FileText className="w-4 h-4" />
                      </a>
                    }
                  />
                )}
              </div>
            </div>
          )}

          {/* Section 3: Description */}
          <div>
            <SectionTitle title={t("request.requestDescription", "وصف الطلب ومتطلباته")} />
            <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 text-gray-700 leading-loose text-base whitespace-pre-wrap hover:bg-white hover:shadow-sm transition-all">
              {description || <span className="text-gray-400">{t("noDescription", "لا يوجد وصف")}</span>}
            </div>
          </div>

          {/* Pricing Notes (if any) */}
          {pricingNotes && (
            <div>
              <SectionTitle title={t("request.notes", "ملاحظات التسعير")} />
              <div className="bg-amber-50/50 rounded-3xl p-8 border border-amber-100 text-amber-900 leading-loose text-base whitespace-pre-wrap">
                {pricingNotes}
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default RequestDetails;
