"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/device";

const LOGIN_PATH = "/student/login";

export default function DeviceGuard() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

        if (!token) return;

        const savedVersion = localStorage.getItem("session_version");

        const res = await fetch("/api/student/device", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",


                   body: JSON.stringify({
            mode: "check",
            deviceId: getDeviceId(),
            sessionVersion: savedVersion === null ? null : Number(savedVersion),
          }),



        });

        const result = await res.json().catch(() => ({}));

        if (cancelled) return;

      
        if (result.status === "ok") {
          return;
        }





        if (result.status === "locked" || result.status === "expired") {
          await supabase.auth.signOut();
          localStorage.removeItem("student");
          localStorage.removeItem("student_id");
          localStorage.removeItem("session_version");
          window.location.href =
            result.status === "locked"
              ? `${LOGIN_PATH}?locked=1`
              : `${LOGIN_PATH}?expired=1`;
        }
      } catch {
        // Internet problem hole kichu korbo na
      }
    }

    check();

    const timer = setInterval(check, 30000);

    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pathname]);

  return null;
}