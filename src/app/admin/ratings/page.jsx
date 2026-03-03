"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const RatingsAdmin = dynamic(() => import("@/views/admin/ratings/Ratings"), {
  loading: () => <TablePageSkeleton />,
  ssr: false,
});

export default function AdminRatingsPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <RatingsAdmin />
    </Suspense>
  );
}

