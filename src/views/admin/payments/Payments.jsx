"use client";

import { useTranslation } from "react-i18next";
import { useGetPaymentsQuery, useUpdatePaymentStatusMutation } from "@/redux/api/paymentApi";
import { useUpdateRequestStatusMutation, useUpdateRequestPaymentStatusMutation } from "@/redux/api/requestsApi";
import CustomDataTable from "@/components/shared/datatable/DataTable";
import dayjs from "dayjs";
import { tr as trHelper } from "@/utils/tr";
import { formatAmount } from "@/utils/format";
import { useState } from "react";
import AdminPaymentTicketModal from "@/components/admin-components/payments/AdminPaymentTicketModal";

const Payments = () => {
  const { t } = useTranslation();
  const { data: payments, isLoading } = useGetPaymentsQuery({});
  const tr = (key, fallback) => trHelper(t, key, fallback);
  const currencyLabel = tr("currency", "SAR");
  const [updatePaymentStatus] = useUpdatePaymentStatusMutation();
  const [updateRequestStatus] = useUpdateRequestStatusMutation();
  const [updateRequestPaymentStatus] = useUpdateRequestPaymentStatusMutation();

  const rows = Array.isArray(payments) ? payments : (payments?.data || []);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState(null);

  const columns = [
    {
      name: t("payments.id") || "المعرف",
      cell: (row) => <span className="font-mono text-xs text-gray-600">{String(row.id).slice(0, 8)}</span>,
    },
    {
      name: t("payments.amount") || "المبلغ",
      cell: (row) => (
        <span className="font-bold text-emerald-700">{formatAmount(Number(row.amount || 0), row.currency || currencyLabel)}</span>
      ),
    },
    {
      name: t("payments.status") || "الحالة",
      cell: (row) => {
        const st = row.payment_status || row.status || "-";
        const cls =
          st === "submitted" ? "border-amber-200 bg-amber-50 text-amber-700" :
            st === "approved" ? "border-green-200 bg-green-50 text-green-700" :
              st === "rejected" ? "border-rose-200 bg-rose-50 text-rose-700" :
                "border-gray-200 bg-gray-50 text-gray-700";
        return <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${cls}`}>{st}</span>;
      },
      wrap: true,
    },
    {
      name: tr("payments.actions", "إجراءات"),
      cell: (row) => {
        const isManual = row.payment_method === "bank_transfer" || row.payment_method === "cash";
        const isSubmitted = (row.payment_status || row.status) === "submitted";
        if (!isManual || !isSubmitted) return <span className="text-gray-400 text-xs">-</span>;
        return (
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold"
              onClick={async () => {
                try {
                  await updatePaymentStatus({ id: row.id, body: { status: "approved", paymentStatus: "approved" } }).unwrap();
                  if (row.request_id) {
                    await updateRequestStatus({ id: row.request_id, statusId: 204 }).unwrap();
                    await updateRequestPaymentStatus({ id: row.request_id, paymentStatus: "paid" }).unwrap();
                  }
                } catch (error) {
                  console.error("Error approving payment", error);
                }
              }}
            >
              {tr("approve", "اعتماد")}
            </button>
            <button
              className="px-3 py-1 rounded-lg bg-amber-600 text-white text-xs font-bold"
              onClick={async () => {
                try {
                  await updatePaymentStatus({ id: row.id, body: { status: "under_review", paymentStatus: "under_review" } }).unwrap();
                  if (row.request_id) {
                    await updateRequestPaymentStatus({ id: row.request_id, paymentStatus: "under_review" }).unwrap();
                  }
                } catch (error) {
                  console.error("Error updating payment status", error);
                }
              }}
            >
              {tr("underReview", "تحت المراجعة")}
            </button>
            <button
              className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold"
              onClick={async () => {
                try {
                  await updatePaymentStatus({ id: row.id, body: { status: "rejected", paymentStatus: "rejected" } }).unwrap();
                } catch (error) {
                  console.error("Error rejecting payment", error);
                }
              }}
            >
              {tr("reject", "رفض")}
            </button>
            <a
              onClick={() => { setChatTarget(row); setChatOpen(true); }}
              className="px-3 py-1 rounded-lg bg-gray-100 text-gray-800 text-xs font-bold border border-gray-200 cursor-pointer"
              title={tr("payments.openChat", "فتح محادثة")}
            >
              {tr("payments.openChat", "محادثة")}
            </a>
          </div>
        );
      },
    },
    {
      name: t("payments.order") || "المشروع/الطلب",
      cell: (row) => (
        <a href={row.request?.id ? `/requests/${row.request.id}` : (row.request_id ? `/requests/${row.request_id}` : "#")} className="text-primary hover:underline">
          {row.order?.order_title || row.request?.title || (row.request_id ? `طلب #${String(row.request_id).slice(0, 8)}` : "-")}
        </a>
      ),
    },
    {
      name: t("payments.user") || "المستخدم",
      selector: (row) => row.user?.email || "-",
      wrap: true,
    },
    {
      name: t("payments.date") || "التاريخ",
      selector: (row) => dayjs(row.created_at).format("DD/MM/YYYY HH:mm"),
      wrap: true,
    },
  ];

  return (
    <div className="py-6">
      <div className="mx-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{tr("homeAdmin.wallet", "المحفظة")}</h2>
          <CustomDataTable
            columns={columns}
            data={rows}
            searchableFields={["status", "payment_status"]}
            searchPlaceholder={tr("searchPlaceholder", "ابحث...")}
            isLoading={isLoading}
            pagination={rows.length > 10}
            totalRows={rows.length}
          />
          <AdminPaymentTicketModal
            open={chatOpen}
            onClose={() => setChatOpen(false)}
            userId={chatTarget?.user?.id}
            relatedOrderId={chatTarget?.request_id || chatTarget?.order?.id || null}
            presetTitle={`دفع #${String(chatTarget?.id || "").slice(0, 8)}`}
          />
        </div>
      </div>
    </div>
  );
};

export default Payments;
