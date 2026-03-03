"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const Requesters = dynamic(() => import("@/views/admin/requesters/Requesters"), {
  loading: () => <TablePageSkeleton />,
  ssr: false,
});

export default function RequestersPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <Requesters />
    </Suspense>
  );
}

