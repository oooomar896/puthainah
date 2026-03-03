import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import fileUpload from "@/assets/icons/fileUpload.svg";
import axios from "axios";
import { useRequesterActionMutation } from "@/redux/api/ordersApi";
import { useTranslation } from "react-i18next";
import { getAppBaseUrl } from "../../utils/env";

const RequesterAttachmentForm = ({ data, refetch }) => {
  const { t } = useTranslation();
  const validationSchema = Yup.object().shape({
    isApproved: Yup.boolean().required(),
    pricingNotes: Yup.string().when("isApproved", {
      is: true,
      then: (schema) =>
        schema.required(t("attachmentForm.pricingNotesRequired")),
    }),
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [AdminRequestPrice] = useRequesterActionMutation();

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = {
        requestId: data?.id,
        isApproved: values.isApproved,
        ...(values.isApproved && { pricingNotes: values.pricingNotes }),
      };

      if (values.isApproved && selectedFiles.length > 0) {
        const uploadFormData = new FormData();
        uploadFormData.append("attachmentUploaderLookupId", 702);
        uploadFormData.append("requestPhaseLookupId", 802);
        selectedFiles.forEach((file) => {
          uploadFormData.append("files", file);
        });
        await axios.post(
          `${getAppBaseUrl()}api/attachments?groupKey=${data?.attachments_group_key || data?.attachmentsGroupKey
          }`,
          uploadFormData
        );
      }

      await AdminRequestPrice(payload).unwrap();
      toast.success(t("attachmentForm.success"));
      refetch();
      resetForm(); // بيرجع الفورم لقيمته الأولية
      setSelectedFiles([]); // نمسح الملفات المرفوعة من الواجهة
    } catch (error) {
      toast.error(
        error?.data?.message || t("attachmentForm.error") || "حدث خطأ أثناء إضافة المرفقات"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white shadow-sm p-2 md:p-3 lg:p-4 xl:p-6 my-5">
      <h3 className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl font-bold text-primary mb-5">
        {t("attachmentForm.title")}
      </h3>

      <Formik
        initialValues={{ isApproved: true, pricingNotes: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form>
            {/* رفع المرفقات */}
            <label
              htmlFor="file-upload"
              className="mb-5 flex flex-col items-center justify-center border-2 border-dashed border-[#ADADAD] rounded-xl px-4 py-10 cursor-pointer text-center text-[#808080] hover:border-primary transition"
            >
              <img src={typeof fileUpload === "string" ? fileUpload : (fileUpload?.src || "")} alt="upload" loading="lazy" decoding="async" />
              <span className="text-sm font-light">
                {t("attachmentForm.uploadPrompt")}{" "}
                <span className="text-red-500">*</span>
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
              <ul className="mt-2 text-sm text-gray-700 list-disc pr-4 text-right">
                {selectedFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            )}

            {values.isApproved && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("attachmentForm.pricingNotesLabel")}
                </label>
                <Field
                  name="pricingNotes"
                  as="textarea"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring focus:border-primary resize-none"
                  placeholder={t("attachmentForm.pricingNotesPlaceholder")}
                />
                <ErrorMessage
                  name="pricingNotes"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            )}

            <div className="mt-5 flex items-center justify-center md:justify-end gap-2 md:gap-3">
              {/* زر الرفض */}
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={() => setFieldValue("isApproved", false)}
                className="bg-[#F61A1E] transition-all duration-300 hover:bg-[#F61A1E]/80 py-2 px-4 md:px-5 lg:px-6 xl:px-8 rounded-xl text-white font-medium flex items-center justify-center gap-2 disabled:opacity-70 text-xs md:text-sm lg:text-base"
              >
                {isSubmitting && values.isApproved === false ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>{t("attachmentForm.rejecting")}</span>
                  </>
                ) : (
                  t("attachmentForm.reject")
                )}
              </button>

              {/* زر القبول */}
              <button
                type="submit"
                disabled={selectedFiles.length === 0 || isSubmitting}
                onClick={() => setFieldValue("isApproved", true)}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 py-3 px-8 rounded-2xl text-white font-black text-base shadow-xl hover:shadow-emerald-500/50 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting && values.isApproved === true ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t("attachmentForm.approving")}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t("attachmentForm.approve")}
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

export default RequesterAttachmentForm;
