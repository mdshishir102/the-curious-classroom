"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SiteShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const isPortal = ["/admin", "/student"].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isPortal) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}