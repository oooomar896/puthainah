"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { ProfileSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const OurRates = dynamic(() => import("@/views/provider/our-rates/OurRates"), {
  loading: () => <ProfileSkeleton />,
  ssr: false,
});

export default function OurRatesPage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <OurRates />
    </Suspense>
  );
}

