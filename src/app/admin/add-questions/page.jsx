"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { FormPageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const AddQuestion = dynamic(() => import("@/components/admin-components/faqs/AddQuestion"), {
  loading: () => <FormPageSkeleton />,
});

export default function AddQuestionPage() {
  return (
    <Suspense fallback={<FormPageSkeleton />}>
      <AddQuestion />
    </Suspense>
  );
}

