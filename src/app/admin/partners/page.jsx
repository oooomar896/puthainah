"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const PartnersAdmin = dynamic(() => import("@/views/admin/partners/Partners"), {
  loading: () => <TablePageSkeleton />,
  ssr: false,
});

export default function AdminPartnersPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <PartnersAdmin />
    </Suspense>
  );
}

