import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import AsyncSelect from "react-select/async";
import { useLazyGetProvidersAccountsQuery } from "@/redux/api/providersApi";
import debounce from "lodash.debounce";
import { useParams } from "next/navigation";
import { useReassignRequestFnMutation } from "../../../redux/api/ordersApi";
import { useTranslation } from "react-i18next";

const ReassignRequest = ({ refetch }) => {
  const { t } = useTranslation();
  const validationSchema = Yup.object().shape({
    providerId: Yup.string().required(t("projects.providerRequired")),
  });
  const [ReassignRequestFn] = useReassignRequestFnMutation();
  const { id } = useParams();
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await ReassignRequestFn({
        orderId: id,
        providerId: values.providerId,
      }).unwrap();
      toast.success(t("projects.successMessage"));
      refetch();
      resetForm();
    } catch (error) {
      toast.error(
        error?.data?.message || t("projects.errorMessage") || "حدث خطأ أثناء إعادة تعيين الطلب"
      );
    } finally {
      setSubmitting(false);
    }
  };
  const [triggerSearch] = useLazyGetProvidersAccountsQuery();

  const debouncedLoadProvidersOptions = debounce(
    async (inputValue, callback) => {
      try {
        const result = await triggerSearch({
          name: inputValue,
          PageNumber: 1,
          PageSize: 10,
        }).unwrap();

        const options = result?.map((provider) => ({
          value: provider.id,
          label: provider.name,
        }));

        callback(options);
      } catch {
        callback([]);
      }
    },
    500
  ); // ⏳ 500ms تأخير بعد ما يوقف المستخدم عن الكتابة

  return (
    <section className="rounded-2xl bg-white shadow-sm md:p-3 lg:p-4 xl:p-6 my-5">
      <h3 className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl font-bold text-primary mb-5">
        {t("projects.confirmRequest")}
      </h3>

      <Formik
        initialValues={{
          providerId: "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className="grid gap-4">
            {/* اختيار مقدم الخدمة */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                {t("projects.providerLabel")}
                <span className="text-red-500">*</span>
              </label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={debouncedLoadProvidersOptions}
                onChange={(option) =>
                  setFieldValue("providerId", option?.value || "")
                }
                placeholder={t("projects.providerPlaceholder")}
                isClearable
              />
              <ErrorMessage
                name="providerId"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            {/* زر التأكيد */}
            <div className="flex items-center justify-end mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/80 py-2 px-6 rounded-xl text-white font-medium disabled:opacity-70 text-sm"
              >
                {isSubmitting ? t("projects.submitting") : t("projects.submit")}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
};

export default ReassignRequest;
