/**
 * Utility functions for image upload to Supabase Storage
 */
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

/**
 * Upload image to Supabase Storage
 * @param {File} file - Image file to upload
 * @param {string} bucket - Storage bucket name (default: 'images')
 * @param {string} folder - Folder path in bucket (default: 'partners' or 'customers')
 * @returns {Promise<string|null>} Public URL of uploaded image or null if failed
 */
export const uploadImageToStorage = async (
  file,
  bucket = process.env.NEXT_PUBLIC_SUPABASE_IMAGES_BUCKET || "images",
  folder = "general"
) => {
  try {
    if (!supabase || !supabase.storage) {
      toast.error("اتصال Supabase غير متاح. تحقق من مفاتيح البيئة.");
      return null;
    }
    if (!file) {
      return null;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("الملف المحدد ليس صورة");
      return null;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return null;
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;

    // Upload file to Supabase Storage
    let { error } = await supabase.storage.from(bucket).upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      const msg = (error?.message || "").toLowerCase();
      const isBucketMissing =
        msg.includes("bucket") && msg.includes("not found");
      const fallbacks = [bucket, process.env.NEXT_PUBLIC_SUPABASE_FALLBACK_BUCKET || "attachments", "public"].filter(Boolean);
      // Try server-side upload via API route
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("bucket", bucket);
        fd.append("folder", folder);
        const res = await fetch("/api/storage/upload", { method: "POST", body: fd });
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const json = await res.json();
          if (res.ok && json?.url) return json.url;
        }
      } catch (e) {
        void e;
      }
      // Fallback to alternative buckets if server route fails
      for (const fb of fallbacks) {
        try {
          const fallbackPath = `services/${Date.now()}-${Math.random()
            .toString(36)
            .substring(7)}.${fileExt}`;
          const retry = await supabase.storage
            .from(fb)
            .upload(fallbackPath, file, {
              cacheControl: "3600",
              upsert: false,
            });
          if (!retry.error) {
            // Return relative path for consistency
            return fallbackPath;
          }
        } catch (e) {
          void e;
        }
      }

      console.error("Upload error:", error);
      toast.error(
        isBucketMissing
          ? "لم يتم العثور على حاوية التخزين. أنشئ الحاوية أو حدّد اسمًا صالحًا."
          : "فشل رفع الصورة: " + error.message
      );
      return null;
    }

    // Return the relative path (fileName) instead of full public URL
    // this is better for database storage and works with OptimizedImage
    return fileName;
  } catch (error) {
    console.error("Image upload error:", error);
    toast.error("حدث خطأ أثناء رفع الصورة");
    return null;
  }
};

/**
 * Delete image from Supabase Storage
 * @param {string} imageUrl - Full URL of the image to delete
 * @param {string} bucket - Storage bucket name (default: 'images')
 * @returns {Promise<boolean>} Success status
 */
export const deleteImageFromStorage = async (imageUrl, bucket) => {
  try {
    if (!imageUrl) {
      return true; // No image to delete
    }

    // Auto-detect bucket and file path if not provided
    let detectedBucket = bucket;
    let filePath = null;
    if (!detectedBucket) {
      const m = imageUrl.match(/storage\/v1\/object\/(?:public|authenticated|private)\/([^/]+)\/(.+?)(?:\?|$)/);
      if (m && m[1] && m[2]) {
        detectedBucket = m[1];
        filePath = m[2];
      }
    }
    if (!filePath) {
      const parts = imageUrl.split("/");
      const bucketIndex = parts.findIndex((p) => p === detectedBucket);
      if (bucketIndex > -1) {
        filePath = parts.slice(bucketIndex + 1).join("/");
        if (filePath.includes("?")) filePath = filePath.split("?")[0];
      }
    }
    if (!detectedBucket || !filePath) return false;

    // Delete file from Supabase Storage
    const { error } = await supabase.storage.from(detectedBucket).remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Image delete error:", error);
    return false;
  }
};

/**
 * Convert File to base64 string (for preview)
 * @param {File} file - File to convert
 * @returns {Promise<string|null>} Base64 string or null
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Upload generic file to Supabase Storage (PDF, Images, etc)
 * @param {File} file - File to upload
 * @param {string} bucket - Storage bucket name
 * @param {string} folder - Folder path
 * @returns {Promise<string|null>} Relative path of uploaded file
 */
export const uploadFileToStorage = async (
  file,
  bucket = process.env.NEXT_PUBLIC_SUPABASE_IMAGES_BUCKET || "attachments", // Default to attachments for generic files
  folder = "documents"
) => {
  try {
    if (!supabase || !supabase.storage) {
      toast.error("اتصال Supabase غير متاح. تحقق من مفاتيح البيئة.");
      return null;
    }
    if (!file) return null;

    // Validate size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("حجم الملف يجب أن يكون أقل من 10 ميجابايت");
      return null;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    let { error } = await supabase.storage.from(bucket).upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      // Fallback logic similar to images if needed, or just specific error handling
      console.error("Upload error:", error);
      toast.error("فشل رفع الملف: " + error.message);
      return null;
    }

    return fileName;
  } catch (error) {
    console.error("File upload error:", error);
    toast.error("حدث خطأ أثناء رفع الملف");
    return null;
  }
};
