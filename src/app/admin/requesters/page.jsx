"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { DetailPageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const UsersDetails = dynamic(() => import("@/views/admin/users-details/UsersDetails"), {
  loading: () => <DetailPageSkeleton />,
});

export default function RequesterDetailsPage({ params: _params }) {
  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <UsersDetails />
    </Suspense>
  );
}

