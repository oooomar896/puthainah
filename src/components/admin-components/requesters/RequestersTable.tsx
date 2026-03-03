import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CustomDataTable from "../../shared/datatable/DataTable";
import Avatar from "../../shared/Avatar";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, Edit, Trash, Mail, Phone, MapPin, ShieldCheck, ShieldAlert, MoreVertical } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";
import toast from "react-hot-toast";
import ModalDelete from "./ModalDelete";
import {
  useGetRequestersAccountsQuery,
  useDeleteRequesterMutation,
  useUpdateRequesterStatusMutation,
} from "@/redux/api/requestersApi";

interface RequestersTableProps {
  stats: any;
}

const RequestersTable = ({ stats }: RequestersTableProps) => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);
  const searchParams = useSearchParams();

  // Extract values from URL
  const PageNumber = searchParams?.get("PageNumber") || "1";
  const PageSize = searchParams?.get("PageSize") || "30";
  const AccountStatus = searchParams?.get("AccountStatus") || "";

  const {
    data: response,
    isLoading,
    refetch,
  } = useGetRequestersAccountsQuery({
    PageNumber: Number(PageNumber),
    PageSize: Number(PageSize),
    AccountStatus,
  });

  const [deleteRequester, { isLoading: isDeleting }] = useDeleteRequesterMutation();
  const [updateStatus] = useUpdateRequesterStatusMutation();

  const requesters = response?.data || [];
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
      await deleteRequester(selectedId).unwrap();
      toast.success(t("requesters.deleteSuccess"));
      setOpenDelete(false);
      setSelectedId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || t("requesters.deleteError"));
    }
  };

  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    const loadingToast = toast.loading(t("common.processing"));
    try {
      await updateStatus({
        body: { userId, isBlocked }
      }).unwrap();
      toast.success(isBlocked ? t("requesters.blockSuccess") : t("requesters.unblockSuccess"));
    } catch (err: any) {
      toast.error(err?.data?.message || t("requesters.statusUpdateError"));
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const tabs = [
    {
      name: t("all"),
      href: "/admin/requesters",
      numbers: stats?.totalRequestersCount || 0,
      color: "#637381",
    },
    {
      name: t("requesters.stats.active"),
      href: "/admin/requesters?AccountStatus=active",
      numbers: stats?.activeRequestersCount || 0,
      color: "#007867",
    },
    {
      name: t("requesters.stats.blocked"),
      href: "/admin/requesters?AccountStatus=blocked",
      numbers: stats?.inactiveRequestersCount || 0,
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
              src={row.logoUrl || null}
              name={row.name}
              size={48}
              className="rounded-2xl border-2 border-white shadow-md ring-1 ring-gray-100 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
            />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${row.user?.is_blocked ? 'bg-rose-500' : 'bg-emerald-500'}`} />
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
            <a href={`mailto:${row.user?.email || ""}`} className="text-xs font-medium text-gray-600 group-hover:text-primary truncate max-w-[180px]">
              {row.user?.email || ""}
            </a>
          </div>
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <a href={`tel:${row.user?.phone || ""}`} className="text-xs font-semibold text-gray-700 group-hover:text-primary">
              {row.user?.phone || ""}
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
      center: true,
      cell: (row: any) => {
        const isBlocked = row.user?.is_blocked;
        let colors = isBlocked
          ? "bg-rose-50 text-rose-700 border-rose-100 ring-rose-500/10"
          : "bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10";

        return (
          <div className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border ring-4 ring-opacity-10 transition-all duration-300 flex items-center gap-2 ${colors}`}>
            <span className={`w-2 h-2 rounded-full ${isBlocked ? 'bg-rose-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
            {isBlocked ? t("blocked") || "محظور" : t("active") || "نشط"}
          </div>
        );
      },
    },
    {
      name: t("orders.columns.action"),
      center: true,
      width: "180px",
      cell: (row: any) => {
        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleToggleBlock(row.user_id, !row.user?.is_blocked)}
              className={`group relative p-2.5 bg-white rounded-xl border shadow-sm transition-all duration-300 ${row.user?.is_blocked
                ? "text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white"
                : "text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white"
                }`}
              title={row.user?.is_blocked ? t("unblock") : t("block")}
            >
              {row.user?.is_blocked ? <ShieldCheck className="w-4.5 h-4.5" /> : <ShieldAlert className="w-4.5 h-4.5" />}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                {row.user?.is_blocked ? t("unblock") || "إلغاء الحظر" : t("block") || "حظر"}
              </span>
            </button>
            <Link
              href={`/admin/requesters/${row.id}`}
              className="group relative p-2.5 bg-white text-primary rounded-xl border border-primary/10 shadow-sm hover:bg-primary hover:text-white transition-all duration-300"
              title={t("view")}
            >
              <Eye className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                {t("view")}
              </span>
            </Link>
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
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-transparent overflow-hidden">
        <CustomDataTable
          tabs={tabs}
          columns={columns}
          data={requesters}
          searchableFields={["name"]}
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
    </div>
  );
};

export default RequestersTable;
