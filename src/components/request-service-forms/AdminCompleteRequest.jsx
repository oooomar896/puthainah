import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import Select from "react-select";
import { useAdminCompleteRequestMutation } from "../../redux/api/ordersApi";
import AsyncSelect from "react-select/async";
import { useLazyGetProvidersAccountsQuery } from "../../redux/api/providersApi";
import debounce from "lodash.debounce";
import fileUpload from "@/assets/icons/fileUpload.svg";
import { useState } from "react";
import axios from "axios";
import { useAddOrderAttachmentsMutation } from "../../redux/api/projectsApi";
import { useTranslation } from "react-i18next";
import { getAppBaseUrl } from "../../utils/env";

const AdminCompleteRequest = ({ data, refetch }) => {
  const { t } = useTranslation();
  const validationSchema = Yup.object().shape({
    requestTitle: Yup.string().required(t("AdminCompleteRequest.errorRequestTitleRequired")),
    startDate: Yup.date().required(t("AdminCompleteRequest.errorStartDateRequired")),
    endDate: Yup.date()
      .required(t("AdminCompleteRequest.errorEndDateRequired"))
      .min(Yup.ref("startDate"), t("AdminCompleteRequest.errorEndDateMin")),
    providerId: Yup.string().required(t("AdminCompleteRequest.errorProviderRequired")),
    orderPrice: Yup.number()
      .typeError(t("AdminCompleteRequest.errorPriceType"))
      .required(t("AdminCompleteRequest.errorPriceRequired"))
      .min(0, t("AdminCompleteRequest.errorPriceMin")),
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const [AdminCompleteRequest] = useAdminCompleteRequestMutation();
  const [addOrderAttachments] = useAddOrderAttachmentsMutation();

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const groupRes = await axios.get(
        `${getAppBaseUrl()}api/attachments/new-attachments-group-key`
      );
      const groupKey = groupRes.data;

      const payload = {
        requestId: data?.id,
        statusCode: 11, // Completed
        isCompleted: true,
        orderTitle: values.requestTitle,
        startDate: values.startDate,
        endDate: values.endDate,
        providers: [values.providerId],
        orderPrice: values.orderPrice, // ➕ أضفت السعر هنا
        statusId: 11, // Completed status for API
      };
      if (selectedFiles && selectedFiles.length > 0) {
        const uploadFormData = new FormData();
        uploadFormData.append("attachmentUploaderLookupId", 700);
        uploadFormData.append("requestPhaseLookupId", 25);
        for (let i = 0; i < selectedFiles.length; i++) {
          uploadFormData.append("files", selectedFiles[i]);
        }
        await axios.post(
          `${getAppBaseUrl()}api/attachments?groupKey=${groupKey}`,
          uploadFormData
        );
      }
      const res = await AdminCompleteRequest(payload).unwrap();
      await addOrderAttachments({
        body: { attachmentsGroupKey: groupKey },
        projectId: res,
      }).unwrap();

      toast.success(t("AdminCompleteRequest.operationSuccess"));
      refetch();
      resetForm();
    } catch (error) {
      toast.error(
        error?.data?.message || t("AdminCompleteRequest.operationError") || "حدث خطأ أثناء إتمام الطلب"
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
    <section className="rounded-[32px] bg-white border border-gray-100 shadow-custom p-6 sm:p-8 my-8 overflow-hidden relative animate-fade-in-up">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

      <h3 className="text-xl sm:text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
        <span className="w-2 h-8 bg-primary rounded-full"></span>
        {t("AdminCompleteRequest.confirmRequest") || "إتمام الطلب وبدء التنفيذ"}
      </h3>

      <Formik
        initialValues={{
          requestTitle: "",
          startDate: "",
          endDate: "",
          providerId: "",
          orderPrice: "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* عنوان الطلب */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-gray-700">
                  {t("AdminCompleteRequest.requestTitle")} <span className="text-red-500">*</span>
                </label>
                <Field
                  name="requestTitle"
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                  placeholder={t("AdminCompleteRequest.enterRequestTitle")}
                />
                <ErrorMessage name="requestTitle" component="div" className="text-red-500 text-xs font-bold mt-1" />
              </div>

              {/* السعر */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  {t("AdminCompleteRequest.price")} <span className="text-red-500">*</span>
                </label>
                <Field
                  name="orderPrice"
                  type="number"
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                  placeholder="0.00 SAR"
                />
                <ErrorMessage name="orderPrice" component="div" className="text-red-500 text-xs font-bold mt-1" />
              </div>

              {/* التاريخ */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">{t("AdminCompleteRequest.startDate")}</label>
                  <Field
                    name="startDate"
                    type="date"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">{t("AdminCompleteRequest.endDate")}</label>
                  <Field
                    name="endDate"
                    type="date"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none text-sm font-bold"
                  />
                </div>
              </div>

              {/* اختيار مقدم الخدمة */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-gray-700">
                  {t("AdminCompleteRequest.provider")} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    loadOptions={debouncedLoadProvidersOptions}
                    onChange={(option) => setFieldValue("providerId", option?.value)}
                    placeholder={t("AdminCompleteRequest.selectProvider")}
                    isClearable
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: '1rem',
                        padding: '0.25rem',
                        backgroundColor: '#f9fafb',
                        borderColor: '#f3f4f6',
                        boxShadow: 'none',
                        '&:hover': { borderColor: '#3b82f6' }
                      })
                    }}
                  />
                </div>
                <ErrorMessage name="providerId" component="div" className="text-red-500 text-xs font-bold mt-1" />
              </div>

              {/* رفع الملفات */}
              <div className="md:col-span-2">
                <label className="text-sm font-bold text-gray-700 mb-2 block">المرفقات النهائية</label>
                <label
                  htmlFor="file-upload"
                  className="group flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl px-4 py-8 cursor-pointer text-center hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                    <img src={typeof fileUpload === "string" ? fileUpload : (fileUpload?.src || "")} alt="upload" className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-bold text-gray-500 group-hover:text-primary tracking-tight">
                    {t("AdminCompleteRequest.uploadAttachments")}
                  </span>
                  <input type="file" id="file-upload" className="hidden" multiple onChange={handleFileChange} />
                </label>

                {selectedFiles.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-gray-600">
                    {selectedFiles.map((file, index) => (
                      <span key={index} className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        {file.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end pt-6 border-t border-gray-50">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 px-12 py-4 rounded-2xl text-white font-black text-base shadow-2xl hover:shadow-teal-500/50 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t("AdminCompleteRequest.sending")}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t("AdminCompleteRequest.confirm")}
                  </>
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
};

export default AdminCompleteRequest;
