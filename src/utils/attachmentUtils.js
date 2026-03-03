/**
 * Utility functions for attachment operations
 */
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

/**
 * إنشاء group key جديد باستخدام Supabase RPC
 * @returns {Promise<string|null>} Group key أو null إذا فشل
 */
export const createAttachmentGroupKey = async () => {
  try {
    const { data, error } = await supabase.rpc("create_attachment_group_key");
    
    if (error) {
      console.error("Error creating attachment group key:", error);
      
      // معالجة أخطاء محددة
      if (error.code === '23503') {
        // Foreign key constraint violation - user doesn't exist in users table
        console.warn("User not found in users table, creating group without user_id");
        // المحاولة مرة أخرى - الدالة يجب أن تتعامل مع هذا
        const retryResult = await supabase.rpc("create_attachment_group_key");
        if (retryResult.error) {
          toast.error("فشل في إنشاء group key للمرفقات");
          return null;
        }
        return retryResult.data;
      }
      
      toast.error("فشل في إنشاء group key للمرفقات");
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error creating attachment group key:", error);
    toast.error("حدث خطأ أثناء إنشاء group key");
    return null;
  }
};

/**
 * رفع ملفات إلى Supabase Storage
 * @param {File[]} files - الملفات المرفوعة
 * @param {string} groupKey - Group key للمرفقات
 * @param {number} attachmentUploaderLookupId - ID للـ lookup value (700, 701, 702)
 * @param {number} requestPhaseLookupId - ID لمرحلة الطلب (800, 801, 802, 803, 804, 805)
 * @returns {Promise<boolean>} نجح أو فشل
 */
export const uploadAttachmentsToStorage = async (
  files,
  groupKey,
  attachmentUploaderLookupId,
  requestPhaseLookupId
) => {
  try {
    if (!files || files.length === 0 || !groupKey) {
      return true; // لا يوجد ملفات للرفع
    }

    // جلب group_id من group_key
    const { data: groupData, error: groupError } = await supabase
      .from("attachment_groups")
      .select("id")
      .eq("group_key", groupKey)
      .single();

    if (groupError || !groupData) {
      console.error("Error finding attachment group:", groupError);
      toast.error("فشل في العثور على group key");
      return false;
    }

    const groupId = groupData.id;

    const { data: phaseType } = await supabase
      .from("lookup_types")
      .select("id")
      .eq("code", "request-phase")
      .single();
    let requestPhaseId = null;
    if (phaseType?.id) {
      const { data: phaseRow } = await supabase
        .from("lookup_values")
        .select("id")
        .eq("lookup_type_id", phaseType.id)
        .eq("code", String(requestPhaseLookupId))
        .single();
      requestPhaseId = phaseRow?.id || null;
    }
    if (!requestPhaseId) {
      toast.error("تعذر تحديد مرحلة الطلب للمرفقات");
      return false;
    }

    // رفع كل ملف إلى Supabase Storage وإنشاء سجل في attachments
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        // إنشاء مسار فريد للملف
        const fileExt = file.name.split(".").pop();
        const fileName = `attachments/${groupId}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;

        // رفع الملف إلى Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("attachments")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }

        // إنشاء سجل في جدول attachments
        const { error: insertError } = await supabase
          .from("attachments")
          .insert({
            group_id: groupId,
            file_path: uploadData.path,
            file_name: file.name,
            content_type: file.type,
            size_bytes: file.size,
            request_phase_lookup_id: requestPhaseId,
          });

        if (insertError) {
          console.error("Insert error:", insertError);
          throw insertError;
        }

        return true;
      } catch (error) {
        console.error("Error uploading file:", error);
        return false;
      }
    });

    const results = await Promise.all(uploadPromises);
    const success = results.every((r) => r === true);

    if (!success) {
      toast.error("فشل في رفع بعض الملفات");
    }

    return success;
  } catch (error) {
    console.error("Error uploading attachments:", error);
    toast.error("حدث خطأ أثناء رفع الملفات");
    return false;
  }
};

