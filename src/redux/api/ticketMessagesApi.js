import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const ticketMessagesApi = createApi({
  reducerPath: "ticketMessagesApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["TicketMessages"],
  endpoints: (builder) => ({
    getTicketMessages: builder.query({
      query: (ticketId) => ({
        table: "ticket_messages",
        method: "GET",
        filters: { ticket_id: ticketId },
        orderBy: { column: "created_at", ascending: true },
        joins: [
          "sender:users!ticket_messages_sender_id_fkey(id,email)",
        ],
      }),
      providesTags: (result, error, arg) => [{ type: "TicketMessages", id: arg }],
    }),
    sendTicketMessage: builder.mutation({
      query: ({ ticketId, senderId, message }) => ({
        table: "ticket_messages",
        method: "POST",
        body: {
          ticket_id: ticketId,
          sender_id: senderId,
          message,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "TicketMessages", id: arg.ticketId }],
    }),
  }),
});

export const {
  useGetTicketMessagesQuery,
  useSendTicketMessageMutation,
} = ticketMessagesApi;

