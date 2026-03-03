import { useState } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/shared/OptimizedImage";
import { normalizeImageSrc } from "@/utils/image";
import CustomDataTable from "../../shared/datatable/DataTable";
import TableActions from "../../shared/TableActions";
import { Edit, PlusIcon, Trash } from "lucide-react";
import toast from "react-hot-toast";
import ModalDelete from "./ModalDelete";
// import {
//   useDeletePartnerMutation,
//   useGetPartnersQuery,
// } from "../../../redux/api/partnersApi";
import { useTranslation } from "react-i18next";
import {
  useDeleteCustomerMutation,
  useGetCustomersQuery,
} from "../../../redux/api/customersApi";

const CustomersTable = () => {
  const { t } = useTranslation();

  const { data: customers, isLoading, refetch } = useGetCustomersQuery();
  const [deletePartner, { isLoading: isDeleting }] =
    useDeleteCustomerMutation();

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
      toast.success(t("customers.deleteSuccess"));
      setOpenDelete(false);
      setSelectedId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || t("customers.deleteError"));
    }
  };

  const columns = [
    {
      name: t("customers.name"),
      selector: (row) => row?.name || "-",
      wrap: true,
      grow: 2,
    },
    {
      name: t("customers.image"),
      // selector: (row) => row?.imageBase64 || "-",
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
      grow: 3,
    },
    {
      name: t("customers.actions"),
      cell: (row) => (
        <TableActions
          actions={[
            {
              label: t("customers.edit", "تعديل"),
              icon: <Edit className="w-4 h-4" />,
              href: `/admin/update-customer/${row.id}`,
            },
            {
              label: t("customers.delete", "حذف"),
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
      style: { overflow: "visible" }, // Keeping this just in case, but allowOverflow is the key
    },
  ];

  return (
    <>
      <div className="py-6">
        <div className="mx-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-700">
                {t("customers.title")}
              </h2>
              <Link
                href="/admin/add-customer"
                className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-lg text-sm md:text-base font-medium hover:bg-primary/90 transition"
              >
                <PlusIcon className="w-4 h-4" /> {t("customers.addCustomer")}
              </Link>
            </div>

            <CustomDataTable
              columns={columns}
              data={customers || []}
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

export default CustomersTable;
