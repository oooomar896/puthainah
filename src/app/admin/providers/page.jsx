"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const Providers = dynamic(() => import("@/views/admin/providers/Providers"), {
  loading: () => <TablePageSkeleton />,
  ssr: false,
});

export default function ProvidersPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <Providers />
    </Suspense>
  );
}

