import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const updateApi = createApi({
  reducerPath: "updateApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Provider", "Requester", "Admin"],
  endpoints: (builder) => ({
    createRequester: builder.mutation({
      query: (body) => ({
        table: "requesters",
        method: "POST",
        body: {
          user_id: body.userId,
          name: body.name,
          commercial_reg_no: body.commercialRegNo || null,
          city_id: body.cityId || null,
          entity_type_id: body.entityTypeLookupId || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        select: "*",
      }),
      invalidatesTags: ["Requester"],
    }),
    updateProvider: builder.mutation({
      query: (body) => {
        // Update provider table
        const providerUpdate = {
          table: "providers",
        method: "PUT",
          id: body.providerId,
          body: {
            name: body.name,
            specialization: body.specialization || null,
            city_id: body.cityId || null,
            updated_at: new Date().toISOString(),
          },
        };
        return providerUpdate;
      },
      invalidatesTags: ["Provider"],
    }),
    updateRequester: builder.mutation({
      query: (body) => ({
        table: "requesters",
        method: "PUT",
        id: body.requesterId,
        body: {
          name: body.name,
          commercial_reg_no: body.commercialRegNo || null,
          city_id: body.cityId || null,
          entity_type_id: body.entityTypeLookupId || null,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Requester"],
    }),
    updateAdmin: builder.mutation({
      query: (body) => ({
        table: "admins",
        method: "PUT",
        id: body.adminId,
        body: {
          display_name: body.displayName || null,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Admin"],
    }),
    updateUserContact: builder.mutation({
      query: (body) => ({
        table: "users",
        method: "PUT",
        id: body.userId,
        body: {
          email: body.email || undefined,
          phone: body.phone || undefined,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Requester", "Provider", "Admin"],
    }),
    suspendRequester: builder.mutation({
      query: (userId) => ({
        table: "users",
        method: "PUT",
        id: userId,
        body: {
          is_blocked: true,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Requester"],
    }),
    suspendProvider: builder.mutation({
      query: (userId) => ({
        table: "users",
        method: "PUT",
        id: userId,
        body: {
          is_blocked: true,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Provider"],
    }),
  }),
});

export const {
  useUpdateProviderMutation,
  useUpdateRequesterMutation,
  useUpdateAdminMutation,
  useUpdateUserContactMutation,
  useSuspendProviderMutation,
  useSuspendRequesterMutation,
  useCreateRequesterMutation,
} = updateApi;
