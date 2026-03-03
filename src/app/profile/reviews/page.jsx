"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { ProfileSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const Reviews = dynamic(() => import("@/views/landing/reviws/Reviews"), {
  loading: () => <ProfileSkeleton />,
  ssr: false,
});

export default function ReviewsPage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Reviews />
    </Suspense>
  );
}

