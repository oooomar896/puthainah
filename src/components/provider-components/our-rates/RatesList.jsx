// example: pages/RatesList.jsx

import CustomDataTable from "../../shared/datatable/DataTable";
import star from "../../../assets/icons/star.svg";
import emptyStar from "../../../assets/icons/emptyStar.svg";
import { useEffect } from "react";
import { useGetRatingsQuery } from "../../../redux/api/ratingsApi";
import { useSearchParams } from "@/utils/useSearchParams";
import { useTranslation } from "react-i18next";
const RatesList = () => {
  const { t } = useTranslation(); // 🟢 استدعاء hook الترجمة

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

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PageNumber, PageSize]);

  const columns = [
    {
      name: t("rates.projectNumber") || "رقم المشروع",
      cell: (row) => (
        <span className={`rounded-lg text-xs text-blue-600 font-normal`}>
          {row.orderNumber}
        </span>
      ),
    },
    {
      name: t("rates.projectName") || "اسم المشروع",
      cell: (row) => row.orderTitle,
    },
    {
      name: t("rates.clientName") || "اسم العميل",
      selector: (row) => row.requester?.fullName,
      sortable: true,
    },
    {
      name: t("rates.ratingStars") || "التقييم",
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
      name: t("rates.clientNotes") || "ملاحظات العميل",
      selector: (row) => row.ratingNotes,
      sortable: true,
      cell: (row) => (
        <div title={row.ratingNotes} className="">
          {row.ratingNotes}
        </div>
      ),
    },
  ];

  return (
    <div className="py-5">
      <div className="mx-2">
        <div className="rounded-3xl bg-white p-5">
          <CustomDataTable
            columns={columns}
            data={ratings}
            searchableFields={["orderTitle", "orderNumber", "ratingNotes"]}
            searchPlaceholder={t("searchPlaceholder") || "بحث..."}
            defaultPage={PageNumber}
            defaultPageSize={PageSize}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default RatesList;
