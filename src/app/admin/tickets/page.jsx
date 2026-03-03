"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const TicketsPage = dynamic(() => import("@/views/admin/tickets/Tickets"), {
  loading: () => <TablePageSkeleton />,
  ssr: false,
});

export default function AdminTicketsPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <TicketsPage />
    </Suspense>
  );
}

