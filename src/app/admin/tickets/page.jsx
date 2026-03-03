"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { DetailPageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const TicketsDetails = dynamic(() => import("@/views/admin/tickets/TicketsDetails"), {
  loading: () => <DetailPageSkeleton />,
});

export default function AdminTicketDetailsPage({ params: _params }) {
  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <TicketsDetails />
    </Suspense>
  );
}

