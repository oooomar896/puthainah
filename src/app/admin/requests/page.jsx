"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { DetailPageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const RequestDetails = dynamic(() => import("@/views/admin/request-details/RequestDetails"), {
  loading: () => <DetailPageSkeleton />,
});

export default function AdminRequestDetailsPage({ params: _params }) {
  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <RequestDetails />
    </Suspense>
  );
}

