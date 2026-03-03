"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { DetailPageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const ProviderProjectsDetails = dynamic(() => import("@/views/provider/project-details/ProviderProjectsDetails"), {
  loading: () => <DetailPageSkeleton />,
});

export default function ProviderProjectDetailsPage({ params: _params }) {
  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <ProviderProjectsDetails />
    </Suspense>
  );
}

