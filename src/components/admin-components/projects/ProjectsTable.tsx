import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CustomDataTable from "../../shared/datatable/DataTable";
import { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Eye, Edit, Trash, Calendar, Tag, User, MapPin, Briefcase } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import ModalDelete from "./ModalDelete";
import {
  useGetProjectsQuery,
  useGetProjectsRequestersQuery,
  useDeleteProjectMutation,
} from "@/redux/api/projectsApi";

interface ProjectsTableProps {
  stats: any;
  requesterId?: string;
}

const ProjectsTable = ({ stats, requesterId }: ProjectsTableProps) => {
  const { lang } = useContext(LanguageContext);
  const { t } = useTranslation();
  const role = useSelector((state: any) => state.auth.role);
  const searchParams = useSearchParams();

  const PageNumber = searchParams?.get("PageNumber") || "1";
  const PageSize = searchParams?.get("PageSize") || "30";
  const OrderStatusLookupId = searchParams?.get("OrderStatusLookupId") || "";

  // Map string codes to IDs for API query
  const getStatusId = (code: string) => {
    switch (code) {
      case "waiting_approval": return 17;
      case "waiting_start": return 18;
      case "processing": return 13;
      case "completed": return 15;
      case "ended": return 15;
      case "rejected": return 19;
      case "expired": return 20;
      case "cancelled": return 16;
      case "on-hold": return 14;
      default: return "";
    }
  };

  const useProjectsQuery = role === "Requester" ? useGetProjectsRequestersQuery : useGetProjectsQuery;
  const queryParams: any = {
    PageNumber: Number(PageNumber),
    PageSize: Number(PageSize),
    OrderStatusLookupId: getStatusId(OrderStatusLookupId),
  };

  if (role === "Requester" && requesterId) {
    queryParams.requesterId = requesterId;
  }

  const {
    data: projects,
    isLoading,
    refetch,
  } = useProjectsQuery(queryParams);

  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    refetch();
  }, [PageNumber, PageSize, OrderStatusLookupId, refetch]);

  const askToDelete = (id: string) => {
    setSelectedId(id);
    setOpenDelete(true);
  };

  const onDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteProject(selectedId).unwrap();
      toast.success(t("projects.deleteSuccess") || "تم حذف المشروع بنجاح");
      setOpenDelete(false);
      setSelectedId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || t("projects.deleteError") || "فشل حذف المشروع");
    }
  };

  const tabs = [
    {
      name: t("projects.stats.total") || t("all"),
      href: "/admin/projects",
      numbers: stats?.totalOrdersCount || 0,
      color: "#637381",
    },
    {
      name: t("projects.waitingApproval") || "بانتظار الموافقة",
      href: "/admin/projects?OrderStatusLookupId=waiting_approval",
      numbers: stats?.waitingForApprovalOrdersCount || 0,
      color: "#B76E00",
    },
    {
      name: t("projects.waitingStart") || "بانتظار البدء",
      href: "/admin/projects?OrderStatusLookupId=waiting_start",
      numbers: stats?.waitingToStartOrdersCount || 0,
      color: "#F59E0B",
    },
    {
      name: t("projects.stats.ongoing") || t("projects.processing"),
      href: "/admin/projects?OrderStatusLookupId=processing",
      numbers: stats?.ongoingOrdersCount || 0,
      color: "#b76f21",
    },
    {
      name: t("projects.stats.completed") || t("projects.completed"),
      href: "/admin/projects?OrderStatusLookupId=completed",
      numbers: stats?.completedOrdersCount || 0,
      color: "#007867",
    },
    {
      name: t("projects.stats.rejected") || t("projects.rejected"),
      href: "/admin/projects?OrderStatusLookupId=rejected",
      numbers: stats?.rejectedOrdersCount || 0,
      color: "#B71D18",
    },
  ];

  const columns = [
    {
      name: "#",
      width: "80px",
      cell: (row: any, index?: number) => (
        <span className="font-bold text-gray-400">
          {index ? index + 1 : "-"}
        </span>
      ),
    },
    {
      name: t("projects.orderNumber"),
      width: "120px",
      cell: (row: any) => (
        <span className="font-mono text-[11px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
          #{row.id ? row.id.substring(0, 8) : "-"}
        </span>
      ),
    },
    {
      name: t("common.service") || t("projects.serviceType"),
      grow: 1.5,
      cell: (row: any) => (
        <div className="flex items-center gap-3 py-2">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-gray-900 text-xs truncate">
              {lang === "ar" ? row.request?.service?.name_ar : row.request?.service?.name_en}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">
              {row.request?.title || "-"}
            </span>
          </div>
        </div>
      ),
    },
    {
      name: t("common.client") || t("projects.requester"),
      grow: 1,
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/5 text-primary rounded-lg">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-gray-700">
            {row.request?.requester?.name || "-"}
          </span>
        </div>
      ),
    },
    {
      name: t("common.provider") || t("projects.provider"),
      grow: 1,
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-gray-700">
            {row.provider?.name || "-"}
          </span>
        </div>
      ),
    },
    {
      name: t("common.date") || t("projects.startDate"),
      cell: (row: any) => (
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-[11px] font-medium">
            {row.started_at ? dayjs(row.started_at).format("DD/MM/YYYY") : "-"}
          </span>
        </div>
      ),
    },
    {
      name: t("common.status") || t("projects.orderStatus"),
      cell: (row: any) => {
        const status = row.status;
        const code = status?.code;

        let colors = "";
        if (code === 'completed' || code === 'ended') colors = "bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10";
        else if (code === 'processing' || code === 'waiting_start') colors = "bg-primary/5 text-primary border-primary/10 ring-primary/10";
        else if (code === 'rejected' || code === 'expired' || code === 'cancelled') colors = "bg-rose-50 text-rose-700 border-rose-100 ring-rose-500/10";
        else if (code === 'waiting_approval' || code === 'on-hold') colors = "bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/10";
        else colors = "bg-gray-50 text-gray-700 border-gray-100 ring-gray-500/10";

        return (
          <div className="w-full flex justify-center">
            <div className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border ring-4 ring-opacity-10 transition-all duration-300 flex items-center gap-2 ${colors}`}>
              <span className={`w-2 h-2 rounded-full ${code === 'processing' ? 'bg-primary shadow-[0_0_8px_rgba(25,103,174,0.5)]' : 'bg-current'}`} />
              {lang === "ar" ? status?.name_ar || "-" : status?.name_en || "-"}
            </div>
          </div>
        );
      },
    },
    {
      name: t("common.actions") || t("projects.action"),
      width: "150px",
      cell: (row: any) => (
        <div className="flex items-center justify-center gap-2">
          <Link
            href={`/admin/projects/${row.id}`}
            className="group relative p-2.5 bg-white text-primary rounded-xl border border-primary/10 shadow-sm hover:bg-primary hover:text-white transition-all duration-300"
            title={t("view")}
          >
            <Eye className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
              {t("view")}
            </span>
          </Link>
          <Link
            href={`/admin/projects/${row.id}`}
            className="group relative p-2.5 bg-white text-emerald-600 rounded-xl border border-emerald-100 shadow-sm hover:bg-emerald-600 hover:text-white transition-all duration-300"
            title={t("edit")}
          >
            <Edit className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
              {t("edit")}
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
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-transparent overflow-hidden">
        <CustomDataTable
          tabs={tabs}
          columns={columns}
          data={projects?.data || projects || []}
          searchableFields={["id"]}
          searchPlaceholder={t("searchPlaceholder")}
          pagination={true}
          isLoading={isLoading}
          totalRows={projects?.count || projects?.data?.length || projects?.length || 0}
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

export default ProjectsTable;
