import { useState } from "react";
import CustomDataTable from "../../shared/datatable/DataTable";
import star from "../../../assets/icons/star.svg";
import emptyStar from "../../../assets/icons/emptyStar.svg";
import { useEffect } from "react";
import { useGetRatingsQuery, useDeleteRatingMutation } from "../../../redux/api/ratingsApi";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";
import ModalDelete from "./ModalDelete";

const RatingsTable = () => {
  const { t } = useTranslation();

  const searchParams = useSearchParams();
  const PageNumber = searchParams.get("PageNumber") || 1;
  const PageSize = searchParams.get("PageSize") || 30;
  const {
    data: ratings,
    isLoading,
    refetch,
  } = useGetRatingsQuery({
    PageNumber,
    PageSize,
  });

  const [deleteRating, { isLoading: isDeleting }] = useDeleteRatingMutation();

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PageNumber, PageSize]);

  const askToDelete = (id) => {
    setSelectedId(id);
    setOpenDelete(true);
  };

  const onDelete = async () => {
    if (!selectedId) return;

    try {
      await deleteRating(selectedId).unwrap();
      toast.success(t("ratings.deleteSuccess") || "تم حذف التقييم بنجاح");
      setOpenDelete(false);
      setSelectedId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || t("ratings.deleteError") || "فشل حذف التقييم");
    }
  };

  const columns = [
    {
      name: t("rates.projectNumber"),
      cell: (row) => (
        <span className={`rounded-lg text-xs text-blue-600 font-normal`}>
          {row.orderNumber}
        </span>
      ),
    },
    {
      name: t("rates.projectName"),
      cell: (row) => row.orderTitle,
    },
    {
      name: t("rates.clientName"),
      selector: (row) => row.requester?.fullName,
      sortable: true,
    },
    {
      name: t("rates.ratingStars"),
      cell: (row) => (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <img
              key={index}
              src={index < row?.orderRating ? star : emptyStar}
              alt="star"
              className="w-4 h-4"
            />
          ))}
        </div>
      ),
    },
    {
      name: t("rates.clientNotes"),
      selector: (row) => row.ratingNotes,
      sortable: true,
      cell: (row) => (
        <div title={row.ratingNotes} className="">
          {row.ratingNotes}
        </div>
      ),
    },
    {
      name: t("ratings.actions") || "الإجراءات",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => askToDelete(row.id)}
            className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition text-xs font-medium"
          >
            <Trash width={15} />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];

  return (
    <>
      <div className="py-5">
        <div className="mx-2">
          <div className="rounded-3xl bg-white p-5">
            <CustomDataTable
              columns={columns}
              data={ratings}
              searchableFields={["orderTitle", "orderNumber", "ratingNotes"]}
              searchPlaceholder={t("searchPlaceholder")}
              defaultPage={PageNumber}
              defaultPageSize={PageSize}
              isLoading={isLoading}
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

export default RatingsTable;
