"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { ProfileSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const Signup = dynamic(() => import("@/views/landing/signup/Signup"), {
  loading: () => <ProfileSkeleton />,
  ssr: false,
});

export default function SignupProviderPage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Signup />
    </Suspense>
  );
}

