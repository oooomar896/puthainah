import React, { useEffect, useState } from "react";
import { useNavigate } from "@/utils/useNavigate";
import { useParams } from "@/utils/useParams";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

import OptimizedImage from "@/components/shared/OptimizedImage";
import { normalizeImageSrc } from "@/utils/image";

import {
  useCreatePartnerMutation,
  useUpdatePartnerMutation,
  useGetPartnerDetailsQuery,
  useGetPartnersQuery,
} from "@/redux/api/partnersApi";
import { useTranslation } from "react-i18next";

const UpsertPartner = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const params = useParams();
  const id = params?.id;
  const isEdit = Boolean(id);

  const { data, isLoading: isLoadingDetails } = useGetPartnerDetailsQuery(id, {
    skip: !isEdit,
  });

  const { refetch } = useGetPartnersQuery();

  const [createPartner, { isLoading: isCreating }] = useCreatePartnerMutation();
  const [updatePartner, { isLoading: isUpdating }] = useUpdatePartnerMutation();

  const [preview, setPreview] = useState(null);

  const initialValues = {
    name: data?.name || "",
    image: null,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required(t("partners.upsertPartner.nameRequired")),
    image: Yup.mixed().when([], {
      is: () => !isEdit,
      then: (schema) =>
        schema.required(t("partners.upsertPartner.imageRequired")),
      otherwise: (schema) => schema.nullable(),
    }),
  });

  const handleSubmit = async (values, { resetForm }) => {
    try {
      let logoUrl = data?.logo_url || null;

      // Upload image if new image is provided
      if (values.image) {
        const { uploadImageToStorage } = await import("../../../utils/imageUpload");
        const uploadedUrl = await uploadImageToStorage(
          values.image,
          "images",
          "partners"
        );
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        } else {
          return; // Stop if upload failed
        }
      }

      const body = {
        name: values.name,
        logoUrl: logoUrl,
        websiteUrl: data?.website_url || null,
        description: data?.description || null,
        isActive: data?.is_active !== undefined ? data.is_active : true,
      };

      if (isEdit) {
        await updatePartner({ id, body }).unwrap();
        toast.success(t("partners.upsertPartner.successUpdate"));
        refetch?.();
      } else {
        await createPartner(body).unwrap();
        toast.success(t("partners.upsertPartner.successAdd"));
        resetForm();
        setPreview(null);
        refetch?.();
      }

      navigate("/admin/partners");
    } catch (err) {
      toast.error(
        err?.data?.message || t("partners.upsertPartner.error") || "حدث خطأ أثناء حفظ الشريك"
      );
    }
  };
  useEffect(() => {
    if (isEdit && data?.logo_url) {
      setPreview(data.logo_url);
    }
  }, [isEdit, data]);

  if (isEdit && isLoadingDetails)
    return <p>{t("partners.upsertPartner.loading")}</p>;

  const isLoading = isCreating || isUpdating;

  return (
    <div className="mx-auto p-4 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">
        {isEdit
          ? t("partners.upsertPartner.titleEdit")
          : t("partners.upsertPartner.titleAdd")}
      </h2>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, touched, errors }) => (
          <Form>
            <div className="mb-4 border p-3 rounded-lg relative">
              {/* name */}
              <label className="block text-gray-700 mb-1">
                {t("partners.upsertPartner.partnerName")}
              </label>
              <Field
                name="name"
                placeholder={t("partners.upsertPartner.enterPartnerName")}
                className="w-full border rounded p-2 mb-2 bg-primary/10 focus:outline-primary"
              />
              {touched.name && errors.name && (
                <div className="text-red-500 text-sm mb-2">{errors.name}</div>
              )}

              {/* image */}
              <label className="block text-gray-700 mb-1">
                {t("partners.upsertPartner.image")}
              </label>
              {!preview ? (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setFieldValue("image", file || null);
                    if (file) {
                      setPreview(file); // Store file object for local preview
                    }
                  }}
                  className="w-full border rounded p-2 bg-primary/10 focus:outline-primary"
                />
              ) : (
                <div className="relative inline-block mt-2">
                  <OptimizedImage
                    src={typeof preview === 'string' ? normalizeImageSrc(preview) : URL.createObjectURL(preview)}
                    alt="Preview"
                    width={128}
                    height={128}
                    className="w-32 h-32 object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      setFieldValue("image", null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              )}

              {!preview && touched.image && errors.image && (
                <div className="text-red-500 text-sm mt-2">{errors.image}</div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-white px-3 py-1 rounded"
            >
              {isLoading
                ? t("partners.upsertPartner.saving")
                : t("partners.upsertPartner.save")}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default UpsertPartner;
