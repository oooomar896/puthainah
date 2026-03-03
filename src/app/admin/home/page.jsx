"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { DashboardSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const HomeAdmin = dynamic(() => import("@/views/admin/home/Home"), {
  loading: () => <DashboardSkeleton />,
  ssr: false,
});

export default function AdminHomeAliasPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <HomeAdmin />
    </Suspense>
  );
}
