"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { FormPageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const UpsertPartner = dynamic(() => import("@/components/admin-components/partners/UpsertPartner"), {
  loading: () => <FormPageSkeleton />,
});

export default function UpdatePartnerPage({ params: _params }) {
  return (
    <Suspense fallback={<FormPageSkeleton />}>
      <UpsertPartner />
    </Suspense>
  );
}

