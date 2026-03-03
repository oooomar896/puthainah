import { useState } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/shared/OptimizedImage";
import { normalizeImageSrc } from "@/utils/image";
import CustomDataTable from "../../shared/datatable/DataTable";
import { Edit, PlusIcon, Trash, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import ModalDelete from "./ModalDelete";
import {
  useDeletePartnerMutation,
  useGetAllPartnersQuery,
} from "../../../redux/api/partnersApi";
import { useTranslation } from "react-i18next";
import TableActions from "../../shared/TableActions";

const PartnersTable = () => {
  const { t } = useTranslation();

  const { data: partners, isLoading, refetch } = useGetAllPartnersQuery();
  const [deletePartner, { isLoading: isDeleting }] = useDeletePartnerMutation();

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const askToDelete = (id) => {
    setSelectedId(id);
    setOpenDelete(true);
  };

  const onDelete = async () => {
    if (!selectedId) return;

    try {
      await deletePartner(selectedId).unwrap();
      toast.success(t("partners.deleteSuccess"));
      setOpenDelete(false);
      setSelectedId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || t("partners.deleteError"));
    }
  };

  const columns = [
    {
      name: t("partners.name"),
      selector: (row) => row?.name || "-",
      wrap: true,
      grow: 2,
    },
    {
      name: t("partners.image"),
      cell: (row) => (
        <div className="flex items-center gap-3 justify-center">
          <OptimizedImage
            src={normalizeImageSrc(row.logo_url || row.imageBase64)}
            alt={row.name}
            width={50}
            height={50}
            className="w-12 h-12 rounded-lg object-contain bg-gray-50 border border-gray-100 p-1"
          />
        </div>
      ),
      wrap: true,
      grow: 2,
    },
    {
      name: t("partners.status") || "الحالة",
      cell: (row) => (
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${row.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {row.is_active ? (
            <><Check className="w-3 h-3" /> {t("active") || "نشط"}</>
          ) : (
            <><X className="w-3 h-3" /> {t("inactive") || "غير نشط"}</>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      name: t("partners.actions"),
      cell: (row) => (
        <TableActions
          actions={[
            {
              label: t("partners.edit") || "تعديل",
              icon: <Edit className="w-4 h-4" />,
              href: `/admin/update-partner/${row.id}`,
            },
            {
              label: t("partners.delete") || "حذف",
              icon: <Trash className="w-4 h-4" />,
              onClick: () => askToDelete(row.id),
              variant: "destructive",
            },
          ]}
        />
      ),
      ignoreRowClick: true,
      button: true,
      allowOverflow: true,
      style: { overflow: "visible" },
    },
  ];

  return (
    <>
      <div className="py-6">
        <div className="mx-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-700">
                {t("partners.title")}
              </h2>
              <Link
                href="/admin/add-partner"
                className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-lg text-sm md:text-base font-medium hover:bg-primary/90 transition"
              >
                <PlusIcon className="w-4 h-4" /> {t("partners.addPartner")}
              </Link>
            </div>

            <CustomDataTable
              columns={columns}
              data={partners || []}
              searchableFields={["name"]}
              isLoading={isLoading}
              searchPlaceholder={t("searchPlaceholder")}
            />
          </div>
        </div>
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
    </>
  );
};

export default PartnersTable;
