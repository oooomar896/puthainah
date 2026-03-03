"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const FaqsAdmin = dynamic(() => import("@/views/admin/faqs/Faqs"), {
  loading: () => <TablePageSkeleton />,
  ssr: false,
});

export default function AdminFaqsPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <FaqsAdmin />
    </Suspense>
  );
}

