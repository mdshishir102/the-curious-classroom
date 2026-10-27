
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Payment = {
  student_id: string | null;
  amount: number | string | null;
  payment_method: string | null;
};

type Student = {
  id: string;
  class: string | null;
};

type ClassStat = {
  className: string;
  total: number;
  paid: number;
  unpaid: number;
  percentage: number;
};

type Stats = {
  total: number;
  bkash: number;
  offline: number;
  other: number;
  students: number;
};

type IconName =
  | "wallet"
  | "users"
  | "phone"
  | "cash"
  | "calendar"
  | "refresh"
  | "arrow"
  | "chart"
  | "check"
  | "clock"
  | "graduation";

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const CLASSES = [
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
];

const EMPTY_STATS: Stats = {
  total: 0,
  bkash: 0,
  offline: 0,
  other: 0,
  students: 0,
};

const currency = (value: number) =>
  `৳${new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 2,
  }).format(value)}`;

const safeAmount = (value: unknown) => {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
};

const percentage = (value: number, total: number) =>
  total > 0
    ? Math.min(100, Math.max(0, Math.round((value / total) * 100)))
    : 0;

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {name === "wallet" && (
        <>
          <rect x="3" y="6" width="18" height="15" rx="2" />
          <path d="M3 10h18M7 6V4a2 2 0 0 1 2-2h9v4" />
          <path d="M16 15h3" />
        </>
      )}

      {name === "users" && (
        <>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      )}

      {name === "phone" && (
        <>
          <rect x="5" y="2" width="14" height="20" rx="3" />
          <path d="M10 18h4" />
          <path d="M8 6h8" />
        </>
      )}

      {name === "cash" && (
        <>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <circle cx="12" cy="12" r="3" />
          <path d="M6 9h.01M18 15h.01" />
        </>
      )}

      {name === "calendar" && (
        <>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </>
      )}

      {name === "refresh" && (
        <>
          <path d="M20 11a8 8 0 0 0-14-5L4 8" />
          <path d="M4 4v4h4" />
          <path d="M4 13a8 8 0 0 0 14 5l2-2" />
          <path d="M16 16h4v4" />
        </>
      )}

      {name === "arrow" && (
        <>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </>
      )}

      {name === "chart" && (
        <>
          <path d="M3 3v18h18" />
          <path d="m7 16 5-5 4 3 5-7" />
        </>
      )}

      {name === "check" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 3 3 5-6" />
        </>
      )}

      {name === "clock" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      )}

      {name === "graduation" && (
        <>
          <path d="m2 10 10-5 10 5-10 5-10-5Z" />
          <path d="M6 12v5c4 3 8 3 12 0v-5" />
          <path d="M22 10v7" />
        </>
      )}
    </svg>
  );
}

const THEMES = {
  blue: {
    line: "bg-sky-400",
    icon: "bg-sky-400/10 text-sky-400 border-sky-400/20",
    glow: "bg-sky-500/10",
  },
  green: {
    line: "bg-emerald-400",
    icon: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    glow: "bg-emerald-500/10",
  },
  purple: {
    line: "bg-violet-400",
    icon: "bg-violet-400/10 text-violet-400 border-violet-400/20",
    glow: "bg-violet-500/10",
  },
  amber: {
    line: "bg-amber-400",
    icon: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    glow: "bg-amber-500/10",
  },
};

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  theme,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: IconName;
  theme: keyof typeof THEMES;
}) {
  const style = THEMES[theme];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#23324b] bg-[#101b2e] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/30 hover:shadow-xl hover:shadow-black/20 sm:p-6">
      <div className={`absolute left-5 top-0 h-[2px] w-14 ${style.line}`} />

      <div
        className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full blur-3xl ${style.glow}`}
      />

      <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl border ${style.icon}`}>
        <Icon name={icon} className="h-6 w-6" />
      </div>

      <div className="relative mt-6">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <h3 className="mt-2 break-words text-3xl font-bold tracking-tight text-white">
          {value}
        </h3>
        <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function ProgressBar({
  value,
  color = "bg-sky-400",
}: {
  value: number;
  color?: string;
}) {
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-[#26354e]"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function PaymentDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toLocaleString("en-US", {
      month: "long",
      timeZone: "Asia/Dhaka",
    })
  );

  const [selectedYear, setSelectedYear] = useState(() =>
    Number(
      new Date().toLocaleString("en-US", {
        year: "numeric",
        timeZone: "Asia/Dhaka",
      })
    )
  );

  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [classStats, setClassStats] = useState<ClassStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        // Both queries run together.
        const [paymentResponse, studentResponse] = await Promise.all([
          supabase
            .from("payments")
            .select("student_id, amount, payment_method")
            .eq("month", selectedMonth)
            .eq("year", selectedYear)
            .eq("status", "paid"),

          supabase
            .from("students")
            .select("id, class")
            .eq("status", "approved"),
        ]);

        if (!active) return;

        if (paymentResponse.error) {
          throw new Error(paymentResponse.error.message);
        }

        if (studentResponse.error) {
          throw new Error(studentResponse.error.message);
        }

        const payments = (paymentResponse.data ?? []) as Payment[];
        const students = (studentResponse.data ?? []) as Student[];

        const total = payments.reduce(
          (sum, payment) => sum + safeAmount(payment.amount),
          0
        );

        const bkash = payments
          .filter(
            (payment) =>
              payment.payment_method?.trim().toLowerCase() === "bkash"
          )
          .reduce(
            (sum, payment) => sum + safeAmount(payment.amount),
            0
          );

        const offline = payments
          .filter(
            (payment) =>
              payment.payment_method?.trim().toLowerCase() === "offline"
          )
          .reduce(
            (sum, payment) => sum + safeAmount(payment.amount),
            0
          );

        const paidStudentIds = new Set(
          payments
            .map((payment) => payment.student_id)
            .filter((id): id is string => Boolean(id))
        );

        setStats({
          total,
          bkash,
          offline,
          other: Math.max(0, total - bkash - offline),
          students: paidStudentIds.size,
        });

        // Calculate class statistics locally.
        // No query with an empty .in() array.
        const result: ClassStat[] = CLASSES.map((className) => {
          const classStudents = students.filter(
            (student) => student.class === className
          );

          const totalStudents = classStudents.length;

          const paid = classStudents.filter((student) =>
            paidStudentIds.has(student.id)
          ).length;

          return {
            className,
            total: totalStudents,
            paid,
            unpaid: totalStudents - paid,
            percentage: percentage(paid, totalStudents),
          };
        });

        setClassStats(result);
      } catch (err) {
        if (!active) return;

        setStats(EMPTY_STATS);
        setClassStats([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load payment statistics."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [selectedMonth, selectedYear, refreshKey]);

  const years = [
    selectedYear - 1,
    selectedYear,
    selectedYear + 1,
    selectedYear + 2,
  ];

  const totalApproved = classStats.reduce(
    (sum, item) => sum + item.total,
    0
  );

  const paidApproved = classStats.reduce(
    (sum, item) => sum + item.paid,
    0
  );

  const totalUnpaid = classStats.reduce(
    (sum, item) => sum + item.unpaid,
    0
  );

  const collectionRate = percentage(paidApproved, totalApproved);

  const channels = [
    {
      name: "bKash",
      amount: stats.bkash,
      color: "bg-violet-400",
      dot: "bg-violet-400",
    },
    {
      name: "Offline",
      amount: stats.offline,
      color: "bg-sky-400",
      dot: "bg-sky-400",
    },
    ...(stats.other > 0
      ? [{
          name: "Other Methods",
          amount: stats.other,
          color: "bg-amber-400",
          dot: "bg-amber-400",
        }]
      : []),
  ];

  const refresh = () => setRefreshKey((value) => value + 1);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080f1d] text-slate-100">
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-40 top-32 h-80 w-80 rounded-full bg-blue-600/10 blur-[110px]" />
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-sky-500/5 blur-[110px]" />

      {/* TOP NAVIGATION */}
      <header className="relative z-10 border-b border-[#1d2c44] bg-[#0b1525]/90">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              aria-label="Back to admin dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#293b55] bg-[#142139] text-slate-300 transition hover:border-sky-500/40 hover:text-white"
            >
              <Icon name="arrow" />
            </Link>

            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-sky-400">
                THE CURIOUS CLASSROOM
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                Financial Collection Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-[#293b55] bg-[#142139] px-4 py-2.5 text-xs text-slate-300 sm:flex">
              <Icon name="calendar" className="h-4 w-4 text-sky-400" />
              {selectedMonth} {selectedYear}
            </div>

            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-[#293b55] bg-[#142139] px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-[#1c2d49] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon
                name="refresh"
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1500px] space-y-9 px-5 py-9 sm:px-8 lg:px-10">

        {/* PAGE TITLE */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-7 bg-sky-400" />
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-400">
              Finance Control Center
            </span>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Monthly <span className="text-[#55a6ff]">Collection</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                Track student payments, monitor class-wise collection,
                and review your monthly financial activity.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-xs text-sky-300">
              <Icon name="chart" className="h-4 w-4" />
              Collection Analytics
            </div>
          </div>
        </section>

        {/* FILTER PANEL */}
        <section className="rounded-2xl border border-[#23324b] bg-[#101b2e] p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-base font-semibold text-white">
                Reporting Period
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Select a month and year to view collection statistics.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div>
                <label
                  htmlFor="collection-month"
                  className="mb-2 block text-xs font-medium text-slate-400"
                >
                  Month
                </label>
                <select
                  id="collection-month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full min-w-[175px] rounded-xl border border-[#30415e] bg-[#0b1525] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 sm:w-auto"
                >
                  {MONTHS.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="collection-year"
                  className="mb-2 block text-xs font-medium text-slate-400"
                >
                  Year
                </label>
                <select
                  id="collection-year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full min-w-[125px] rounded-xl border border-[#30415e] bg-[#0b1525] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 sm:w-auto"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
          >
            <span>Unable to load dashboard: {error}</span>
            <button
              type="button"
              onClick={refresh}
              className="rounded-lg border border-red-400/30 px-4 py-2 font-semibold hover:bg-red-500/10"
            >
              Try Again
            </button>
          </div>
        )}

        {/* KEY STATISTICS */}
        <section>
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-white">
              Collection Overview
            </h2>
            <span className="text-xs text-slate-500">
              {selectedMonth} {selectedYear}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Total Collection"
              value={loading ? "—" : currency(stats.total)}
              subtitle="Total payments received"
              icon="wallet"
              theme="blue"
            />

            <MetricCard
              title="Paid Students"
              value={loading ? "—" : String(stats.students)}
              subtitle="Unique students with paid records"
              icon="users"
              theme="green"
            />

            <MetricCard
              title="bKash Collection"
              value={loading ? "—" : currency(stats.bkash)}
              subtitle="Collected through bKash"
              icon="phone"
              theme="purple"
            />

            <MetricCard
              title="Offline Collection"
              value={loading ? "—" : currency(stats.offline)}
              subtitle="Cash and offline payments"
              icon="cash"
              theme="amber"
            />
          </div>
        </section>

        {/* ANALYTICS */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {/* Payment Channels */}
          <div className="rounded-2xl border border-[#23324b] bg-[#101b2e] p-6">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Payment Channels
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Distribution of received payments
                </p>
              </div>
              <div className="rounded-xl border border-[#29405b] bg-[#17253e] p-2.5 text-sky-400">
                <Icon name="chart" />
              </div>
            </div>

            <div className="space-y-7">
              {channels.map((channel) => {
                const share = stats.total > 0
                  ? Math.max(0, Math.min(100, (channel.amount / stats.total) * 100))
                  : 0;

                return (
                  <div key={channel.name}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${channel.dot}`} />
                        <span className="text-sm font-medium text-slate-300">
                          {channel.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-white">
                        {loading ? "—" : currency(channel.amount)}
                      </span>
                    </div>
                    <ProgressBar
                      value={loading ? 0 : share}
                      color={channel.color}
                    />
                    <p className="mt-2 text-right text-xs text-slate-500">
                      {loading ? "—" : `${share.toFixed(1)}%`}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 border-t border-[#23324b] pt-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Received</span>
                <span className="font-bold text-white">
                  {loading ? "—" : currency(stats.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Collection Health */}
          <div className="rounded-2xl border border-[#23324b] bg-[#101b2e] p-6">
            <div className="mb-7 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Collection Progress
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Approved students in Classes 9–12
                </p>
              </div>
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-2.5 text-emerald-400">
                <Icon name="check" />
              </div>
            </div>

            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <div className="text-4xl font-bold tracking-tight text-white">
                  {loading ? "—" : `${collectionRate}%`}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Students with payments recorded
                </p>
              </div>
              <div className="text-right text-sm text-slate-400">
                <span className="font-bold text-emerald-400">
                  {loading ? "—" : paidApproved}
                </span>
                {" / "}
                {loading ? "—" : totalApproved}
                <p className="mt-1 text-xs text-slate-500">Paid / Approved</p>
              </div>
            </div>

            <ProgressBar value={loading ? 0 : collectionRate} color="bg-emerald-400" />

            <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-xl border border-[#263750] bg-[#0b1525] p-3 text-center">
                <p className="text-[11px] text-slate-500">Approved</p>
                <p className="mt-2 text-xl font-bold text-white">
                  {loading ? "—" : totalApproved}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-3 text-center">
                <p className="text-[11px] text-emerald-300">Paid</p>
                <p className="mt-2 text-xl font-bold text-emerald-400">
                  {loading ? "—" : paidApproved}
                </p>
              </div>
              <div className="rounded-xl border border-amber-400/15 bg-amber-400/5 p-3 text-center">
                <p className="text-[11px] text-amber-300">Unpaid</p>
                <p className="mt-2 text-xl font-bold text-amber-400">
                  {loading ? "—" : totalUnpaid}
                </p>
              </div>
            </div>

            <p className="mt-5 text-xs leading-5 text-slate-500">
              Paid status is based on recorded payments for the selected month.
            </p>
          </div>
        </section>

        {/* CLASS-WISE STATUS */}
        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">
                Class-wise Payment Status
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Track individual class collection performance.
              </p>
            </div>
            <span className="rounded-full border border-[#293b55] bg-[#111e32] px-4 py-2 text-xs text-slate-400">
              4 Academic Classes
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {(loading
              ? CLASSES.map((className): ClassStat => ({
                  className,
                  total: 0,
                  paid: 0,
                  unpaid: 0,
                  percentage: 0,
                }))
              : classStats
            ).map((item) => (
              <div
                key={item.className}
                className="group rounded-2xl border border-[#23324b] bg-[#101b2e] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/30 sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-400/10 text-sky-400">
                    <Icon name="graduation" className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold text-sky-400">
                    {loading ? "—" : `${item.percentage}% Paid`}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold text-white">
                  {item.className}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Monthly payment overview
                </p>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#23324b] pb-3">
                    <span className="text-sm text-slate-400">Total Students</span>
                    <span className="text-base font-bold text-white">
                      {loading ? "—" : item.total}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Paid
                    </span>
                    <span className="font-bold text-emerald-400">
                      {loading ? "—" : item.paid}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="h-2 w-2 rounded-full bg-rose-400" />
                      Unpaid
                    </span>
                    <span className="font-bold text-rose-400">
                      {loading ? "—" : item.unpaid}
                    </span>
                  </div>

                  <div className="pt-2">
                    <ProgressBar
                      value={loading ? 0 : item.percentage}
                      color="bg-sky-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MONTHLY INSIGHT */}
        <section className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-r from-[#142a50] to-[#10203b] p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-300/20 bg-blue-300/10 text-blue-300">
              <Icon name="chart" className="h-6 w-6" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">
                Monthly Insights
              </p>

              <h3 className="mt-2 text-lg font-bold text-white">
                {loading
                  ? "Analyzing collection data..."
                  : totalApproved === 0
                    ? "No approved students in the listed classes"
                    : totalUnpaid === 0
                      ? "All approved students have paid!"
                      : `${totalUnpaid} students still have unpaid status`}
              </h3>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                {loading
                  ? "Fetching the latest data for your selected reporting period."
                  : totalUnpaid > 0
                    ? `The recorded payment rate is ${collectionRate}% for ${selectedMonth} ${selectedYear}. Review outstanding student payments to improve collection performance.`
                    : "Review monthly collection trends regularly and maintain accurate payment records."}
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="flex flex-col justify-between gap-3 border-t border-[#1d2c44] pb-4 pt-6 text-xs text-slate-500 sm:flex-row">
          <span>© The Curious Classroom · Financial Management</span>
          <span>Collection data from Supabase</span>
        </footer>
      </div>
    </main>
  );
}
