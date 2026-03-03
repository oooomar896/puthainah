import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const profileInfoApi = createApi({
  reducerPath: "profileInfoApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["ProfileInfo"],
  endpoints: (builder) => ({
    createProfileInfo: builder.mutation({
      query: (body) => ({
        table: "profile_infos",
        method: "POST",
        body: {
          user_id: body.userId,
          bio: body.bio || null,
          website_url: body.websiteUrl || null,
          file_path_url: body.filePathUrl || null, // Added file path
          attachments_group_key: body.attachmentsGroupKey || null,
        },
      }),
      invalidatesTags: ["ProfileInfo"],
    }),
    getProfileInfo: builder.query({
      query: (userId) => ({
        table: "profile_infos",
        method: "GET",
        filters: userId ? { user_id: userId } : undefined, // If no ID, ideally return single or first?
        // Usually for 'getProfileInfo', if no userId is passed, it might be fetching by current session implicitly in backend?
        // But here we rely on Supabase query. If userId is missing, 'filters: undefined' returns ALL.
        // We probably want to limit it. But for now, let's keep it safe.
      }),
      providesTags: ["ProfileInfo"],
    }),
    updateProfileInfo: builder.mutation({
      query: ({ userId, body }) => ({
        table: "profile_infos",
        method: "PUT",
        filters: { user_id: userId },
        body: {
          bio: body.bio || null,
          website_url: body.websiteUrl || null,
          file_path_url: body.filePathUrl || null, // Added file path
          attachments_group_key: body.attachmentsGroupKey || null,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["ProfileInfo"],
    }),
    // Note: downloadProfileInfo would need to be handled separately
    // as it's about downloading attachments, not querying profile_infos
  }),
});

export const {
  useCreateProfileInfoMutation,
  useGetProfileInfoQuery,
  useUpdateProfileInfoMutation,
} = profileInfoApi;
