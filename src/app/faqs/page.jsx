"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { DashboardSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const Faqs = dynamic(() => import("@/components/landing-components/home-components/faqs/Faqs"), {
  loading: () => <DashboardSkeleton />,
  ssr: false,
});

export default function FaqsPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Faqs />
    </Suspense>
  );
}

