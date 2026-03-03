"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { ProfileSkeleton } from "@/components/shared/skeletons/PageSkeleton";

const ProfileInfo = dynamic(() => import("@/views/admin/profile-info/ProfileInfo"), {
  loading: () => <ProfileSkeleton />,
});

export default function AdminProfileInfoPage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileInfo />
    </Suspense>
  );
}

