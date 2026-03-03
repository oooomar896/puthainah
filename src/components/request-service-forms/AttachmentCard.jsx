import React, { useState } from "react";
import pdf from "@/assets/images/pdf.png";
import { supabase } from "@/lib/supabaseClient";
import { useSelector } from "react-redux";
import { Eye, Download, Trash2, X } from "lucide-react";

const getPublicUrl = (path) => {
  if (!path) return "#";
  // If the path starts with 'attachments/', remove it because .from('attachments') already adds it
  const cleanPath = path.startsWith("attachments/") ? path.replace("attachments/", "") : path;
  const { data } = supabase.storage.from("attachments").getPublicUrl(cleanPath);
  return data?.publicUrl || "#";
};

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let i = -1;
  do {
    bytes = bytes / 1024;
    i++;
  } while (bytes >= 1024 && i < units.length - 1);
  return `${bytes.toFixed(1)} ${units[i]}`;
};

const formatDate = (iso) => {
  try {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso || "";
  }
};

const AttachmentCard = ({ item, onDelete, onAccept, onReject }) => {
  const [open, setOpen] = useState(false);
  const role = useSelector((s) => s.auth?.role);

  const isPdf = (item?.attachment_extension || item?.attachmentExtension || "").toLowerCase() === ".pdf";
  const filePath = item?.file_path || item?.filePathUrl || item?.file_path;
  const publicUrl = getPublicUrl(filePath);
  const fileName = item?.file_name || item?.fileName || item?.fileName || "file";
  const contentType = item?.content_type || item?.contentType || "";
  const sizeBytes = item?.size_bytes || item?.sizeBytes || null;
  const createdAt = item?.created_at || item?.createdAt || null;

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onDelete === "function") {
      onDelete(item.id, filePath);
    }
  };

  return (
    <div>
      <div className="relative group">
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          key={item?.id}
          className="attachCard max-w-52 xl:h-44 lg:h-36 md:h-32 sm:h-28 h-auto bg-gray-300/30 backdrop-blur-md rounded-lg md:rounded-xl lg:rounded-2xl flex flex-col gap-3 items-center justify-center overflow-hidden cursor-pointer shadow-lg transition-all duration-500 hover:shadow-xl p-4"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="flex-shrink-0">
              {isPdf ? (
                <img
                  src={pdf}
                  alt={fileName}
                  className="w-12 h-12 md:w-14 lg:w-16 xl:w-20 md:h-14 lg:h-16 xl:h-20 object-contain"
                />
              ) : (
                <img
                  src={publicUrl}
                  alt={fileName}
                  className="w-12 h-12 md:w-14 lg:w-16 xl:w-20 md:h-14 lg:h-16 xl:h-20 object-contain rounded"
                  loading="lazy"
                />
              )}
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-sm font-bold truncate">{fileName}</h4>
              <div className="text-xs text-gray-600 mt-1">
                {contentType && <span className="mr-2">{contentType}</span>}
                {sizeBytes != null && <span className="mr-2">{formatBytes(sizeBytes)}</span>}
                {createdAt && <span className="text-gray-500">{formatDate(createdAt)}</span>}
              </div>
              {item?.request_phase_lookup_id === 26 && (
                <div className="mt-2 text-[11px] inline-block px-2 py-1 bg-emerald-100 text-emerald-700 font-black rounded-full">مقبول</div>
              )}
              {item?.request_phase_lookup_id === 27 && (
                <div className="mt-2 text-[11px] inline-block px-2 py-1 bg-rose-100 text-rose-700 font-black rounded-full">مرفوض</div>
              )}
            </div>
          </div>
        </a>

        {/* Action overlay */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }} title="عرض" className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-100">
            <Eye className="w-4 h-4" />
          </button>
          <a href={publicUrl} download={fileName} onClick={(e) => e.stopPropagation()} title="تنزيل" className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-100">
            <Download className="w-4 h-4" />
          </a>
          {role === 'Admin' && onDelete && (
            <>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAccept && onAccept(item); }} title="قبول" className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-100 text-emerald-600">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </button>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onReject && onReject(item); }} title="رفض" className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-100 text-rose-600">
                <X className="w-4 h-4" />
              </button>
              <button onClick={handleDelete} title="حذف" className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-100 text-rose-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Modal */}
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-xl overflow-hidden">
              <div className="absolute top-3 right-3 z-10">
                <button onClick={() => setOpen(false)} className="p-2 rounded-full bg-white shadow-sm">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 overflow-auto">
                {isPdf ? (
                  <iframe src={publicUrl} className="w-full min-h-[60vh]" title={fileName} />
                ) : contentType.startsWith('image/') ? (
                  <img src={publicUrl} alt={fileName} className="w-full h-auto max-h-[80vh] object-contain" />
                ) : (
                  <div className="p-8 text-center">
                    <p className="font-bold mb-4">معاينة غير مدعومة لهذا النوع</p>
                    <a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg">فتح في تبويب جديد</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachmentCard;
