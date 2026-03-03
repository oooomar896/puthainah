"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const Tickets = dynamic(() => import("@/views/landing/tickets/Tickets"), {
    loading: () => <TablePageSkeleton />,
    ssr: false,
});

export default function TicketsContent() {
    return (
        <Suspense fallback={<TablePageSkeleton />}>
            <Tickets />
        </Suspense>
    );
}
