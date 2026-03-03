import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const citiesApi = createApi({
  reducerPath: "citiesApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["Cities"],
  endpoints: (builder) => ({
    // Get All Cities
    getCities: builder.query({
      query: () => ({
        table: "cities",
        method: "GET",
        orderBy: { column: "name_ar", ascending: true },
      }),
      providesTags: ["Cities"],
    }),
  }),
});

export const { useGetCitiesQuery } = citiesApi;
