import { useTranslation } from "react-i18next";
import CustomDataTable from "../../shared/datatable/DataTable";
import { getAppBaseUrl } from "../../../utils/env";

import { FileText, Eye, Download } from "lucide-react";

const AttachmentsTable = ({ title, attachments }) => {
  const { t } = useTranslation();
  const base = getAppBaseUrl();

  const columns = [
    {
      name: t("projects.attachments") || "المرفقات",
      cell: (row) => (
        <div className="flex items-center gap-3 py-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <FileText className="w-4 h-4" />
          </div>
          <span className="font-bold text-gray-700 text-xs truncate max-w-[200px]">
            {row?.fileName || row?.name || "Document"}
          </span>
        </div>
      ),
    },
    {
      name: t("projects.action") || "إجراء",
      right: true,
      cell: (row) => (
        <a
          href={`${base}${row?.filePathUrl || row?.path || ""}`}
          target="_blank"
          className="flex items-center gap-2 bg-gray-50 hover:bg-primary/10 text-gray-600 hover:text-primary px-4 py-2 rounded-xl text-[10px] font-black tracking-wider transition-all border border-transparent hover:border-primary/20"
        >
          <Eye className="w-3.5 h-3.5" />
          {t("projects.preview") || "معاينة"}
        </a>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];

  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="py-4">
      <div className="rounded-[32px] bg-white border border-gray-100 shadow-sm overflow-hidden">
        <CustomDataTable
          title={title || t("projects.attachments")}
          columns={columns}
          data={attachments}
          searchableFields={false}
          pagination={attachments.length > 5}
          totalRows={attachments.length}
        />
      </div>
    </div>
  );
};

export default AttachmentsTable;
