"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const PaymentsView = dynamic(() => import("@/views/admin/payments/Payments"), {
  loading: () => <TablePageSkeleton />,
  ssr: false,
});

export default function AdminPaymentsPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <PaymentsView />
    </Suspense>
  );
}
