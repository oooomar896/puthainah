import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useAdminSetRequestPriceMutation, useAdminMarkRequestPaidMutation, useGetRequestDetailsQuery } from "@/redux/api/ordersApi";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DollarSign, Upload, FileText, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const AdminPricingPanel = ({ refetch }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [adminSetPrice] = useAdminSetRequestPriceMutation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, done, error

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validationSchema = Yup.object().shape({
    adminPrice: Yup.number().typeError(t("AdminPricingPanel.priceType") || "السعر غير صحيح").required(t("AdminPricingPanel.priceRequired") || "أدخل السعر"),
    adminNotes: Yup.string().nullable(),
  });

  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(t("AdminPricingPanel.fileTooLarge") || "حجم الملف كبير جداً (الحد الأقصى 10 ميجابايت)");
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setUploadStatus("uploading");
      let proposalUrl = values.adminProposalFileUrl || ""; // Keep manual URL if no file

      // Handle File Upload if exists
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `proposals/${id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(fileName, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('attachments')
          .getPublicUrl(fileName);

        proposalUrl = publicUrl;
      }

      await adminSetPrice({
        requestId: id,
        adminPrice: values.adminPrice,
        adminNotes: values.adminNotes,
        adminProposalFileUrl: proposalUrl,
      }).unwrap();

      toast.success(t("AdminPricingPanel.success") || "تم حفظ السعر والبيانات");
      setSelectedFile(null); // Reset file
      setUploadStatus("done");
      refetch && refetch();
      resetForm();
    } catch (error) {
      console.error(error);
      setUploadStatus("error");
      toast.error(error?.data?.message || t("AdminPricingPanel.error") || "حدث خطأ أثناء الحفظ");
    } finally {
      setSubmitting(false);
      setTimeout(() => setUploadStatus("idle"), 2000);
    }
  };

  return (
    <section className="bg-white rounded-[2rem] shadow-custom border border-gray-100 p-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <DollarSign className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">
          {t("AdminPricingPanel.title") || "تسعير الطلب"}
        </h3>
      </div>
      <Formik initialValues={{ adminPrice: "", adminNotes: "", adminProposalFileUrl: "" }} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form className="grid gap-5">
            <div>
              <label className="block mb-1.5 text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                {t("AdminPricingPanel.price") || "قيمة العرض المالي"} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Field
                  name="adminPrice"
                  type="number"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-lg font-bold text-primary focus:border-primary/50 transition-all outline-none pl-12"
                  placeholder="0.00"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">SAR</div>
              </div>
              <ErrorMessage name="adminPrice" component="div" className="text-red-500 text-[10px] font-bold mt-1 px-1" />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                {t("AdminPricingPanel.notes") || "ملاحظات إضافية"}
              </label>
              <Field
                as="textarea"
                name="adminNotes"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm min-h-[100px] focus:border-primary/50 transition-all outline-none"
                placeholder={t("AdminPricingPanel.enterNotes") || "أدخل أية تفاصيل أو اشتراطات للملف..."}
              />
              <ErrorMessage name="adminNotes" component="div" className="text-red-500 text-[10px] font-bold mt-1 px-1" />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                {t("AdminPricingPanel.proposalFile") || "ملف العرض الفني"}
              </label>

              {!selectedFile ? (
                <div className="relative group">
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50/50 hover:border-primary/30 transition-all cursor-pointer">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.png,.jpg,.jpeg"
                    />
                    <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                      <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary mb-1 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-gray-600 group-hover:text-primary transition-colors">
                        {t("AdminPricingPanel.uploadFile") || "اضغط لرفع ملف العرض"}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        PDF, Excel, Word, Images (Max 10MB)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between animate-fade-in-up">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold text-gray-900 truncate max-w-[150px]">
                        {selectedFile.name}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {t("common.readyToUpload") || "جاهز للرفع"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || uploadStatus === "uploading"}
              className="w-full bg-gradient-to-r from-primary to-[#155490] hover:from-[#155490] hover:to-primary text-white py-4 rounded-2xl font-black text-base transition-all duration-300 hover:scale-[1.02] shadow-2xl hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
            >
              {isSubmitting || uploadStatus === "uploading" ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {selectedFile && uploadStatus === 'uploading' ? (t("AdminPricingPanel.uploading") || "جاري رفع الملف...") : (t("AdminPricingPanel.saving") || "جاري الحفظ...")}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {t("AdminPricingPanel.save") || "حفظ وإرسال العرض"}
                </>
              )}
            </button>
          </Form>
        )}
      </Formik>

      {/* Cash Payment / Mark as Paid Action */}
      <AdminMarkPaidAction requestId={id} refetch={refetch} />
    </section >
  );
};

// Sub-component for Marking as Paid
const AdminMarkPaidAction = ({ requestId, refetch }) => {
  const { t } = useTranslation();
  const [markPaid, { isLoading }] = useAdminMarkRequestPaidMutation();
  const { data: requestData } = useGetRequestDetailsQuery(requestId);

  // Show only if status is priced or waiting-payment (by code)
  const canMarkPaid = ["priced", "waiting-payment", "waiting_payment"].includes(requestData?.status?.code);

  if (!canMarkPaid) return null;

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <div className="flex items-center justify-between bg-secondary/5 p-4 rounded-xl border border-secondary/20">
        <div>
          <h4 className="font-bold text-gray-900">{t("AdminPricingPanel.cashPayment") || "الدفع الكاش / تحويل بنكي"}</h4>
          <p className="text-sm text-gray-500 mt-1">
            {t("AdminPricingPanel.markPaidDesc") || "يمكنك تحديث حالة الطلب إلى 'مدفوع' يدوياً في حال استلام المبلغ نقداً أو عبر تحويل."}
          </p>
        </div>
        <button
          onClick={async () => {
            if (window.confirm(t("AdminPricingPanel.confirmMarkPaid") || "هل أنت متأكد من تغيير الحالة إلى مدفوع؟")) {
              await markPaid(requestId).unwrap();
              toast.success(t("AdminPricingPanel.markedPaid") || "تم تحديث الحالة إلى مدفوع");
              refetch && refetch();
            }
          }}
          disabled={isLoading}
          className="bg-secondary hover:bg-secondary/90 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-secondary/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              جاري المعالجة...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t("AdminPricingPanel.markAsPaid") || "تحديد كـ مدفوع"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminPricingPanel;
