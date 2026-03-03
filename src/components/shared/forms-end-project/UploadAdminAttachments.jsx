import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import fileUpload from "../../../assets/icons/fileUpload.svg";
import {
  useAddOrderAttachmentsMutation,
  useCompleteOrderMutation,
} from "../../../redux/api/projectsApi";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { getAppBaseUrl } from "../../../utils/env";

const UploadAdminAttachments = ({ projectData, refetch, onSuccess }) => {
  const { t } = useTranslation();

  const role = useSelector((state) => state.auth.role);
  const orderAttachments = projectData?.orderAttachments || [];
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [statusId, setStatusId] = useState(null);
  const [addOrderAttachments, { isLoading }] = useAddOrderAttachmentsMutation();
  const [completeOrder] = useCompleteOrderMutation();

  useEffect(() => {
    setStatusId(projectData?.orderStatus?.id);
  }, [projectData]);

  // نبحث في كل الـ attachments
  const has700 = orderAttachments.some(
    (att) => att.attachmentUploaderLookupId === 700
  );
  const has701 = orderAttachments.some(
    (att) => att.attachmentUploaderLookupId === 701
  );
  const has702 = orderAttachments.some(
    (att) => att.attachmentUploaderLookupId === 702
  );

  // شرط إظهار الرفع بناءً على الـ role والـ IDs الموجودة
  const shouldShowUploader =
    // (role === "Provider" && !has700 && !has701 && !has702) ||
    (role === "Provider" && has700 && !has701) ||
    (role === "Requester" && has701 && !has702);

  // الحالة النهائية
  const isFinalStage = has702;

  // آخر مرفق (لسحب آخر حالة للمرحلة فقط، وليس ID)
  const lastAttachment = orderAttachments?.at(-1);
  const lastRequestPhaseId = lastAttachment?.requestPhaseLookupId;

  const getNextAttachmentUploaderLookupId = () => {
    if (has701) return 702;
    if (has700) return 701;
    return 703;
  };

  const getNextRequestPhaseLookupId = () => {
    if (lastRequestPhaseId === 804) return 805;
    if (lastRequestPhaseId === 803) return 804;
    return 803;
  };

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const onSubmit = async () => {
    try {
      const attachmentUploaderLookupId = getNextAttachmentUploaderLookupId();
      const requestPhaseLookupId = getNextRequestPhaseLookupId();

      // 1. احصل على group key
      let groupKey;

      if (orderAttachments.length === 0) {
        try {
          const groupRes = await axios.get(
            `${getAppBaseUrl()}api/attachments/new-attachments-group-key`
          );
          groupKey = groupRes.data ?? "";
        } catch {
          throw new Error("Failed to get group key");
        }
      } else {
        groupKey = projectData?.attachmentGroupKey ?? "";
      }

      // 2. ارفع الملفات
      if (selectedFiles?.length > 0) {
        const formData = new FormData();
        formData.append(
          "attachmentUploaderLookupId",
          attachmentUploaderLookupId
        );
        formData.append("requestPhaseLookupId", requestPhaseLookupId);
        Array.from(selectedFiles).forEach((file) =>
          formData.append("files", file)
        );

        await axios.post(
          `${getAppBaseUrl()}api/attachments?groupKey=${groupKey}`,
          formData
        );
      }

      // 3. سجل في النظام
      if (statusId === 606 && !has700 && !has701 && !has702) {
        await addOrderAttachments({
          body: { attachmentsGroupKey: groupKey },
          projectId: projectData?.id,
        }).unwrap();

        toast.success(t("uploadAdminAttachments.uploadSuccess"));
      }
      refetch();
      if (typeof onSuccess === "function") {
        onSuccess(); // تنفذ لو محتاج تعيد تحميل حاجة أو تعرض رسالة معينة
      }
    } catch (error) {
      toast.error(
        error?.data?.Message || t("uploadAdminAttachments.uploadError") || "حدث خطأ أثناء رفع المرفقات"
      );
    }
  };

  const complete = async () => {
    try {
      await completeOrder({
        projectId: projectData?.id,
      }).unwrap();

      toast.success(t("uploadAdminAttachments.completeSuccess"));
      refetch();
    } catch {
      toast.error(t("uploadAdminAttachments.completeError"));
    }
  };

  return (
    <div>
      {statusId === 606 && shouldShowUploader && (
        <div className="flex flex-col gap-4">
          <label className="font-medium text-sm">
            {t("uploadAdminAttachments.attachmentsLabel")}
          </label>
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center border-2 border-dashed border-[#ADADAD] rounded-xl px-4 py-10 cursor-pointer text-center text-[#808080] hover:border-primary transition"
          >
            <img src={typeof fileUpload === "string" ? fileUpload : (fileUpload?.src || "")} alt="upload" loading="lazy" decoding="async" />
            <span className="text-sm font-normal">
              {t("uploadAdminAttachments.uploadPrompt")}
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

          {selectedFiles?.length > 0 && (
            <ul className="mt-2 text-sm text-gray-700 list-disc pr-4 text-right">
              {Array.from(selectedFiles).map((file, i) => (
                <li key={i}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex items-center justify-center md:justify-end gap-2 md:gap-3 mb-10 mt-4">
        {statusId === 606 && shouldShowUploader && (
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/80 text-white py-2 px-4 rounded-xl text-sm font-semibold"
          >
            {t("uploadAdminAttachments.submitButton")}
          </button>
        )}

        {statusId === 606 && isFinalStage && role === "Admin" && (
          <button
            onClick={complete}
            className="bg-primary hover:bg-primary/80 text-white py-2 px-4 rounded-xl text-sm font-semibold"
          >
            {t("uploadAdminAttachments.completeTask")}
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadAdminAttachments;
