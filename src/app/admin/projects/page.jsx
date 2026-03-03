"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { TablePageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const ProjectsAdmin = dynamic(() => import("@/views/admin/projects/Projects"), {
  loading: () => <TablePageSkeleton />,
  ssr: false,
});

export default function AdminProjectsPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <ProjectsAdmin />
    </Suspense>
  );
}

