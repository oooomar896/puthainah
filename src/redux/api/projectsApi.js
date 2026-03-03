import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const projectsApi = createApi({
  reducerPath: "projectsApis",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Orders", "Projects"],
  endpoints: (builder) => ({
    // Get All Projects/Orders (Admin)
    getProjects: builder.query({
      query: ({
        PageNumber = 1,
        PageSize = 10,
        OrderTitle = "",
        OrderStatusLookupId,
      }) => {
        const filters = {};
        if (OrderStatusLookupId) {
          filters.order_status_id = Number(OrderStatusLookupId);
        }
        if (OrderTitle) {
          filters.order_title = { operator: "ilike", value: `%${OrderTitle}%` };
        }
        return {
          table: "orders",
          method: "GET",
          filters,
          pagination: {
            page: Number(PageNumber),
            pageSize: Number(PageSize),
          },
          joins: [
            "request:requests(id,title,description,requester_id,provider_quoted_price, requester:requesters(id,name), service:services(name_ar,name_en,base_price))",
            "provider:providers(id,name,specialization)",
            "status:lookup_values!orders_order_status_id_fkey(id,name_ar,name_en,code)",
          ],
        };
      },
      providesTags: ["Orders"],
    }),
    // Get Provider Projects/Orders
    getProjectsProviders: builder.query({
      query: ({
        PageNumber = 1,
        PageSize = 10,
        OrderTitle = "",
        OrderStatusLookupId,
        providerId,
      }) => {
        const filters = {};
        if (providerId) {
          filters.provider_id = providerId;
        }
        if (OrderStatusLookupId) {
          filters.order_status_id = Number(OrderStatusLookupId);
        }
        if (OrderTitle) {
          filters.order_title = { operator: "ilike", value: `%${OrderTitle}%` };
        }
        return {
          table: "orders",
          method: "GET",
          filters,
          pagination: {
            page: Number(PageNumber),
            pageSize: Number(PageSize),
          },
          joins: [
            "request:requests(id,title,description,requester_id,provider_quoted_price, requester:requesters(id,name), service:services(name_ar,name_en,base_price))",
            "provider:providers(id,name,specialization)",
            "status:lookup_values!orders_order_status_id_fkey(id,name_ar,name_en,code)",
          ],
        };
      },
      providesTags: ["Orders"],
    }),
    // Get Requester Projects/Orders
    getProjectsRequesters: builder.query({
      query: ({
        PageNumber = 1,
        PageSize = 10,
        OrderTitle = "",
        OrderStatusLookupId,
        requesterId,
      }) => {
        const filters = {};
        if (requesterId) {
          // Join path to filter by requester_id via request table
          filters["request.requester_id"] = requesterId;
        }
        if (OrderStatusLookupId) {
          filters.order_status_id = Number(OrderStatusLookupId);
        }
        if (OrderTitle) {
          filters.order_title = { operator: "ilike", value: `%${OrderTitle}%` };
        }
        return {
          table: "orders",
          method: "GET",
          filters,
          pagination: {
            page: Number(PageNumber),
            pageSize: Number(PageSize),
          },
          joins: [
            "request:requests!inner(id,title,description,requester_id,provider_quoted_price, requester:requesters(id,name), service:services(name_ar,name_en,base_price))",
            "provider:providers(id,name,specialization)",
            "status:lookup_values!orders_order_status_id_fkey(id,name_ar,name_en,code)",
          ],
        };
      },
      providesTags: ["Orders"],
    }),
    // Get Project Details
    getProjectDetails: builder.query({
      query: ({ id }) => ({
        table: "orders",
        method: "GET",
        id,
        joins: [
          "request:requests(id,title,description,requester_id,service_id,provider_quoted_price,attachments_group_key,created_at, requester:requesters(id,name), service:services(id,name_ar,name_en,base_price))",
          "provider:providers(id,name,specialization,avg_rate)",
          "status:lookup_values!orders_order_status_id_fkey(id,name_ar,name_en,code)",
        ],
      }),
      providesTags: ["Orders"],
    }),
    // Get Project Statistics
    getProjectStatistics: builder.query({
      query: (filters = {}) => {
        return {
          table: "orders",
          method: "GET",
          count: "exact",
          pagination: { page: 1, pageSize: 1 }, // Just get count
          filters,
        };
      },
      providesTags: ["Orders"],
    }),
    // Get Requester Specific Statistics (Requests & Orders)
    getRequesterStatistics: builder.query({
      async queryFn({ requesterId }, _queryApi, _extraOptions, baseQuery) {
        try {
          // 1) Get Requests counts
          const reqFilters = { requester_id: requesterId };

          const [totalReqs, , priced, waitingPay, , , newReqs,] = await Promise.all([
            baseQuery({ table: 'requests', method: 'GET', filters: reqFilters, pagination: { page: 1, pageSize: 1 } }),
            baseQuery({ table: 'requests', method: 'GET', filters: { ...reqFilters, status_id: 9 }, pagination: { page: 1, pageSize: 1 } }), // initial approval
            baseQuery({ table: 'requests', method: 'GET', filters: { ...reqFilters, status_id: 8 }, pagination: { page: 1, pageSize: 1 } }), // priced
            baseQuery({ table: 'requests', method: 'GET', filters: { ...reqFilters, status_id: 21 }, pagination: { page: 1, pageSize: 1 } }), // waiting payment
            baseQuery({ table: 'requests', method: 'GET', filters: { ...reqFilters, status_id: 10 }, pagination: { page: 1, pageSize: 1 } }), // rejected
            baseQuery({ table: 'requests', method: 'GET', filters: { ...reqFilters, status_id: 11 }, pagination: { page: 1, pageSize: 1 } }), // completed
            baseQuery({ table: 'requests', method: 'GET', filters: { ...reqFilters, status_id: 7 }, pagination: { page: 1, pageSize: 1 } }), // new
            baseQuery({ table: 'requests', method: 'GET', filters: { ...reqFilters, status_id: 207 }, pagination: { page: 1, pageSize: 1 } }), // under review
          ]);

          // 2) Get Orders (Projects) counts
          // Filtering orders by request.requester_id requires a join as seen in getProjectsRequesters
          const orderBaseQuery = {
            table: 'orders',
            method: 'GET',
            filters: { "request.requester_id": requesterId },
            joins: ["request:requests!inner(id,requester_id)"],
            pagination: { page: 1, pageSize: 1 }
          };

          const [totalOrders, waitingStart, ongoing, orderCompleted] = await Promise.all([
            baseQuery(orderBaseQuery),
            baseQuery({ ...orderBaseQuery, filters: { ...orderBaseQuery.filters, order_status_id: 18 } }), // waiting to start
            baseQuery({ ...orderBaseQuery, filters: { ...orderBaseQuery.filters, order_status_id: 13 } }), // ongoing
            baseQuery({ ...orderBaseQuery, filters: { ...orderBaseQuery.filters, order_status_id: 15 } }), // completed
          ]);

          const stats = {
            totalRequests: totalReqs.data?.count || 0,
            newRequests: newReqs.data?.count || 0,
            pricedRequests: priced.data?.count || 0,
            waitingPayment: waitingPay.data?.count || 0,
            totalOrders: totalOrders.data?.count || 0,
            waitingStart: waitingStart.data?.count || 0,
            ongoing: ongoing.data?.count || 0,
            completed: orderCompleted.data?.count || 0,
          };

          return { data: stats };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', message: error.message } };
        }
      },
      providesTags: ["Orders", "Requests"],
    }),
    // Provider Update Order Status
    ProviderProjectState: builder.mutation({
      query: (body) => ({
        table: "orders",
        method: "PUT",
        id: body.orderId,
        body: {
          order_status_id: body.statusId,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Orders"],
    }),
    // Add Order Attachments
    addOrderAttachments: builder.mutation({
      query: ({ body, projectId }) => ({
        table: "orders",
        method: "PUT",
        id: projectId,
        body: {
          order_attachments_group_key: body.attachmentsGroupKey,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Orders"],
    }),
    // Complete Order
    completeOrder: builder.mutation({
      query: ({ body, projectId }) => ({
        table: "orders",
        method: "PUT",
        id: projectId,
        body: {
          order_status_id: body.statusId, // completed status
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Orders"],
    }),
    // Delete Project/Order
    deleteProject: builder.mutation({
      query: (id) => ({
        table: "orders",
        method: "DELETE",
        id,
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectDetailsQuery,
  useProviderProjectStateMutation,
  useGetProjectStatisticsQuery,
  useAddOrderAttachmentsMutation,
  useCompleteOrderMutation,
  useGetProjectsProvidersQuery,
  useGetProjectsRequestersQuery,
  useDeleteProjectMutation,
  useGetRequesterStatisticsQuery,
} = projectsApi;
