"use client";
import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const adminProfilesApi = createApi({
  reducerPath: "adminProfilesApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Profiles"],
  endpoints: (builder) => ({
    approveProfile: builder.mutation({
      query: (id) => ({
        table: "profiles",
        method: "PUT",
        id,
        body: {
          is_active: true,
          is_blocked: false,
          is_suspended: false,
          updated_at: new Date().toISOString(),
        },
        select: "*",
      }),
      invalidatesTags: ["Profiles", "Providers", "Requesters"],
    }),
    rejectProfile: builder.mutation({
      query: (id) => ({
        table: "profiles",
        method: "PUT",
        id,
        body: {
          is_active: false,
          is_blocked: true,
          updated_at: new Date().toISOString(),
        },
        select: "*",
      }),
      invalidatesTags: ["Profiles", "Providers", "Requesters"],
    }),
  }),
});

export const {
  useApproveProfileMutation,
  useRejectProfileMutation,
} = adminProfilesApi;
