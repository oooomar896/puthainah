"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { DashboardSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const AboutUs = dynamic(() => import("@/views/landing/about-us/AboutUs"), {
  loading: () => <DashboardSkeleton />,
  ssr: false,
});

export default function AboutUsPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AboutUs />
    </Suspense>
  );
}

