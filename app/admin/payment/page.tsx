
"use client";

import Link from "next/link";
import {
  BookOpen,
  CreditCard,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const classes = [
  {
    name: "Class 9",
    slug: "Class 9",
    color: "text-blue-400",
    iconBg: "bg-blue-500/10",
    border: "border-blue-400/15",
    accent: "bg-blue-400",
  },
  {
    name: "Class 10",
    slug: "Class 10",
    color: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    border: "border-emerald-400/15",
    accent: "bg-emerald-400",
  },
  {
    name: "Class 11",
    slug: "Class 11",
    color: "text-amber-400",
    iconBg: "bg-amber-500/10",
    border: "border-amber-400/15",
    accent: "bg-amber-400",
  },
  {
    name: "Class 12",
    slug: "Class 12",
    color: "text-violet-400",
    iconBg: "bg-violet-500/10",
    border: "border-violet-400/15",
    accent: "bg-violet-400",
  },
];

export default function MonthlyPaymentPage() {
  return (
    <main className="min-h-screen bg-[#080D19] px-5 py-10 text-white sm:px-8 lg:px-10">

      <div className="mx-auto max-w-7xl">

        {/* PAGE HEADER */}

        <div className="mb-10">

          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-7 bg-blue-400" />

            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300">
              FINANCE MANAGEMENT
            </p>
          </div>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Monthly Payment{" "}
                <span className="text-blue-400">
                  Management
                </span>
              </h1>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                Manage student payments and monthly
                fee records by class.
              </p>
            </div>

            <Link
              href="/admin/dashboard"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={17} />
              Dashboard
            </Link>

          </div>
        </div>

        {/* SECTION HEADER */}

        <div className="mb-6 flex items-center justify-between gap-4">

          <div>
            <h2 className="text-xl font-semibold text-white">
              Select a Class
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Choose a class to manage payment records.
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-[#101A2C] px-4 py-2.5 text-xs text-slate-400 sm:flex">
            <CreditCard size={16} />
            4 Classes
          </div>

        </div>

        {/* PREMIUM CLASS CARDS */}

        <div className="grid gap-5 md:grid-cols-2">

          {classes.map((item) => (

            <Link
              key={item.slug}
              href={`/admin/payment/${encodeURIComponent(item.slug)}`}
              className="
                group relative overflow-hidden
                rounded-3xl
                border border-white/[0.09]
                bg-[#101A2C]
                p-7 sm:p-8
                shadow-[0_15px_50px_rgba(0,0,0,0.15)]
                transition-all duration-300
                hover:-translate-y-1
                hover:border-blue-400/30
                hover:bg-[#14213A]
                hover:shadow-[0_20px_60px_rgba(37,99,235,0.10)]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-blue-400
              "
            >

              {/* TOP ACCENT */}
              <div
                className={`absolute left-7 top-0 h-[2px] w-12 ${item.accent}`}
              />

              {/* ICON ROW */}
              <div className="flex items-start justify-between">

                <div
                  className={`
                    flex h-14 w-14 items-center justify-center
                    rounded-2xl border
                    ${item.iconBg}
                    ${item.border}
                    ${item.color}
                  `}
                >
                  <BookOpen size={25} strokeWidth={1.8} />
                </div>

                <ArrowUpRight
                  size={19}
                  className="text-slate-600 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-blue-300"
                />

              </div>

              {/* CONTENT */}
              <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                MONTHLY PAYMENT
              </p>

              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                {item.name}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                View student payment history,
                manage monthly fees and review
                transaction records.
              </p>

              {/* BOTTOM ACTION */}
              <div className="mt-8 flex items-center justify-between border-t border-white/[0.07] pt-5">

                <span className="flex items-center gap-2 text-sm font-semibold text-blue-300">
                  Open Module

                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>

                <span className={`h-2 w-2 rounded-full ${item.accent}`} />

              </div>

            </Link>

          ))}

        </div>

      </div>

    </main>
  );
}
