'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CallbackRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/auth/callback");
  }, [router]);
  return (
    <div className="container mx-auto p-8 text-center">
      <div className="inline-block rounded-2xl px-6 py-4 bg-blue-50 text-blue-700">
        <h3 className="text-xl font-bold mb-2">جارٍ التحويل...</h3>
        <p>إعادة التوجيه إلى صفحة التفعيل</p>
      </div>
    </div>
  );
}
