import Link from "next/link";
import CustomDataTable from "../../shared/datatable/DataTable";
import { useGetTicketsQuery } from "../../../redux/api/ticketApi";
import { useSelector } from "react-redux";
import { EyeIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useContext, useEffect, useState } from "react";
import { LanguageContext } from "@/context/LanguageContext";
import TicketModal from "../../landing-components/profile-components/TicketModal";
import { tr as trHelper } from "@/utils/tr";

const TicketsTable = () => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);
  const tr = (key, fallback) => trHelper(t, key, fallback);
  const [open, setOpen] = useState(false);
  const role = useSelector((state) => state.auth.role);
  const { data: tickets, isLoading, isError, error, refetch } = useGetTicketsQuery(undefined, {
    // For admin, we don't necessarily need userId, but let's be safe
  });

  useEffect(() => {
    if (role === "Admin") {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  if (isError) {
    console.error("Admin TicketsTable error:", error);
  }

  const columns = [
    {
      name: t("tickets.username"),
      selector: (row) => row?.user?.email || "-",
      wrap: true,
    },
    {
      name: t("tickets.complaint_title"),
      selector: (row) => row?.title || "-",
      wrap: true,
    },
    {
      name: t("tickets.complaint_status"),
      selector: (row) => {
        return lang === "ar"
          ? row?.status?.name_ar
          : row?.status?.name_en || "-";
      },
      wrap: true,
    },
    {
      name: t("tickets.actions"),
      cell: (row) => (
        <Link
          href={
            role === "Admin"
              ? `/admin/tickets/${row.id}`
              : `/provider/tickets/${row.id}`
          }
          className="bg-primary text-white px-1 py-1 rounded-xl hover:bg-primary/90 transition text-xs font-medium ml-5 text-nowrap"
        >
          <EyeIcon />
        </Link>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];

  return (
    <div className="py-5">
      <div className="mx-2">
        <div className="rounded-3xl bg-white p-5">
          <button
            onClick={() => setOpen(true)}
            className="bg-primary/10 rounded-xl text-sm font-bold py-2 px-4 w-fit block mr-auto"
          >
            {tr("ticket.sendTicket", "إرسال تذكرة")}
          </button>
          <TicketModal open={open} setOpen={setOpen} refetch={refetch} />
          <CustomDataTable
            columns={columns}
            data={tickets}
            searchableFields={["user.name", "title", "status.nameAr"]}
            searchPlaceholder={tr("searchPlaceholder", "ابحث...")}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default TicketsTable;
