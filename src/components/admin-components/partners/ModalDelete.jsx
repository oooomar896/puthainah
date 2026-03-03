import { useTranslation } from "react-i18next";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

export default function ModalDelete({ open, onClose, onConfirm, loading }) {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="relative z-50"
      style={{ direction: "rtl" }} // ممكن تتحكم فيه حسب اللغة
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative sm:w-[370px] w-full py-7 px-6 transform overflow-hidden rounded-lg bg-white text-center shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <h2 className="text-lg font-semibold text-gray-700 mb-6">
              {t("partners.modalDelete.title")}
            </h2>

            <div className="flex flex-col gap-3">
              <button
                onClick={onConfirm}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition text-white font-medium rounded-xl h-[50px] w-full"
              >
                {loading
                  ? t("partners.modalDelete.deleting")
                  : t("partners.modalDelete.delete")}
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                className="bg-gray-100 hover:bg-gray-200 transition font-medium rounded-xl h-[50px] w-full"
              >
                {t("partners.modalDelete.cancel")}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
