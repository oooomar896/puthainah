"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const OurProjects = dynamic(() => import("@/views/provider/our-projects/OurProjects"), {
  loading: () => <TablePageSkeleton />,
  ssr: false,
});

export default function OurProjectsPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <OurProjects />
    </Suspense>
  );
}

