import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const ticketApi = createApi({
  reducerPath: "ticketApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Tickets"],
  endpoints: (builder) => ({
    createTickets: builder.mutation({
      query: (body) => ({
        table: "tickets",
        method: "POST",
        body: {
          user_id: body.userId,
          related_order_id: body.relatedOrderId || null,
          related_request_id: body.relatedRequestId || null,
          title: body.title,
          description: body.description || null,
          status_id: body.statusId, // Should be open status
        },
      }),
      invalidatesTags: ["Tickets"],
    }),
    getTickets: builder.query({
      query: (userId) => ({
        table: "tickets",
        method: "GET",
        filters: userId ? { user_id: userId } : {},
        orderBy: { column: "created_at", ascending: false },
        joins: [
          "user:users!tickets_user_id_fkey(id,email)",
          "related_order:orders!tickets_related_order_id_fkey(id,order_title)",
          "status:lookup_values!tickets_status_id_fkey(id,name_ar,name_en,code)",
        ],
      }),
      providesTags: ["Tickets"],
    }),
    getTicketsByFilters: builder.query({
      query: (filters) => ({
        table: "tickets",
        method: "GET",
        filters: filters || {},
        orderBy: { column: "created_at", ascending: false },
        joins: [
          "user:users!tickets_user_id_fkey(id,email)",
          "related_order:orders!tickets_related_order_id_fkey(id,order_title)",
          "status:lookup_values!tickets_status_id_fkey(id,name_ar,name_en,code)",
        ],
      }),
      providesTags: ["Tickets"],
    }),
    getTicketDetails: builder.query({
      query: (id) => ({
        table: "tickets",
        method: "GET",
        id,
        joins: [
          "user:users!tickets_user_id_fkey(id,email)",
          "related_order:orders!tickets_related_order_id_fkey(id,order_title)",
          "status:lookup_values!tickets_status_id_fkey(id,name_ar,name_en,code)",
        ],
      }),
      providesTags: ["Tickets"],
    }),
    UpdateTicketStatus: builder.mutation({
      query: ({ body, id }) => ({
        table: "tickets",
        method: "PUT",
        id,
        body: {
          status_id: body.statusId,
          updated_at: new Date().toISOString(),
          closed_at: body.statusId === 3 ? new Date().toISOString() : null, // 3 = closed
        },
      }),
      invalidatesTags: ["Tickets"],
    }),
  }),
});

export const {
  useCreateTicketsMutation,
  useGetTicketsQuery,
  useGetTicketsByFiltersQuery,
  useGetTicketDetailsQuery,
  useUpdateTicketStatusMutation,
} = ticketApi;
