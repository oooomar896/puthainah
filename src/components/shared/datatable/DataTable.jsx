// components/shared/DataTable.jsx
import { useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { Search } from "lucide-react";
import Link from "next/link";
import { useLocation } from "@/utils/useLocation";
import { useNavigate } from "@/utils/useNavigate";
import { useSearchParams } from "@/utils/useSearchParams";
import { useTranslation } from "react-i18next";
import { SkeletonTable } from "../../shared/skeletons/Skeleton";
import EmptyState from "../../shared/EmptyState";

const CustomDataTable = ({
  columns,
  pagination,
  data,
  title,
  searchPlaceholder,
  searchableFields = [],
  tabs = [],
  totalRows = 0,
  defaultPage = 1,
  defaultPageSize = 15,
  isLoading,
  isServerPagination = true,
}) => {
  const { t } = useTranslation();
  const path = useLocation();
  const tr = (key, fallback) => {
    const v = t(key);
    return v === key ? fallback : v;
  };

  // ... (customStyles object remains unchanged from previous read)
  const customStyles = {
    tableWrapper: {
      style: {
        borderRadius: tabs?.length > 0 ? "0 0 12px 12px" : "12px",
        overflow: "visible", // This is important for dropdowns
        border: "1px solid #e5e7eb",
      },
    },
    table: {
      style: {
        borderRadius: tabs?.length > 0 ? "0 0 12px 12px" : "12px",
        overflow: "visible",
      },
    },
    responsiveWrapper: {
      style: {
        overflow: "visible",
      },
    },
    headCells: {
      style: {
        backgroundColor: "#F8F9FA",
        color: "#1f2937",
        fontWeight: "bold",
        fontSize: "14px",
        paddingLeft: "16px",
        paddingRight: "16px",
      },
    },
    header: {
      style: {
        minHeight: "56px",
      },
    },
  };

  // ... (existing logic: searchParams, initialQ, search, navigate, location, isProjectDetail, filteredData, handleSearchChange, etc.)
  const searchParams = useSearchParams();
  const initialQ = (searchParams?.get && searchParams.get("q")) || "";
  const [search, setSearch] = useState(initialQ);
  const navigate = useNavigate();
  const location = useLocation();

  const isProjectDetail =
    /^\/projects\/[^/]+$/.test(path?.pathname || "") ||
    /^\/admin\/projects\/[^/]+$/.test(path?.pathname || "") ||
    /^\/provider\/projects\/[^/]+$/.test(path?.pathname || "");

  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter((row) =>
      searchableFields.some((field) =>
        String(row[field] || "").toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search, searchableFields]);

  const handleSearchChange = (value) => {
    setSearch(value);
    const params = new URLSearchParams(location?.search || "");
    if (value) {
      params.set("q", value);
      params.set("PageNumber", 1);
    } else {
      params.delete("q");
      params.set("PageNumber", 1);
    }
    navigate(`${location?.pathname || ""}?${params.toString()}`);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(location?.search || "");
    params.set("PageNumber", page);
    navigate(`${location?.pathname || ""}?${params.toString()}`);
  };

  const handlePerRowsChange = (newPageSize, _) => {
    const params = new URLSearchParams(location?.search || "");
    params.set("PageSize", newPageSize);
    params.set("PageNumber", 1);
    navigate(`${location?.pathname || ""}?${params.toString()}`);
  };

  const queryStatus =
    searchParams?.get("AccountStatus") ||
    searchParams?.get("RequestStatus") ||
    searchParams?.get("OrderStatusLookupId") ||
    "";

  return (
    <div className="custom-table space-y-4">
      {title && <h2 className="text-lg font-bold text-gray-800">{title}</h2>}

      {searchableFields?.length > 0 && (
        <div className="flex justify-center mb-6">
          <div className="relative w-full max-w-xl group">
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder={searchPlaceholder || tr("searchPlaceholder", "ابحث...")}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-12 pr-12 pl-6 bg-gray-50/50 border border-gray-200 rounded-2xl outline-none transition-all duration-300 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 hover:border-gray-300"
            />
          </div>
        </div>
      )}

      {tabs?.length > 0 && (
        <div className="bg-gray-100/50 w-full rounded-t-2xl py-3 px-4 border-x border-t border-gray-200 overflow-auto">
          <ul className="flex items-center gap-6 text-sm">
            {tabs?.map((item, i) => {
              const isActive = (item?.href.includes(queryStatus) && queryStatus) ||
                ((item?.name === "الكل" || item?.name.toLowerCase() === "all" || item?.href === "/admin/providers") && !queryStatus);
              return (
                <li key={i} className="shrink-0">
                  <Link
                    href={item?.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${isActive ? "bg-white shadow-sm text-primary font-bold" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                      }`}
                  >
                    <span
                      className="text-[10px] font-black px-1.5 py-0.5 rounded-lg"
                      style={{
                        backgroundColor: `${item?.color}20`,
                        color: item?.color,
                      }}
                    >
                      {item?.numbers}
                    </span>
                    {item?.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-b-2xl overflow-hidden">
        <DataTable
          data={filteredData}
          columns={columns}
          pagination={pagination === false ? false : true}
          highlightOnHover
          responsive
          customStyles={customStyles}
          noDataComponent={
            <EmptyState
              title={tr("noData", "لا توجد بيانات")}
              description={tr("noDataDesc", "لم يتم العثور على سجلات مطابقة")}
              className="py-20"
            />
          }
          paginationServer={isServerPagination}
          paginationTotalRows={isServerPagination ? totalRows : filteredData?.length}
          paginationDefaultPage={parseInt(defaultPage)}
          paginationPerPage={parseInt(defaultPageSize)}
          paginationRowsPerPageOptions={[15, 25, 50, 100]}
          onChangePage={isProjectDetail ? () => { } : handlePageChange}
          onChangeRowsPerPage={isProjectDetail ? () => { } : handlePerRowsChange}
          progressPending={isLoading}
          progressComponent={
            <div className="w-full py-4">
              <SkeletonTable rows={5} columns={columns?.length || 5} />
            </div>
          }
        />
      </div>
    </div>
  );
}; // End of CustomDataTable

export default CustomDataTable;
