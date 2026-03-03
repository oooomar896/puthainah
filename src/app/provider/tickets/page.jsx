"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { DetailPageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const TicketsDetails = dynamic(() => import("@/views/landing/tickets/TicketDetails"), {
  loading: () => <DetailPageSkeleton />,
});

export default function ProviderTicketDetailsPage({ params }) {
  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <TicketsDetails ticketId={params.id} />
    </Suspense>
  );
}
