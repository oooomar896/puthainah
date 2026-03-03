"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { DashboardSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const HowItWork = dynamic(() => import("@/views/landing/howItWork/HowItWork"), {
  loading: () => <DashboardSkeleton />,
  ssr: false,
});

export default function HowItWorkPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <HowItWork />
    </Suspense>
  );
}

