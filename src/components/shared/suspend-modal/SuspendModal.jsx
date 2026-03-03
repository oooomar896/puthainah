import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  DialogDescription,
} from "@headlessui/react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import suspend from "@/assets/icons/suspend.svg";
import {
  useSuspendProviderMutation,
  useSuspendRequesterMutation,
} from "../../../redux/api/updateApi";
import { logoutUser } from "../../../redux/slices/authSlice";
import { useTranslation } from "react-i18next";

export default function SuspendModal({ open, setOpen }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const role = useSelector((state) => state.auth.role);
  const [suspendProvider, { isLoading: loadingProvider }] =
    useSuspendProviderMutation();
  const [suspendRequester, { isLoading: loadingRequester }] =
    useSuspendRequesterMutation();

  const handleSuspend = async () => {
    try {
      if (role === "Provider") {
        await suspendProvider().unwrap();
      } else {
        await suspendRequester().unwrap();
      }
      toast.success(t("suspend.success"));
      await dispatch(logoutUser());
      router.replace("/login");
    } catch (error) {
      toast.error(
        error?.data?.message || t("suspend.error") || "حدث خطأ أثناء تعليق الحساب"
      );
    }
  };

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/30" />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-center shadow-xl transition-all">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <img src={typeof suspend === "string" ? suspend : (suspend?.src || "")} className="h-6 w-6 text-red-600" alt="suspend" loading="lazy" decoding="async" />
          </div>

          <DialogTitle className="mt-4 text-lg font-semibold text-gray-900">
            {t("suspend.title")}
          </DialogTitle>

          <DialogDescription className="mt-2 text-sm text-gray-600">
            {t("suspend.description")}
          </DialogDescription>

          <div className="mt-6 flex justify-center gap-4">
            <button
              type="button"
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              onClick={() => setOpen(false)}
              disabled={loadingProvider || loadingRequester}
            >
              {t("suspend.cancel")}
            </button>
            <button
              type="button"
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              onClick={handleSuspend}
              disabled={loadingProvider || loadingRequester}
            >
              {loadingProvider || loadingRequester
                ? t("suspend.loading")
                : t("suspend.confirm")}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
