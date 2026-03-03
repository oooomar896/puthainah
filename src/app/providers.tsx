"use client";

import { Suspense } from "react";
import LoadingPage from "@/views/LoadingPage";

// Initialize i18n before anything else
import "@/lib/i18n";


import { LanguageProvider } from "@/context/LanguageContext";
import StoreProvider from "@/redux/StoreProvider";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import BackToTopButton from "@/components/BackTop";
import AuthInitializer from "@/components/AuthInitializer";
import DirManager from "@/components/shared/DirManager";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary>
            <Suspense fallback={<LoadingPage />}>
                <StoreProvider>
                    <LanguageProvider>
                        <AuthInitializer>
                            <DirManager />
                            <Toaster
                                position="top-center"
                                reverseOrder={false}
                                toastOptions={{
                                    duration: 4000,
                                    style: {
                                        background: "#ffffff",
                                        color: "#1f2937",
                                        border: "1px solid #e5e7eb",
                                        boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
                                    },
                                    success: {
                                        duration: 3000,
                                        iconTheme: {
                                            primary: "#10b981",
                                            secondary: "#ffffff",
                                        },
                                    },
                                    error: {
                                        duration: 4000,
                                        iconTheme: {
                                            primary: "#ef4444",
                                            secondary: "#ffffff",
                                        },
                                    },
                                }}
                            />
                            {children}
                            <BackToTopButton />
                        </AuthInitializer>
                    </LanguageProvider>
                </StoreProvider>
            </Suspense>
        </ErrorBoundary>
    );
}
