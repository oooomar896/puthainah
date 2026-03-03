import React from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";

const Row = ({ label, value }) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
};

const Section = ({ title, children }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-2 text-gray-800">
        <ChevronRight size={16} />
        <h4 className="font-semibold text-sm">{title}</h4>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
};

const ProjectActionTree = ({ data, lang = "ar" }) => {
  const { t } = useTranslation();
  const statusName =
    lang === "ar" ? data?.orderStatus?.nameAr : data?.orderStatus?.nameEn;
  const createdAt = data?.createdAt || data?.created_at;
  const startDate = data?.startDate || data?.started_at;
  const endDate = data?.endDate || data?.completed_at;
  const assignTime = data?.assignTime;

  const formatDate = (d) =>
    d ? dayjs(d).format("DD/MM/YYYY hh:mm A") : undefined;

  const orderAttachments =
    data?.orderAttachments?.map((a) => a) ||
    data?.attachments ||
    [];

  const requester = data?.requester || data?.request?.requester;
  const service =
    data?.services?.[0] ||
    data?.request?.service ||
    null;
  const provider = data?.providers || data?.provider || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Section title={t("projectTree.overview") || "نظرة عامة"}>
        <Row label={t("projectTree.projectNumber") || "رقم المشروع"} value={data?.orderNumber} />
        <Row label={t("projectTree.title") || "العنوان"} value={data?.order_title || data?.title} />
        <Row label={t("projectTree.status") || "الحالة"} value={statusName} />
      </Section>

      <Section title={t("projectTree.timeline") || "الجدول الزمني"}>
        <Row label={t("projectTree.createdAt") || "أُنشئ"} value={formatDate(createdAt)} />
        <Row label={t("projectTree.assignedAt") || "تعيين"} value={formatDate(assignTime)} />
        <Row label={t("projectTree.startedAt") || "بدأ"} value={formatDate(startDate)} />
        <Row label={t("projectTree.completedAt") || "اكتمل"} value={formatDate(endDate)} />
      </Section>

      <Section title={t("projectTree.request") || "الطلب"}>
        <Row label={t("projectTree.requestTitle") || "عنوان الطلب"} value={data?.request?.title} />
        <Row label={t("projectTree.requestDescription") || "وصف الطلب"} value={data?.request?.description} />
        <Row
          label={t("projectTree.service") || "الخدمة"}
          value={
            lang === "ar"
              ? service?.titleAr || service?.name_ar
              : service?.titleEn || service?.name_en
          }
        />
      </Section>

      <Section title={t("projectTree.participants") || "الأطراف"}>
        <Row label={t("projectTree.requester") || "طالب الخدمة"} value={requester?.fullName || requester?.name} />
        <Row label={t("projectTree.provider") || "مزود الخدمة"} value={provider?.fullName || provider?.name} />
        <Row label={t("projectTree.providerSpec") || "تخصص المزود"} value={provider?.specialization} />
        <Row label={t("projectTree.providerRate") || "تقييم المزود"} value={provider?.avg_rate} />
      </Section>

      <Section title={t("projectTree.attachments") || "المرفقات"}>
        <Row label={t("projectTree.count") || "العدد"} value={orderAttachments?.length} />
      </Section>
    </div>
  );
};

export default ProjectActionTree;
