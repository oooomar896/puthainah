import { useContext, useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { useCreatePaymentMutation } from "../../../redux/api/paymentApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/context/LanguageContext";
import MoyasarInlineForm from "./MoyasarInlineForm";
import { getStripePublishableKey } from "@/utils/env";

const stripePublishableKey = getStripePublishableKey() || null;

// فقط حمّل Stripe إذا كان المفتاح موجوداً وصحيحاً وليس مجرد نص مؤقت
const isStripeKeyValid = stripePublishableKey && stripePublishableKey.trim() && !stripePublishableKey.includes("xxxx");
const stripePromise = isStripeKeyValid ? loadStripe(stripePublishableKey.trim()) : null;

export default function PaymentForm({ amount, consultationId, refetch }) {
  const { t } = useTranslation();
  const { lang } = useContext(LanguageContext);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentId, setPaymentId] = useState(null);
  const [createPayment, { isLoading, error }] = useCreatePaymentMutation();
  // Force fallback if Stripe key is invalid
  const [fallback, setFallback] = useState(!isStripeKeyValid);

  useEffect(() => {
    // إذا لم يكن Stripe متوفراً، لا تفعل شيء
    if (!stripePublishableKey || !stripePromise) {
      setFallback(true);
      return;
    }

    const createPaymentIntent = async () => {
      try {
        // 1. Create Payment Intent via Next.js API
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, currency: "sar" }),
        });

        const paymentData = await response.json();

        if (!response.ok) {
          setFallback(true);
          throw new Error(paymentData.error || "Failed to create payment intent");
        }

        const { clientSecret: secret } = paymentData;
        const parts = typeof secret === "string" ? secret.split("_secret_") : [];
        const intentId = parts.length > 0 ? parts[0] : null;

        // 2. Create pending payment record in Supabase
        const dbPayment = await createPayment({
          amount,
          currency: "sar",
          requestId: consultationId,
          stripePaymentIntentId: intentId,
          status: "pending",
          paymentMethod: "stripe",
          paymentStatus: "pending",
        }).unwrap();

        if (dbPayment?.data?.id) {
          setPaymentId(dbPayment.data.id);
        } else if (dbPayment?.id) {
          setPaymentId(dbPayment.id);
        }

        // 3. Show Form
        setClientSecret(secret);

      } catch (err) {
        console.error("Payment setup error:", err);
        toast.error(
          err?.message || t("payment.stripeError") || "حدث خطأ أثناء إنشاء نية الدفع"
        );
        setFallback(true);
      }
    };

    if (amount && consultationId) {
      createPaymentIntent();
    }
  }, [amount, consultationId, createPayment, t]);

  if (fallback) {
    return <MoyasarInlineForm amount={amount} requestId={consultationId} />;
  }

  const appearance = { theme: "stripe" };
  const options = {
    clientSecret,
    appearance,
    locale: lang === "ar" ? "ar" : "en",
  };

  return clientSecret ? (
    <Elements options={options} stripe={stripePromise}>
      <CheckoutForm refetch={refetch} paymentId={paymentId} />
    </Elements>
  ) : isLoading ? (
    <p>جاري تحميل الدفع...</p>
  ) : error ? (
    <p>حدث خطأ أثناء تحميل الدفع</p>
  ) : null;
}
