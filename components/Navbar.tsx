"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

const menu = [
  { name: "হোম", link: "/" },
  { name: "আমাদের সম্পর্কে", link: "/about" },
  { name: "কোর্সসমূহ", link: "/courses" },
  { name: "শিক্ষকবৃন্দ", link: "/teachers" },
  {
    name: "অনলাইন ক্লাস",
    link: "https://www.youtube.com/@TheCuriousClassroom-s2s",
    external: true,
  },
  { name: "ফলাফল", link: "/result" },
  { name: "যোগাযোগ", link: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);

  const isActive = (link: string) =>
    link === "/"
      ? pathname === "/"
      : pathname === link || pathname.startsWith(`${link}/`);

  const focusStyle =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#080D19]";

  return (
    <nav
      aria-label="প্রধান নেভিগেশন"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          toggleRef.current?.focus();
        }
      }}
      className="sticky top-0 z-50 border-b border-white/10 bg-[#080D19]/95 text-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.15)] backdrop-blur-xl"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[88px] items-center justify-between gap-5">
          {/* Logo */}
          <Link
            href="/"
            aria-label="The Curious Classroom — হোম"
            onClick={() => setOpen(false)}
            className={`shrink-0 rounded-xl bg-white px-3 py-2 ${focusStyle}`}
          >
            <Image
              src="/logo.png"
              alt="The Curious Classroom"
              width={170}
              height={60}
              sizes="(max-width: 639px) 128px, 145px"
              className="h-auto w-32 sm:w-[145px]"
            />
          </Link>

          {/* Desktop menu */}
          <div className="hidden items-center gap-1 xl:flex">
            {menu.map((item) => {
              const active = !item.external && isActive(item.link);

              const className = `
                relative whitespace-nowrap rounded-lg px-3 py-3
                text-sm font-medium transition-colors
                ${focusStyle}
                ${
                  active
                    ? "bg-blue-400/10 text-blue-300"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }
              `;

              return item.external ? (
                <a
                  key={item.link}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {item.name}
                  <span aria-hidden="true" className="ml-1 text-xs">
                    ↗
                  </span>
                  <span className="sr-only"> — নতুন ট্যাবে খুলবে</span>
                </a>
              ) : (
                <Link
                  key={item.link}
                  href={item.link}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={className}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Admission and mobile toggle */}
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/admission"
              onClick={() => setOpen(false)}
              className={`hidden items-center gap-3 rounded-xl border border-blue-400/20 bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-[0_4px_20px_rgba(37,99,235,0.18)] transition-colors hover:bg-blue-500 sm:inline-flex ${focusStyle}`}
            >
              ভর্তি করুন
              <span aria-hidden="true">↗</span>
            </Link>

            <button
              ref={toggleRef}
              type="button"
              aria-label={open ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              onClick={() => setOpen((value) => !value)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-100 transition-colors hover:bg-white/10 xl:hidden ${focusStyle}`}
            >
              <svg
                aria-hidden="true"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                {open ? (
                  <>
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                  </>
                ) : (
                  <>
                    <path d="M4 6h16" />
                    <path d="M4 12h16" />
                    <path d="M4 18h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile and tablet menu */}
        <div
          id="mobile-navigation"
          hidden={!open}
          className="max-h-[calc(100dvh-88px)] overflow-y-auto border-t border-white/10 pb-5 pt-4 xl:hidden"
        >
          <div className="flex flex-col gap-1">
            {menu.map((item) => {
              const active = !item.external && isActive(item.link);

              const className = `
                flex items-center justify-between rounded-xl
                px-4 py-3.5 text-base transition-colors
                ${focusStyle}
                ${
                  active
                    ? "bg-blue-400/10 text-blue-300"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }
              `;

              return item.external ? (
                <a
                  key={item.link}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className={className}
                >
                  {item.name}
                  <span aria-hidden="true">↗</span>
                  <span className="sr-only"> — নতুন ট্যাবে খুলবে</span>
                </a>
              ) : (
                <Link
                  key={item.link}
                  href={item.link}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={className}
                >
                  {item.name}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full bg-blue-400"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <Link
            href="/admission"
            onClick={() => setOpen(false)}
            className={`mt-4 flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-3.5 font-medium text-white transition-colors hover:bg-blue-500 ${focusStyle}`}
          >
            ভর্তি করুন
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}