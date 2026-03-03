import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { LanguageContext } from "@/context/LanguageContext";
import { formatDate } from "@/utils/format";
import { mapOrderStatus } from "@/utils/statusMapper";

const ProjectListInfo = ({ data }) => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);
  const role = useSelector((state) => state.auth.role);
  const rows = [
    { label: t("projects.orderNumber"), value: data.orderNumber },
    {
      label: t("projects.startDate"),
      value: formatDate(data.startDate, "DD/MM/YYYY"),
    },
    {
      label: t("projects.endDate"),
      value: formatDate(data.endDate, "DD/MM/YYYY"),
    },
    ...(role !== "Provider"
      ? [{ label: t("projects.userNotes"), value: data.userNotes }]
      : ""),
    // { label: "سعر الخدمة", value: data.servicePricing },
    ...(role !== "Requester"
      ? [{ label: t("projects.servicePrice"), value: data.servicePricing }]
      : ""),
    {
      label: t("projects.serviceType"),
      value: Array.isArray(data.services) && data.services.length > 0
        ? data.services.map((item, index) => (
            <span key={index}>
              {lang === "ar" ? item?.titleAr : item?.titleEn}
              {index < data.services.length - 1 ? "، " : ""}
            </span>
          ))
        : (lang === "ar" ? data.request?.service?.name_ar : data.request?.service?.name_en) || "-",
    },
    ...(role === "Admin"
      ? [
          { label: t("projects.requester"), value: data.requester?.fullName },
          { label: t("projects.provider"), value: data.providers?.[0]?.fullName },
        ]
      : [{ label: t("projects.requester"), value: data.requester?.fullName }]),
    {
      label: t("projects.orderStatus"),
      value: (lang === "ar" ? mapOrderStatus(data.orderStatus)?.nameAr : mapOrderStatus(data.orderStatus)?.nameEn),
      statusId: mapOrderStatus(data.orderStatus)?.id,
    },
  ];

  const getStatusColor = (id) => mapOrderStatus({ id })?.color || "text-black";

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-md">
        <tbody>
          {rows?.map((row, index) => {
            const bgColor = index % 2 === 0 ? "bg-[#1A71F61A]" : "bg-[#FCFBFC]";
            const statusColor =
              row.label === t("projects.orderStatus")
                ? getStatusColor(row.statusId)
                : "";

            return (
              <tr key={index} className={bgColor}>
                <td className="text-right p-3 font-bold text-xs md:text-sm">
                  {row.label}
                </td>
                <td className={`text-right p-3 text-sm ${statusColor}`}>
                  {row.value}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectListInfo;
