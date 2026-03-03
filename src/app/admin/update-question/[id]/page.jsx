"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { FormPageSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const UpdateQuestion = dynamic(() => import("@/components/admin-components/faqs/UpdateQuestion"), {
  loading: () => <FormPageSkeleton />,
});

export default function UpdateQuestionPage({ params: _params }) {
  return (
    <Suspense fallback={<FormPageSkeleton />}>
      <UpdateQuestion />
    </Suspense>
  );
}

