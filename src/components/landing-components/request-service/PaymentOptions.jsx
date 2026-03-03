"use client";

import { useContext, useState } from "react";
import PaymentForm from "./PaymentForm";
import { useCreatePaymentMutation } from "@/redux/api/paymentApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { tr as trHelper } from "@/utils/tr";
import { useSelector } from "react-redux";
import { supabase } from "@/lib/supabaseClient";
import { LanguageContext } from "@/context/LanguageContext";
import {
  CreditCard,
  Banknote,
  Wallet,
  Upload,
  CheckCircle2,
  Info,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

export default function PaymentOptions({ amount, requestId, attachmentsGroupKey, refetch }) {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);
  const tr = (k, f) => trHelper(t, k, f);
  const [method, setMethod] = useState("card");
  const [createPayment, { isLoading }] = useCreatePaymentMutation();
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState("");

  // Try to get userId and role from Redux first
  const { userId: reduxUserId, role: reduxRole } = useSelector((state) => state.auth || {});

  const onUploadChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const submitManual = async (pm) => {
    try {
      let userId = reduxUserId;

      // Fallback to session or localStorage if not in Redux
      if (!userId) {
        const { data: { session } } = await supabase.auth.getSession();
        userId = session?.user?.id;
      }

      if (!userId && typeof window !== "undefined") {
        userId = JSON.parse(localStorage.getItem("user"))?.id || null;
      }

      if (!userId) {
        toast.error(tr("payment.errorUser", "لم يتم العثور على بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى."));
        return;
      }

      // Upload receipt(s) as attachments directly to Supabase
      if (files.length > 0) {
        if (!supabase) {
          toast.error(tr("payment.errorNoSupabase", "خطأ: إعداد Supabase غير موجود. تحقق من المتغيرات البيئية."));
          return;
        }

        let uid = userId;
        let groupKey = attachmentsGroupKey;
        let groupId = null;

        try {
          // 1. Resolve or Create Group
          if (groupKey) {
            const { data: group } = await supabase.from("attachment_groups").select("id,group_key").eq("group_key", groupKey).maybeSingle();
            groupId = group?.id || null;
          }

          if (!groupId) {
            groupKey = groupKey || `group_${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
            const { data: created, error: createErr } = await supabase
              .from("attachment_groups")
              .insert({ group_key: groupKey, created_by_user_id: uid })
              .select("id,group_key")
              .single();

            if (createErr) {
              console.error("Failed to create attachment group:", createErr);
              toast.error(tr("payment.errorGroupCreate", "تعذر إنشاء مجموعة المرفقات."));
              return;
            }
            groupId = created.id;

            if (requestId) {
              await supabase.from("requests").update({ attachments_group_key: groupKey }).eq("id", requestId);
            }
          }

          // 2. Resolve Uploader Lookup
          let uploaderLookupId = null;
          try {
            const roleToCode = { Provider: '700', Requester: '701', Admin: '702' };
            const uploaderCode = roleToCode[reduxRole] || '701';
            const { data: lt } = await supabase.from('lookup_types').select('id').eq('code', 'attachment-uploader').maybeSingle();
            if (lt?.id) {
              const { data: lv } = await supabase.from('lookup_values').select('id').eq('lookup_type_id', lt.id).eq('code', String(uploaderCode)).maybeSingle();
              uploaderLookupId = lv?.id || null;
            }
          } catch (err) {
            console.warn('Could not resolve uploader lookup id:', err);
          }

          // 3. Upload each file
          for (const file of files) {
            const ext = file.name.split(".").pop();
            const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            const path = `attachments/${groupId}/${unique}.${ext}`;

            const { data: storageRes, error: storageErr } = await supabase.storage
              .from("attachments")
              .upload(path, file, { cacheControl: "3600", upsert: false });

            if (storageErr) {
              console.error("Storage upload error:", storageErr);
              toast.error(tr("payment.errorUpload", "فشل في رفع بعض الملفات"));
              continue;
            }

            const insertPayload = {
              group_id: groupId,
              file_path: storageRes?.path || path,
              file_name: file.name,
              content_type: file.type || null,
              size_bytes: file.size || null,
              request_phase_lookup_id: 25,
            };
            if (uploaderLookupId) insertPayload.attachment_uploader_lookup_id = uploaderLookupId;

            await supabase.from("attachments").insert(insertPayload);
          }
        } catch (uploadErr) {
          console.error("Error in attachment workflow:", uploadErr);
          toast.error(tr("payment.errorUploadGeneric", "حدث خطأ أثناء معالجة المرفقات"));
          return;
        }
      }

      // 4. Create payment entry
      await createPayment({
        amount,
        currency: "sar",
        requestId,
        userId,
        status: "pending",
        paymentMethod: pm,
        paymentStatus: "submitted",
        notes: notes || ""
      }).unwrap();

      toast.success(tr("payment.submitted", "تم إرسال الطلب للمراجعة"));
      setFiles([]);
      setNotes("");
      if (typeof refetch === "function") refetch();
    } catch (err) {
      console.error("Payment submission error:", err);
      toast.error(tr("payment.errorSubmit", "تعذرإرسال الدفع، حاول لاحقًا"));
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { id: "card", label: tr("payment.method.card", "بطاقة إلكترونية"), icon: <CreditCard className="w-5 h-5" /> },
          { id: "bank", label: tr("payment.method.bank", "تحويل بنكي"), icon: <Banknote className="w-5 h-5" /> },
          { id: "cash", label: tr("payment.method.cash", "دفع كاش"), icon: <Wallet className="w-5 h-5" /> },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMethod(m.id)}
            className={`
              flex flex-col items-center gap-3 px-4 py-5 rounded-3xl border-2 transition-all duration-300
              ${method === m.id
                ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10 ring-4 ring-primary/5 scale-[1.02]"
                : "border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50"}
            `}
          >
            <div className={`p-3 rounded-2xl ${method === m.id ? "bg-primary text-white shadow-premium" : "bg-gray-50 text-gray-400"}`}>
              {m.icon}
            </div>
            <span className="text-sm font-black">{m.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
        {method === "card" && (
          <div className="space-y-6 animate-fade-in px-2">
            <div className="flex items-start gap-4 p-5 bg-primary/5 rounded-3xl border border-primary/10">
              <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                {tr("payment.cardDesc", "سيتم توجيهك لبوابة الدفع لخدمة ميسر لإتمام المعاملة ببطاقة مدى أو فيزا بشكل آمن.")}
              </p>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-400 opacity-20"></div>
              <PaymentForm amount={amount} requestId={requestId} onSuccess={() => refetch && refetch()} />
            </div>
          </div>
        )}

        {method === "bank" && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <div className="w-1 h-4 bg-secondary rounded-full"></div>
                {tr("payment.bankDetails", "بيانات التحويل البنكي")}
              </h4>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-premium-secondary/10 space-y-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>

                <div className="flex justify-between items-center text-sm relative z-10">
                  <span className="text-gray-400 font-bold">{tr("payment.bankName", "اسم البنك")}:</span>
                  <span className="font-black text-gray-900">البنك الأهلي السعودي</span>
                </div>
                <div className="flex justify-between items-center text-sm relative z-10 border-t border-gray-50 pt-4">
                  <span className="text-gray-400 font-bold">{tr("payment.accName", "اسم الحساب")}:</span>
                  <div className="flex flex-col items-end">
                    <span className="font-black text-gray-900">بثينة أعمال</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm relative z-10 border-t border-gray-50 pt-4">
                  <span className="text-gray-400 font-bold">{tr("payment.accNumber", "رقم الحساب")}:</span>
                  <span className="font-black text-gray-900 font-mono tracking-wider text-base">49400000475403</span>
                </div>
                <div className="flex justify-between items-center text-sm relative z-10 border-t border-gray-50 pt-4">
                  <span className="text-gray-400 font-bold">IBAN:</span>
                  <span className="font-black text-primary font-mono tracking-wider text-xs md:text-sm uppercase">SA17 1000 0049 4000 0047 5403</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <input
                  type="file"
                  id="receipt-upload"
                  multiple
                  onChange={onUploadChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                />
                <div className={`
                  border-2 border-dashed rounded-[2rem] p-8 transition-all duration-300 relative overflow-hidden
                  ${files.length > 0 ? "border-primary bg-primary/5 shadow-inner" : "border-gray-200 bg-white hover:border-primary/40 hover:bg-gray-50/50"}
                `}>
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`
                      w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500
                      ${files.length > 0 ? "bg-primary text-white scale-110 rotate-3 shadow-premium" : "bg-gray-100 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary"}
                    `}>
                      <Upload className="w-8 h-8" />
                    </div>

                    <div className="space-y-1">
                      <h5 className="font-black text-gray-900 text-lg">
                        {files.length > 0 ? tr("payment.filesSelected", "تم اختيار الملفات") : tr("payment.uploadReceipt", "رفع إيصال التحويل")}
                      </h5>
                      <p className="text-sm text-gray-500 max-w-[200px] mx-auto leading-tight">
                        {files.length > 0
                          ? (lang === 'ar' ? `تم اختيار ${files.length} ملفات` : `${files.length} files selected`)
                          : tr("payment.uploadDescription", "يرجى رفع صورة واضحة لإيصال التحويل لتأكيد عملية الدفع")}
                      </p>
                    </div>

                    {files.length === 0 && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-xs font-bold text-gray-500 group-hover:bg-primary group-hover:text-white transition-all">
                        {tr("payment.browseFiles", "تصفح الملفات")}
                        <ChevronLeft className="w-3 h-3 rtl:rotate-180" />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {files.length > 0 && (
                <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                  <ul className="text-[10px] text-primary/80 space-y-1">
                    {files.map((f, i) => <li key={i} className="flex items-center gap-2"><span className="w-1 h-1 bg-primary rounded-full"></span> {f.name}</li>)}
                  </ul>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Info className="w-3.5 h-3.5 text-secondary" />
                  {tr("payment.notes", "ملاحظات إضافية")}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-5 bg-white border border-gray-100 rounded-[2rem] text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary/40 outline-none transition-all h-32 resize-none shadow-inner"
                  placeholder={tr("payment.notesPlaceholder", "أدخل رقم الحوالة أو اسم المحول...")}
                />
              </div>

              <button
                onClick={() => submitManual("bank")}
                disabled={isLoading || files.length === 0}
                className="w-full premium-gradient-secondary text-white py-5 rounded-[2rem] font-black text-base shadow-premium-secondary hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 mt-6 group"
              >
                {isLoading ? (
                  <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <CheckCircle2 className="w-6 h-6 transition-transform group-hover:scale-110" />
                    <span>{tr("payment.confirmBank", "تأكيد التحويل وإرسال الإيصال")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {method === "cash" && (
          <div className="space-y-8 animate-fade-in px-2">
            <div className="flex items-center gap-6 p-8 bg-secondary/5 rounded-[2.5rem] border-2 border-dashed border-secondary/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/5 rounded-full -mr-24 -mt-24 transition-transform group-hover:scale-110"></div>
              <div className="p-4 bg-secondary rounded-[1.5rem] text-white shadow-premium-secondary z-10">
                <Wallet className="w-8 h-8" />
              </div>
              <div className="z-10">
                <h4 className="font-black text-xl text-gray-900 mb-1">{tr("payment.cashTitle", "الدفع النقدي")}</h4>
                <p className="text-sm text-gray-600 font-medium">
                  {tr("payment.cashDesc", "يمكنك سداد المبلغ كاش في مقر الشركة أو عند تسليم المشروع.")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                {tr("payment.notes", "ملاحظات إضافية")}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-6 bg-white border border-gray-100 rounded-[2.5rem] text-sm focus:ring-8 focus:ring-primary/5 focus:border-primary/30 outline-none transition-all h-32 resize-none shadow-inner font-medium"
                placeholder={tr("payment.notesPlaceholder", "أدخل تفاصيل الدفع النقدي المتفق عليها...")}
              />
            </div>

            <button
              onClick={() => submitManual("cash")}
              disabled={isLoading}
              className="w-full premium-gradient-primary text-white py-6 rounded-[2.5rem] font-black text-lg shadow-premium hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 group"
            >
              {isLoading ? (
                <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6 transition-transform group-hover:scale-110" />
                  <span>{tr("payment.confirmCash", "تأكيد الدفع النقدي")}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
