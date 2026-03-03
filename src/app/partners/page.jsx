"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { DashboardSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const Partners = dynamic(() => import("@/components/landing-components/home-components/partners/Partners"), {
  loading: () => <DashboardSkeleton />,
});

export default function PartnersPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Partners />
    </Suspense>
  );
}

