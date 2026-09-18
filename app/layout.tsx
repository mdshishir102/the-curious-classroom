import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
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
  title: "The Curious Classroom | Explore • Learn • Understand",
  description:
    "The Curious Classroom explains science, technology, history and fascinating ideas through simple and engaging content.",
  verification: {
    google: "ZhbYuxL7znnBk3uGPO5aagRt-LcQ2FbqrNiljZuyK80",
  },
  openGraph: {
    title: "The Curious Classroom | Explore • Learn • Understand",
    description:
      "Explore science, technology, history and fascinating ideas through simple and engaging content.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>

      <GoogleAnalytics gaId="G-X51ZCDCKNZ" />
    </html>
  );
}