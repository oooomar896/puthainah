import React, { useEffect, useState } from "react";
import { useNavigate } from "@/utils/useNavigate";
import { useParams } from "@/utils/useParams";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { useTranslation } from "react-i18next";
import HeadTitle from "../../shared/head-title/HeadTitle";
import { SkeletonFormField } from "../../shared/skeletons/Skeleton";
import { FiUploadCloud, FiX, FiTrash2, FiSave, FiArrowRight } from "react-icons/fi"; // Assuming react-icons is installed or I can use SVG

// Fallback icons if react-icons is not installed (checking package.json would be ideal but I'll use SVGs to be safe or standard icons)
const UploadIcon = () => (
  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const UpsertService = () => {
  const { t } = useTranslation();
  const tr = (key, fallback) => {
    const v = t(key);
    return v === key ? fallback : v;
  };
  const navigate = useNavigate();
  const params = useParams();
  const id = params?.id;
  const isEdit = Boolean(id);

  const [data, setData] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [preview, setPreview] = useState(null);

  const initialValues = {
    titleAr: data?.name_ar || "",
    titleEn: data?.name_en || "",
    price: data?.price ?? "",
    isPriced: !!data?.price,
    isActive: data?.is_active !== undefined ? !!data.is_active : true,
    image: null,
    removeImage: false,
  };

  const validationSchema = Yup.object({
    titleAr: Yup.string().required(tr("services.addService.titleArRequired", "العنوان بالعربية مطلوب")),
    titleEn: Yup.string().required(tr("services.addService.titleEnRequired", "العنوان بالإنجليزية مطلوب")),
    price: Yup.number()
      .typeError(tr("services.addService.priceTypeError", "السعر يجب أن يكون رقماً"))
      .min(0, tr("services.addService.priceMin", "السعر يجب أن يكون أكبر من أو يساوي صفر"))
      .when("isPriced", {
        is: true,
        then: (schema) =>
          schema.required(tr("services.addService.priceRequired", "السعر مطلوب")),
        otherwise: (schema) => schema.nullable(),
      }),
    image: Yup.mixed().nullable(),
  });

  const handleSubmit = async (values) => {
    try {
      setIsUpdating(true);
      let imageUrl = data?.image_url || null;

      if (values.removeImage && data?.image_url) {
        const { deleteImageFromStorage } = await import("../../../utils/imageUpload");
        await deleteImageFromStorage(data.image_url);
        imageUrl = null;
      } else if (values.image) {
        const { uploadImageToStorage } = await import("../../../utils/imageUpload");
        const uploadedUrl = await uploadImageToStorage(
          values.image,
          process.env.NEXT_PUBLIC_SUPABASE_IMAGES_BUCKET || "images",
          "services"
        );
        if (!uploadedUrl) {
          setIsUpdating(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      const updateBody = {
        name_ar: values.titleAr,
        name_en: values.titleEn,
        image_url: imageUrl,
        is_active: values.isActive,
        updated_at: new Date().toISOString(),
      };
      if (values.isPriced) {
        updateBody.price = Number(values.price);
      }
      const { error } = await supabase.from("services").update(updateBody).eq("id", id);
      if (error) throw error;
      toast.success(tr("services.updateSuccess", "تم تحديث الخدمة بنجاح"));
      navigate("/admin/services");
    } catch (err) {
      toast.error(
        err?.data?.message ||
          tr("services.addService.error", "حدث خطأ أثناء تحديث الخدمة") ||
          "حدث خطأ أثناء تحديث الخدمة"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(tr("services.confirmDelete", "هل أنت متأكد من حذف هذه الخدمة؟"))) return;
    try {
      setIsDeleting(true);
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
      toast.success(tr("services.deleteSuccess", "تم حذف الخدمة بنجاح"));
      navigate("/admin/services");
    } catch (err) {
      toast.error(
        err?.data?.message ||
          tr("services.deleteError", "فشل حذف الخدمة") ||
          "فشل حذف الخدمة"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!isEdit) return;
      try {
        setIsLoadingDetails(true);
        const { data: svc, error } = await supabase
          .from("services")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;
        setData(svc || null);
        if (svc?.image_url) setPreview(svc.image_url);
      } catch {
        toast.error(tr("services.fetchError", "فشل جلب بيانات الخدمة"));
      } finally {
        setIsLoadingDetails(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id]);

  if (isEdit && isLoadingDetails) {
    return (
      <div className="p-4 space-y-4">
         <HeadTitle title={tr("services.loading", "جاري التحميل...")} />
         <div className="mx-auto bg-white p-6 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkeletonFormField />
              <SkeletonFormField />
            </div>
            <SkeletonFormField className="mt-4" />
            <SkeletonFormField className="mt-4 h-32" />
         </div>
      </div>
    );
  }

  return (
    <div>
      <HeadTitle title={tr("services.editService", "تعديل خدمة")} />
      <div className="mx-auto p-4 md:p-6 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{tr("services.editService", "تعديل الخدمة")}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {tr("services.editServiceHint", "قم بتحديث تفاصيل الخدمة أدناه")}
            </p>
          </div>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition disabled:opacity-60 disabled:cursor-not-allowed border border-red-200"
              title={tr("services.delete", "حذف")}
            >
              {isDeleting ? (
                 <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              )}
              {isDeleting ? tr("services.deleting", "جاري الحذف...") : tr("services.delete", "حذف الخدمة")}
            </button>
          )}
        </div>

        <Formik enableReinitialize initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ values, touched, errors, setFieldValue }) => (
            <Form className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Arabic Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{tr("services.addService.titleAr", "العنوان بالعربية")} <span className="text-red-500">*</span></label>
                  <Field
                    name="titleAr"
                    placeholder={tr("services.addService.titleArPlaceholder", "مثال: تصميم شعار")}
                    className={`w-full border rounded-lg p-3 transition focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${touched.titleAr && errors.titleAr ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-50"}`}
                  />
                  {touched.titleAr && errors.titleAr && (
                    <div className="text-red-500 text-xs mt-1">{errors.titleAr}</div>
                  )}
                </div>

                {/* English Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{tr("services.addService.titleEn", "العنوان بالإنجليزية")} <span className="text-red-500">*</span></label>
                  <Field
                    name="titleEn"
                    placeholder={tr("services.addService.titleEnPlaceholder", "Ex: Logo Design")}
                    className={`w-full border rounded-lg p-3 transition focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none dir-ltr ${touched.titleEn && errors.titleEn ? "border-red-500 bg-red-50" : "border-gray-300 bg-gray-50"}`}
                  />
                  {touched.titleEn && errors.titleEn && (
                    <div className="text-red-500 text-xs mt-1">{errors.titleEn}</div>
                  )}
                </div>
              </div>

              {/* Price Section */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <div className="relative flex items-center">
                    <Field type="checkbox" name="isPriced" className="peer sr-only" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                  <span className="font-medium text-gray-700">
                    {tr("services.addService.isPriced", "هل هذه الخدمة لها سعر ثابت؟")}
                  </span>
                </label>

                {values.isPriced && (
                  <div className="animate-fadeIn">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{tr("services.addService.price", "السعر (ر.س)")} <span className="text-red-500">*</span></label>
                    <Field
                      type="number"
                      name="price"
                      placeholder="0.00"
                      className={`w-full md:w-1/3 border rounded-lg p-3 transition focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${touched.price && errors.price ? "border-red-500 bg-red-50" : "border-white"}`}
                    />
                    {touched.price && errors.price && (
                      <div className="text-red-500 text-xs mt-1">{errors.price}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{tr("services.addService.image", "صورة الخدمة")}</label>
                
                {!preview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary hover:bg-primary/5 transition cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFieldValue("image", file);
                          const url = URL.createObjectURL(file);
                          setPreview(url);
                          setFieldValue("removeImage", false);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center pointer-events-none">
                      <UploadIcon />
                      <p className="mt-2 text-sm text-gray-600 font-medium">
                        {tr("services.clickToUpload", "انقر لرفع صورة")}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative inline-block group">
                    <img 
                      src={preview} 
                      alt="Service Preview" 
                      className="w-48 h-48 object-cover rounded-xl border border-gray-200 shadow-sm" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                       <button
                        type="button"
                        onClick={() => {
                          setPreview(null);
                          setFieldValue("image", null);
                          setFieldValue("removeImage", true);
                        }}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition transform hover:scale-110 shadow-lg"
                        title={tr("services.removeImage", "إزالة الصورة")}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                )}
                {touched.image && errors.image && (
                  <div className="text-red-500 text-xs mt-1">{errors.image}</div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                 <div className="relative flex items-center">
                    <Field type="checkbox" name="isActive" className="peer sr-only" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 block">
                      {tr("services.addService.isActive", "تفعيل الخدمة")}
                    </span>
                    <span className="text-xs text-gray-500 block">
                      {values.isActive ? tr("services.activeHint", "الخدمة ظاهرة للمستخدمين") : tr("services.inactiveHint", "الخدمة مخفية عن المستخدمين")}
                    </span>
                  </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-primary text-white px-8 py-2.5 rounded-lg hover:bg-primary/90 transition shadow-sm hover:shadow disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUpdating ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  )}
                  {isUpdating ? tr("services.addService.saving", "جاري الحفظ...") : tr("services.addService.save", "حفظ التغييرات")}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/services")}
                  className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition"
                >
                  {tr("services.addService.cancel", "إلغاء")}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default UpsertService;
