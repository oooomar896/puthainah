import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";


export default function MoyasarInvoiceButton({ amount, requestId, userId }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);


  const handlePay = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/moyasar/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "SAR",
          description: t("payment.title") || "الدفع",
          requestId,
          userId,
          supportedSources: ["creditcard", "mada", "applepay"],
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.invoiceUrl) {
        throw new Error(data?.error || "فشل إنشاء فاتورة الدفع");
      }
      window.location.href = data.invoiceUrl;
    } catch (err) {
      toast.error(err?.message || "حدث خطأ أثناء بدء الدفع عبر Moyasar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePay}
      disabled={loading}
      className="w-full bg-[#1a9f5a] py-3 rounded-xl text-white font-bold hover:bg-[#15894c] transition-all mt-4"
    >
      {loading
        ? t("payment.processing") || "جاري المعالجة..."
        : t("payWithMoyasar") || "الدفع عبر Moyasar"}
    </button>
  );
}
