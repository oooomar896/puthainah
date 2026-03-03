"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { FormPageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const UpsertCustomer = dynamic(() => import("@/components/admin-components/customers/UpsertCustomer"), {
  loading: () => <FormPageSkeleton />,
});

export default function UpdateCustomerPage({ params: _params }) {
  return (
    <Suspense fallback={<FormPageSkeleton />}>
      <UpsertCustomer />
    </Suspense>
  );
}

