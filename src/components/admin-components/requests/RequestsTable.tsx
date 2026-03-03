import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CustomDataTable from "../../shared/datatable/DataTable";
import { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Eye, Edit, Trash, Calendar, Tag, User, MapPin, MessageCircle } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";
import toast from "react-hot-toast";
import ModalDelete from "./ModalDelete";
import RequestsChatModal from "./RequestsChatModal";
import { useSelector } from "react-redux";
import {
    useGetAllRequestsQuery,
    useDeleteRequestMutation
} from "@/redux/api/requestsApi";

interface RequestsTableProps {
    stats: any;
}

const RequestsTable = ({ stats }: RequestsTableProps) => {
    const { t } = useTranslation();
    const { lang } = useContext(LanguageContext);
    const searchParams = useSearchParams();

    // Extract values from URL
    const PageNumber = searchParams?.get("PageNumber") || "1";
    const PageSize = searchParams?.get("PageSize") || "30";
    const RequestStatus = searchParams?.get("RequestStatus") || "";

    const {
        data: response,
        isLoading,
        refetch
    } = useGetAllRequestsQuery({
        PageNumber: Number(PageNumber),
        PageSize: Number(PageSize),
        requestStatus: RequestStatus,
    });

    const [deleteRequest, { isLoading: isDeleting }] = useDeleteRequestMutation();

    const requests = response?.data || [];
    const totalRows = response?.count || 0;

    const [openDelete, setOpenDelete] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Chat Logic
    const { userId } = useSelector((state: any) => state.auth);
    const [openChat, setOpenChat] = useState(false);
    const [chatRequestId, setChatRequestId] = useState<string | null>(null);
    const [chatRequesterId, setChatRequesterId] = useState<string>("");

    const handleChat = (requestId: string, requesterId: string) => {
        setChatRequestId(requestId);
        setChatRequesterId(requesterId);
        setOpenChat(true);
    };

    useEffect(() => {
        refetch();
    }, [PageNumber, PageSize, RequestStatus, refetch]);

    const askToDelete = (id: string) => {
        setSelectedId(id);
        setOpenDelete(true);
    };

    const onDelete = async () => {
        if (!selectedId) return;
        try {
            await deleteRequest(selectedId).unwrap();
            toast.success(t("requests.deleteSuccess"));
            setOpenDelete(false);
            setSelectedId(null);
        } catch (err: any) {
            toast.error(err?.data?.message || t("requests.deleteError"));
        }
    };

    const tabs = [
        {
            name: t("all"),
            href: "/admin/requests",
            numbers: stats?.totalRequestsCount || 0,
            color: "#637381",
        },
        {
            name: t("requests.stats.new"),
            href: "/admin/requests?RequestStatus=7",
            numbers: stats?.newRequestsCount || 0,
            color: "#1967AE",
        },
        {
            name: t("requests.stats.priced"),
            href: "/admin/requests?RequestStatus=8",
            numbers: stats?.underProcessingRequestsCount || 0,
            color: "#B76E00",
        },
        {
            name: t("requests.stats.accepted"),
            href: "/admin/requests?RequestStatus=9",
            numbers: stats?.initiallyApprovedRequestsCount || 0,
            color: "#007867",
        },
        {
            name: t("requests.stats.waitingPayment"),
            href: "/admin/requests?RequestStatus=21",
            numbers: stats?.waitingForPaymentRequestsCount || 0,
            color: "#FF5630",
        },
        {
            name: t("requests.stats.paid") || "مدفوع",
            href: "/admin/requests?RequestStatus=204",
            numbers: stats?.paidRequestsCount || 0,
            color: "#10B981",
        },
        {
            name: t("requests.stats.completed"),
            href: "/admin/requests?RequestStatus=11",
            numbers: stats?.approvedRequestsCount || 0,
            color: "#22C55E",
        },
        {
            name: t("requests.stats.rejected"),
            href: "/admin/requests?RequestStatus=10",
            numbers: stats?.rejectedRequestsCount || 0,
            color: "#B71D18",
        },
    ];

    const columns = [
        {
            name: t("orders.columns.orderNumber"),
            width: "120px",
            cell: (row: any) => (
                <span className="font-mono text-[11px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                    #{row.request_number || row.id.slice(0, 8)}
                </span>
            ),
        },
        {
            name: t("orders.columns.requester"),
            grow: 1.5,
            cell: (row: any) => (
                <div className="flex items-center gap-3 py-2">
                    <div className="p-2 bg-primary/5 text-primary rounded-xl">
                        <User className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-gray-900 text-xs truncate">
                            {row.requester?.name || "-"}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <MapPin className="w-3 h-3" />
                            {lang === "ar" ? row.city?.name_ar : row.city?.name_en}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            name: t("nav.services"),
            grow: 1.5,
            cell: (row: any) => (
                <div className="flex items-center gap-3 py-2">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                        <Tag className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-700 text-xs truncate">
                        {lang === "ar" ? row.service?.name_ar : row.service?.name_en}
                    </span>
                </div>
            ),
        },
        {
            name: t("orders.columns.startDate"),
            cell: (row: any) => (
                <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-[11px] font-medium">
                        {dayjs(row.created_at).format("DD/MM/YYYY")}
                    </span>
                </div>
            ),
        },
        {
            name: t("orders.columns.status"),
            // center: true, // Removed to fix console error
            cell: (row: any) => {
                const status = row.status;
                const statusId = status?.id || row.status_id;

                let colors = "";
                if ([11, 18, 13].includes(statusId)) colors = "bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10";
                else if (statusId === 7) colors = "bg-primary/5 text-primary border-primary/10 ring-primary/10";
                else if (statusId === 10) colors = "bg-rose-50 text-rose-700 border-rose-100 ring-rose-500/10";
                else if (statusId === 21) colors = "bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/10";
                else colors = "bg-gray-50 text-gray-700 border-gray-100 ring-gray-500/10";

                return (
                    <div className="w-full flex justify-center">
                        <div className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border ring-4 ring-opacity-10 transition-all duration-300 flex items-center gap-2 ${colors}`}>
                            <span className={`w-2 h-2 rounded-full ${[7].includes(statusId) ? 'bg-primary shadow-[0_0_8px_rgba(25,103,174,0.5)]' : [11, 18, 13].includes(statusId) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-current'}`} />
                            {lang === "ar" ? status?.name_ar || "-" : status?.name_en || "-"}
                        </div>
                    </div>
                );
            },
        },
        {
            name: t("orders.columns.action"),
            width: "150px",
            cell: (row: any) => (
                <div className="flex items-center justify-center gap-2">
                    <Link
                        href={`/admin/requests/${row.id}`}
                        className="group relative p-2.5 bg-white text-primary rounded-xl border border-primary/10 shadow-sm hover:bg-primary hover:text-white transition-all duration-300"
                        title={t("view")}
                    >
                        <Eye className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                            {t("view")}
                        </span>
                    </Link>
                    <Link
                        href={`/admin/requests/${row.id}`}
                        className="group relative p-2.5 bg-white text-emerald-600 rounded-xl border border-emerald-100 shadow-sm hover:bg-emerald-600 hover:text-white transition-all duration-300"
                        title={t("edit")}
                    >
                        <Edit className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                            {t("edit")}
                        </span>
                    </Link>
                    <button
                        onClick={() => handleChat(row.id, row.requester?.id || "")}
                        className="group relative p-2.5 bg-white text-purple-600 rounded-xl border border-purple-100 shadow-sm hover:bg-purple-600 hover:text-white transition-all duration-300"
                        title={t("tickets.chatTitle") || "المحادثة"}
                    >
                        <MessageCircle className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                            {t("tickets.chatTitle") || "المحادثة"}
                        </span>
                    </button>
                    <button
                        onClick={() => askToDelete(row.id)}
                        className="group relative p-2.5 bg-white text-gray-400 rounded-xl border border-gray-100 shadow-sm hover:bg-gray-900 hover:text-white transition-all duration-300"
                        title={t("delete")}
                    >
                        <Trash className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                            {t("delete")}
                        </span>
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-transparent overflow-hidden">
                <CustomDataTable
                    tabs={tabs}
                    columns={columns}
                    data={requests}
                    searchableFields={["request_number", "requester.name"]}
                    searchPlaceholder={t("searchPlaceholder")}
                    pagination={true}
                    isLoading={isLoading}
                    totalRows={totalRows}
                    defaultPage={Number(PageNumber)}
                    defaultPageSize={Number(PageSize)}
                />
            </div>

            <ModalDelete
                open={openDelete}
                onClose={() => {
                    setOpenDelete(false);
                    setSelectedId(null);
                }}
                onConfirm={onDelete}
                loading={isDeleting}
            />

            <RequestsChatModal
                open={openChat}
                onClose={() => {
                    setOpenChat(false);
                    setChatRequestId(null);
                    setChatRequesterId("");
                }}
                requestId={chatRequestId}
                userId={userId}
                ticketOwnerId={chatRequesterId}
            />
        </div>
    );
};

export default RequestsTable;
