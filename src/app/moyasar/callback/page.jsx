'use client';
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState({ loading: true, message: "", ok: false });

  useEffect(() => {
    const paymentId =
      searchParams.get("id") ||
      searchParams.get("payment_id") ||
      searchParams.get("paymentId") ||
      "";
    if (!paymentId) {
      setState({ loading: false, message: "لا يوجد معرف دفع", ok: false });
      return;
    }
    const verify = async () => {
      try {
        const res = await fetch("/api/moyasar/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "فشل التحقق من الدفع");
        }
        const ok = data?.status === "paid" || data?.updatedPayment?.status === "succeeded";
        setState({
          loading: false,
          message: ok ? "تم الدفع بنجاح" : `حالة الدفع: ${data?.status || "غير معروف"}`,
          ok,
        });
        // Redirect to request details when linked request id is available
        const rid = data?.requestId;
        if (ok && rid) {
          setTimeout(() => router.push(`/requests/${rid}`), 1200);
        }
      } catch (e) {
        setState({ loading: false, message: e?.message || "فشل التحقق", ok: false });
      }
    };
    verify();
  }, [searchParams, router]);

  if (state.loading) {
    return <div className="container mx-auto p-8 text-center">جاري التحقق من الدفع...</div>;
  }
  return (
    <div className="container mx-auto p-8 text-center">
      <div className={`inline-block rounded-2xl px-6 py-4 ${state.ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        <h3 className="text-xl font-bold mb-2">{state.ok ? "نجاح الدفع" : "لم يتم تأكيد الدفع"}</h3>
        <p>{state.message}</p>
      </div>
      <div className="mt-6">
        <button
          className="bg-black text-white px-5 py-2 rounded-lg"
          onClick={() => router.push("/")}
        >
          العودة للرئيسية
        </button>
      </div>
    </div>
  );
}
