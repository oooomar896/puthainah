import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useCallback, useContext, useRef, useState } from "react";
import * as Yup from "yup";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css"; // استيراد التصميم الافتراضي
import toast from "react-hot-toast";
// import { updateUserProfile } from "../../rtk/slices/userSlice";
import { useSelector } from "react-redux";
import { useGetCitiesQuery } from "../../../redux/api/citiesApi";
import { Camera, Upload, User, Mail, Phone, Calendar as CalendarIcon, MapPin, Building, FileText } from "lucide-react";

import {
  useUpdateAdminMutation,
  useUpdateProviderMutation,
  useUpdateRequesterMutation,
  useUpdateUserContactMutation,
} from "../../../redux/api/updateApi";
import { useCreateRequesterMutation } from "../../../redux/api/updateApi";
import {
  useGetProviderEntityTypesQuery,
  useGetRequesterEntityTypesQuery,
} from "../../../redux/api/typeApi";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import { getAppBaseUrl } from "../../../utils/env";
import { tr as trHelper } from "@/utils/tr";

export default function ProfileModal({ open, setOpen, data, refetch }) {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);
  const tr = (key, fallback) => trHelper(t, key, fallback);

  const [setIsChanged] = useState(false);
  const role = useSelector((state) => state.auth.role);
  const validationSchema = Yup.object({
    FullName: Yup.string().required(t("profile.requiredFullName")),
    address: Yup.string().required(t("profile.requiredAddress")),
    email: Yup.string()
      .email(t("profile.invalidEmail"))
      .required(t("profile.requiredEmail")),
    phoneNumber: Yup.string().required(t("profile.requiredPhone")),
    InstitutionTypeLookupId:
      role !== "Admin"
        ? Yup.mixed().required(t("profile.requiredInstitution"))
        : Yup.mixed().notRequired(),
  });

  const [updateProvider, { isLoading: isProviderLoading }] =
    useUpdateProviderMutation();
  const [updateRequester, { isLoading: isRequesterLoading }] =
    useUpdateRequesterMutation();
  const [createRequester, { isLoading: isCreateRequesterLoading }] =
    useCreateRequesterMutation();
  const [updateAdmin, { isLoading: isAdminLoading }] = useUpdateAdminMutation();
  const [updateUserContact] = useUpdateUserContactMutation();
  const isLoading = isProviderLoading || isRequesterLoading || isAdminLoading || isCreateRequesterLoading;

  const [selectedFiles, setSelectedFiles] = useState(null);
  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const { data: addresses } = useGetCitiesQuery();
  const { data: providerData } = useGetProviderEntityTypesQuery(undefined, {
    skip: role !== "Provider",
  });
  const { data: requesterData } = useGetRequesterEntityTypesQuery(undefined, {
    skip: role !== "Requester",
  });
  const types = role === "Provider" ? providerData : requesterData;

  const [preview, setPreview] = useState(() => {
    const url = data?.profilePictureUrl;
    return url ? `${getAppBaseUrl()}/${url}` : null;
  });

  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef(null); // إشارة لعنصر الفيديو
  const canvasRef = useRef(null); // إشارة لعنصر الكانفاس

  // التعامل مع تغيير الصورة من خلال رفع ملف
  const handleImageChange = useCallback((event, setFieldValue) => {
    const file = event.target.files[0];
    if (file) {
      setFieldValue("ProfilePicture", file);
      setFieldValue("IsProfilePictureChanged", true);
      setIsChanged(true);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }, [setIsChanged]);

  // تشغيل الكاميرا لالتقاط صورة
  const openCamera = useCallback(async () => {
    try {
      setCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      toast.error(
        t("profile.cameraAccessFailed") || "فشل الوصول إلى الكاميرا"
      );
    }
  }, [t]);

  // التقاط الصورة من الكاميرا
  const captureImage = useCallback((setFieldValue) => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "captured-image.png", {
              type: "image/png",
              lastModified: Date.now(),
            });
            setPreview(URL.createObjectURL(file)); // عرض المعاينة
            setFieldValue("ProfilePicture", file); // تحديث قيمة الصورة في Formik
            setFieldValue("IsProfilePictureChanged", true); // تحديث قيمة الصورة في Formik
            setIsChanged(true);
          }
        }, "image/png");
        stopCamera(); // إيقاف الكاميرا بعد التقاط الصورة
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // إيقاف الكاميرا وتنظيف الستريم
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraOpen(false);
  }, []);

  // دالة لإغلاق النافذة وتنظيف حالة المعاينة والكاميرا
  const handleClose = useCallback(() => {
    setOpen(false);
    setSelectedFiles([]);
    setPreview(null);
    stopCamera();
  }, [setOpen, stopCamera]);
  return (
    <Dialog open={open} onClose={setOpen} className="relative z-[5000]">
      <DialogBackdrop
        transition
        className="fixed inset-0  bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <DialogPanel className="relative w-full max-w-2xl transform overflow-hidden rounded-[32px] bg-white text-left shadow-2xl transition-all animate-fade-in-up">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

            <div className="px-6 py-6 border-b border-gray-50 flex items-center justify-between relative z-10">
              <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                <div className="w-2 h-6 bg-primary rounded-full"></div>
                {tr("profile.editTitle", "تعديل الملف الشخصي")}
              </h2>
              <button onClick={handleClose} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                <span className="text-2xl text-gray-400">&times;</span>
              </button>
            </div>
            <Formik
              initialValues={{
                FullName: data?.fullName || data?.name || "",
                email: data?.email || "",
                phoneNumber: data?.phone || data?.phoneNumber || "",
                CommercialRegistrationNumber:
                  data?.commercialRegistrationNumber || "",
                CommercialRegistrationDate:
                  data?.commercialRegistrationDate?.split("T")[0] || "",
                address: data?.city?.id || data?.address?.id || data?.address || "",
                InstitutionTypeLookupId: data?.entityType?.id || "",
                ProfilePicture: null,
                IsProfilePictureChanged: false,
                ProfilePictureUrl: `${data?.profilePictureUrl}`,
                AttachmentsGroupKey: data?.attachmentsGroupKey || "",
              }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  let updateFn;
                  if (role === "Provider") updateFn = updateProvider;
                  else if (role === "Requester") updateFn = data?.id ? updateRequester : createRequester;
                  else if (role === "Admin") updateFn = updateAdmin;

                  if (!updateFn) {
                    toast.error(t("profile.unknownUserRole"));
                    return;
                  }

                  // 🟢 تجهيز GroupKey
                  const groupKey = values.AttachmentsGroupKey || null;
                  // 🟡 رفع الملفات (لو فيه ملفات مرفوعة)
                  if (selectedFiles && selectedFiles.length > 0) {
                    const uploadFormData = new FormData();
                    uploadFormData.append(
                      "attachmentUploaderLookupId",
                      role === "Requester" ? 702 : role === "Admin" ? 700 : 701
                    );

                    for (let i = 0; i < selectedFiles.length; i++) {
                      uploadFormData.append("files", selectedFiles[i]);
                    }

                    const uploadRes = await axios.post(
                      `${getAppBaseUrl()}api/attachments${groupKey ? `?groupKey=${groupKey}` : ""
                      }`,
                      uploadFormData
                    );

                    const newGroupKey = uploadRes?.data?.groupKey;

                    // 🟢 تخزين GroupKey المحدث
                    values.AttachmentsGroupKey = newGroupKey;
                  }

                  // 🟢 تجهيز الحمولة للتحديث وفق الدور
                  let payload = {};
                  if (role === "Requester") {
                    payload = data?.id
                      ? {
                        requesterId: data?.id,
                        name: values.FullName || values.name || "",
                        commercialRegNo: values.CommercialRegistrationNumber || null,
                        cityId: values.address || null,
                        entityTypeLookupId: values.InstitutionTypeLookupId || null,
                      }
                      : {
                        userId: data?.userId || data?.user?.id,
                        name: values.FullName || values.name || "",
                        commercialRegNo: values.CommercialRegistrationNumber || null,
                        cityId: values.address || null,
                        entityTypeLookupId: values.InstitutionTypeLookupId || null,
                      };
                  } else if (role === "Provider") {
                    payload = {
                      providerId: data?.id,
                      name: values.FullName || values.name || "",
                      cityId: values.address || null,
                    };
                  } else if (role === "Admin") {
                    payload = {
                      adminId: data?.id,
                      displayName: values.FullName || values.name || "",
                    };
                  }
                  await updateFn(payload).unwrap();
                  // تحديث بيانات التواصل للمستخدم (البريد/الهاتف)
                  const userId = data?.user?.id || data?.userId || null;
                  if (userId) {
                    await updateUserContact({
                      userId,
                      email: values.email,
                      phone: values.phoneNumber,
                    }).unwrap();
                  }
                  toast.success(t("profile.profileUpdateSuccess"));
                  setOpen(false);
                } catch {
                  toast.error(
                    t("profile.profileUpdateFailed") || "حدث خطأ أثناء تحديث الملف الشخصي"
                  );
                } finally {
                  setSubmitting(false);
                  refetch();
                }
              }}
              enableReinitialize
            >
              {({ setFieldValue, values }) => (
                <Form className="bg-white p-6 sm:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Profile Picture Section */}
                    <div className="md:col-span-2 flex items-center gap-6 bg-gray-50/50 p-6 rounded-[24px] border border-gray-100 mb-4">
                      {!cameraOpen ? (
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-white">
                            {preview ? (
                              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                <User className="w-10 h-10" />
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
                          <video ref={videoRef} className="w-full h-full object-cover" />
                          <canvas ref={canvasRef} className="hidden" />
                          <button
                            type="button"
                            className="absolute bottom-4 left-4 bg-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-lg"
                            onClick={() => captureImage(setFieldValue)}
                          >
                            {t("profile.captureImage")}
                          </button>
                        </div>
                      )}

                      <div className="flex flex-col gap-3">
                        <h4 className="font-bold text-gray-800 text-sm">{t("profile.profilePicture") || "الصورة الشخصية"}</h4>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-primary/10 hover:border-primary/20 transition-all text-gray-600 hover:text-primary"
                            onClick={openCamera}
                            title={tr("profile.openCamera", "فتح الكاميرا")}
                          >
                            <Camera className="w-5 h-5" />
                          </button>
                          <label className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-primary/10 hover:border-primary/20 transition-all text-gray-600 hover:text-primary cursor-pointer">
                            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setFieldValue)} className="hidden" />
                            <Upload className="w-5 h-5" />
                          </label>
                        </div>
                      </div>
                    </div>
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700">{tr("profile.fullName", "الاسم بالكامل")}</label>
                      <Field
                        name="FullName"
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-gray-800"
                        placeholder={tr("profile.fullName", "الاسم بالكامل")}
                      />
                      <ErrorMessage name="FullName" component="div" className="text-red-500 text-xs font-bold" />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700">{tr("profile.email", "البريد الإلكتروني")}</label>
                      <Field
                        name="email"
                        type="email"
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-gray-800"
                        placeholder={tr("profile.email", "البريد الإلكتروني")}
                      />
                      <ErrorMessage name="email" component="div" className="text-red-500 text-xs font-bold" />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5" style={{ direction: "ltr" }}>
                      <label className="text-sm font-bold text-gray-700 block text-right">{tr("profile.phone", "رقم الجوال")}</label>
                      <PhoneInput
                        country={"sa"}
                        value={values.phoneNumber}
                        onChange={(val) => setFieldValue("phoneNumber", val)}
                        specialLabel=""
                        inputStyle={{
                          width: '100%',
                          height: '52px',
                          borderRadius: '1rem',
                          backgroundColor: '#f9fafb',
                          border: 'none',
                          fontSize: '1rem',
                          fontWeight: 'bold'
                        }}
                        containerStyle={{
                          width: '100%',
                        }}
                      />
                      <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-xs font-bold" />
                    </div>

                    {/* CR Number */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700">{tr("profile.crNumber", "رقم السجل التجاري")}</label>
                      <Field
                        name="CommercialRegistrationNumber"
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl transition-all font-bold"
                        placeholder={tr("profile.crNumber", "رقم السجل التجاري")}
                      />
                    </div>

                    {/* CR Date */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700">{tr("profile.crDate", "تاريخ تأكيد السجل التجاري")}</label>
                      <Field
                        name="CommercialRegistrationDate"
                        type="date"
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl transition-all font-bold"
                      />
                    </div>

                    {/* Address/City */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-gray-700">{tr("profile.address", "المدينة / العنوان")}</label>
                      <Field
                        as="select"
                        name="address"
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl transition-all font-bold"
                      >
                        <option value="">{tr("profile.selectCity", "اختر المدينة")}</option>
                        {addresses?.map((city) => (
                          <option key={city.id} value={city.id}>
                            {lang === "ar" ? (city.name_ar || city.nameAr) : (city.name_en || city.nameEn)}
                          </option>
                        ))}
                      </Field>
                    </div>

                    {/* Institution Type */}
                    {role !== "Admin" && (
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-bold text-gray-700">{tr("profile.institutionType", "نوع المؤسسة")}</label>
                        <Field
                          as="select"
                          name="InstitutionTypeLookupId"
                          className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl transition-all font-bold"
                        >
                          <option value="">{tr("profile.selectType", "اختر النوع")}</option>
                          {types?.map((type) => (
                            <option key={type.id} value={type.id}>
                              {lang === "ar" ? (type.name_ar || type.nameAr) : (type.name_en || type.nameEn)}
                            </option>
                          ))}
                        </Field>
                      </div>
                    )}

                    <Field
                      type="hidden"
                      name="AttachmentsGroupKey"
                    />
                  </div>
                  {/* Attachments Section */}
                  <div className="md:col-span-2 mt-4">
                    <label className="text-sm font-bold text-gray-700 mb-2 block">{tr("profile.attachments", "قم برفع المرفقات")}</label>
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[24px] px-6 py-10 cursor-pointer text-center hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                        <Upload className="w-6 h-6 text-gray-400 group-hover:text-primary" />
                      </div>
                      <span className="text-sm font-bold text-gray-500 group-hover:text-primary">
                        {tr("profile.attachments", "قم برفع المرفقات")}
                      </span>
                      <input id="file-upload" type="file" onChange={handleFileChange} multiple className="hidden" />
                    </label>
                    {selectedFiles && selectedFiles.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-gray-600">
                        {Array.from(selectedFiles).map((file, index) => (
                          <span key={index} className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                            {file.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-10 flex flex-col-reverse sm:flex-row justify-end items-center gap-4 pt-6 border-t border-gray-50">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full sm:w-auto px-8 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      {tr("profile.cancel", "عودة")}
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-12 py-4 rounded-2xl font-black text-base shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {tr("profile.saving", "جاري الحفظ...")}
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {tr("profile.confirm", "تأكيـد")}
                        </>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
