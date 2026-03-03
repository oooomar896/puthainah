"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { FormPageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const UpsertPartner = dynamic(() => import("@/components/admin-components/partners/UpsertPartner"), {
  loading: () => <FormPageSkeleton />,
  ssr: false,
});

export default function AddPartnerPage() {
  return (
    <Suspense fallback={<FormPageSkeleton />}>
      <UpsertPartner />
    </Suspense>
  );
}

