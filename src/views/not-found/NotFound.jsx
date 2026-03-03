"use client";

import { useEffect } from "react";
import "./NotFound.css";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Link from "next/link";

const NotFound = () => {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="not-found">
      <div className="container mx-auto px-6 py-16 text-center">
        <div className="inline-block bg-white border border-gray-100 rounded-3xl px-8 py-10 shadow-sm">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-3">404</h1>
          <p className="text-gray-600 mb-6">{t("notFound.message")}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => router.back()}
              className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              {t("notFound.back")}
            </button>
            <Link
              href="/"
              className="px-5 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
            >
              {t("error.boundary.goHome")}
            </Link>
            <Link
              href="/requests"
              className="px-5 py-2 rounded-lg bg-black text-white hover:bg-black/90"
            >
              {t("notFound.goRequests") || "اذهب إلى طلباتي"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
