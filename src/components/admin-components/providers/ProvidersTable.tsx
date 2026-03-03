import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CustomDataTable from "../../shared/datatable/DataTable";
import Avatar from "../../shared/Avatar";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, Edit, Trash, CheckCircle, XCircle, MoreVertical, Phone, Mail, MapPin } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";
import toast from "react-hot-toast";
import ModalDelete from "./ModalDelete";
import TableActions from "../../shared/TableActions";
import {
    useGetProvidersAccountsQuery,
    useDeleteProviderMutation,
    useUpdateProviderAccountStatusMutation
} from "@/redux/api/providersApi";

interface ProvidersTableProps {
    stats: any;
}

const ProvidersTable = ({ stats }: ProvidersTableProps) => {
    const { t } = useTranslation();
    const { lang } = useContext(LanguageContext);
    const searchParams = useSearchParams();

    // Extract values from URL
    const PageNumber = searchParams?.get("PageNumber") || "1";
    const PageSize = searchParams?.get("PageSize") || "30";
    const rawStatus = searchParams?.get("AccountStatus") || "";
    const allowedStatuses = ["200", "201", "202", "203"];
    const AccountStatus = allowedStatuses.includes(rawStatus) ? rawStatus : "";

    const {
        data: response,
        isLoading,
        refetch
    } = useGetProvidersAccountsQuery({
        PageNumber: Number(PageNumber),
        PageSize: Number(PageSize),
        AccountStatus,
    });

    const [deleteProvider, { isLoading: isDeleting }] = useDeleteProviderMutation();
    const [updateAccountStatus] = useUpdateProviderAccountStatusMutation();

    const providers = response?.data || [];
    const totalRows = response?.count || 0;

    const [openDelete, setOpenDelete] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        refetch();
    }, [PageNumber, PageSize, AccountStatus, refetch]);

    const askToDelete = (id: string) => {
        setSelectedId(id);
        setOpenDelete(true);
    };

    const onDelete = async () => {
        if (!selectedId) return;
        try {
            await deleteProvider(selectedId).unwrap();
            toast.success(t("providers.deleteSuccess") || "تم حذف مزود الخدمة بنجاح");
            setOpenDelete(false);
            setSelectedId(null);
        } catch (err: any) {
            toast.error(err?.data?.message || t("providers.deleteError") || "فشل حذف مزود الخدمة");
        }
    };

    const handleStatusUpdate = async (providerId: string, statusId: number) => {
        const loadingToast = toast.loading(t("common.processing") || "جاري المعالجة...");
        try {
            await updateAccountStatus({ providerId, statusId }).unwrap();
            toast.success(statusId === 201 ? (t("providers.approveSuccess") || "تم قبول الحساب بنجاح") : (t("providers.rejectSuccess") || "تم تحديث حالة الحساب"));
        } catch (err: any) {
            toast.error(err?.data?.message || t("common.error") || "حدث خطأ ما");
        } finally {
            toast.dismiss(loadingToast);
        }
    };

    const tabs = [
        {
            name: t("all"),
            href: "/admin/providers",
            numbers: stats?.totalAccountsCount || 0,
            color: "#637381",
        },
        {
            name: t("providers.stats.pending"),
            href: "/admin/providers?AccountStatus=200",
            numbers: stats?.pendingAccountsCount || 0,
            color: "#B76E00",
        },
        {
            name: t("providers.stats.active"),
            href: "/admin/providers?AccountStatus=201",
            numbers: stats?.activeAccountsCount || 0,
            color: "#007867",
        },
        {
            name: t("providers.stats.suspended"),
            href: "/admin/providers?AccountStatus=203",
            numbers: stats?.suspendedAccountsCount || 0,
            color: "#b76f21",
        },
        {
            name: t("providers.stats.blocked"),
            href: "/admin/providers?AccountStatus=202",
            numbers: stats?.blockedAccountsCount || 0,
            color: "#B71D18",
        },
    ];

    const columns = [
        {
            name: t("userData.fullName"),
            selector: (row: any) => row.name,
            sortable: true,
            grow: 2,
            cell: (row: any) => (
                <div className="flex items-center gap-4 py-3">
                    <div className="relative group">
                        <Avatar
                            src={row.logoUrl || row.profilePicturePath || null}
                            name={row.name}
                            size={48}
                            className="rounded-2xl border-2 border-white shadow-md ring-1 ring-gray-100 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${(row.profile_status?.id || row.profile_status_id) === 201 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-gray-900 text-[14px] truncate group-hover:text-primary transition-colors">
                            {row.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                                {lang === "ar" ? row.entity_type?.name_ar : row.entity_type?.name_en}
                            </span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            name: t("userData.email"),
            grow: 1.5,
            cell: (row: any) => (
                <div className="flex flex-col gap-2 py-3">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="p-1.5 bg-primary/5 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
                            <Mail className="w-3.5 h-3.5" />
                        </div>
                        <a href={`mailto:${row.user?.email || row.email}`} className="text-xs font-medium text-gray-600 group-hover:text-primary truncate max-w-[180px]">
                            {row.user?.email || row.email}
                        </a>
                    </div>
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <Phone className="w-3.5 h-3.5" />
                        </div>
                        <a href={`tel:${row.user?.phone || row.phoneNumber}`} className="text-xs font-semibold text-gray-700 group-hover:text-primary">
                            {row.user?.phone || row.phoneNumber}
                        </a>
                    </div>
                </div>
            ),
        },
        {
            name: t("userData.workRegion"),
            selector: (row: any) => lang === "ar" ? row.city?.name_ar : row.city?.name_en,
            cell: (row: any) => (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                    <MapPin className="w-4 h-4 text-primary/70" />
                    <span className="text-xs font-bold text-gray-700">
                        {lang === "ar" ? row.city?.name_ar : row.city?.name_en}
                    </span>
                </div>
            ),
        },
        {
            name: t("orders.columns.status"),
            cell: (row: any) => {
                const status = row.profile_status;
                const statusId = status?.id || row.profile_status_id;

                let colors = "";
                if (statusId === 201) colors = "bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10";
                else if (statusId === 200) colors = "bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/10";
                else if (statusId === 202) colors = "bg-red-50 text-red-700 border-red-100 ring-red-500/10";
                else colors = "bg-gray-50 text-gray-700 border-gray-100 ring-gray-500/10";

                return (
                    <div className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border ring-4 ring-opacity-10 transition-all duration-300 flex items-center justify-center gap-2 ${colors}`}>
                        <span className={`w-2 h-2 rounded-full ${statusId === 201 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-current'}`} />
                        {lang === "ar" ? status?.name_ar || "غير معروف" : status?.name_en || "Unknown"}
                    </div>
                );
            },
        },
        {
            name: t("orders.columns.action"),
            width: "180px",
            cell: (row: any) => {
                const statusId = row.profile_status?.id || row.profile_status_id;

                return (
                    <div className="flex items-center justify-center gap-2">
                        {statusId === 200 && (
                            <button
                                onClick={() => handleStatusUpdate(row.id, 201)}
                                className="group relative p-2.5 bg-white text-emerald-600 rounded-xl border border-emerald-100 shadow-sm hover:bg-emerald-600 hover:text-white transition-all duration-300"
                                title={t("providers.approve")}
                            >
                                <CheckCircle className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                                    {t("providers.approve")}
                                </span>
                            </button>
                        )}
                        {statusId !== 202 && (
                            <button
                                onClick={() => handleStatusUpdate(row.id, 202)}
                                className="group relative p-2.5 bg-white text-rose-600 rounded-xl border border-rose-100 shadow-sm hover:bg-rose-600 hover:text-white transition-all duration-300"
                                title={t("providers.reject")}
                            >
                                <XCircle className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                                    {t("providers.reject")}
                                </span>
                            </button>
                        )}
                        <Link
                            href={`/admin/providers/${row.id}`}
                            className="group relative p-2.5 bg-white text-primary rounded-xl border border-primary/10 shadow-sm hover:bg-primary hover:text-white transition-all duration-300"
                            title={t("providers.view")}
                        >
                            <Eye className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                                {t("providers.view")}
                            </span>
                        </Link>
                        <button
                            onClick={() => askToDelete(row.id)}
                            className="group relative p-2.5 bg-white text-gray-400 rounded-xl border border-gray-100 shadow-sm hover:bg-gray-900 hover:text-white transition-all duration-300"
                            title={t("providers.delete")}
                        >
                            <Trash className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                                {t("providers.delete")}
                            </span>
                        </button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-transparent overflow-hidden">
                {(!isLoading && providers.length === 0) && (
                    <div className="mb-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 flex items-center justify-between">
                        <div className="text-sm">
                            {t("noDataDesc") || "لم يتم العثور على سجلات مطابقة"}
                        </div>
                        <Link href="/admin/providers" className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700">
                            {t("common.resetFilters") || "إعادة ضبط الفلاتر"}
                        </Link>
                    </div>
                )}
                {providers.length > 0 && (
                    <CustomDataTable
                        tabs={tabs}
                        columns={columns}
                        data={providers}
                        searchableFields={["name"]}
                        searchPlaceholder={t("searchPlaceholder")}
                        pagination={true}
                        isLoading={isLoading}
                        totalRows={totalRows}
                        defaultPage={Number(PageNumber)}
                        defaultPageSize={Number(PageSize)}
                    />
                )}
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
        </div>
    );
};

export default ProvidersTable;
