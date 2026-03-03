import { createApi } from "@reduxjs/toolkit/query/react";
import { supabaseBaseQuery } from "./supabaseBaseQuery";

export const faqsApi = createApi({
  reducerPath: "faqsApi",
  baseQuery: supabaseBaseQuery,
  tagTypes: ["FAQs"],
  endpoints: (builder) => ({
    createQuestion: builder.mutation({
      query: (body) => ({
        table: "faq_questions",
        method: "POST",
        body: {
          question_ar: body.questionAr,
          question_en: body.questionEn,
          answer_ar: body.answerAr,
          answer_en: body.answerEn,
          is_active: body.isActive !== undefined ? body.isActive : true,
        },
      }),
      invalidatesTags: ["FAQs"],
    }),
    getQuestions: builder.query({
      query: () => ({
        table: "faq_questions",
        method: "GET",
        filters: { is_active: true },
        orderBy: { column: "created_at", ascending: false },
      }),
      providesTags: ["FAQs"],
    }),
    getQuestionDetails: builder.query({
      query: (id) => ({
        table: "faq_questions",
        method: "GET",
        id,
      }),
      providesTags: ["FAQs"],
    }),
    updateQuestion: builder.mutation({
      query: ({ id, body }) => ({
        table: "faq_questions",
        method: "PUT",
        id,
        body: {
          question_ar: body.questionAr,
          question_en: body.questionEn,
          answer_ar: body.answerAr,
          answer_en: body.answerEn,
          is_active: body.isActive !== undefined ? body.isActive : true,
          updated_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["FAQs"],
    }),
    deleteQuestion: builder.mutation({
      query: (id) => ({
        table: "faq_questions",
        method: "DELETE",
        id,
      }),
      invalidatesTags: ["FAQs"],
    }),
  }),
});

export const {
  useCreateQuestionMutation,
  useGetQuestionsQuery,
  useGetQuestionDetailsQuery,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} = faqsApi;
