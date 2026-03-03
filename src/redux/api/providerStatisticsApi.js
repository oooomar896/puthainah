import { createApi } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabaseClient";

// Custom base query for provider statistics
const providerStatisticsBaseQuery = async (args) => {
  const { providerId } = args;

  try {
    if (!providerId) {
      throw new Error("Provider ID is required");
    }

    // Get provider's average rating from providers table
    const { data: providerData } = await supabase
      .from("providers")
      .select("avg_rate")
      .eq("id", providerId)
      .single();

    // Get all orders for this provider
    const { data: allOrders, error: ordersError } = await supabase
      .from("orders")
      .select("id, order_status_id, created_at, start_date, due_date, completed_at")
      .eq("provider_id", providerId);

    if (ordersError) throw ordersError;

    // Get lookup values for order statuses to map codes
    const { data: statusLookups } = await supabase
      .from("lookup_values")
      .select("id, code")
      .eq("lookup_type_id", 4); // lookup_type_id 4 = order statuses

    const statusMap = {};
    statusLookups?.forEach((status) => {
      statusMap[status.id] = status.code;
    });

    // Count orders by status
    const statusCounts = {};
    const now = new Date();
    
    // Initialize all status counts
    statusCounts["in-progress"] = 0;
    statusCounts["on-hold"] = 0;
    statusCounts["completed"] = 0;
    statusCounts["cancelled"] = 0;
    statusCounts["waiting-to-start"] = 0;
    statusCounts["expired"] = 0;
    
    allOrders?.forEach((order) => {
      const statusCode = statusMap[order.order_status_id];
      
      if (statusCode) {
        statusCounts[statusCode] = (statusCounts[statusCode] || 0) + 1;
      }

      // Waiting to start - order exists but hasn't started (no start_date and not completed/cancelled)
      if (!order.start_date && statusCode !== "completed" && statusCode !== "cancelled") {
        statusCounts["waiting-to-start"] = (statusCounts["waiting-to-start"] || 0) + 1;
      }

      // Expired orders - has due_date in the past and not completed
      if (order.due_date && new Date(order.due_date) < now && !order.completed_at && statusCode !== "completed") {
        statusCounts["expired"] = (statusCounts["expired"] || 0) + 1;
      }
    });

    // Get ratings for this provider's orders
    const { data: ratings } = await supabase
      .from("order_ratings")
      .select("rating_value")
      .in(
        "order_id",
        allOrders?.map((o) => o.id) || []
      );

    const averageRating =
      ratings && ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating_value, 0) / ratings.length
        : providerData?.avg_rate || 0;

    const result = {
      totalOrdersCount: allOrders?.length || 0,
      waitingForApprovalOrdersCount: statusCounts["on-hold"] || 0, // Using on-hold as waiting for approval
      waitingToStartOrdersCount: statusCounts["waiting-to-start"] || 0,
      ongoingOrdersCount: statusCounts["in-progress"] || 0,
      completedOrdersCount: statusCounts["completed"] || 0,
      rejectedOrdersCount: statusCounts["cancelled"] || 0,
      serviceCompletedOrdersCount: statusCounts["completed"] || 0, // Using completed as service completed
      expiredOrdersCount: statusCounts["expired"] || 0,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    };

    return { data: result };
  } catch (error) {
    return {
      error: {
        status: "CUSTOM_ERROR",
        data: error,
        message: error.message || "An error occurred fetching provider statistics",
      },
    };
  }
};

export const providerStatisticsApi = createApi({
  reducerPath: "providerStatisticsApi",
  baseQuery: providerStatisticsBaseQuery,
  tagTypes: ["ProviderStatistics"],
  endpoints: (builder) => ({
    getProviderStatistics: builder.query({
      query: (providerId) => ({
        providerId,
      }),
      providesTags: ["ProviderStatistics"],
    }),
  }),
});

export const { useGetProviderStatisticsQuery } = providerStatisticsApi;

