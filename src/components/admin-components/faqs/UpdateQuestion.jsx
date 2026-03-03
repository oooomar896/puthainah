import { useRouter, useParams } from "next/navigation";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  useGetQuestionDetailsQuery,
  useUpdateQuestionMutation,
} from "@/redux/api/faqsApi";
import { useGetQuestionsQuery } from "../../../redux/api/faqsApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const UpdateQuestion = () => {
  const { t } = useTranslation();

  const router = useRouter();
  const { id } = useParams(); // جيب الـ id من البارامز
  const { data, isLoading: isLoadingDetails } = useGetQuestionDetailsQuery(id);
  const [updateQuestion, { isLoading }] = useUpdateQuestionMutation();
  const { refetch } = useGetQuestionsQuery();

  const validationSchema = Yup.object({
    questionString: Yup.string().required(
      t("question.validation.questionRequired")
    ),
    answer: Yup.string().required(t("question.validation.answerRequired")),
  });

  const handleSubmit = async (values) => {
    try {
      await updateQuestion({ id, body: values }).unwrap();
      toast.success(t("question.updateSuccess"));
      refetch();
      router.push("/admin/faqs");
    } catch (err) {
      toast.error(
        err?.data?.message || t("question.updateError") || "حدث خطأ أثناء تحديث السؤال"
      );
    }
  };

  if (isLoadingDetails) return <p>{t("question.loadingData")}</p>;

  const initialValues = {
    questionString: data?.questionString || "",
    answer: data?.answer || "",
  };

  return (
    <div className="mx-auto p-4 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">{t("question.editQuestion")}</h2>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form>
            <div className="mb-4 border p-3 rounded-lg relative">
              <label className="block text-gray-700 mb-1">
                {t("question.question")}
              </label>
              <Field
                name="questionString"
                placeholder={t("question.questionPlaceholder")}
                className="w-full border rounded p-2 mb-2 bg-primary/10 focus:outline-primary"
              />
              {touched.questionString && errors.questionString && (
                <div className="text-red-500 text-sm mb-2">
                  {errors.questionString}
                </div>
              )}

              <label className="block text-gray-700 mb-1">
                {t("question.answer")}
              </label>
              <Field
                as="textarea"
                name="answer"
                placeholder={t("question.answerPlaceholder")}
                className="w-full border rounded p-2 bg-primary/10 focus:outline-primary"
                rows="3"
              />
              {touched.answer && errors.answer && (
                <div className="text-red-500 text-sm">{errors.answer}</div>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-white px-3 py-1 rounded"
            >
              {isLoading ? t("question.submitting") : t("question.saveButton")}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default UpdateQuestion;
