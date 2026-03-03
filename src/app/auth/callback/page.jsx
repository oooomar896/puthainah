'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { detectUserRole } from "@/utils/roleDetection";

function parseHash(hashStr) {
  const out = {};
  const str = (hashStr || "").replace(/^#/, "");
  for (const part of str.split("&")) {
    const [k, v] = part.split("=");
    if (!k) continue;
    out[decodeURIComponent(k)] = decodeURIComponent(v || "");
  }
  return out;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [state, setState] = useState({ loading: true, message: "جاري تفعيل الجلسة...", ok: false });

  useEffect(() => {
    const run = async () => {
      try {
        // Supabase عادة يلتقط الجلسة من الـ hash تلقائياً
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // fallback: نحاول قراءة الـ hash يدوياً
          const params = parseHash(window.location.hash);
          const access_token = params["access_token"];
          const refresh_token = params["refresh_token"];
          if (access_token && refresh_token) {
            const { error: setErr } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            if (setErr) throw new Error(setErr.message || "فشل ضبط جلسة المستخدم");
          }
        }
        // التحقق النهائي
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!s?.user) {
          setState({ loading: false, message: "تعذر تفعيل الجلسة. حاول الدخول من صفحة تسجيل الدخول.", ok: false });
          return;
        }
        const role = await detectUserRole(s.user, s);
        if (!role) {
          setState({ loading: false, message: "تعذر تحديد صلاحية المستخدم.", ok: false });
          return;
        }
        const r = role.toLowerCase();
        setState({ loading: false, message: "تم التفعيل بنجاح. إعادة التوجيه...", ok: true });
        setTimeout(() => {
          if (r === "admin") router.replace("/admin");
          else if (r === "provider") router.replace("/provider");
          else if (r === "requester") router.replace("/profile");
          else router.replace("/");
        }, 500);
      } catch (e) {
        setState({ loading: false, message: e?.message || "حدث خطأ أثناء التفعيل", ok: false });
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto p-8 text-center">
      <div className={`inline-block rounded-2xl px-6 py-4 ${state.ok ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
        <h3 className="text-xl font-bold mb-2">{state.ok ? "تم التفعيل" : "قيد المعالجة"}</h3>
        <p>{state.message}</p>
      </div>
    </div>
  );
}
