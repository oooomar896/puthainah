import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const servicesApi = createApi({
  reducerPath: "servicesApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Services"],
  endpoints: (builder) => ({
    getServices: builder.query({
      query: () => ({
        table: "services",
        method: "GET",
        filters: { is_active: true },
        orderBy: { column: "created_at", ascending: true },
        select: "id,name_ar,name_en,base_price,is_active,image_url,created_at",
      }),
      providesTags: ["Services"],
    }),
    getService: builder.query({
      query: (id) => ({
        table: "services",
        method: "GET",
        id,
      }),
      providesTags: ["Services"],
    }),
    createService: builder.mutation({
      query: (body) => ({
        table: "services",
        method: "POST",
        body: {
          name_ar: body.titleAr,
          name_en: body.titleEn,
          price: body.price || null,
          image_url: body.imageUrl || null,
          is_active: true,
        },
      }),
      invalidatesTags: ["Services"],
    }),
    updateService: builder.mutation({
      query: ({ id, body }) => ({
        table: "services",
        method: "PUT",
        id,
        body: {
          name_ar: body.titleAr,
          name_en: body.titleEn,
          price: body.price || null,
          image_url: body.imageUrl || null,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Services"],
    }),
    ActiveServiceStatus: builder.mutation({
      query: ({ id }) => ({
        table: "services",
        method: "PUT",
        id,
        body: {
          is_active: true,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Services"],
    }),
    deActiveServiceStatus: builder.mutation({
      query: ({ id }) => ({
        table: "services",
        method: "PUT",
        id,
        body: {
          is_active: false,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Services"],
    }),
    updateServicePrice: builder.mutation({
      query: ({ id, body }) => ({
        table: "services",
        method: "PUT",
        id,
        body: {
          price: body.price,
          updated_at: new Date().toISOString(),
        },
    }),
      invalidatesTags: ["Services"],
    }),
    deleteService: builder.mutation({
      query: (id) => ({
        table: "services",
        method: "DELETE",
        id,
      }),
      invalidatesTags: ["Services"],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServiceQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useActiveServiceStatusMutation,
  useDeActiveServiceStatusMutation,
  useUpdateServicePriceMutation,
  useDeleteServiceMutation,
} = servicesApi;
