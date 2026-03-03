import React, { useContext, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import fileUpload from "../../../assets/icons/fileUpload.svg";
import { useRouter } from "next/navigation";
import {
  useCreateOrderMutation,
  useCreateOrderPricedMutation,
} from "../../../redux/api/ordersApi";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import PaymentForm from "./PaymentForm";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import { createAttachmentGroupKey, uploadAttachmentsToStorage } from "@/utils/attachmentUtils";
import { supabase } from "@/lib/supabaseClient";
import StepWizard from "./StepWizard";
import { ArrowRight, ArrowLeft } from "lucide-react";
import MoyasarInlineForm from "./MoyasarInlineForm";
import { PLATFORM_SERVICES, ServiceIcon } from "@/constants/servicesData";

const RequestForm = ({ services }) => {
  const router = useRouter();
  const itemId = null;

  const { lang } = useContext(LanguageContext);
  const { t } = useTranslation();
  const tr = (key, fallback) => {
    const v = t(key);
    return v === key ? fallback : v;
  };

  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, label: tr("formRequest.steps.services", "الخدمات") },
    { id: 2, label: tr("formRequest.steps.details", "التفاصيل") },
    { id: 3, label: tr("formRequest.steps.attachments", "المرفقات") },
    { id: 4, label: tr("formRequest.steps.review", "المراجعة") },
  ];

  const validationSchema = [
    // Step 1: Services
    Yup.object({
      selectedServices: Yup.array()
        .min(1, t("formRequest.validation.selectAtLeastOne"))
        .required(t("formRequest.validation.selectAtLeastOne")),
    }),
    // Step 2: Details
    Yup.object({
      description: Yup.string().required(
        t("formRequest.validation.descriptionRequired")
      ),
    }),
    // Step 3: Attachments (Optional but validated if present)
    Yup.object({
      attachment: Yup.mixed()
        .nullable()
        .test("fileSize", t("formRequest.validation.fileTooLarge"), (value) => {
          return !value || (value && value.size <= 5 * 1024 * 1024);
        }),
    }),
    // Step 4: Review & Terms
    Yup.object({
      agreeToTerms: Yup.bool().oneOf(
        [true],
        t("formRequest.validation.agreeRequired")
      ),
    }),
  ];

  const currentValidationSchema = validationSchema[currentStep - 1];

  const [showPayment, setShowPayment] = useState(null);

  const userId = useSelector((state) => state.auth.userId);
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [createOrder, { isLoading: loadingCreateOrder }] =
    useCreateOrderMutation();
  const [createOrderPriced, { isLoading: loadingCreateOrderPriced }] =
    useCreateOrderPricedMutation();

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const initialValues = {
    selectedServices: itemId ? [String(itemId)] : [],
    description: "",
    attachment: null,
    agreeToTerms: false,
  };

  const isAnyPricedSelected = (selectedServices) => {
    if (!selectedServices) return false;
    return selectedServices.some((id) => {
      const service = services.find((s) => String(s.id) === id);
      return !!service && typeof service.base_price === "number" && service.base_price > 0;
    });
  };


  const handleNext = async (validateForm, setTouched) => {
    const errors = await validateForm();
    if (Object.keys(errors).length === 0) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    } else {
      setTouched(errors); // Mark fields as touched to show errors
      toast.error(t("formRequest.validation.fixErrors") || "يرجى تصحيح الأخطاء للمتابعة");
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (values) => {
    try {
      const hasPricedService = isAnyPricedSelected(values.selectedServices);

      // 1. إنشاء Group Key باستخدام Supabase RPC
      const groupKey = await createAttachmentGroupKey();
      if (!groupKey) {
        toast.error("فشل في إنشاء group key للمرفقات");
        return;
      }

      // 2. جلب requester_id من جدول requesters باستخدام userId (مع إنشاء ملف تعريفي تلقائي إذا لم يوجد)
      let requesterId = null;
      const { data: requesterRow } = await supabase
        .from("requesters")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!requesterRow?.id) {
        console.log("Requester profile not found, creating one...");
        const { data: newUser, error: createErr } = await supabase
          .from("requesters")
          .insert([{ user_id: userId, full_name: "Service Seeker" }])
          .select("id")
          .single();

        if (createErr || !newUser?.id) {
          console.error("Failed to self-heal requester profile:", createErr);
          toast.error("تعذر تهيئة حساب طالب الخدمة، يرجى التواصل مع الدعم");
          return;
        }
        requesterId = newUser.id;
      } else {
        requesterId = requesterRow.id;
      }

      // 3. تحديد الخدمة المختارة (قاعدة: طلب واحد مرتبط بخدمة واحدة)
      const selectedServiceId = values.selectedServices?.[0];
      let selectedService = services.find((s) => String(s.id) === String(selectedServiceId));

      // Fallback: search in PLATFORM_SERVICES if not found in DB list (for title/display purposes)
      if (!selectedService) {
        const platformMatch = PLATFORM_SERVICES.find(s => String(s.id) === String(selectedServiceId));
        if (platformMatch) {
          selectedService = {
            ...platformMatch,
            name_ar: platformMatch.name_ar,
            name_en: platformMatch.name_en,
            base_price: platformMatch.base_price || 0 // Ensure price exists
          };
        }
      }

      if (!selectedServiceId || !selectedService) {
        toast.error("يجب اختيار خدمة واحدة على الأقل");
        return;
      }

      // 4. جلب status_id حسب نوع الخدمة (تحسين البحث ليكون أكثر مرونة)
      let statusId = null;
      const statusCode = hasPricedService ? "priced" : "pending";

      try {
        const { data: statusLookup } = await supabase
          .from("lookup_values")
          .select("id")
          .eq("code", statusCode)
          .maybeSingle();

        statusId = statusLookup?.id;

        // Fallback IDs based on common DB seeds if lookup fails
        if (!statusId) {
          if (statusCode === "pending") statusId = 7;
          if (statusCode === "priced") statusId = 8;
        }
      } catch {
        console.warn("Status lookup failed, using fallbacks");
        statusId = statusCode === "pending" ? 7 : 8;
      }

      if (!statusId) {
        toast.error("تعذر تحديد حالة الطلب بشكل آمن");
        return;
      }

      // 5. تجهيز العنوان
      const title =
        (lang === "ar" ? selectedService?.name_ar : selectedService?.name_en) ||
        (selectedService?.titleAr || selectedService?.titleEn) ||
        "طلب خدمة";

      // 6. جهز بيانات الطلب
      const payload = {
        requesterId,
        serviceId: selectedServiceId,
        title,
        description: values.description,
        statusId,
        attachmentsGroupKey: groupKey,
      };

      // 7. ارفع الملفات فقط لو فيه ملفات
      if (selectedFiles && selectedFiles.length > 0) {
        const uploadSuccess = await uploadAttachmentsToStorage(
          selectedFiles,
          groupKey,
          702, // attachmentUploaderLookupId للـ Requester
          800  // requestPhaseLookupId لمرحلة الطلب الأولية
        );
        if (!uploadSuccess) {
          toast.error("فشل في رفع بعض الملفات");
        }
      }

      // ******************** stripe  *********************
      if (hasPricedService) {
        const orderRes = await createOrderPriced(payload).unwrap();
        const orderId = orderRes.id;
        const pricedService = selectedService;
        setShowPayment({
          amount: pricedService.base_price, // Stripe uses cents
          consultationId: orderId, // we'll use it to link payment to the order
        });

        return; // ما نكملش التسجيل دلوقتي
      }
      // ******************** stripe  *********************
      // 8. التسجيل
      else {
        await createOrder(payload).unwrap();
        toast.success(t("formRequest.messages.successUpload") || "تم تقديم طلبك بنجاح");
        router.push("/requests");
      }
    } catch (error) {
      toast.error(
        error?.data?.message || t("formRequest.messages.registrationError") || t("formRequest.messages.errorUpload") || "حدث خطأ أثناء إنشاء الطلب"
      );
    }
  };

  return (
    <div
      className="rounded-[32px] bg-white basis-1/2 text-black pt-8 pb-10 px-6 sm:px-8 border border-gray-100"
      style={{
        boxShadow: "0px 10px 40px -10px rgba(0, 0, 0, 0.08)",
        direction: "rtl",
      }}
    >
      <h4 className="text-2xl md:text-3xl font-bold mt-2 mb-6 text-center text-gray-800">
        {t("formRequest.requestService")}
      </h4>
      <div className="w-20 h-1 bg-primary/20 mx-auto mb-8 rounded-full"></div>

      <StepWizard currentStep={currentStep} steps={steps} />

      <Formik
        initialValues={initialValues}
        validationSchema={currentValidationSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue, validateForm, setTouched }) => {
          const anyPriced = isAnyPricedSelected(values.selectedServices);

          const handleCheckboxChange = (e) => {
            const { value, checked } = e.target;
            let selected = checked ? [String(value)] : [];
            setFieldValue("selectedServices", selected);
            if (selected.length === 0) setFieldValue("budget", "");
          };

          return (
            <Form className="mt-4 flex flex-col gap-6 min-h-[300px]">

              {/* Step 1: Services Selection */}
              {currentStep === 1 && (
                <div className="animate-fadeIn">
                  <p className="text-lg font-medium text-black mb-4">
                    {t("formRequest.requiredServices")}{" "}
                    <span className="text-red-500">*</span>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ltr:items-end max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                    {PLATFORM_SERVICES.map((item) => {
                      // Find matching service in DB to get real ID and Price
                      const dbMatch = services?.find(s => {
                        const nameAr = s.name_ar || s.titleAr || "";
                        const nameEn = s.name_en || s.titleEn || "";
                        return nameAr.includes(item.name_ar) ||
                          item.name_ar.includes(nameAr) ||
                          nameEn.toLowerCase().includes(item.name_en.toLowerCase());
                      });

                      const serviceId = dbMatch?.id || String(item.id);
                      const isSelected = values.selectedServices.includes(String(serviceId));

                      return (
                        <div
                          key={item.id}
                          className={`group relative overflow-hidden transition-all duration-300 rounded-3xl border-2 ${isSelected ? 'border-primary bg-primary/[0.03] shadow-lg' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'}`}
                        >
                          <label className="p-5 flex items-center justify-between cursor-pointer w-full">
                            <div className="flex items-center gap-4">
                              <ServiceIcon icon={item.icon} color={item.color} size={28} />
                              <div className="flex flex-col">
                                <span className={`font-bold transition-colors ${isSelected ? 'text-primary' : 'text-gray-800'}`}>
                                  {lang === "ar" ? item.name_ar : item.name_en}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium tracking-tight">
                                  {lang === "ar" ? "خدمة متخصصة" : "Specialized Service"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              {(dbMatch?.price || dbMatch?.base_price) && (
                                <span className="bg-primary/5 text-primary px-3 py-1 rounded-full text-xs font-black">
                                  {dbMatch.price || dbMatch.base_price} ر.س
                                </span>
                              )}
                              <input
                                type="checkbox"
                                name="selectedServices"
                                value={String(serviceId)}
                                checked={isSelected}
                                onChange={handleCheckboxChange}
                                className="w-6 h-6 rounded-lg accent-primary cursor-pointer border-gray-300"
                              />
                            </div>
                          </label>

                          {/* Subtle background decoration */}
                          <div
                            className={`absolute -right-4 -bottom-4 w-12 h-12 opacity-[0.03] rounded-full transition-opacity group-hover:opacity-[0.08]`}
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <ErrorMessage
                    name="selectedServices"
                    component="div"
                    className="text-red-500 text-sm mt-2"
                  />
                </div>
              )}

              {/* Step 2: Description & Details */}
              {currentStep === 2 && (
                <div className="animate-fadeIn flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="description" className="font-medium text-lg">
                      {t("formRequest.descriptionLabel")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      className="w-full h-40 resize-none rounded-xl border border-[#ADADAD] focus:border-primary focus:ring-1 focus:ring-primary outline-none py-4 px-5 text-base"
                      placeholder={t("formRequest.descriptionPlaceholder") || "اشرح تفاصيل طلبك بدقة..."}
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  {anyPriced && (
                    <div className="flex flex-col gap-2">
                      <label htmlFor="budget" className="font-medium text-lg">{t("formRequest.budgetLabel")}</label>
                      <input
                        type="number"
                        name="budget"
                        inputMode="numeric"
                        disabled
                        className="w-full rounded-xl border border-[#ADADAD] bg-gray-100 py-3 px-5 text-gray-500 cursor-not-allowed"
                        value={(() => {
                          const pricedServiceId = values.selectedServices.find(
                            (id) => {
                              const svc = services.find((s) => String(s.id) === id);
                              return typeof svc?.base_price === "number" && svc.base_price > 0;
                            }
                          );
                          const pricedService = services.find(
                            (s) => String(s.id) === pricedServiceId
                          );
                          return pricedService ? pricedService.base_price : "";
                        })()}
                      />
                      <p className="text-xs text-gray-500">{t("formRequest.fixedPriceNote") || "هذه الخدمة لها سعر ثابت"}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Attachments */}
              {currentStep === 3 && (
                <div className="animate-fadeIn flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    <label className="font-medium text-lg">
                      {t("formRequest.attachmentsLabel")}
                    </label>
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-[#ADADAD] rounded-2xl px-4 py-16 cursor-pointer text-center text-[#808080] hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-white transition-colors">
                        <img src={typeof fileUpload === "string" ? fileUpload : (fileUpload?.src || "")} alt={t("formRequest.attachmentsLabel")} className="w-8 h-8 opacity-60 group-hover:opacity-100 transition-opacity" loading="lazy" decoding="async" />
                      </div>
                      <span className="text-base font-medium text-gray-700 mb-1">
                        {t("formRequest.clickToUpload") || "اضغط لرفع الملفات"}
                      </span>
                      <span className="text-sm text-gray-400">
                        {t("formRequest.attachmentsPlaceholder")}
                      </span>
                      <input
                        id="file-upload"
                        name="attachment"
                        type="file"
                        onChange={handleFileChange}
                        multiple
                        className="hidden"
                      />
                    </label>
                    <ErrorMessage
                      name="attachment"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                  {selectedFiles && selectedFiles.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h5 className="text-sm font-bold text-gray-700 mb-2">{t("formRequest.selectedFiles") || "الملفات المختارة"}:</h5>
                      <ul className="text-sm text-gray-600 list-disc pr-4 space-y-1">
                        {Array.from(selectedFiles).map((file, index) => (
                          <li key={index} className="flex items-center justify-between">
                            <span>{file.name}</span>
                            <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <div className="animate-fadeIn flex flex-col gap-6">
                  <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                    <h3 className="font-bold text-xl text-gray-800 border-b pb-2">{t("formRequest.summary") || "ملخص الطلب"}</h3>

                    <div>
                      <span className="text-sm text-gray-500 block mb-1">{t("formRequest.steps.services")}</span>
                      <div className="flex flex-wrap gap-2">
                        {values.selectedServices.map(id => {
                          const s = services.find(srv => String(srv.id) === id);
                          const nameAr = s?.name_ar || s?.titleAr;
                          const nameEn = s?.name_en || s?.titleEn;
                          return (
                            <span key={id} className="bg-white border px-3 py-1 rounded-full text-sm font-medium text-primary">
                              {lang === "ar" ? (nameAr || "-") : (nameEn || "-")}
                            </span>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-gray-500 block mb-1">{t("formRequest.descriptionLabel")}</span>
                      <p className="text-gray-800 bg-white p-3 rounded-lg border text-sm whitespace-pre-wrap">
                        {values.description}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm text-gray-500 block mb-1">{t("formRequest.attachmentsLabel")}</span>
                      <p className="text-gray-800 text-sm">
                        {selectedFiles?.length > 0 ? `${selectedFiles.length} ${tr("files", "ملفات")}` : tr("noFiles", "لا توجد مرفقات")}
                      </p>
                    </div>
                    {isAnyPricedSelected(values.selectedServices) && (
                      <div>
                        <span className="text-sm text-gray-500 block mb-1">{tr("projects.servicePrice", "سعر الخدمة")}</span>
                        <p className="text-gray-800 text-sm">
                          {(() => {
                            const sid = values.selectedServices?.[0];
                            const s = services.find(srv => String(srv.id) === String(sid));
                            return typeof s?.base_price === "number" ? `${s.base_price} ${tr("currency.sar", "ريال")}` : "-";
                          })()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <Field
                      type="checkbox"
                      name="agreeToTerms"
                      id="agreeToTerms"
                      className="w-5 h-5 mt-0.5 accent-primary"
                    />
                    <label htmlFor="agreeToTerms" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                      {t("formRequest.agreeTerms")}{" "}
                      <span className="text-primary font-bold hover:underline">
                        {t("formRequest.termsAndConditions")}
                      </span>
                    </label>
                  </div>
                  <ErrorMessage
                    name="agreeToTerms"
                    component="div"
                    className="text-red-500 text-sm px-2"
                  />

                  {!showPayment && (
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary py-4 rounded-2xl text-white font-black text-base hover:scale-[1.02] transition-all shadow-2xl hover:shadow-primary/50 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loadingCreateOrder || loadingCreateOrderPriced}
                    >
                      {loadingCreateOrder || loadingCreateOrderPriced ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>{anyPriced ? (t("formRequest.redirectingToPayment") || "جاري التحويل للدفع...") : (t("formRequest.submitting") || "جاري التقديم...")}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {t("formRequest.submitButton")}
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-black font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ArrowRight size={20} className="rtl:rotate-180" />
                    {t("back") || "السابق"}
                  </button>
                ) : (
                  <div></div> // Spacer
                )}

                {currentStep < steps.length && (
                  <button
                    type="button"
                    onClick={() => handleNext(validateForm, setTouched)}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all"
                  >
                    {tr("next", "التالي")}
                    <ArrowLeft size={20} className="rtl:rotate-180" />
                  </button>
                )}
              </div>
            </Form>
          );
        }}
      </Formik>

      {showPayment && (
        <div className="mt-8 border-t pt-8 animate-fadeIn">
          <h3 className="text-xl font-bold mb-2 text-center">{t("payment.title") || "الدفع"}</h3>
          <p className="text-center text-sm text-gray-600 mb-4">
            {t("payment.safeRedirect") || "سيتم توجيهك الآن للدفع الآمن، وبعد إتمام العملية ستعود تلقائياً للتطبيق."}
          </p>
          <PaymentForm
            amount={showPayment.amount}
            consultationId={showPayment.consultationId}
          />
          <div className="mt-4">
            <MoyasarInlineForm
              amount={showPayment.amount}
              orderId={showPayment.consultationId}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestForm;
