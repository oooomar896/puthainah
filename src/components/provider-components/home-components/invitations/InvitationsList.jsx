import Link from "next/link";
import CustomDataTable from "../../../shared/datatable/DataTable";
import { useContext } from "react";
import dayjs from "dayjs";
import { useGetProviderInvitationsQuery, useRespondToInvitationMutation } from "@/redux/api/requestsApi";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Eye, DollarSign } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";
import toast from "react-hot-toast";
import { formatCurrency } from "@/utils/currency";

const InvitationsList = ({ providerId }) => {
    const { t } = useTranslation();
    const { lang } = useContext(LanguageContext);

    const {
        data: invitations,
        isLoading,
        refetch,
    } = useGetProviderInvitationsQuery({
        providerId,
        PageNumber: 1,
        PageSize: 10,
    }, { skip: !providerId });

    const [respondToInvitation] = useRespondToInvitationMutation();

    const handleResponse = async (requestId, response) => {
        let rejectionReason = null;
        if (response === 'rejected') {
            rejectionReason = window.prompt(t("invitations.rejectReason") || "يرجى إدخال سبب الرفض:");
            if (!rejectionReason) return;
        }

        try {
            await respondToInvitation({ requestId, response, rejectionReason, providerId }).unwrap();
            toast.success(response === 'accepted' ? t("invitations.acceptedSuccess") : t("invitations.rejectedSuccess"));
            refetch();
        } catch {
            toast.error(t("invitations.error"));
        }
    };

    const columns = [
        {
            name: t("invitations.columns.title") || "عنوان الطلب",
            selector: (row) => row.title,
            wrap: true,
            cell: (row) => (
                <div className="flex flex-col py-2">
                    <span className="font-bold text-gray-900">{row.title}</span>
                    <span className="text-[10px] text-gray-400">{row.id?.slice(0, 8)}</span>
                </div>
            )
        },
        {
            name: t("invitations.columns.requester") || "مقدم الطلب",
            selector: (row) => row.requester?.name || "-",
        },
        {
            name: t("invitations.columns.service") || "الخدمة",
            selector: (row) => lang === 'ar' ? row.service?.name_ar : row.service?.name_en,
        },
        {
            name: t("invitations.columns.offeredPrice") || "السعر المعروض",
            cell: (row) => (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100 font-bold text-xs">
                    <DollarSign className="w-3 h-3" />
                    {formatCurrency(row.provider_quoted_price || 0, lang)}
                </div>
            ),
        },
        {
            name: t("invitations.columns.date") || "التاريخ",
            selector: (row) => dayjs(row.created_at).format("DD/MM/YYYY"),
        },
        {
            name: t("invitations.columns.actions") || "الإجراءات",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleResponse(row.id, 'accepted')}
                        className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition"
                        title={t("invitations.accept") || "قبول"}
                    >
                        <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleResponse(row.id, 'rejected')}
                        className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition"
                        title={t("invitations.reject") || "رفض"}
                    >
                        <XCircle className="w-4 h-4" />
                    </button>
                    <Link
                        href={`/provider/invitations/${row.id}`}
                        className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                </div>
            ),
        },
    ];

    const data = Array.isArray(invitations) ? invitations : (invitations?.data || []);

    if (!providerId) return null;

    return (
        <div className="p-6">
            <CustomDataTable
                columns={columns}
                data={data}
                isLoading={isLoading}
                searchPlaceholder={t("invitations.searchPlaceholder") || "البحث في الدعوات..."}
            />
        </div>
    );
};

export default InvitationsList;
