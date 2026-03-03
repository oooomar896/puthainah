import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getMoyasarCallbackUrl } from "@/utils/env";

export default function MoyasarInlineForm({ amount, requestId }) {
  const { t } = useTranslation();
  // Using user provided test key as fallback
  const publishable = "pk_test_V1Lb6Faw9ccLDmDT5brsz3GHQa7r6FDzEHNgptXk";
  const callbackUrl = getMoyasarCallbackUrl();
  const [init, setInit] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Load CSS
    if (!document.getElementById("moyasar-css")) {
      const link = document.createElement("link");
      link.id = "moyasar-css";
      link.rel = "stylesheet";
      link.href = "https://cdn.moyasar.com/mpf/1.14.0/moyasar.css";
      document.head.appendChild(link);
    }

    // 2. Load Script logic
    const handleScriptLoad = () => {
      console.log("Moyasar script loaded event");
      setInit(true);
    };

    const handleScriptError = () => {
      console.error("Moyasar script load error");
      setError("فشل الاتصال ببوابة الدفع. يرجى التحقق من الانترنت وتحديث الصفحة.");
    };

    if (window.Moyasar) {
      setInit(true);
    } else {
      let script = document.getElementById("moyasar-script");
      if (!script) {
        script = document.createElement("script");
        script.id = "moyasar-script";
        script.src = "https://cdn.moyasar.com/mpf/1.14.0/moyasar.js";
        script.async = true;
        document.body.appendChild(script);
      }

      script.addEventListener("load", handleScriptLoad);
      script.addEventListener("error", handleScriptError);

      // Polling fallback in case event was missed or script already loading
      const interval = setInterval(() => {
        if (window.Moyasar) {
          setInit(true);
          clearInterval(interval);
        }
      }, 500);

      return () => {
        script.removeEventListener("load", handleScriptLoad);
        script.removeEventListener("error", handleScriptError);
        clearInterval(interval);
      };
    }
  }, []);

  useEffect(() => {
    if (init && window.Moyasar) {
      const minor = Math.round(Number(amount) * 100);
      const desc = (t("payment.title") || "الدفع") + (requestId ? ` (#${requestId})` : "");

      try {
        // Ensure container is empty before init to avoid duplicates
        const container = document.querySelector('.mysr-form');
        if (container) container.innerHTML = '';

        console.log("Initializing Moyasar Form...", { amount: minor, desc });
        window.Moyasar.init({
          element: '.mysr-form',
          amount: minor,
          currency: 'SAR',
          description: desc,
          publishable_api_key: publishable,
          callback_url: callbackUrl,
          methods: ['creditcard', 'mada']
        });
      } catch (e) {
        console.error("Moyasar Init Exception", e);
        setError("حدث خطأ أثناء تهيئة نموذج الدفع");
      }
    }
  }, [init, amount, requestId, publishable, callbackUrl, t]);

  if (!publishable || !amount) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-lg">خطأ في إعدادات الدفع: البيانات ناقصة</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>;
  }

  return (
    <div className="w-full relative min-h-[300px]">
      {!init && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/50 rounded-xl z-20 pointer-events-none">
          <span className="text-sm font-bold text-gray-500">جاري تجهيز بوابة الدفع...</span>
        </div>
      )}

      <div className="mysr-form relative z-10"></div>
    </div>
  );
}
