import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

  keywords: [
    "The Curious Classroom",
    "Science",
    "Technology",
    "History",
    "Education",
    "Online Learning",
  ],

  verification: {
    google: "ZhbYuxL7znnBk3uGPO5aagRt-LcQ2FbqrNiljZuyK80",
  },

  icons: {
    icon: "/favicon.png",
  },

  openGraph: {
    title: "The Curious Classroom | Explore • Learn • Understand",

    description:
      "Explore science, technology, history and fascinating ideas through simple and engaging content.",

    url: "https://thecuriousclassroom.vercel.app",

    siteName: "The Curious Classroom",

    images: [
      {
        url: "https://thecuriousclassroom.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Curious Classroom",
      },
    ],

    locale: "en_US",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "The Curious Classroom | Explore • Learn • Understand",

    description:
      "Explore science, technology, history and fascinating ideas through simple and engaging content.",

    images: [
      "https://thecuriousclassroom.vercel.app/og-image.png",
    ],
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
    </html>
  );
}