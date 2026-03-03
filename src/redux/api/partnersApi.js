import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const partnersApi = createApi({
  reducerPath: "partnersApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Partners"],
  endpoints: (builder) => ({
    createPartner: builder.mutation({
      query: (body) => ({
        table: "partners",
        method: "POST",
        body: {
          name: body.name,
          logo_url: body.logoUrl || null,
          website_url: body.websiteUrl || null,
          description: body.description || null,
          is_active: body.isActive !== undefined ? body.isActive : true,
        },
      }),
      invalidatesTags: ["Partners"],
    }),
    getPartners: builder.query({
      query: () => ({
        table: "partners",
        method: "GET",
        filters: { is_active: true },
        orderBy: { column: "created_at", ascending: false },
      }),
      providesTags: ["Partners"],
    }),
    getAllPartners: builder.query({
      query: () => ({
        table: "partners",
        method: "GET",
        orderBy: { column: "created_at", ascending: false },
      }),
      providesTags: ["Partners"],
    }),
    getPartnerDetails: builder.query({
      query: (id) => ({
        table: "partners",
        method: "GET",
        id,
      }),
      providesTags: ["Partners"],
    }),
    updatePartner: builder.mutation({
      query: ({ id, body }) => ({
        table: "partners",
        method: "PUT",
        id,
        body: {
          name: body.name,
          logo_url: body.logoUrl || null,
          website_url: body.websiteUrl || null,
          description: body.description || null,
          is_active: body.isActive !== undefined ? body.isActive : true,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Partners"],
    }),
    deletePartner: builder.mutation({
      query: (id) => ({
        table: "partners",
        method: "DELETE",
        id,
      }),
      invalidatesTags: ["Partners"],
    }),
  }),
});

export const {
  useCreatePartnerMutation,
  useGetPartnersQuery,
  useGetAllPartnersQuery,
  useGetPartnerDetailsQuery,
  useUpdatePartnerMutation,
  useDeletePartnerMutation,
} = partnersApi;
