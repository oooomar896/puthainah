"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import LoadingPage from "@/views/LoadingPage";
import { DashboardSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const LandingHome = dynamic(() => import("@/views/landing/home/Home"), {
  loading: () => <DashboardSkeleton />,
  ssr: false,
});

export default function HomePage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <LandingHome />
    </Suspense>
  );
}

