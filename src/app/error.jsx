'use client';
import { useTranslation } from "react-i18next";
import Link from "next/link";

export default function GlobalError({ error, reset }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-lg w-full bg-white rounded-2xl p-8 shadow">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          {t("error.boundary.title")}
        </h2>
        <p className="text-gray-600 mb-6">
          {t("error.boundary.message")}
        </p>
        {process.env.NODE_ENV !== "production" && (
          <div className="bg-gray-100 text-gray-700 text-sm rounded p-3 mb-6 break-words">
            {String(error?.message || "")}
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded bg-black text-white"
          >
            {t("error.boundary.tryAgain")}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded bg-gray-200 text-gray-800"
          >
            {t("error.boundary.reload")}
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded bg-primary text-white"
          >
            {t("error.boundary.goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
