// example: pages/OrdersTable.jsx

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";
import { LanguageContext } from "@/context/LanguageContext";
import { useGetCitiesQuery } from "@/redux/api/citiesApi";
import { useGetServicesQuery } from "@/redux/api/servicesApi";
import { useNavigate } from "@/utils/useNavigate";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import CustomDataTable from "../../shared/datatable/DataTable";
import { useGetUserOrdersQuery } from "../../../redux/api/ordersApi";
import { useGetRequesterByUserIdQuery } from "../../../redux/api/usersDetails";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

import { TablePageSkeleton } from "../../shared/skeletons/PageSkeleton";
import FadeIn from "../../shared/FadeIn";

const ExploreRequests = ({ stats }) => {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);

  const searchParams = useSearchParams();
  const PageNumber = searchParams.get("PageNumber") || 1;
  const PageSize = searchParams.get("PageSize") || 30;
  const RequestStatus = searchParams.get("RequestStatus") || "";
  const CityId = searchParams.get("CityId") || "";
  const ServiceId = searchParams.get("ServiceId") || "";

  const { userId } = useSelector((state) => state.auth);
  const { data: requesterDataResult } = useGetRequesterByUserIdQuery(userId, { skip: !userId });
  const requesterData = Array.isArray(requesterDataResult) ? requesterDataResult[0] : requesterDataResult;

  const {
    data: orders,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUserOrdersQuery({
    PageNumber,
    PageSize,
    RequestStatus,
    CityId,
    ServiceId,
    requesterId: requesterData?.id,
  }, { skip: !requesterData?.id });

  const { data: cities, isLoading: citiesLoading } = useGetCitiesQuery();
  const { data: services, isLoading: servicesLoading } = useGetServicesQuery();
  const navigate = useNavigate();
  const [dynamicTotal, setDynamicTotal] = useState(null);

  const onFilterChange = (key, value) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("PageNumber", 1);
    navigate(`${window.location.pathname}?${params.toString()}`);
  };

  const activeCity = (cities || []).find((c) => String(c.id) === String(CityId));
  const activeService = (services || []).find((s) => String(s.id) === String(ServiceId));

  const totalRows = (() => {
    if (RequestStatus === "207") return stats?.underProcessingRequestsCount || 0;
    if (RequestStatus === "8") return stats?.initiallyApprovedRequestsCount || 0;
    if (RequestStatus === "21") return stats?.waitingForPaymentRequestsCount || 0;
    if (RequestStatus === "10") return stats?.rejectedRequestsCount || 0;
    if (RequestStatus === "11") return stats?.approvedRequestsCount || 0;
    if (RequestStatus === "7") return stats?.newRequestssCount || 0;
    return stats?.totalRequestsCount || 0;
  })();

  // Dynamic count that respects CityId/ServiceId filters
  useEffect(() => {
    if (!CityId && !ServiceId) {
      setDynamicTotal(null);
      return;
    }

    let mounted = true;
    const loadCount = async () => {
      try {
        if (!supabase) {
          setDynamicTotal(null);
          return;
        }
        let query = supabase.from("requests").select("*", { count: "exact", head: true });
        if (requesterData?.id) query = query.eq("requester_id", requesterData.id);
        if (RequestStatus) query = query.eq("status_id", RequestStatus);
        if (CityId) query = query.eq("city_id", CityId);
        if (ServiceId) query = query.eq("service_id", ServiceId);
        const { count, error } = await query;
        if (error) {
          setDynamicTotal(null);
          return;
        }
        if (!mounted) return;
        setDynamicTotal(count ?? null);
      } catch {
        setDynamicTotal(null);
      }
    };
    loadCount();
    return () => {
      mounted = false;
    };
  }, [RequestStatus, CityId, ServiceId, requesterData?.id]);

  useEffect(() => {
    if (requesterData?.id) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PageNumber, PageSize, RequestStatus, CityId, ServiceId, requesterData?.id]);

  if (isLoading) {
    return <TablePageSkeleton />;
  }

  const tabs = [
    {
      name: t("requestsUser.status_all"),
      href: "",
      numbers: stats?.totalRequestsCount,
      color: "#637381",
    },
    {
      name: t("requestsUser.status_new"),
      href: "?RequestStatus=7",
      numbers: stats?.newRequestssCount,
      color: "#B76E00",
    },
    {
      name: t("requestsUser.status_processing"),
      href: "?RequestStatus=207",
      numbers: stats?.underProcessingRequestsCount,
      color: "#B76E00",
    },
    {
      name: t("requestsUser.status_initial_approval"),
      href: "?RequestStatus=8",
      numbers: stats?.initiallyApprovedRequestsCount,

      color: "#007867",
    },
    {
      name: t("requestsUser.status_waiting_payment"),
      href: "?RequestStatus=21",
      numbers: stats?.waitingForPaymentRequestsCount,
      color: "#b76f21",
    },
    {
      name: t("requestsUser.status_rejected"),
      href: "?RequestStatus=10",
      numbers: stats?.rejectedRequestsCount,
      color: "#B71D18",
    },
    {
      name: t("requestsUser.status_completed"),
      href: "?RequestStatus=11",
      numbers: stats?.approvedRequestsCount,
      color: "#007867",
    },
  ];
  const columns = [
    {
      name: t("requestsUser.request_number"),
      cell: (row) => (
        <span className="text-xs font-medium text-gray-400">
          #{row?.id?.slice(0, 8)}
        </span>
      ),
      width: "100px",
    },
    {
      name: t("projects.serviceType"),
      selector: (row) =>
        lang === "ar" ? row.service?.name_ar : row.service?.name_en,
      wrap: true,
    },
    {
      name: t("requestsUser.requester_name"),
      selector: (row) => row.requester?.name || row.fullName || "-",
      wrap: true,
    },
    {
      name: t("requestsUser.request_date"),
      selector: (row) => row.created_at ? dayjs(row.created_at).format("DD/MM/YYYY hh:mm A") : "-",
      wrap: true,
    },
    {
      name: t("requestsUser.request_status"),
      cell: (row) => (
        <span
          className={`text-nowrap px-3 py-1 rounded-full text-[10px] font-bold border
              ${row.status?.code === "accepted" || row.status?.code === "completed"
              ? "border-green-200 bg-green-50 text-green-700"
              : row.status?.code === "priced"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : row.status?.code === "rejected"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : row.status?.code === "waiting-payment" || row.status?.code === "priced"
                    ? "border-orange-200 bg-orange-50 text-orange-700"
                    : "border-gray-200 bg-gray-50 text-gray-600"
            }`}
        >
          {lang === "ar"
            ? row.status?.name_ar
            : row.status?.name_en}
        </span>
      ),
      wrap: true,
    },
    {
      name: t("requestsUser.action"),
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/requests/${row.id}`}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
            title={t("viewDetails")}
          >
            <Eye size={16} />
          </Link>
        </div>
      ),
      width: "80px",
    },
  ];

  const baseData = Array.isArray(orders) ? orders : (orders?.data || []);
  const sortedData = baseData && baseData.length > 0
    ? [...baseData]?.sort((a, b) => {
      const aTime = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b?.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    })
    : [];

  return (
    <FadeIn className="py-5">
      <div className="container">
        <div className="rounded-3xl bg-white shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h3 className="font-bold text-2xl text-gray-800">
              {t("requestsUser.my_requests")}
            </h3>

            <div className="flex flex-wrap gap-2">
              <select
                id="filter-city"
                value={CityId}
                onChange={(e) => onFilterChange("CityId", e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                disabled={citiesLoading}
              >
                <option value="">{t("city") || "المدينة"}</option>
                {citiesLoading ? (
                  <option value="">{t("loading.default")}</option>
                ) : (
                  (cities || []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {lang === "ar" ? c.name_ar : c.name_en}
                    </option>
                  ))
                )}
              </select>

              <select
                id="filter-service"
                value={ServiceId}
                onChange={(e) => onFilterChange("ServiceId", e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                disabled={servicesLoading}
              >
                <option value="">{t("projects.serviceType")}</option>
                {servicesLoading ? (
                  <option value="">{t("loading.default")}</option>
                ) : (
                  (services || []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {lang === "ar" ? s.name_ar : s.name_en}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {isError && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {(error?.data?.message) || (error?.error) || t("error.default") || "An error occurred"}
            </div>
          )}

          {(CityId || ServiceId) && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500 mr-2 ltr:ml-2">{t("activeFilters") || "الفلاتر النشطة"}:</span>
              {CityId && activeCity && (
                <span className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-xs font-medium">
                  {lang === "ar" ? activeCity.name_ar : activeCity.name_en}
                  <button
                    type="button"
                    onClick={() => onFilterChange("CityId", "")}
                    className="hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                </span>
              )}
              {ServiceId && activeService && (
                <span className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-xs font-medium">
                  {lang === "ar" ? activeService.name_ar : activeService.name_en}
                  <button
                    type="button"
                    onClick={() => onFilterChange("ServiceId", "")}
                    className="hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  const params = new URLSearchParams(window.location.search);
                  params.delete("CityId");
                  params.delete("ServiceId");
                  params.set("PageNumber", 1);
                  navigate(`${window.location.pathname}?${params.toString()}`);
                }}
                className="text-xs text-red-500 hover:underline font-medium px-2"
              >
                {t("clearAll") || "حذف الكل"}
              </button>
            </div>
          )}

          <div className="overflow-hidden">
            <CustomDataTable
              tabs={tabs}
              columns={columns}
              data={sortedData}
              searchableFields={["fullName", "requestNumber"]}
              searchPlaceholder={t("searchPlaceholder")}
              defaultPage={PageNumber}
              defaultPageSize={PageSize}
              totalRows={dynamicTotal ?? totalRows}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </FadeIn>
  );
};

export default ExploreRequests;
