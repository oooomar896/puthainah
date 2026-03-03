import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import HeadTitle from "../../../components/shared/head-title/HeadTitle";
import {
  useCreateProfileInfoMutation,
  useGetProfileInfoQuery,
  useUpdateProfileInfoMutation,
} from "../../../redux/api/profileInfoApi";
import { useSelector } from "react-redux";
import { uploadFileToStorage } from "../../../utils/imageUpload";
import pdfIcon from "@/assets/images/pdf.png";
import fileUploadImg from "@/assets/icons/fileUpload.svg";
import toast from "react-hot-toast";

import { FileText, Download, Eye } from "lucide-react";
import { motion as m } from "framer-motion";



// Card for already-uploaded attachments
export const AttachmentCard = ({ item }) => {
  const { t } = useTranslation();
  const filePath = item?.filePathUrl || item?.file_path_url;
  if (!filePath) return null;

  // Construct full URL if it's relative
  const fullUrl = filePath.startsWith("http") ? filePath : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/attachments/${filePath}`;

  return (
    <a
      href={fullUrl}
      target="_blank"
      rel="noreferrer"
      className="attachCard max-w-52 xl:h-44 lg:h-36 md:h-32 sm:h-28 h-24 bg-gray-300/30 backdrop-blur-md rounded-lg md:rounded-xl lg:rounded-2xl flex flex-col gap-3 items-center justify-center overflow-hidden cursor-pointer shadow-lg transition-all duration-500 hover:shadow-xl"
    >
      {filePath.endsWith(".pdf") ? (
        <img
          src={typeof pdfIcon === "string" ? pdfIcon : (pdfIcon?.src || "")}
          alt="pdf"
          className="w-12 h-12 md:w-14 lg:w-16 xl:w-20 md:h-14 lg:h-16 xl:h-20 object-contain"
          loading="lazy"
        />
      ) : (
        <img
          src={fullUrl}
          alt="attachment"
          className="w-12 h-12 md:w-14 lg:w-16 xl:w-20 md:h-14 lg:h-16 xl:h-20 object-cover"
        />
      )}
      <div className="px-2 w-full text-center">
        <h4 className="text-[10px] md:text-xs truncate">
          {t("profile.viewProfile") || "عرض الملف"}
        </h4>
      </div>
    </a>
  );
};

const SelectedAttachmentCard = ({ file, onRemove }) => {
  const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
  const previewUrl = isPdf ? null : URL.createObjectURL(file);

  return (
    <div className="relative w-36 h-28 bg-gray-100 rounded-lg flex flex-col items-center justify-center p-2 shadow">
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow text-red-600 z-10 hover:bg-red-50"
        aria-label="remove"
      >
        ✕
      </button>

      {isPdf ? (
        <img src={typeof pdfIcon === "string" ? pdfIcon : (pdfIcon?.src || "")} alt="pdf" className="w-12 h-12 object-contain" />
      ) : (
        <img
          src={previewUrl}
          alt={file.name}
          className="w-12 h-12 object-cover rounded"
        />
      )}
      <h4 className="mt-1 text-[11px] text-center truncate w-full px-1">
        {file.name}
      </h4>
    </div>
  );
};

const ProfileInfo = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  // We try to fetch profile for this user
  const { data: profileList, refetch } = useGetProfileInfoQuery(user?.id, {
    skip: !user?.id,
  });

  // profileList is usually an array from Supabase select
  const currentProfile = Array.isArray(profileList) ? profileList[0] : profileList;

  const [createProfileInfo, { isLoading: creating }] = useCreateProfileInfoMutation();
  const [updateProfileInfo, { isLoading: updating }] = useUpdateProfileInfoMutation();

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (preview?.url) URL.revokeObjectURL(preview.url);

    const newPreview = {
      file,
      url: file.type === "application/pdf" ? null : URL.createObjectURL(file),
    };

    setSelectedFile(file);
    setPreview(newPreview);
    e.target.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error(t("errors.noFileAttached") || "Please attach a file first");
      return;
    }

    if (!user?.id) {
      toast.error("User not found (Reload page)");
      return;
    }

    try {
      // 1. Upload file to Supabase (attachments bucket)
      const filePath = await uploadFileToStorage(selectedFile, "attachments", "profiles");

      if (!filePath) {
        return; // Error toast already shown in utility
      }

      // 2. Save/Update Profile Info in DB
      const payload = {
        userId: user.id,
        filePathUrl: filePath, // Storing relative path
      };

      if (currentProfile?.id) {
        // Update
        await updateProfileInfo({ userId: user.id, body: payload }).unwrap();
        toast.success("Profile Updated Successfully");
      } else {
        // Create
        await createProfileInfo({ ...payload, bio: "", websiteUrl: "" }).unwrap();
        toast.success("Profile Created Successfully");
      }

      // Cleanup
      if (preview?.url) URL.revokeObjectURL(preview.url);
      setSelectedFile(null);
      setPreview(null);
      refetch();

    } catch (err) {
      console.error(err);
      toast.error("Operation failed: " + (err?.data?.message || err.message));
    }
  };

  return (
    <div>
      <title>{t("footer.profile")}</title>
      <meta name="description" content={t("footer.profile")} />

      <HeadTitle title={t("footer.profile")} />
      <div className="container px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">{t("profileInfo.uploadTitle") || "رفع المستندات"}</h3>
                  <p className="text-gray-400 text-sm font-medium">{t("profileInfo.uploadDesc") || "يرجى إرفاق النسخ الرقمية من السجلات التجارية والتراخيص"}</p>
                </div>
              </div>

              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[32px] px-6 py-16 cursor-pointer text-center text-gray-400 hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner group-hover:bg-primary/10 transition-colors">
                  <img
                    src={typeof fileUploadImg === "string" ? fileUploadImg : (fileUploadImg?.src || "")}
                    alt="upload"
                    className="w-10 h-10 group-hover:scale-110 transition-transform"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <span className="text-sm font-bold text-gray-500 group-hover:text-primary">
                  {t("formRequest.attachmentsPlaceholder") || "اسحب الملفات هنا أو انقر للإختيار"}
                </span>
                <input
                  id="file-upload"
                  name="attachment"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* preview selected files with X */}
            {selectedFile && (
              <m.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center"
              >
                <SelectedAttachmentCard
                  file={selectedFile}
                  onRemove={() => {
                    if (preview?.url) URL.revokeObjectURL(preview.url);
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                />
              </m.div>
            )}

            <div className="flex pt-6 border-t border-gray-50">
              <button
                type="submit"
                disabled={creating || updating}
                className="ml-auto bg-primary hover:bg-primary/90 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2"
              >
                {creating || updating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t("profileInfo.uploading") || "جارٍ الرفع..."}
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 opacity-50 rotate-180" />
                    {t("profileInfo.submit") || "رفع المستند"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* show already-uploaded attachments from server */}
        {currentProfile && (currentProfile.filePathUrl || currentProfile.file_path_url) && (
          <div className="mt-12 space-y-6">
            <h3 className="text-xl font-black text-gray-800 flex items-center gap-3">
              <div className="w-2 h-6 bg-primary rounded-full"></div>
              {t("profile.uploadedAttachments") || "الملف التعريفي الحالي"}
            </h3>
            <div className="flex justify-start">
              <AttachmentCard item={currentProfile} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;
