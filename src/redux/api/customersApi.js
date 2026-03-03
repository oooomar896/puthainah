import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const customersApi = createApi({
  reducerPath: "customersApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Customers"],
  endpoints: (builder) => ({
    createCustomer: builder.mutation({
      query: (body) => ({
        table: "customers",
        method: "POST",
        body: {
          name: body.name,
          logo_url: body.logoUrl || null,
          description: body.description || null,
        },
      }),
      invalidatesTags: ["Customers"],
    }),
    getCustomers: builder.query({
      query: () => ({
        table: "customers",
        method: "GET",
        orderBy: { column: "created_at", ascending: false },
      }),
      providesTags: ["Customers"],
    }),
    getCustomerDetails: builder.query({
      query: (id) => ({
        table: "customers",
        method: "GET",
        id,
      }),
      providesTags: ["Customers"],
    }),
    updateCustomer: builder.mutation({
      query: ({ id, body }) => ({
        table: "customers",
        method: "PUT",
        id,
        body: {
          name: body.name,
          logo_url: body.logoUrl || null,
          description: body.description || null,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Customers"],
    }),
    deleteCustomer: builder.mutation({
      query: (id) => ({
        table: "customers",
        method: "DELETE",
        id,
      }),
      invalidatesTags: ["Customers"],
    }),
  }),
});

export const {
  useCreateCustomerMutation,
  useGetCustomersQuery,
  useGetCustomerDetailsQuery,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi;
