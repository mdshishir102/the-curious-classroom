"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { syncOfflineAttendance } from "@/lib/syncAttendance";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  const [allowed, setAllowed] = useState(false);

  // Admin verify (login page bad)
  useEffect(() => {
    if (isLoginPage) {
      setAllowed(true);
      return;
    }

    let active = true;

    async function verify() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;

      if (!session) {
        localStorage.removeItem("admin");
        router.replace("/admin/login");
        return;
      }

      const { data: admin, error } = await supabase
        .from("admins")
        .select("role")
        .eq("auth_user_id", session.user.id)
        .single();

      if (!active) return;

      if (error || !admin || admin.role !== "admin") {
        // Student ba onno kew: session bondho kore login e pathao
        await supabase.auth.signOut();
        localStorage.removeItem("admin");
        router.replace("/admin/login");
        return;
      }

      setAllowed(true);
    }

    void verify();

    return () => {
      active = false;
    };
  }, [isLoginPage, router]);

  // Offline attendance sync: shudhu admin verify hole cholbe
  useEffect(() => {
    if (!allowed || isLoginPage) return;

    syncOfflineAttendance();
  }, [allowed, isLoginPage]);

  if (!allowed) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#080D19]">
        <LoaderCircle size={28} className="animate-spin text-blue-400" />
      </div>
    );
  }

  return <>{children}</>;
}