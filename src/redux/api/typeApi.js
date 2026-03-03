import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";
import { supabase } from "@/lib/supabaseClient";

export const lookupApi = createApi({
  reducerPath: "lookupApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["LookupTypes", "LookupValues"],
  endpoints: (builder) => ({
    // Get All Lookup Types
    getLookupTypes: builder.query({
      query: () => ({
        table: "lookup_types",
        method: "GET",
      }),
      providesTags: ["LookupTypes"],
    }),

    // Get Lookup Values by Type ID (generic)
    getLookupValues: builder.query({
      query: (typeId) => ({
        table: "lookup_values",
        method: "GET",
        filters: {
          lookup_type_id: typeId,
        },
      }),
      providesTags: ["LookupValues"],
    }),

    // Get Lookup Values by Type Code (generic)
    getLookupValuesByType: builder.query({
      // نستخدم queryFn هنا لأننا نحتاج استعلامين متتاليين
      async queryFn(typeCode) {
        try {
          const { data: typeRow, error: typeError } = await supabase
            .from("lookup_types")
            .select("id")
            .eq("code", typeCode)
            .single();

          if (typeError) {
            return { error: typeError };
          }

          const { data, error } = await supabase
            .from("lookup_values")
            .select("*")
            .eq("lookup_type_id", typeRow.id);

          if (error) {
            return { error };
          }

          // تحويل الأسماء إلى camelCase لتوافق الكود الحالي
          const mapped = data?.map((item) => ({
            ...item,
            nameAr: item.name_ar,
            nameEn: item.name_en,
          }));

          return { data: mapped };
        } catch (err) {
          return { error: err };
        }
      },
      providesTags: ["LookupValues"],
    }),

    // === Backwards-compatible endpoints used by UI ===
    // Requester Entity Types
    getRequesterEntityTypes: builder.query({
      async queryFn() {
        try {
          const { data: typeRow, error: typeError } = await supabase
            .from("lookup_types")
            .select("id")
            .eq("code", "requester-entity-types")
            .single();

          if (typeError) {
            return { error: typeError };
          }

          const { data, error } = await supabase
            .from("lookup_values")
            .select("*")
            .eq("lookup_type_id", typeRow.id);

          if (error) {
            return { error };
          }

          const mapped = data?.map((item) => ({
            ...item,
            nameAr: item.name_ar,
            nameEn: item.name_en,
          }));

          return { data: mapped };
        } catch (err) {
          return { error: err };
        }
      },
      providesTags: ["LookupValues"],
    }),

    // Provider Entity Types
    getProviderEntityTypes: builder.query({
      async queryFn() {
        try {
          const { data: typeRow, error: typeError } = await supabase
            .from("lookup_types")
            .select("id")
            .eq("code", "provider-entity-types")
            .single();

          if (typeError) {
            return { error: typeError };
          }

          const { data, error } = await supabase
            .from("lookup_values")
            .select("*")
            .eq("lookup_type_id", typeRow.id);

          if (error) {
            return { error };
          }

          const mapped = data?.map((item) => ({
            ...item,
            nameAr: item.name_ar,
            nameEn: item.name_en,
          }));

          return { data: mapped };
        } catch (err) {
          return { error: err };
        }
      },
      providesTags: ["LookupValues"],
    }),
  }),
});

export const {
  useGetLookupTypesQuery,
  useGetLookupValuesByTypeQuery,
  useGetLookupValuesQuery,
  useGetRequesterEntityTypesQuery,
  useGetProviderEntityTypesQuery,
} = lookupApi;
