"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, isInitialized } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const [gracePeriod, setGracePeriod] = useState(true);

  useEffect(() => {
    if (!isInitialized) return;

    // Grace period to allow store to settle
    const timer = setTimeout(() => {
      setGracePeriod(false);
      
      if (!isAuthenticated) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else {
        setChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isInitialized, pathname, router]);

  if (!isInitialized || gracePeriod || checking || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}