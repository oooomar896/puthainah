"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { DetailPageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const UserRequestDetails = dynamic(() => import("@/views/landing/request-details/RequestDetails"), {
  loading: () => <DetailPageSkeleton />,
});

export default function RequestDetailsContent({ id, initialData }) {
  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <UserRequestDetails id={id} initialData={initialData} />
    </Suspense>
  );
}
