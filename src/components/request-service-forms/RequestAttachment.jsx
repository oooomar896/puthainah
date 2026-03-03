import React from "react";
import AttachmentCard from "./AttachmentCard";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { FolderOpen, FileText, Receipt, File as FileIcon, Eye, Download, ExternalLink, Check, X, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";

const RequestAttachment = ({ attachments, onDeleted, requestId: propsRequestId }) => {
  const role = useSelector((state) => state.auth.role);
  const userId = useSelector((state) => state.auth.userId);
  const { t } = useTranslation();
  const params = useParams();
  const [isAdmin, setIsAdmin] = React.useState(false);

  // Use propsRequestId if provide, fallback to URL param 'id'
  const requestId = propsRequestId || params?.id;

  const list = Array.isArray(attachments) ? attachments : [];

  // Check if user is Admin from multiple sources
  React.useEffect(() => {
    const checkAdminStatus = async () => {
      // 1. Check Redux role
      const normalizedRole = role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : null;
      console.log('[RequestAttachment] Redux role:', role, 'normalized:', normalizedRole);

      if (normalizedRole === 'Admin') {
        setIsAdmin(true);
        return;
      }

      // 2. Check Supabase session metadata
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const metadataRole = user?.user_metadata?.role;
        const normalizedMetadataRole = metadataRole ? metadataRole.charAt(0).toUpperCase() + metadataRole.slice(1).toLowerCase() : null;
        console.log('[RequestAttachment] Metadata role:', metadataRole, 'normalized:', normalizedMetadataRole);

        if (normalizedMetadataRole === 'Admin') {
          setIsAdmin(true);
          return;
        }

        // 3. Check users table in database
        if (user?.id) {
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          const dbRole = userData?.role;
          const normalizedDbRole = dbRole ? dbRole.charAt(0).toUpperCase() + dbRole.slice(1).toLowerCase() : null;
          console.log('[RequestAttachment] DB role:', dbRole, 'normalized:', normalizedDbRole);

          if (normalizedDbRole === 'Admin') {
            setIsAdmin(true);
            return;
          }
        }
      } catch (error) {
        console.error('[RequestAttachment] Error checking admin status:', error);
      }

      setIsAdmin(false);
    };

    checkAdminStatus();
  }, [role, userId]);

  const requestFiles = list.filter((item) => item.request_phase_lookup_id === 22 || item.request_phase_lookup_id === 23 || item.requestPhaseLookupId === 22 || item.requestPhaseLookupId === 23) || [];
  const adminFiles = list.filter((item) => item.request_phase_lookup_id === 24 || item.requestPhaseLookupId === 24) || [];
  const requesterPaymentFiles = list.filter((item) => item.request_phase_lookup_id === 25 || item.requestPhaseLookupId === 25) || [];

  const handleAcceptReceipt = async (attachment) => {
    if (!requestId) return window.alert(t('RequestAttachment.noRequestContext') || 'لم يتم العثور على بيانات الطلب');

    if (!window.confirm(t('RequestAttachment.confirmAccept') || 'هل تأكدت من قبول هذا الإيصال؟')) return;

    try {
      // Find lookup id for request-status 'paid'
      const { data: lt } = await supabase.from('lookup_types').select('id').eq('code', 'request-status').maybeSingle();
      let statusId = null;
      if (lt?.id) {
        const { data: lv } = await supabase.from('lookup_values').select('id').eq('lookup_type_id', lt.id).eq('code', 'paid').maybeSingle();
        statusId = lv?.id || 204; // Fallback to 204 (legacy/standard ID) if not found
      } else {
        statusId = 204; // Fallback if lookup type not found
      }

      // We only update columns that exist.
      // We will update the associated payment record instead if possible.
      const updatePayload = {
        updated_at: new Date().toISOString(),
        requester_accepted_price: true,
        payment_status: 'paid',
        status_id: statusId // Force update status ID
      };

      const { error } = await supabase.from('requests').update(updatePayload).eq('id', requestId);
      if (error) {
        console.error('Failed to accept receipt (update request):', error);
        window.alert(t('RequestAttachment.acceptFailed') || 'فشل قبول الإيصال');
        return;
      }

      // Update associated payment records
      try {
        await supabase.from('payments').update({ payment_status: 'paid' }).eq('request_id', requestId);
      } catch (pe) {
        console.warn('Failed to update payments table:', pe);
      }

      // Mark attachment as admin-reviewed via request_phase_lookup_id 26
      try {
        await supabase.from('attachments').update({ request_phase_lookup_id: 26 }).eq('id', attachment.id);
      } catch (e) {
        console.warn('Failed to mark attachment as reviewed:', e);
      }

      if (typeof onDeleted === 'function') onDeleted();
      else window.location.reload();
    } catch (e) {
      console.error(e);
      window.alert(t('RequestAttachment.acceptFailed') || 'فشل قبول الإيصال');
    }
  };

  const handleRejectReceipt = async (attachment) => {
    if (!requestId) return window.alert(t('RequestAttachment.noRequestContext') || 'لم يتم العثور على بيانات الطلب');
    const reason = window.prompt(t('RequestAttachment.rejectReason') || 'أدخل سبب الرفض');
    if (!reason) return;
    try {
      // Find lookup id for request-status 'waiting_payment'
      const { data: lt } = await supabase.from('lookup_types').select('id').eq('code', 'request-status').maybeSingle();
      let waitingPaymentId = null;
      if (lt?.id) {
        const { data: lv } = await supabase.from('lookup_values').select('id').eq('lookup_type_id', lt.id).eq('code', 'waiting_payment').maybeSingle();
        waitingPaymentId = lv?.id || null;
      }

      const updatePayload = { admin_notes: reason, updated_at: new Date().toISOString() };
      if (waitingPaymentId) updatePayload.status_id = waitingPaymentId;

      const { error } = await supabase.from('requests').update(updatePayload).eq('id', requestId);
      if (error) {
        console.error('Failed to reject receipt (update request):', error);
        window.alert(t('RequestAttachment.rejectFailed') || 'فشل رفض الإيصال');
        return;
      }

      // Update associated payment records
      try {
        await supabase.from('payments').update({ payment_status: 'rejected', admin_notes: reason }).eq('request_id', requestId);
      } catch (pe) {
        console.warn('Failed to update payments table:', pe);
      }

      // Mark attachment as rejected via a phase id 27
      try {
        await supabase.from('attachments').update({ request_phase_lookup_id: 27 }).eq('id', attachment.id);
      } catch (e) {
        console.warn('Failed to mark attachment as rejected:', e);
      }

      if (typeof onDeleted === 'function') onDeleted();
      else window.location.reload();
    } catch (e) {
      console.error(e);
      window.alert(t('RequestAttachment.rejectFailed') || 'فشل رفض الإيصال');
    }
  };

  const getPublicUrl = (path) => {
    if (!path) return "#";
    // If the path starts with 'attachments/', remove it because .from('attachments') already adds it
    const cleanPath = path.startsWith("attachments/") ? path.replace("attachments/", "") : path;
    return supabase.storage.from('attachments').getPublicUrl(cleanPath).data.publicUrl;
  };

  const handleDeleteAttachment = async (id, filePath) => {
    if (!id) return;
    if (!window.confirm(t('RequestAttachment.confirmDelete') || 'هل تريد حذف هذا الملف؟')) return;
    try {
      // delete DB row
      const { error: delErr } = await supabase.from('attachments').delete().eq('id', id);
      if (delErr) {
        console.error('Failed to delete attachment row:', delErr);
        window.alert(t('RequestAttachment.deleteFailed') || 'فشل حذف الملف');
        return;
      }

      // attempt to remove file from storage (best-effort)
      if (filePath) {
        try {
          const { error: remErr } = await supabase.storage.from('attachments').remove([filePath]);
          if (remErr) console.warn('Failed to remove storage file:', remErr);
        } catch (e) {
          console.warn('Storage delete error:', e);
        }
      }

      // Call parent hook if provided
      if (typeof onDeleted === 'function') {
        onDeleted();
      } else {
        // fallback: reload to refresh
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      window.alert(t('RequestAttachment.deleteFailed') || 'فشل حذف الملف');
    }
  };

  return (
    <section className="bg-white rounded-[2rem] shadow-custom border border-gray-100 p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-primary">
          <FolderOpen className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">
          {t("RequestAttachment.attachments") || "المرفقات"}
        </h3>
        <span className="px-3 py-1 rounded-full bg-gray-100 text-primary text-[10px] font-black">
          {list.length}
        </span>
      </div>

      <div className="flex flex-col gap-10">
        {requestFiles.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-primary font-bold">
              <FileIcon className="w-4 h-4" />
              <h4 className="text-base">
                {t("RequestAttachment.serviceRequestFiles") || "ملفات الطلب"}
              </h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {requestFiles.map((item) => (
                <AttachmentCard key={item.id || item.fileUrl} item={item} onDelete={handleDeleteAttachment} onAccept={handleAcceptReceipt} onReject={handleRejectReceipt} />
              ))}
            </div>
          </div>
        )}

        {adminFiles.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-secondary font-bold">
              <FileText className="w-4 h-4" />
              <h4 className="text-base">
                {t(
                  isAdmin
                    ? "RequestAttachment.adminPricingFilesForYou"
                    : "RequestAttachment.adminPricingFilesForAdmin"
                ) || "ملفات عرض السعر"}
              </h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {adminFiles.map((item) => (
                <AttachmentCard key={item.id || item.fileUrl} item={item} onDelete={handleDeleteAttachment} onAccept={handleAcceptReceipt} onReject={handleRejectReceipt} />
              ))}
            </div>
          </div>
        )}

        {requesterPaymentFiles.length > 0 && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 text-[#1967AE] font-bold">
              <Receipt className="w-4 h-4" />
              <h4 className="text-base">
                {t(
                  isAdmin
                    ? "RequestAttachment.requesterReceiptForRequester"
                    : "RequestAttachment.requesterReceiptForYou"
                ) || "إيصال السداد"}
              </h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {requesterPaymentFiles.map((item) => (
                <AttachmentCard key={item.id || item.fileUrl} item={item} onDelete={handleDeleteAttachment} onAccept={handleAcceptReceipt} onReject={handleRejectReceipt} />
              ))}
            </div>

            {/* Premium Details table for receipts */}
            <div className="mt-2 overflow-hidden bg-white border border-gray-100 rounded-[2rem] shadow-sm">
              <div className="bg-[#1967AE]/5 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h5 className="text-sm font-black text-[#1967AE] uppercase tracking-wider">{t("RequestAttachment.receiptDetails") || "تفاصيل الدفعات"}</h5>
                <span className="px-3 py-1 bg-[#1967AE]/10 text-[#1967AE] text-[10px] font-black rounded-full">
                  {requesterPaymentFiles.length} {t("common.files") || "ملفات"}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">
                      <th className="px-6 py-4">{t("RequestAttachment.file") || "اسم الملف"}</th>
                      <th className="px-6 py-4 text-center">{t("RequestAttachment.type") || "النوع"}</th>
                      <th className="px-6 py-4 text-center">{t("RequestAttachment.size") || "الحجم"}</th>
                      <th className="px-6 py-4 text-center">{t("RequestAttachment.uploadedAt") || "تاريخ الرفع"}</th>
                      <th className="px-6 py-4 text-left">{t("common.actions") || "الإجراءات"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {requesterPaymentFiles.map((it) => (
                      <tr key={it.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#1967AE]/5 flex items-center justify-center text-[#1967AE]">
                              <Receipt className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-gray-700 max-w-[200px] truncate">
                              {it.file_name || it.fileName || '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-xs text-gray-500 font-medium">
                          {it.content_type || it.contentType || 'application/pdf'}
                        </td>
                        <td className="px-6 py-4 text-center text-xs text-gray-500">
                          {it.size_bytes ? `${(it.size_bytes / 1024).toFixed(1)} KB` : (it.sizeBytes ? `${(it.sizeBytes / 1024).toFixed(1)} KB` : '-')}
                        </td>
                        <td className="px-6 py-4 text-center text-xs text-gray-400">
                          {it.created_at ? new Date(it.created_at).toLocaleDateString() : (it.createdAt ? new Date(it.createdAt).toLocaleDateString() : '-')}
                        </td>
                        <td className="px-6 py-4 text-left">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={getPublicUrl(it.file_path || it.filePathUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-white text-gray-600 border border-gray-100 rounded-xl hover:bg-[#1967AE] hover:text-white hover:border-[#1967AE] transition-all shadow-sm group"
                              title={t("common.download") || "تحميل"}
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => handleAcceptReceipt(it)}
                                  className="p-2 bg-white text-[#1967AE] border border-[#1967AE]/30 rounded-xl hover:bg-[#1967AE] hover:text-white transition-all shadow-sm"
                                  title={t("common.accept") || "قبول"}
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectReceipt(it)}
                                  className="p-2 bg-white text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                  title={t("common.reject") || "رفض"}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAttachment(it.id, it.file_path || it.filePathUrl)}
                                  className="p-2 bg-white text-gray-400 border border-gray-100 rounded-xl hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                                  title={t("common.delete") || "حذف"}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {list.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
            <FolderOpen className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">{t("common.noAttachments") || "لا توجد مرفقات"}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default RequestAttachment;
