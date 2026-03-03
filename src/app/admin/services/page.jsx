"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { FormPageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const UpsertService = dynamic(() => import("@/components/admin-components/services/UpsertService"), {
  loading: () => <FormPageSkeleton />,
  ssr: false,
});

export default function EditServicePage() {
  return (
    <Suspense fallback={<FormPageSkeleton />}>
      <UpsertService />
    </Suspense>
  );
}

