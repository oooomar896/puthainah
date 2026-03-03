import React from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import { useCreateQuestionMutation } from "@/redux/api/faqsApi";
import { useGetQuestionsQuery } from "../../../redux/api/faqsApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const AddQuestion = () => {
  const { t } = useTranslation();

  const [createQuestion, { isLoading }] = useCreateQuestionMutation();
  const { refetch } = useGetQuestionsQuery();

  const initialValues = {
    questions: [
      { questionAr: "", questionEn: "", answerAr: "", answerEn: "" },
    ],
  };

  const validationSchema = Yup.object({
    questions: Yup.array().of(
      Yup.object().shape({
        questionAr: Yup.string().required(t("question.validation.questionArRequired") || "السؤال بالعربية مطلوب"),
        questionEn: Yup.string().required(t("question.validation.questionEnRequired") || "السؤال بالإنجليزية مطلوب"),
        answerAr: Yup.string().required(t("question.validation.answerArRequired") || "الإجابة بالعربية مطلوبة"),
        answerEn: Yup.string().required(t("question.validation.answerEnRequired") || "الإجابة بالإنجليزية مطلوبة"),
      })
    ),
  });

  const handleSubmit = async (values, { resetForm }) => {
    try {
      // Loop through all questions and create them one by one
      await Promise.all(
        values.questions.map((q) => createQuestion(q).unwrap())
      );

      toast.success(t("question.successMessage"));
      refetch();
      resetForm();
    } catch (err) {
      toast.error(
        err?.data?.message || t("question.errorMessage") || "حدث خطأ أثناء إضافة الأسئلة"
      );
    }
  };

  return (
    <div className="mx-auto p-4 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">{t("question.faqTitle")}</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched }) => (
          <Form>
            <FieldArray name="questions">
              {({ push, remove }) => (
                <>
                  {values.questions.map((q, index) => (
                    <div
                      key={index}
                      className="mb-6 border border-gray-200 p-4 rounded-xl relative bg-white shadow-sm"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Arabic Section */}
                        <div className="space-y-3">
                          <h3 className="font-semibold text-primary border-b pb-2 mb-2">النسخة العربية</h3>
                          <div>
                            <label className="block text-gray-700 mb-1 text-sm font-medium">
                              {t("question.questionAr") || "السؤال (عربي)"}
                            </label>
                            <Field
                              name={`questions[${index}].questionAr`}
                              placeholder="اكتب السؤال بالعربية"
                              className="w-full border rounded-lg p-2 bg-gray-50 focus:outline-primary focus:bg-white transition-colors"
                            />
                            {touched.questions?.[index]?.questionAr && errors.questions?.[index]?.questionAr && (
                              <div className="text-red-500 text-xs mt-1">{errors.questions[index].questionAr}</div>
                            )}
                          </div>
                          <div>
                            <label className="block text-gray-700 mb-1 text-sm font-medium">
                              {t("question.answerAr") || "الإجابة (عربي)"}
                            </label>
                            <Field
                              as="textarea"
                              name={`questions[${index}].answerAr`}
                              placeholder="اكتب الإجابة بالعربية"
                              className="w-full border rounded-lg p-2 bg-gray-50 focus:outline-primary focus:bg-white transition-colors"
                              rows="3"
                            />
                            {touched.questions?.[index]?.answerAr && errors.questions?.[index]?.answerAr && (
                              <div className="text-red-500 text-xs mt-1">{errors.questions[index].answerAr}</div>
                            )}
                          </div>
                        </div>

                        {/* English Section */}
                        <div className="space-y-3 ltr" dir="ltr">
                          <h3 className="font-semibold text-primary border-b pb-2 mb-2 text-left">English Version</h3>
                          <div>
                            <label className="block text-gray-700 mb-1 text-sm font-medium text-left">
                              {t("question.questionEn") || "Question (English)"}
                            </label>
                            <Field
                              name={`questions[${index}].questionEn`}
                              placeholder="Write question in English"
                              className="w-full border rounded-lg p-2 bg-gray-50 focus:outline-primary focus:bg-white transition-colors"
                            />
                            {touched.questions?.[index]?.questionEn && errors.questions?.[index]?.questionEn && (
                              <div className="text-red-500 text-xs mt-1 text-left">{errors.questions[index].questionEn}</div>
                            )}
                          </div>
                          <div>
                            <label className="block text-gray-700 mb-1 text-sm font-medium text-left">
                              {t("question.answerEn") || "Answer (English)"}
                            </label>
                            <Field
                              as="textarea"
                              name={`questions[${index}].answerEn`}
                              placeholder="Write answer in English"
                              className="w-full border rounded-lg p-2 bg-gray-50 focus:outline-primary focus:bg-white transition-colors"
                              rows="3"
                            />
                            {touched.questions?.[index]?.answerEn && errors.questions?.[index]?.answerEn && (
                              <div className="text-red-500 text-xs mt-1 text-left">{errors.questions[index].answerEn}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="absolute top-2 left-2 text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors"
                          title={t("question.deleteButton")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => push({ questionAr: "", questionEn: "", answerAr: "", answerEn: "" })}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg mb-6 transition-colors font-medium border border-gray-300"
                  >
                    <span className="text-xl leading-none">+</span> {t("question.addQuestionButton")}
                  </button>
                </>
              )}
            </FieldArray>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t("question.submitting") : t("question.saveButton")}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddQuestion;
