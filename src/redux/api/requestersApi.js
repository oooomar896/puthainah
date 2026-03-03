import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const requestersApi = createApi({
  reducerPath: "requestersApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Requesters"],
  endpoints: (builder) => ({
    // Get Requesters Accounts (Admin)
    getRequestersAccounts: builder.query({
      query: ({ PageNumber = 1, PageSize = 10, AccountStatus = "" }) => {
        const filters = {};
        let userJoin = "user:users!requesters_user_id_fkey(id,email,phone,role,is_blocked)";

        if (AccountStatus === "active") {
          userJoin = "user:users!requesters_user_id_fkey!inner(id,email,phone,role,is_blocked)";
          filters["user.is_blocked"] = false;
        } else if (AccountStatus === "blocked") {
          userJoin = "user:users!requesters_user_id_fkey!inner(id,email,phone,role,is_blocked)";
          filters["user.is_blocked"] = true;
        }

        return {
          table: "requesters",
          method: "GET",
          filters,
          pagination: {
            page: Number(PageNumber),
            pageSize: Number(PageSize),
          },
          joins: [
            userJoin,
            "entity_type:lookup_values!requesters_entity_type_id_fkey(id,name_ar,name_en,code)",
            "city:cities(id,name_ar,name_en)",
          ],
        };
      },
      providesTags: ["Requesters"],
    }),
    // Delete Requester
    deleteRequester: builder.mutation({
      query: (id) => ({
        table: "requesters",
        method: "DELETE",
        id,
      }),
      invalidatesTags: ["Requesters"],
    }),
    // Update Requester Status (Block/Unblock User)
    updateRequesterStatus: builder.mutation({
      query: ({ body }) => {
        // First get the requester to find user_id
        // Then update users table
        return {
          table: "users",
          method: "PUT",
          id: body.userId, // Should be passed from component
          body: {
            is_blocked: body.isBlocked,
            updated_at: new Date().toISOString(),
          },
        };
      },
      invalidatesTags: ["Requesters"],
    }),
    // Update Requester Profile
    updateRequesterProfile: builder.mutation({
      query: ({ id, body }) => ({
        table: "requesters",
        method: "PUT",
        id,
        body: {
          name: body.name,
          city_id: body.cityId,
          entity_type_id: body.entityTypeId,
          commercial_registration_number: body.commercialRegistrationNumber,
          commercial_registration_date: body.commercialRegistrationDate,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Requesters"],
    }),
  }),
});

export const {
  useGetRequestersAccountsQuery,
  useDeleteRequesterMutation,
  useUpdateRequesterStatusMutation,
  useUpdateRequesterProfileMutation,
} = requestersApi;
