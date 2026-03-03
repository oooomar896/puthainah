import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function UpdatePriceModal({ open, setOpen, onSubmit, refetch }) {
  const { t } = useTranslation();

  const [price, setPrice] = useState("");
  const [priceError, setPriceError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async () => {
    setPriceError("");
    if (price === "" || isNaN(price)) {
      const msg = t("services.toast_invalid_price");
      setPriceError(msg);
      toast.error(msg);
      return;
    }
    const numeric = Number(price);
    if (numeric < 0) {
      const msg = t("AdminAttachmentForm.errorPriceNegative");
      setPriceError(msg);
      toast.error(msg);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(numeric);
      toast.success(t("services.toast_success_update"));
      setOpen(false);
      setPrice("");
      setPriceError("");
      refetch();
    } catch (error) {
      toast.error(
        error?.data?.message || t("services.toast_error_update") || "حدث خطأ أثناء تحديث السعر"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setPrice("");
      setPriceError("");
      setIsSubmitting(false);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      className="relative z-[1000]"
      style={{ direction: "rtl" }}
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <DialogPanel className="sm:w-[420px] w-full bg-white rounded-xl p-6 shadow-lg">
            <DialogTitle className="text-lg font-semibold text-center mb-6">
              {t("services.update_price")}
            </DialogTitle>

            <label className="block text-sm font-medium mb-2">
              {t("services.enter_new_price")}
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                disabled={isSubmitting}
                className={`w-full border ${priceError ? "border-red-400" : "border-gray-300"} rounded-lg p-3 text-right pr-12 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                placeholder={t("services.enter_new_price")}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                aria-invalid={!!priceError}
                aria-describedby={priceError ? "price-error" : undefined}
              />
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 text-sm">
                ر.س
              </span>
            </div>
            {priceError ? (
              <p id="price-error" className="mt-2 text-xs text-red-600">
                {priceError}
              </p>
            ) : (
              <p className="mt-2 text-xs text-gray-500">
                {t("projects.servicePrice")} — {t("loading.subtitle")}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-primary text-white rounded-xl h-[50px] w-full flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting && (
                  <span className="loader inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                {isSubmitting ? t("loading.processing") : t("services.update")}
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  setPrice("");
                  setPriceError("");
                }}
                disabled={isSubmitting}
                className="bg-gray-100 text-gray-700 rounded-xl h-[50px] w-full disabled:opacity-60"
              >
                {t("services.back")}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
