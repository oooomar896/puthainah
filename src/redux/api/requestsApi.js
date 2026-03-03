import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const requestsApi = createApi({
    reducerPath: "requestsApi",
    baseQuery: supabaseBaseQuery,
    tagTypes: ["Requests"],
    endpoints: (builder) => ({
        // Get all requests (Admin)
        getAllRequests: builder.query({
            query: ({
                PageNumber = 1,
                PageSize = 10,
                requestStatus = "",
            }) => {
                const filters = {};
                if (requestStatus) {
                    filters.status_id = Number(requestStatus);
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
        // Delete Request
        deleteRequest: builder.mutation({
            query: (id) => ({
                table: "requests",
                method: "DELETE",
                id,
            }),
            invalidatesTags: ["Requests"],
        }),
        // Update Request Status
        updateRequestStatus: builder.mutation({
            query: ({ id, statusId }) => ({
                table: "requests",
                method: "PUT",
                id,
                body: {
                    status_id: statusId,
                    updated_at: new Date().toISOString(),
                },
            }),
            invalidatesTags: ["Requests"],
        }),
        updateRequestPaymentStatus: builder.mutation({
            query: ({ id, paymentStatus }) => ({
                table: "requests",
                method: "PUT",
                id,
                body: {
                    payment_status: paymentStatus,
                    updated_at: new Date().toISOString(),
                },
            }),
            invalidatesTags: ["Requests"],
        }),
        // Get Invitations for a specific provider
        getProviderInvitations: builder.query({
            query: ({ providerId, PageNumber = 1, PageSize = 10 }) => ({
                table: "requests",
                method: "GET",
                filters: {
                    assigned_provider_id: providerId,
                    provider_response: "pending",
                },
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
            }),
            providesTags: ["Requests"],
        }),
        // Provider responds to request invitation
        respondToInvitation: builder.mutation({
            query: ({ requestId, response, rejectionReason = null, providerId }) => {
                const body = {
                    provider_response: response, // 'accepted' or 'rejected'
                    provider_response_at: new Date().toISOString(),
                    provider_rejection_reason: response === 'rejected' ? rejectionReason : null,
                    updated_at: new Date().toISOString(),
                };

                if (response === 'accepted' && providerId) {
                    body.provider_id = providerId;
                    body.provider_assigned_at = new Date().toISOString();
                }

                return {
                    table: "requests",
                    method: "PUT",
                    id: requestId,
                    body,
                };
            },
            invalidatesTags: ["Requests"],
        }),
    }),
});

export const {
    useGetAllRequestsQuery,
    useDeleteRequestMutation,
    useUpdateRequestStatusMutation,
    useUpdateRequestPaymentStatusMutation,
    useGetProviderInvitationsQuery,
    useRespondToInvitationMutation,
} = requestsApi;
