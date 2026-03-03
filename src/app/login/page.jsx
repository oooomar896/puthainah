"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { ProfileSkeleton } from "@/components/shared/skeletons/PageSkeleton";
import GuestGuard from "@/components/GuestGuard";

const Login = dynamic(() => import("@/views/landing/login/Login"), {
  loading: () => <ProfileSkeleton />,
  ssr: false,
});

export default function LoginPage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <GuestGuard>
        <Login />
      </GuestGuard>
    </Suspense>
  );
}

