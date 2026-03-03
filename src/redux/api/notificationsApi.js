import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (userId) => ({
        table: "notifications",
        method: "GET",
        filters: { user_id: userId },
        orderBy: { column: "created_at", ascending: false },
      }),
      providesTags: ["Notifications"],
    }),
    seenNotifications: builder.mutation({
      query: ({ notificationIds }) => {
        // Update multiple notifications using 'in' filter logic supported by modified supabaseBaseQuery
        return {
          table: "notifications",
          method: "PUT",
          filters: { id: notificationIds },
          body: {
            is_seen: true,
          },
        };
      },
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const { useGetNotificationsQuery, useSeenNotificationsMutation } =
  notificationsApi;
