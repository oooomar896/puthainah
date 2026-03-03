import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const ratingsApi = createApi({
  reducerPath: "ratingsApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Ratings"],
  endpoints: (builder) => ({
    getRatings: builder.query({
      query: ({ PageNumber = 1, PageSize = 10, orderId }) => {
        const filters = {};
        if (orderId) {
          filters.order_id = orderId;
        }
        return {
          table: "order_ratings",
        method: "GET",
          filters,
          pagination: {
            page: Number(PageNumber),
            pageSize: Number(PageSize),
          },
          joins: [
            "order:orders(id,order_title)",
            "rated_by:users(id,email)",
          ],
          orderBy: { column: "created_at", ascending: false },
        };
      },
      providesTags: ["Ratings"],
    }),
    CreateRating: builder.mutation({
      query: (body) => ({
        table: "order_ratings",
        method: "POST",
        body: {
          order_id: body.orderId,
          rated_by_user_id: body.ratedByUserId,
          rating_value: body.ratingValue,
          comment: body.comment || null,
        },
    }),
      invalidatesTags: ["Ratings"],
    }),
    deleteRating: builder.mutation({
      query: (id) => ({
        table: "order_ratings",
        method: "DELETE",
        id,
      }),
      invalidatesTags: ["Ratings"],
    }),
  }),
});

export const {
  useGetRatingsQuery,
  useCreateRatingMutation,
  useDeleteRatingMutation,
} = ratingsApi;
