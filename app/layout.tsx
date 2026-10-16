import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import SiteShell from "@/components/SiteShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "The Curious Classroom | Shishir BioVerse",
    template: "%s | The Curious Classroom",
  },
  description:
    "The Curious Classroom-এর জীববিজ্ঞান বিভাগ Shishir BioVerse। শিশিরের সরাসরি দিকনির্দেশনায় SSC ও HSC জীববিজ্ঞানের অফলাইন ক্লাস, নিয়মিত অনুশীলন ও পরীক্ষার প্রস্তুতি।",
  verification: {
    google: "ZhbYuxL7znnBk3uGPO5aagRt-LcQ2FbqrNiljZuyK80",
  },
  openGraph: {
    title: "The Curious Classroom | Shishir BioVerse",
    description:
      "শিশিরের সঙ্গে বুঝে শেখো জীববিজ্ঞান। নবম–দ্বাদশ শ্রেণির জন্য SSC ও HSC জীববিজ্ঞানের অফলাইন ব্যাচ।",
    siteName: "The Curious Classroom",
    locale: "bn_BD",
    type: "website",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteShell>{children}</SiteShell>
        <GoogleAnalytics gaId="G-X51ZCDCKNZ" />
      </body>
    </html>
  );
}