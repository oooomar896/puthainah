import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Payments"],
  endpoints: (builder) => ({
    createPayment: builder.mutation({
      query: (body) => ({
        table: "payments",
        method: "POST",
        body: {
          order_id: body.orderId,
          request_id: body.requestId,
          user_id: body.userId,
          amount: body.amount,
          currency: body.currency || "SAR",
          stripe_payment_intent_id: body.stripePaymentIntentId || null,
          status: body.status || "pending",
          payment_method: body.paymentMethod || "moyasar",
          payment_status: body.paymentStatus || "pending",
        },
      }),
      invalidatesTags: ["Payments"],
    }),
    getPayments: builder.query({
      query: ({ orderId, userId }) => {
        const filters = {};
        if (orderId) filters.order_id = orderId;
        if (orderId === null) filters.order_id = null;
        // allow request_id filter
        // Note: use query with requestId when needed
        if (userId) filters.user_id = userId;
        return {
          table: "payments",
          method: "GET",
          filters,
          orderBy: { column: "created_at", ascending: false },
          joins: [
            "order:orders!payments_order_id_fkey(id,order_title)",
            "user:users!payments_user_id_fkey(id,email)",
            "request:requests!payments_request_id_fkey(id,title)",
          ],
        };
      },
      providesTags: ["Payments"],
    }),
    updatePaymentStatus: builder.mutation({
      query: ({ id, body }) => ({
        table: "payments",
        method: "PUT",
        id,
        body: {
          status: body.status,
          stripe_payment_intent_id: body.stripePaymentIntentId || null,
          payment_status: body.paymentStatus || "pending",
          payment_method: body.paymentMethod || "moyasar",
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Payments"],
    }),
  }),
});

export const {
  useCreatePaymentMutation,
  useGetPaymentsQuery,
  useUpdatePaymentStatusMutation,
} = paymentApi;
