"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const ActiveOrders = dynamic(() => import("@/views/provider/active-orders/ActiveOrders"), {
  loading: () => <TablePageSkeleton />,
  ssr: false,
});

export default function ActiveOrdersPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <ActiveOrders />
    </Suspense>
  );
}

