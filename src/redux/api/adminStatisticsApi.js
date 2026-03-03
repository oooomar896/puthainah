import { createApi } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabaseClient";

// Custom base query for statistics that need complex aggregations
const statisticsBaseQuery = async (args) => {
  const { type, filters = {} } = args;

  try {
    let result;

    switch (type) {
      case "requesters": {
        // Count requesters, active/inactive
        const [totalRequesters, activeRequesters] = await Promise.all([
          supabase.from("requesters").select("id", { count: "exact", head: true }),
          supabase
            .from("requesters")
            .select("id", { count: "exact", head: true })
            .eq("users!requesters_user_id_fkey.is_blocked", false),
        ]);
        result = {
          totalRequestersCount: totalRequesters.count || 0,
          activeRequestersCount: activeRequesters.count || 0,
          inactiveRequestersCount: (totalRequesters.count || 0) - (activeRequesters.count || 0),
        };
        break;
      }

      case "providers": {
        const [
          total,
          pending,
          active,
          blocked,
          suspended
        ] = await Promise.all([
          supabase.from("providers").select("id", { count: "exact", head: true }),
          supabase.from("providers").select("id", { count: "exact", head: true }).eq("profile_status_id", 200),
          supabase.from("providers").select("id", { count: "exact", head: true }).eq("profile_status_id", 201),
          supabase.from("providers").select("id", { count: "exact", head: true }).eq("profile_status_id", 202),
          supabase.from("providers").select("id", { count: "exact", head: true }).eq("profile_status_id", 203),
        ]);

        result = {
          totalAccountsCount: total.count || 0,
          pendingAccountsCount: pending.count || 0,
          activeAccountsCount: active.count || 0,
          blockedAccountsCount: blocked.count || 0,
          suspendedAccountsCount: suspended.count || 0,
        };
        break;
      }

      case "requests": {
        // Count requests by status
        // IDs: 7=pending, 8=priced, 9=accepted, 10=rejected, 11=completed, 21=waiting_payment
        const [
          total,
          processing,
          initialApproval,
          waitingPayment,
          rejected,
          completed,
          newRequests,
          paid
        ] = await Promise.all([
          supabase.from("requests").select("id", { count: "exact", head: true }),
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("status_id", 8),
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("status_id", 9),
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("status_id", 21),
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("status_id", 10),
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("status_id", 11),
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("status_id", 7),
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("status_id", 204),
        ]);

        result = {
          totalRequestsCount: total.count || 0,
          underProcessingRequestsCount: processing.count || 0,
          initiallyApprovedRequestsCount: initialApproval.count || 0,
          waitingForPaymentRequestsCount: waitingPayment.count || 0,
          rejectedRequestsCount: rejected.count || 0,
          approvedRequestsCount: completed.count || 0,
          newRequestsCount: newRequests.count || 0,
          paidRequestsCount: paid.count || 0,
        };
        break;
      }

      case "admin": {
        // Platform-wide statistics
        const [
          usersCount,
          requestersCount,
          providersCount,
          requestsCount,
          ordersCount,
          paymentsCount,
          projectsCount,
          ticketsCount,
          newRequestsCount,
          paidRequestsCount,
          // Service breakdown
          consultationsCount,
          diagnosisCount,
          maintenanceCount,
          trainingCount,
          supervisionCount,
          executionCount,
          managementCount,
          wholesaleCount,
        ] = await Promise.all([
          supabase.from("users").select("id", { count: "exact", head: true }),
          supabase.from("requesters").select("id", { count: "exact", head: true }),
          supabase.from("providers").select("id", { count: "exact", head: true }),
          supabase.from("requests").select("id", { count: "exact", head: true }),
          supabase.from("orders").select("id", { count: "exact", head: true }),
          supabase.from("payments").select("amount"),
          supabase.from("orders").select("id", { count: "exact", head: true }),
          supabase.from("tickets").select("id", { count: "exact", head: true }),
          // Specific requests statuses for main dashboard
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("status_id", 7), // new
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("status_id", 204), // paid
          // Specific service counts (approximate mapping to service_id if available, otherwise 0)
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("service_id", 1),
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("service_id", 2),
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("service_id", 3),
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("service_id", 4),
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("service_id", 5),
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("service_id", 6),
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("service_id", 7),
          supabase.from("requests").select("id", { count: "exact", head: true }).eq("service_id", 8),
        ]);

        const totalAmount = paymentsCount.data?.reduce((sum, row) => sum + Number(row.amount || 0), 0) || 0;

        result = {
          totalUsers: usersCount.count || 0,
          totalRequesters: requestersCount.count || 0,
          totalProviders: providersCount.count || 0,
          totalRequests: requestsCount.count || 0,
          totalOrders: ordersCount.count || 0,
          totalProjects: projectsCount.count || 0,
          totalTickets: ticketsCount.count || 0,
          totalFinancialAmounts: totalAmount,
          newRequestsCount: newRequestsCount.count || 0,
          paidRequestsCount: paidRequestsCount.count || 0,
          serviceBreakdown: {
            consultations: consultationsCount.count || 0,
            diagnosis: diagnosisCount.count || 0,
            maintenance: maintenanceCount.count || 0,
            training: trainingCount.count || 0,
            supervision: supervisionCount.count || 0,
            execution: executionCount.count || 0,
            management: managementCount.count || 0,
            wholesale: wholesaleCount.count || 0,
          }
        };
        break;
      }

      case "projects": {
        const [
          total,
          waitingApproval,
          waitingStart,
          processing,
          completed,
          rejected,
          expired
        ] = await Promise.all([
          supabase.from("orders").select("id", { count: "exact", head: true }),
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_status_id", 17),
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_status_id", 18),
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_status_id", 13),
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_status_id", 15),
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_status_id", 19),
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_status_id", 20),
        ]);

        result = {
          totalOrdersCount: total.count || 0,
          waitingForApprovalOrdersCount: waitingApproval.count || 0,
          waitingToStartOrdersCount: waitingStart.count || 0,
          ongoingOrdersCount: processing.count || 0,
          completedOrdersCount: completed.count || 0,
          rejectedOrdersCount: rejected.count || 0,
          expiredOrdersCount: expired.count || 0,
        };
        break;
      }

      case "providerOrders": {
        // Provider-specific order statistics
        const providerOrders = await supabase
          .from("orders")
          .select("order_status_id", { count: "exact" })
          .eq("provider_id", filters.providerId);
        result = {
          totalOrders: providerOrders.count || 0,
        };
        break;
      }

      default:
        throw new Error(`Unknown statistics type: ${type}`);
    }

    return { data: result };
  } catch (error) {
    return {
      error: {
        status: "CUSTOM_ERROR",
        data: error,
        message: error.message || "An error occurred",
      },
    };
  }
};

export const adminStatisticsApi = createApi({
  reducerPath: "adminStatisticsApi",
  baseQuery: statisticsBaseQuery,
  tagTypes: ["Statistics"],
  endpoints: (builder) => ({
    getRequestersStatistics: builder.query({
      query: () => ({
        type: "requesters",
      }),
      providesTags: ["Statistics"],
    }),
    getServiceProvidersStatistics: builder.query({
      query: () => ({
        type: "providers",
      }),
      providesTags: ["Statistics"],
    }),
    getRequestsStatistics: builder.query({
      query: () => ({
        type: "requests",
      }),
      providesTags: ["Statistics"],
    }),
    getAdminStatistics: builder.query({
      query: () => ({
        type: "admin",
      }),
      providesTags: ["Statistics"],
    }),
    getProjectsStatistics: builder.query({
      query: () => ({
        type: "projects",
      }),
      providesTags: ["Statistics"],
    }),
    getProviderOrderStatistics: builder.query({
      query: ({ providerId }) => ({
        type: "providerOrders",
        filters: { providerId },
      }),
      providesTags: ["Statistics"],
    }),
  }),
});

export const {
  useGetRequestersStatisticsQuery,
  useGetServiceProvidersStatisticsQuery,
  useGetRequestsStatisticsQuery,
  useGetAdminStatisticsQuery,
  useGetProjectsStatisticsQuery,
  useGetProviderOrderStatisticsQuery,
} = adminStatisticsApi;
