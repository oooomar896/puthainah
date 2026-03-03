import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import fileUpload from "@/assets/icons/fileUpload.svg";
import axios from "axios";
import { useAdminRequestPriceMutation, useReassignRequestFnMutation } from "@/redux/api/ordersApi";
import { useGetProvidersAccountsQuery } from "@/redux/api/providersApi";
import { useTranslation } from "react-i18next";
import { getAppBaseUrl } from "../../utils/env";

const AdminAttachmentForm = ({ data, refetch }) => {
  const { t } = useTranslation();

  const validationSchema = Yup.object().shape({
    isApproved: Yup.boolean().required(),
    servicePricing: Yup.number()
      .nullable()
      .when("isApproved", {
        is: true,
        then: (schema) =>
          schema
            .typeError(t("AdminAttachmentForm.errorRequiredNumber"))
            .required(t("AdminAttachmentForm.errorPriceRequired"))
            .min(1, t("AdminAttachmentForm.errorPriceNegative")),
      }),
    providerId: Yup.string()
      .nullable()
      .when("isApproved", {
        is: true,
        then: (schema) => schema.required(t("AdminAttachmentForm.errorProviderRequired") || "يرجى اختيار مزود الخدمة"),
      }),
    providerPayout: Yup.number()
      .nullable()
      .when("isApproved", {
        is: true,
        then: (schema) =>
          schema
            .typeError(t("AdminAttachmentForm.errorRequiredNumber"))
            .required(t("AdminAttachmentForm.errorPayoutRequired") || "يرجى تحديد مبلغ المزود")
            .min(1, t("AdminAttachmentForm.errorPriceNegative")),
      }),
    pricing_notes: Yup.string().nullable(),
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [AdminRequestPrice] = useAdminRequestPriceMutation();
  const [ReassignRequest] = useReassignRequestFnMutation();

  // Fetch providers for assignment
  const { data: providersData, isLoading: loadingProviders } = useGetProvidersAccountsQuery({ PageSize: 100 });
  const providers = providersData?.data || [];

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (values.isApproved) {
        // 1. Update Request Price and Status
        const requestPayload = {
          requestId: data?.id,
          statusId: 8, // Priced
          amount: values.servicePricing,
          pricing_notes: values.pricing_notes,
        };

        // 2. Assign Provider and set Payout
        const reassignPayload = {
          requestId: data?.id,
          providerId: values.providerId,
          payout: values.providerPayout,
        };

        // Upload attachments if any
        if (selectedFiles.length > 0) {
          const uploadFormData = new FormData();
          uploadFormData.append("attachmentUploaderLookupId", 700);
          uploadFormData.append("requestPhaseLookupId", 24);

          selectedFiles.forEach((file) => {
            uploadFormData.append("files", file);
          });

          await axios.post(
            `${getAppBaseUrl()}api/attachments?groupKey=${data?.attachments_group_key || data?.attachmentsGroupKey
            }`,
            uploadFormData
          );
        }

        await AdminRequestPrice(requestPayload).unwrap();
        await ReassignRequest(reassignPayload).unwrap();

        toast.success(t("AdminAttachmentForm.operationSuccess") || "تم تسعير الطلب وتعميد المزود بنجاح");
      } else {
        // Handle rejection
        const requestPayload = {
          requestId: data?.id,
          statusId: 10, // Rejected
        };
        await AdminRequestPrice(requestPayload).unwrap();
        toast.success(t("AdminAttachmentForm.operationSuccess"));
      }

      refetch();
      resetForm();
      setSelectedFiles([]);
    } catch (error) {
      toast.error(
        error?.data?.message || t("AdminAttachmentForm.operationError") || "حدث خطأ أثناء معالجة الطلب"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-[32px] bg-white border border-gray-100 shadow-xl shadow-gray-100/50 p-6 sm:p-8 my-8 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

      <h3 className="text-xl sm:text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
        <span className="w-2 h-8 bg-primary rounded-full"></span>
        {t("AdminAttachmentForm.uploadAttachments") || "تسعير وتعمد الطلب"}
      </h3>

      <Formik
        initialValues={{ isApproved: true, servicePricing: "", pricing_notes: "", providerId: "", providerPayout: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* حقل السعر للعميل */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center justify-between">
                  <span>{t("AdminAttachmentForm.price") || "السعر للعميل"}</span>
                  <span className="text-primary text-[10px] font-black uppercase">Required</span>
                </label>
                <Field
                  name="servicePricing"
                  type="number"
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                  placeholder="0.00 SAR"
                />
                <ErrorMessage name="servicePricing" component="div" className="text-red-500 text-xs font-bold mt-1" />
              </div>

              {/* حقل مبلغ المزود */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center justify-between">
                  <span>{t("AdminAttachmentForm.providerPayout") || "مبلغ المزود"}</span>
                  <span className="text-primary text-[10px] font-black uppercase">Required</span>
                </label>
                <Field
                  name="providerPayout"
                  type="number"
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                  placeholder="0.00 SAR"
                />
                <ErrorMessage name="providerPayout" component="div" className="text-red-500 text-xs font-bold mt-1" />
              </div>

              {/* اختيار المزود */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-gray-700 flex items-center justify-between">
                  <span>{t("AdminAttachmentForm.selectProvider") || "اختيار المزود"}</span>
                  <span className="text-primary text-[10px] font-black uppercase">Required</span>
                </label>
                <Field
                  as="select"
                  name="providerId"
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                >
                  <option value="">{loadingProviders ? "جاري التحميل..." : "-- اختر المزود --"}</option>
                  {providers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Field>
                <ErrorMessage name="providerId" component="div" className="text-red-500 text-xs font-bold mt-1" />
              </div>

              {/* ملاحظات التسعير */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-gray-700">ملاحظات التسعير (اختياري)</label>
                <Field
                  as="textarea"
                  name="pricing_notes"
                  rows="3"
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium"
                  placeholder="اكتب ملاحظات إضافية حول التسعير هنا..."
                />
              </div>
            </div>

            {/* رفع المرفقات الإضافية */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">مرفقات إضافية (اختياري)</label>
              <label
                htmlFor="file-upload"
                className="group flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[32px] px-4 py-8 cursor-pointer text-center hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                  <img src={typeof fileUpload === "string" ? fileUpload : (fileUpload?.src || "")} alt="upload" className="w-6 h-6 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm font-bold text-gray-600 group-hover:text-primary transition-colors">
                  {t("AdminAttachmentForm.uploadAttachments") || "اضغط لرفع العروض أو المرفقات"}
                </span>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                />
              </label>
              {selectedFiles.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-2xl space-y-2 mt-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="text-xs font-medium text-gray-600 flex items-center gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full"></span>
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-6 flex items-center justify-end gap-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={() => setFieldValue("isApproved", false)}
                className="px-8 py-3 rounded-2xl text-red-500 font-bold hover:bg-red-50 transition-all disabled:opacity-50"
              >
                {t("AdminAttachmentForm.reject") || "رفض الطلب"}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                onClick={() => setFieldValue("isApproved", true)}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 px-10 py-4 rounded-2xl text-white font-black text-base shadow-2xl hover:shadow-emerald-500/50 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && values.isApproved ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t("AdminAttachmentForm.sendingApproval") || "جاري التعميد..."}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t("AdminAttachmentForm.acceptAndSend") || "تسعير وتعميد المزود"}
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

export default AdminAttachmentForm;
