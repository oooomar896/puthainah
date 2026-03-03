import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useUpdatePaymentStatusMutation } from "../../../redux/api/paymentApi";

export default function CheckoutForm({ refetch, paymentId }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const location = { pathname };
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const [updatePaymentStatus] = useUpdatePaymentStatusMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // ✅ أولاً: بدء الدفع
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        setMessage(t("payment.succeeded"));
        
        // تحديث حالة الدفع في قاعدة البيانات
        if (paymentId) {
            try {
                await updatePaymentStatus({
                    id: paymentId,
                    body: {
                        status: "succeeded",
                        stripePaymentIntentId: paymentIntent.id
                    }
                }).unwrap();
            } catch (updateErr) {
                console.error("Failed to update payment status in DB:", updateErr);
                // لا نوقف العملية لأن الدفع تم بالفعل في Stripe
            }
        }

        toast.success(t("payment.success"));
        setIsSuccess(true); // Show success UI
        
        if (location?.pathname?.includes("requests/")) {
          refetch();
        }
        // No auto-redirect, let user see the success message
      } else {
        setMessage(t("payment.notConfirmed"));
      }
    } catch (err) {
      toast.error(
        err?.data?.message || t("payment.failed") || "حدث خطأ أثناء الدفع"
      );
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{t("payment.succeeded")}</h3>
        <p className="text-gray-600 mb-6">{t("payment.success")}</p>
        <button
          onClick={() => {
             // If we are on a request page, maybe we just want to reload or scroll up? 
             // Or simply do nothing as refetch() already happened.
             // Let's reload the page to be safe and ensure fresh state if needed, or redirect to home if not on request details.
             if (location?.pathname?.includes("requests/")) {
               window.location.reload(); 
             } else {
               router.push("/");
             }
          }}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          {t("continue") || "Continue"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        type="submit"
        disabled={loading || !stripe || !elements}
        className="bg-green-600 text-white px-4 py-2 mt-4 rounded w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t("payment.processing") : t("payment.payNow")}
      </button>
      {message && <div className="mt-2 text-red-500 text-sm">{message}</div>}
    </form>
  );
}
