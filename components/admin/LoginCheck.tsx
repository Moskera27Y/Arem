"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Client-side safety net: if the admin session is invalid, send to /login. */
export function LoginCheck() {
  const router = useRouter();
  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.authenticated) router.replace("/login");
      })
      .catch(() => router.replace("/login"));
  }, [router]);
  return null;
}
