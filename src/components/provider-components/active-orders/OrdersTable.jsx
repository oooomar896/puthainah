import Link from "next/link";
import { useSearchParams } from "@/utils/useSearchParams";
import CustomDataTable from "../../shared/datatable/DataTable";
import { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useGetProjectsProvidersQuery, useProviderProjectStateMutation } from "../../../redux/api/projectsApi";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Eye, Check, X } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";
import { useGetProviderByUserIdQuery } from "../../../redux/api/usersDetails";
import toast from "react-hot-toast";

import { formatCurrency } from "@/utils/currency";

const OrdersTable = () => {
  const { lang } = useContext(LanguageContext);

  const { t } = useTranslation();
  const role = useSelector((state) => state.auth.role);
  const userId = useSelector((state) => state.auth.userId);

  // Get provider ID from user
  const { data: providerData } = useGetProviderByUserIdQuery(userId, { skip: !userId });
  const providerId = Array.isArray(providerData) ? providerData[0]?.id : providerData?.id;

  const searchParams = useSearchParams();
  const PageNumber = searchParams.get("PageNumber") || 1;
  const PageSize = searchParams.get("PageSize") || 30;
  const OrderStatusLookupId = searchParams.get("OrderStatusLookupId") || "";

  const [updateOrderStatus] = useProviderProjectStateMutation();
  const [processingOrderId, setProcessingOrderId] = useState(null);

  const {
    data: projects,
    isLoading,
    refetch,
  } = useGetProjectsProvidersQuery({
    PageNumber,
    PageSize,
    OrderStatusLookupId: OrderStatusLookupId || undefined, // Use URL param or show all
    providerId,
  }, { skip: !providerId });

  const handleAcceptOrder = async (orderId) => {
    try {
      setProcessingOrderId(orderId);
      // Status 18 = waiting_start (accepted)
      await updateOrderStatus({ orderId, statusId: 18 }).unwrap();
      toast.success(t("orders.acceptSuccess") || "تم قبول الطلب بنجاح");
      refetch();
    } catch (error) {
      console.error('Failed to accept order:', error);
      toast.error(t("orders.acceptError") || "فشل قبول الطلب");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRejectOrder = async (orderId) => {
    if (!window.confirm(t("orders.confirmReject") || "هل أنت متأكد من رفض هذا الطلب؟")) return;
    try {
      setProcessingOrderId(orderId);
      // Status 19 = rejected (was 16)
      await updateOrderStatus({ orderId, statusId: 19 }).unwrap();
      toast.success(t("orders.rejectSuccess") || "تم رفض الطلب بنجاح");
      refetch();
    } catch (error) {
      console.error('Failed to reject order:', error);
      toast.error(t("orders.rejectError") || "فشل رفض الطلب");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleStartOrder = async (orderId) => {
    try {
      setProcessingOrderId(orderId);
      // Status 13 = processing (ongoing)
      await updateOrderStatus({ orderId, statusId: 13 }).unwrap();
      toast.success(t("orders.startSuccess") || "تم بدء العمل على المشروع");
      refetch();
    } catch (error) {
      console.error('Failed to start order:', error);
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
  }, [PageNumber, PageSize, OrderStatusLookupId, providerId]);

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
      selector: (row) => row?.requester?.fullName || row?.request?.requester?.name || t("unknown") || "-",
      wrap: true,
    },
    {
      name: t("orders.columns.provider") || "مزود الخدمة",
      selector: (row) => row?.providers?.fullName || row?.provider?.name || t("unknown") || "-",
      wrap: true,
    },
    {
      name: t("projects.serviceType") || "نوع الخدمة",
      selector: (row) =>
        lang === "ar"
          ? row?.services?.[0]?.titleAr || row?.request?.service?.name_ar || "-"
          : row?.services?.[0]?.titleEn || row?.request?.service?.name_en || "-",
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
      name: t("orders.columns.startDate") || "تاريخ البداية",
      selector: (row) =>
        row?.startDate
          ? dayjs(row.startDate).format("DD/MM/YYYY hh:mm A")
          : (row?.created_at ? dayjs(row.created_at).format("DD/MM/YYYY hh:mm A") : "-"),
      wrap: true,
    },
    {
      name: t("orders.columns.endDate") || "تاريخ النهاية",
      selector: (row) =>
        row?.endDate ? dayjs(row.endDate).format("DD/MM/YYYY hh:mm A") : "-",
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
            {lang === "ar"
              ? row.status?.name_ar || "-"
              : row.status?.name_en || "-"}
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
              href={
                role === "Admin"
                  ? `/admin/projects/${row.id}`
                  : role === "Requester"
                    ? `/projects/${row.id}`
                    : `/provider/projects/${row.id}`
              }
              className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition"
              title={t("orders.view") || "عرض"}
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        );
      },
      ignoreRowClick: true,
      button: true,
      width: "180px",
    },
  ];

  const baseData = Array.isArray(projects) ? projects : (projects?.data || []);

  // Filter by URL param if provided, otherwise show all
  const filteredProjects = OrderStatusLookupId === ""
    ? baseData
    : baseData?.filter((item) =>
      (item.orderStatus?.id === Number(OrderStatusLookupId)) ||
      (item.status?.id === Number(OrderStatusLookupId)) ||
      (item.order_status_id === Number(OrderStatusLookupId))
    );

  const sortedData = filteredProjects
    ? [...filteredProjects]?.sort((a, b) => {
      return Number(b?.orderNumber || b?.id) - Number(a?.orderNumber || a?.id);
    })
    : [];

  return (
    <div className="py-8 bg-gray-50/20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="glass-card p-2 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl">
          <div className="bg-white rounded-[2.2rem] overflow-hidden p-6">
            <CustomDataTable
              columns={columns}
              data={sortedData}
              searchableFields={["orderNumber"]}
              searchPlaceholder={t("searchPlaceholder")}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;
