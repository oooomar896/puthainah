"use client";

import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import OptimizedImage from "@/components/shared/OptimizedImage";
import logo from "@/assets/images/logo.png";

interface LoadingPageProps {
    message?: string;
    useSkeleton?: boolean;
    skeletonComponent?: ReactNode;
}

const LoadingPage = ({ message, useSkeleton = false, skeletonComponent }: LoadingPageProps) => {
    const { t } = useTranslation();
    const translated = t("loading.default");
    const loadingMessage =
        typeof message === "string" && message
            ? message
            : (typeof translated === "string" ? translated : "Loading...");

    // If skeleton component is provided, use it
    if (useSkeleton && skeletonComponent) {
        return <>{skeletonComponent}</>;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 dark:border-primary/30 border-t-primary animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <OptimizedImage src={logo} alt="logo" width={56} height={56} sizes="56px" className="w-14 h-14 object-contain" />
                    </div>
                </div>
                <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">
                    {loadingMessage}
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {typeof t("loading.subtitle") === "string" ? t("loading.subtitle") : "Please wait..."}
                </p>
            </div>
        </div>
    );
};

export default LoadingPage;
