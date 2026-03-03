// example: pages/ExploreRequests.jsx

import { useTranslation } from "react-i18next";
import CustomDataTable from "../../shared/datatable/DataTable";

const ExploreRequests = () => {
  const { t } = useTranslation();

  const columns = [
    {
      name: t("exploreRequests.columns.projectName"),
      cell: (row) => (
        <span className={`rounded-lg text-xs text-blue-600 font-normal`}>
          {row.orderno}
        </span>
      ),
    },
    {
      name: t("exploreRequests.columns.serviceType"),
      selector: (row) => row.typeService,
      sortable: true,
    },
    {
      name: t("exploreRequests.columns.requestDate"),
      selector: (row) => row.date,
    },
    {
      name: t("exploreRequests.columns.status"),
      cell: (row) => (
        <span
          className={`text-nowrap px-0.5 py-1 rounded-lg text-xs font-bold
              ${
                row.status === t("exploreRequests.status.new")
                  ? "border border-[#B2EECC] bg-[#EEFBF4] text-green-800"
                  : row.status === t("exploreRequests.status.old")
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600"
              }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  const data = [
    {
      id: 1,
      orderno: "#1002",
      typeService: t("exploreRequests.columns.serviceType"), // أو خليه ديناميكي من API
      date: "15|5|2025",
      status: t("exploreRequests.status.new"),
    },
    {
      id: 2,
      orderno: "#1002",
      typeService: t("exploreRequests.columns.serviceType"),
      date: "15|5|2025",
      status: t("exploreRequests.status.new"),
    },
    {
      id: 3,
      orderno: "#1002",
      typeService: t("exploreRequests.columns.serviceType"),
      date: "15|5|2025",
      status: t("exploreRequests.status.new"),
    },
    {
      id: 4,
      orderno: "#1002",
      typeService: t("exploreRequests.columns.serviceType"),
      date: "15|5|2025",
      status: t("exploreRequests.status.new"),
    },
    {
      id: 5,
      orderno: "#1002",
      typeService: t("exploreRequests.columns.serviceType"),
      date: "15|5|2025",
      status: t("exploreRequests.status.new"),
    },
  ];

  return (
    <div className="py-5">
      <div className="rounded-3xl bg-white">
        <h3 className="font-bold text-xl mb-3">
          {t("exploreRequests.pageTitle")}
        </h3>
        <CustomDataTable
          columns={columns}
          data={data}
          // title="احدث الطلبات"
          searchableFields={null}
          pagination={false}
        />
      </div>
    </div>
  );
};

export default ExploreRequests;
