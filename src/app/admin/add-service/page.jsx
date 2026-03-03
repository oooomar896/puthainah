"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { FormPageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const AddService = dynamic(() => import("@/components/admin-components/services/AddService"), {
  loading: () => <FormPageSkeleton />,
  ssr: false,
});

export default function AddServicePage() {
  return (
    <Suspense fallback={<FormPageSkeleton />}>
      <AddService />
    </Suspense>
  );
}

