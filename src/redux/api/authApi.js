import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: (userId) => {
        return {
          table: "users",
          method: "GET",
          id: userId,
        };
      },
      providesTags: ["Profile"],
    }),
    toggleBlockUser: builder.mutation({
      query: ({ userId, isBlocked }) => ({
        table: "users",
        method: "PUT",
        id: userId,
        body: {
          is_blocked: isBlocked,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Profile"],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useToggleBlockUserMutation,
} = authApi;
