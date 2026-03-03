import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const detailsApi = createApi({
  reducerPath: "detailsApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["ProviderDetails", "RequesterDetails", "AdminDetails"],
  endpoints: (builder) => ({
    getProviderDetails: builder.query({
      query: (id) => ({
        table: "providers",
        method: "GET",
        id,
        joins: [
          "user:users!providers_user_id_fkey(id,email,phone,role,is_blocked)",
          "entity_type:lookup_values!providers_entity_type_id_fkey(id,name_ar,name_en,code)",
          "city:cities(id,name_ar,name_en)",
        ],
      }),
      providesTags: ["ProviderDetails"],
    }),
    getProviderByUserId: builder.query({
      query: (userId) => ({
        table: "providers",
        method: "GET",
        filters: { user_id: userId },
        joins: [
          "user:users!providers_user_id_fkey(id,email,phone,role,is_blocked)",
          "entity_type:lookup_values!providers_entity_type_id_fkey(id,name_ar,name_en,code)",
          "city:cities(id,name_ar,name_en)",
        ],
      }),
      providesTags: ["ProviderDetails"],
    }),
    getRequesterDetails: builder.query({
      query: (id) => ({
        table: "requesters",
        method: "GET",
        id,
        joins: [
          "user:users!requesters_user_id_fkey(id,email,phone,role,is_blocked)",
          "entity_type:lookup_values!requesters_entity_type_id_fkey(id,name_ar,name_en,code)",
          "city:cities(id,name_ar,name_en)",
        ],
      }),
      providesTags: ["RequesterDetails"],
    }),
    getRequesterByUserId: builder.query({
      query: (userId) => ({
        table: "requesters",
        method: "GET",
        filters: { user_id: userId },
        joins: [
          "user:users!requesters_user_id_fkey(id,email,phone,role,is_blocked)",
          "entity_type:lookup_values!requesters_entity_type_id_fkey(id,name_ar,name_en,code)",
          "city:cities(id,name_ar,name_en)",
        ],
      }),
      providesTags: ["RequesterDetails"],
    }),
    getAdminByUserId: builder.query({
      query: (userId) => ({
        table: "admins",
        method: "GET",
        filters: { user_id: userId },
        joins: [
          "user:users!admins_user_id_fkey(id,email,phone,role,is_blocked)",
        ],
      }),
      providesTags: ["AdminDetails"],
    }),
    getAdminDetails: builder.query({
      query: (id) => ({
        table: "admins",
        method: "GET",
        id,
        joins: [
          "user:users!admins_user_id_fkey(id,email,phone,role,is_blocked)",
        ],
      }),
      providesTags: ["AdminDetails"],
    }),
  }),
});

export const {
  useGetProviderDetailsQuery,
  useGetProviderByUserIdQuery,
  useGetRequesterDetailsQuery,
  useGetRequesterByUserIdQuery,
  useGetAdminDetailsQuery,
  useGetAdminByUserIdQuery,
} = detailsApi;
