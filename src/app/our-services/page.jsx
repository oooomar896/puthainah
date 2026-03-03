"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { DashboardSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const OurServices = dynamic(() => import("@/views/landing/our-services/OurServices"), {
  loading: () => <DashboardSkeleton />,
  ssr: false,
});

export default function OurServicesPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <OurServices />
    </Suspense>
  );
}

