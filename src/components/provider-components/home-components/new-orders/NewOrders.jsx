import Link from "next/link";
import CustomDataTable from "../../../shared/datatable/DataTable";
import { useContext, useEffect } from "react";
import dayjs from "dayjs";
import { useGetProjectsProvidersQuery, useProviderProjectStateMutation } from "@/redux/api/projectsApi";
import { useGetProviderByUserIdQuery } from "@/redux/api/usersDetails";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Eye, Check, X } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";
import { useState } from "react";
import toast from "react-hot-toast";

import { formatCurrency } from "@/utils/currency";

const OrdersTable = () => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);

  const userId = useSelector((state) => state.auth.userId);
  const { data: providerDataResult } = useGetProviderByUserIdQuery(userId, { skip: !userId });
  const providerData = Array.isArray(providerDataResult) ? providerDataResult[0] : providerDataResult;
  const providerId = providerData?.id;

  const PageNumber = 1;
  const PageSize = 10;

  const {
    data: projects,
    isLoading,
    refetch,
  } = useGetProjectsProvidersQuery({
    PageNumber,
    PageSize,
    // OrderStatusLookupId: 18, // Removed to show both 17 and 18 invitations
    providerId,
  }, { skip: !providerId });

  const [updateOrderStatus] = useProviderProjectStateMutation();
  const [processingOrderId, setProcessingOrderId] = useState(null);

  const handleAcceptOrder = async (orderId) => {
    try {
      setProcessingOrderId(orderId);
      await updateOrderStatus({ orderId, statusId: 18 }).unwrap();
      toast.success(t("orders.acceptSuccess") || "تم قبول الطلب بنجاح");
      refetch();
    } catch {
      toast.error(t("orders.acceptError") || "فشل قبول الطلب");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRejectOrder = async (orderId) => {
    if (!window.confirm(t("orders.confirmReject") || "هل أنت متأكد من رفض هذا الطلب؟")) return;
    try {
      setProcessingOrderId(orderId);
      await updateOrderStatus({ orderId, statusId: 19 }).unwrap();
      toast.success(t("orders.rejectSuccess") || "تم رفض الطلب بنجاح");
      refetch();
    } catch {
      toast.error(t("orders.rejectError") || "فشل رفض الطلب");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleStartOrder = async (orderId) => {
    try {
      setProcessingOrderId(orderId);
      await updateOrderStatus({ orderId, statusId: 13 }).unwrap();
      toast.success(t("orders.startSuccess") || "تم بدء العمل");
      refetch();
    } catch {
      toast.error(t("orders.startError") || "فشل بدء العمل");
    } finally {
      setProcessingOrderId(null);
    }
  };

  useEffect(() => {
    if (providerId) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  const columns = [
    {
      name: t("orders.columns.orderNumber") || "رقم الطلب",
      cell: (row) => (
        <span className="rounded-lg text-xs text-primary font-normal">
          {row?.orderNumber || row?.id?.slice?.(0, 8) || "-"}
        </span>
      ),
    },
    {
      name: t("orders.columns.requester") || "مقدم الطلب",
      selector: (row) => row.request?.requester?.name || "-",
      wrap: true,
    },
    {
      name: t("projects.serviceType") || "نوع الخدمة",
      selector: (row) =>
        lang === "ar"
          ? row.request?.service?.name_ar || "-"
          : row.request?.service?.name_en || "-",
      wrap: true,
    },
    {
      name: t("orders.columns.price") || "أتعاب المشروع",
      selector: (row) => {
        const amount = row.payout || row.request?.provider_quoted_price;
        return typeof amount === "number" ? formatCurrency(amount, lang) : "-";
      },
      wrap: true,
    },
    {
      name: t("orders.columns.startDate") || "تاريخ البدء",
      selector: (row) => row.created_at ? dayjs(row.created_at).format("DD/MM/YYYY hh:mm A") : "-",
      wrap: true,
    },
    {
      name: t("orders.columns.status") || "الحالة",
      cell: (row) => {
        const statusId = row.status?.id || row.order_status_id;
        return (
          <span
            className={`text-nowrap px-2 py-1 rounded-lg text-xs font-bold
              ${statusId === 15
                ? "border border-[#B2EECC] bg-[#EEFBF4] text-green-800"
                : statusId === 13
                  ? "border border-primary/20 bg-primary/10 text-primary"
                  : statusId === 19 || statusId === 20
                    ? "bg-red-50 text-red-700 border border-red-100"
                    : statusId === 18
                      ? "bg-amber-50 text-[#B76E00] border border-amber-100"
                      : statusId === 17
                        ? "bg-purple-50 text-purple-700 border border-purple-100"
                        : "bg-gray-100 text-gray-600"
              }`}
          >
            {lang === "ar" ? row.status?.name_ar : row.status?.name_en}
          </span>
        );
      },
      wrap: true,
    },
    {
      name: t("orders.columns.action") || "الإجراءات",
      cell: (row) => {
        const statusId = row.status?.id || row.order_status_id;
        const isProcessing = processingOrderId === row.id;

        return (
          <div className="flex items-center gap-2">
            {/* If Waiting Approval (17) -> Show Accept/Reject */}
            {statusId === 17 && (
              <>
                <button
                  onClick={() => handleAcceptOrder(row.id)}
                  disabled={isProcessing}
                  className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                  title={t("orders.accept") || "قبول"}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRejectOrder(row.id)}
                  disabled={isProcessing}
                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                  title={t("orders.reject") || "رفض"}
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}

            {/* If Waiting Start (18) -> Show Start/Reject */}
            {statusId === 18 && (
              <>
                <button
                  onClick={() => handleStartOrder(row.id)}
                  disabled={isProcessing}
                  className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
                  title={t("projects.start") || "بدء العمل"}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRejectOrder(row.id)}
                  disabled={isProcessing}
                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                  title={t("orders.reject") || "رفض"}
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}

            {/* View button always visible */}
            <Link
              href={`/provider/projects/${row.id}`}
              className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition text-xs font-medium flex items-center justify-center whitespace-nowrap"
            >
              <Eye size={16} />
            </Link>
          </div>
        );
      },
      ignoreRowClick: true,
      button: true,
    },
  ];

  const sortedData = Array.isArray(projects)
    ? [...projects]?.sort((a, b) => dayjs(b.created_at).unix() - dayjs(a.created_at).unix())
    : (projects?.data ? [...projects.data]?.sort((a, b) => dayjs(b.created_at).unix() - dayjs(a.created_at).unix()) : []);

  return (
    <div className="py-5">
      <div className="container">
        <div className="rounded-3xl bg-white p-5">
          <CustomDataTable
            columns={columns}
            data={sortedData}
            searchableFields={["id"]}
            searchPlaceholder={t("searchPlaceholder") || "بحث برقم الطلب..."}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;
