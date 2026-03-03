import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Requests", "Orders"],
  endpoints: (builder) => ({
    // Create Request
    createOrder: builder.mutation({
      query: (body) => ({
        table: "requests",
        method: "POST",
        body: {
          requester_id: body.requesterId,
          service_id: body.serviceId,
          city_id: body.cityId || null,
          title: body.title,
          description: body.description || null,
          status_id: body.statusId, // Should be pending status
          attachments_group_key: body.attachmentsGroupKey || null,
        },
      }),
      invalidatesTags: ["Requests"],
    }),
    // Get Requests by Provider (Admin view)
    getProviderRequests: builder.query({
      query: ({ providerId, PageNumber = 1, PageSize = 10 }) => ({
        table: "requests",
        method: "GET",
        filters: { provider_id: providerId },
        pagination: { page: Number(PageNumber), pageSize: Number(PageSize) },
        orderBy: { column: "created_at", ascending: false },
        joins: [
          "requester:requesters!requests_requester_id_fkey(id,name)",
          "service:services(id,name_ar,name_en)",
          "status:lookup_values!requests_status_id_fkey(id,name_ar,name_en,code)",
          "city:cities(id,name_ar,name_en)",
        ],
      }),
      providesTags: ["Requests"],
    }),
    // Create Priced Request (Consultation)
    createOrderPriced: builder.mutation({
      query: (body) => ({
        table: "requests",
        method: "POST",
        body: {
          requester_id: body.requesterId,
          service_id: body.serviceId,
          city_id: body.cityId || null,
          title: body.title,
          description: body.description || null,
          status_id: body.statusId, // Should be priced status
          attachments_group_key: body.attachmentsGroupKey || null,
        },
      }),
      invalidatesTags: ["Requests"],
    }),
    // Get All Requests (Admin)
    getOrders: builder.query({
      query: ({ PageNumber = 1, PageSize = 10, RequestStatus = "" }) => {
        const filters = {};
        if (RequestStatus) {
          filters.status_id = RequestStatus;
        }
        return {
          table: "requests",
          method: "GET",
          filters,
          pagination: {
            page: Number(PageNumber),
            pageSize: Number(PageSize),
          },
          joins: [
            "requester:requesters!requests_requester_id_fkey(id,name)",
            "service:services(id,name_ar,name_en)",
            "status:lookup_values!requests_status_id_fkey(id,name_ar,name_en,code)",
            "city:cities(id,name_ar,name_en)",
          ],
        };
      },
      providesTags: ["Requests"],
    }),
    // Get User Requests (Requester)
    getUserOrders: builder.query({
      query: ({ PageNumber = 1, PageSize = 10, RequestStatus = "", CityId = "", ServiceId = "", requesterId = "" }) => {
        const filters = {};
        if (RequestStatus) {
          filters.status_id = RequestStatus;
        }
        if (CityId) {
          filters.city_id = CityId;
        }
        if (ServiceId) {
          filters.service_id = ServiceId;
        }
        if (requesterId) {
          filters.requester_id = requesterId;
        }
        // Get requester_id from user_id - assumes RLS handles this filtering if we don't pass id, or we need to pass it?
        // Supabase query usually uses auth.uid() automatically for RLS, but if we want to filter by requester_id column explicitly:
        // However, `requests` table has `requester_id`. If `getUserOrders` is called with userId, we should use it.
        // But here the arguments are pagination and status.
        // We might rely on RLS or need to pass userId.
        return {
          table: "requests",
          method: "GET",
          filters,
          pagination: {
            page: Number(PageNumber),
            pageSize: Number(PageSize),
          },
          joins: [
            "requester:requesters!requests_requester_id_fkey(id,name)",
            "service:services(id,name_ar,name_en)",
            "status:lookup_values!requests_status_id_fkey(id,name_ar,name_en,code)",
            "city:cities(id,name_ar,name_en)",
          ],
        };
      },
      providesTags: ["Requests"],
    }),
    // Get Request Details
    getRequestDetails: builder.query({
      query: (id) => ({
        table: "requests",
        method: "GET",
        id,
        joins: [
          "requester:requesters!requests_requester_id_fkey(id,name)",
          "service:services(id,name_ar,name_en,base_price)",
          "status:lookup_values!requests_status_id_fkey(id,name_ar,name_en,code)",
          "city:cities(id,name_ar,name_en)",
          "provider:providers!requests_provider_id_fkey(id,name)",
          "assigned_provider:providers!requests_assigned_provider_id_fkey(id,name)",
        ],
      }),
      providesTags: ["Requests"],
    }),
    // Get Attachments by Group Key
    getAttachmentsByGroupKey: builder.query({
      query: (groupKey) => ({
        table: "attachment_groups",
        method: "GET",
        filters: { group_key: groupKey },
        joins: ["attachments:attachments(id,file_path,file_name,content_type,size_bytes,request_phase_lookup_id,created_at)"],
      }),
      transformResponse: (response) => {
        const group = Array.isArray(response) ? response[0] : response;
        return group?.attachments || [];
      },
      providesTags: ["Requests"],
    }),
    // Get Order by Request ID
    getOrderByRequest: builder.query({
      query: (requestId) => ({
        table: "orders",
        method: "GET",
        filters: { request_id: requestId },
        pagination: { page: 1, pageSize: 1 },
        orderBy: { column: "created_at", ascending: false },
        joins: [
          "status:lookup_values!orders_order_status_id_fkey(id,name_ar,name_en,code)",
          "provider:providers(id,name)",
        ],
      }),
      transformResponse: (data) => Array.isArray(data) ? data[0] : data,
      providesTags: ["Orders"],
    }),
    // Admin set price and notes for request (new fields)
    adminSetRequestPrice: builder.mutation({
      query: (body) => ({
        table: "requests",
        method: "PUT",
        id: body.requestId,
        body: {
          admin_price: body.adminPrice,
          admin_notes: body.adminNotes || null,
          admin_proposal_file_url: body.adminProposalFileUrl || null,
          status_id: 8, // Automatically set to 'Priced'
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Requests"],
    }),
    // Requester respond to price (accept/reject)
    requesterRespondPrice: builder.mutation({
      query: (body) => ({
        table: "requests",
        method: "PUT",
        id: body.requestId,
        body: {
          requester_accepted_price: !!body.accepted,
          requester_response_date: new Date().toISOString(),
          requester_rejection_reason: body.rejectionReason || null,
          status_id: body.statusId,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Requests"],
    }),
    // Admin Request Pricing Action
    AdminRequestPrice: builder.mutation({
      query: (body) => ({
        table: "requests",
        method: "PUT",
        id: body.requestId,
        body: {
          status_id: body.statusId,
          amount: body.amount,
          pricing_notes: body.pricing_notes,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Requests"],
    }),
    // Requester Action (Accept/Reject)
    RequesterAction: builder.mutation({
      query: (body) => ({
        table: "requests",
        method: "PUT",
        id: body.requestId,
        body: {
          status_id: body.statusId,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Requests"],
    }),
    // Reassign Request to Provider (Create Order)
    ReassignRequestFn: builder.mutation({
      query: ({ orderId, providerId, requestId, payout }) => {
        // If orderId exists, update; otherwise create new order
        if (orderId) {
          return {
            table: "orders",
            method: "PUT",
            id: orderId,
            body: {
              provider_id: providerId,
              payout: payout,
              updated_at: new Date().toISOString(),
            },
          };
        } else {
          // Get pending status for orders
          return {
            table: "orders",
            method: "POST",
            body: {
              request_id: requestId,
              provider_id: providerId,
              payout: payout,
              order_title: "مشروع جديد",
              order_status_id: 17, // Waiting Approval
            },
          };
        }
      },
      invalidatesTags: ["Orders", "Requests"],
    }),
    // Assign provider fields directly on request
    assignProviderToRequest: builder.mutation({
      // Use queryFn to check paid status before assigning provider (defense-in-depth)
      async queryFn({ requestId, providerId, providerPrice }, _queryApi, _extraOptions, baseQuery) {
        // 1) fetch request with status code
        const reqRes = await baseQuery({
          table: 'requests',
          method: 'GET',
          id: requestId,
          joins: ["status:lookup_values!requests_status_id_fkey(code)"]
        });

        if (reqRes.error) return { error: reqRes.error };
        const request = reqRes.data;
        if (!request) return { error: { status: 'NOT_FOUND', message: 'Request not found' } };

        // 2) enforce paid status (code = 'paid' OR payment_status = 'paid')
        if (request?.status?.code !== 'paid' && request?.payment_status !== 'paid') {
          return { error: { status: 'FORBIDDEN', message: 'Cannot assign provider: request must be in paid status' } };
        }

        // 3) proceed with update
        const updatePayload = {
          assigned_provider_id: providerId,
          provider_quoted_price: providerPrice ?? null, // Use input price
          provider_response: 'pending',
          provider_response_at: null,
          provider_rejection_reason: null,
          updated_at: new Date().toISOString(),
        };

        const updRes = await baseQuery({ table: 'requests', method: 'PUT', id: requestId, body: updatePayload });
        if (updRes.error) {
          // Explicitly return the error so unwrap() can catch it and handleSubmit can reset isLoading
          return { error: updRes.error };
        }
        return { data: updRes.data };
      },
      invalidatesTags: ["Requests"],
    }),

    // Provider responds to an assignment (accept or reject)
    providerRespond: builder.mutation({
      query: ({ requestId, response, rejectionReason = null }) => ({
        table: "requests",
        method: "PUT",
        id: requestId,
        body: {
          provider_response: response, // 'accepted' or 'rejected'
          provider_response_at: new Date().toISOString(),
          provider_rejection_reason: response === 'rejected' ? rejectionReason : null,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Requests"],
    }),
    // Admin Complete Request
    AdminCompleteRequest: builder.mutation({
      query: (body) => ({
        table: "requests",
        method: "PUT",
        id: body.requestId,
        body: {
          status_id: body.statusId, // completed status
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Requests"],
    }),
    // Status History for a Request
    getRequestStatusHistory: builder.query({
      query: (requestId) => ({
        table: "status_history",
        method: "GET",
        filters: { request_id: requestId },
        orderBy: { column: "created_at", ascending: false },
        joins: [
          "request:requests!status_history_request_id_fkey(id,title)",
          "status:lookup_values!status_history_status_id_fkey(id,name_ar,name_en,code)",
          "old_status:lookup_values!status_history_old_status_id_fkey(id,name_ar,name_en,code)",
        ],
      }),
      providesTags: ["Requests"],
    }),
    // Project messages
    getProjectMessages: builder.query({
      query: ({ orderId, PageNumber = 1, PageSize = 20 }) => ({
        table: "project_messages",
        method: "GET",
        filters: { order_id: orderId },
        pagination: { page: Number(PageNumber), pageSize: Number(PageSize) },
        orderBy: { column: "created_at", ascending: false },
        joins: ["sender:users(id,name)"],
      }),
      providesTags: ["Orders"],
    }),
    addProjectMessage: builder.mutation({
      query: ({ orderId, senderId, message, attachmentUrl }) => ({
        table: "project_messages",
        method: "POST",
        body: {
          order_id: orderId,
          sender_id: senderId,
          message,
          attachment_url: attachmentUrl || null,
          is_read: false,
        },
      }),
      invalidatesTags: ["Orders"],
    }),
    markProjectMessagesRead: builder.mutation({
      query: ({ orderId, senderId }) => ({
        table: "project_messages",
        method: "PUT",
        filters: { order_id: orderId, sender_id: senderId },
        body: { is_read: true },
      }),
      invalidatesTags: ["Orders"],
    }),
    // Deliverables
    getDeliverables: builder.query({
      query: ({ orderId }) => ({
        table: "project_deliverables",
        method: "GET",
        filters: { order_id: orderId },
        orderBy: { column: "created_at", ascending: false },
      }),
      providesTags: ["Orders"],
    }),
    addDeliverable: builder.mutation({
      query: ({ orderId, providerId, title, description, deliveryFileUrl }) => ({
        table: "project_deliverables",
        method: "POST",
        body: {
          order_id: orderId,
          provider_id: providerId,
          title,
          description: description || null,
          delivery_file_url: deliveryFileUrl || null,
          status: "pending",
        },
      }),
      invalidatesTags: ["Orders"],
    }),
    updateDeliverableStatus: builder.mutation({
      query: ({ deliverableId, status, requesterResponse }) => ({
        table: "project_deliverables",
        method: "PUT",
        id: deliverableId,
        body: {
          status,
          requester_response: requesterResponse || null,
          responded_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Orders"],
    }),
    // Delete Request
    deleteRequest: builder.mutation({
      query: (id) => ({
        table: "requests",
        method: "DELETE",
        id,
      }),
      invalidatesTags: ["Requests"],
    }),
    // Admin Mark as Paid
    adminMarkRequestPaid: builder.mutation({
      query: (requestId) => ({
        table: "requests",
        method: "PUT",
        id: requestId,
        body: {
          payment_status: "paid",
          requester_accepted_price: true, // Ensure accepted if paid
          status_id: 204, // Paid status (RequestStatus)
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Requests"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useCreateOrderPricedMutation,
  useGetOrdersQuery,
  useGetUserOrdersQuery,
  useGetRequestDetailsQuery,
  useGetOrderByRequestQuery,
  useAdminSetRequestPriceMutation,
  useRequesterRespondPriceMutation,
  useAdminRequestPriceMutation,
  useRequesterActionMutation,
  useAdminCompleteRequestMutation,
  useReassignRequestFnMutation,
  useAssignProviderToRequestMutation,
  useGetProjectMessagesQuery,
  useAddProjectMessageMutation,
  useGetAttachmentsByGroupKeyQuery,
  useMarkProjectMessagesReadMutation,
  useGetDeliverablesQuery,
  useAddDeliverableMutation,
  useUpdateDeliverableStatusMutation,
  useDeleteRequestMutation,
  useAdminMarkRequestPaidMutation,
  useGetRequestStatusHistoryQuery,
  useGetProviderRequestsQuery,
} = ordersApi;
