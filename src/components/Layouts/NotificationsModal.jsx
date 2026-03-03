import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import {
  useGetNotificationsQuery,
  useSeenNotificationsMutation,
} from "@/redux/api/notificationsApi";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import EmptyState from "../shared/EmptyState";
import { Bell } from "lucide-react";

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export default function NotificationsModal({ open, setOpen }) {
  const { t } = useTranslation();
  const role = useSelector((state) => state.auth.role);
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.userId);

  const {
    data = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetNotificationsQuery(userId, {
    pollingInterval: 60000,
    skip: !token || !userId,
  });

  const [seenNotifications] = useSeenNotificationsMutation();

  useEffect(() => {
    if (open && data.length > 0) {
      const unseenIds = data
        .filter((notification) => !notification.is_seen)
        .map((n) => n.id);

      if (unseenIds.length > 0) {
        seenNotifications({ notificationIds: unseenIds });
      }
    }
  }, [open, data, seenNotifications]);

  const prevOpen = usePrevious(open);
  useEffect(() => {
    if (role) {
      refetch();
    }
  }, [role, refetch]);

  useEffect(() => {
    if (prevOpen && !open) {
      refetch();
    }
  }, [open, prevOpen, refetch]);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      className="relative z-[500]"
      style={{ direction: "rtl" }}
    >
      <DialogBackdrop className="fixed inset-0 bg-gray-500/40" />
      <div className="fixed top-24 rtl:left-4 ltr:right-4 inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-start rtl:justify-end ltr:justify-start p-4 text-start">
          <DialogPanel className="w-[370px] bg-white rounded-xl shadow-xl p-4 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-center">
              {t("notifications.title")}
            </h2>

            {isLoading || isFetching ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {data.length > 0 ? (
                  <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
                    {[...data].reverse().map((notification, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-md border ${!notification.is_seen
                            ? "bg-primary/10 border-primary/30"
                            : "bg-gray-100 border-gray-200"
                          }`}
                      >
                        <h3 className="text-sm font-bold text-gray-800 mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {notification.body}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title={t("notifications.empty") || "لا توجد إشعارات"}
                    description={t("notifications.emptyDesc") || "سنخبرك عند وجود أي تحديثات جديدة."}
                    icon={Bell}
                    className="py-6"
                  />
                )}
              </>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
