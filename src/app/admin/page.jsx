"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { FormPageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const UpsertCustomer = dynamic(() => import("@/components/admin-components/customers/UpsertCustomer"), {
  loading: () => <FormPageSkeleton />,
  ssr: false,
});

export const dynamicParams = true;

export default function AddCustomerPage() {
  return (
    <Suspense fallback={<FormPageSkeleton />}>
      <UpsertCustomer />
    </Suspense>
  );
}

