"use client";

import { useEffect } from "react";


export default function ServiceWorkerUnregister() {
    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                if (registrations.length > 0) {
                    console.log("Found", registrations.length, "service workers. Unregistering...");
                    // toast.success("تم تحديث النظام، جاري تنظيف الملفات المؤقتة...");
                }
                for (let registration of registrations) {
                    registration.unregister().then((success) => {
                        if (success) {
                            console.log("Service worker successfully unregistered.");
                        }
                    });
                }
            });
        }
    }, []);

    return null;
}
