
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ConsecutiveAbsentSection from "@/components/ConsecutiveAbsentSection";



import {
  LayoutDashboard,
  Users,
  UserCheck,
  Clock3,
  BarChart3,
  CreditCard,
  Wallet,
  ClipboardCheck,
  BookOpen,
    Video,
  Bot,
  Dna,
  CalendarDays,
  GraduationCap,
  School,
  ShieldCheck,
  LogOut,
  ArrowUpRight,
  ChevronRight,
  Menu,
  X,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
  Sparkles,
    ListChecks,  
        
  type LucideIcon,
} from "lucide-react";

// =====================================
// TYPES
// =====================================

type DashboardStats = {
  totalStudents: number;
  approvedStudents: number;
  pendingStudents: number;
  totalResults: number;
};

type Tone = "blue" | "green" | "amber" | "purple";

type DashboardAction = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: Tone;
  category: string;
};

// =====================================
// THEME
// =====================================

const tones = {
  blue: {
    icon: "bg-blue-500/10 text-blue-400 border-blue-400/15",
    line: "bg-blue-400",
  },

  green: {
    icon: "bg-emerald-500/10 text-emerald-400 border-emerald-400/15",
    line: "bg-emerald-400",
  },

  amber: {
    icon: "bg-amber-500/10 text-amber-400 border-amber-400/15",
    line: "bg-amber-400",
  },

  purple: {
    icon: "bg-violet-500/10 text-violet-400 border-violet-400/15",
    line: "bg-violet-400",
  },
};

// =====================================
// ALL EXISTING ACTION ROUTES
// =====================================

const actions: DashboardAction[] = [
  {
    title: "Monthly Payment",
    description: "Manage student monthly payments",
    href: "/admin/payment",
    icon: CreditCard,
    tone: "blue",
    category: "FINANCE",
  },

  {
    title: "Collection Dashboard",
    description: "View monthly payment collection",
    href: "/admin/payment/dashboard",
    icon: Wallet,
    tone: "green",
    category: "FINANCE",
  },


{
  title: "Personal Finance",
  description: "Track income, expenses & cash flow",
  href: "/admin/finance",
  icon: Wallet,
  tone: "green",   // 👈 emerald থেকে green এ বদলানো হলো
  category: "FINANCE",
},





  {
    title: "Manage Result",
    description: "Update and manage student results",
    href: "/admin/result/manage",
    icon: BarChart3,
    tone: "purple",
    category: "ACADEMIC",
  },

  {
    title: "Attendance Management",
    description: "Manage student attendance",
    href: "/admin/attendance",
    icon: ClipboardCheck,
    tone: "green",
    category: "ACADEMIC",
  },

  {
    title: "Class Notes",
    description: "Manage class notes & marked books",
    href: "/admin/notes",
    icon: BookOpen,
    tone: "blue",
    category: "LEARNING",
  },






  {
    title: "Upload Recorded Classes",
    description: "Upload lectures & lock / unlock access",
    href: "/admin/recorded-classes",
    icon: Video,
    tone: "purple",
    category: "LEARNING",
  },



  {
    title: "AI Question Generator",
    description: "Generate Biology MCQ, SAQ & CQ",
    href: "/admin/biology/ai-generator",
    icon: Bot,
    tone: "purple",
    category: "AI TOOLS",
  },

  {
    title: "Chapter Management",
    description: "Manage Biology chapters & AI content",
    href: "/admin/biology/chapters",
    icon: Dna,
    tone: "green",
    category: "BIOLOGY",
  },

  {
    title: "Class Time Management",
    description: "Manage class schedules",
    href: "/admin/schedule",
    icon: CalendarDays,
    tone: "amber",
    category: "ACADEMIC",
  },


  {
    title: "Exam Schedule",
    description: "Manage exam dates & schedule",
    href: "/admin/exam",
    icon: ListChecks,
    tone: "amber",
    category: "ACADEMIC",
  },




  {
    title: "Student Management",
    description: "Manage students",
    href: "/admin/student",
    icon: GraduationCap,
    tone: "blue",
    category: "STUDENTS",
  },

  {
    title: "Admission Management",
    description: "Control student admission",
    href: "/admin/admission",
    icon: School,
    tone: "purple",
    category: "ADMISSIONS",
  },
];

// =====================================
// EXISTING SUPABASE STATISTICS
// =====================================

async function getDashboardStats(): Promise<DashboardStats> {
  const [
    totalStudents,
    approvedStudents,
    pendingStudents,
    totalResults,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("students")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "approved"),

    supabase
      .from("students")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "pending"),

    supabase
      .from("results")
      .select("*", {
        count: "exact",
        head: true,
      }),
  ]);

  if (
    totalStudents.error ||
    approvedStudents.error ||
    pendingStudents.error ||
    totalResults.error
  ) {
    throw new Error("Failed to load dashboard statistics");
  }

  return {
    totalStudents: totalStudents.count ?? 0,
    approvedStudents: approvedStudents.count ?? 0,
    pendingStudents: pendingStudents.count ?? 0,
    totalResults: totalResults.count ?? 0,
  };
}

// =====================================
// MAIN DASHBOARD
// =====================================

export default function AdminDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState("");

  // =====================================
  // AUTHENTICATION + INITIAL STATS
  // =====================================

  useEffect(() => {
    let active = true;

    async function initializeDashboard() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          if (active) {
            localStorage.removeItem("admin");
            router.replace("/admin/login");
          }
          return;
        }

        // Existing admin role verification
        const {
          data: admin,
          error: adminError,
        } = await supabase
          .from("admins")
          .select("*")
          .eq("auth_user_id", session.user.id)
          .single();

        if (
          adminError ||
          !admin ||
          admin.role !== "admin"
        ) {
          await supabase.auth.signOut();

          if (active) {
            localStorage.removeItem("admin");
            router.replace("/admin/login");
          }

          return;
        }

        const newStats = await getDashboardStats();

        if (active) {
          setStats(newStats);
        }
      } catch (err) {
        console.error("Dashboard error:", err);

        if (active) {
          setError(
            "Dashboard information could not be loaded."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void initializeDashboard();

    return () => {
      active = false;
    };
  }, [router]);

  // =====================================
  // REFRESH STATISTICS
  // =====================================

  async function refreshStats() {
    if (refreshing) return;

    setRefreshing(true);
    setError("");

    try {
      const newStats = await getDashboardStats();
      setStats(newStats);
    } catch (err) {
      console.error("Refresh error:", err);
      setError("Statistics refresh failed. Try again.");
    } finally {
      setRefreshing(false);
    }
  }

  // =====================================
  // ORIGINAL LOGOUT FUNCTION
  // =====================================

  async function logout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");

    try {
      const { error: logoutError } =
        await supabase.auth.signOut();

      if (logoutError) {
        throw logoutError;
      }

      localStorage.removeItem("admin");

      router.replace("/admin/login");
    } catch (err) {
      console.error("Logout error:", err);
      setError("Logout failed. Please try again.");
      setLoggingOut(false);
    }
  }

  // =====================================
  // LOADING SCREEN
  // =====================================

  if (loading) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-[#080D19] px-6 text-white">

        <div className="mb-7 rounded-2xl bg-white px-5 py-3">
          <Image
            src="/logo.png"
            alt="The Curious Classroom"
            width={160}
            height={60}
            priority
            className="h-auto w-36"
          />
        </div>

        <LoaderCircle
          size={28}
          className="animate-spin text-blue-400"
        />

        <p className="mt-5 text-sm text-slate-400">
          Loading Admin Dashboard...
        </p>

      </main>
    );
  }

  // =====================================
  // STAT CARD DATA
  // =====================================

  const statCards: {
    title: string;
    value: number | null;
    icon: LucideIcon;
    tone: Tone;
    subtitle: string;
  }[] = [
    {
      title: "Total Students",
      value: stats?.totalStudents ?? null,
      icon: Users,
      tone: "blue",
      subtitle: "All registered students",
    },
    {
      title: "Approved Students",
      value: stats?.approvedStudents ?? null,
      icon: UserCheck,
      tone: "green",
      subtitle: "Approved student accounts",
    },
    {
      title: "Pending Admission",
      value: stats?.pendingStudents ?? null,
      icon: Clock3,
      tone: "amber",
      subtitle: "Awaiting approval",
    },
    {
      title: "Total Results",
      value: stats?.totalResults ?? null,
      icon: BarChart3,
      tone: "purple",
      subtitle: "Published result records",
    },
  ];

  return (
    <div className="min-h-dvh bg-[#080D19] text-slate-100">

      {/* Mobile Overlay */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-[275px] flex-col
          border-r border-white/10
          bg-[#0D1627]
          shadow-[20px_0_80px_rgba(0,0,0,0.12)]
          transition-transform duration-300
          lg:translate-x-0
          ${
            menuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* Sidebar Brand */}
        <div className="border-b border-white/[0.07] px-5 py-7">

          <div className="flex items-start justify-between gap-3">

            <Link
              href="/admin/dashboard"
              onClick={() => setMenuOpen(false)}
              className="inline-flex rounded-xl bg-white px-3 py-2"
            >
              <Image
                src="/logo.png"
                alt="The Curious Classroom"
                width={150}
                height={60}
                priority
                className="h-auto w-[135px] object-contain"
              />
            </Link>

            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X size={20} />
            </button>

          </div>

          <div className="mt-5">

            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-400">
              THE CURIOUS CLASSROOM
            </p>

            <p className="mt-2 text-base font-semibold text-white">
              Admin Workspace
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Education Management System
            </p>

          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav
          aria-label="Admin navigation"
          className="flex-1 space-y-7 overflow-y-auto px-3 py-6"
        >

          <div>

            <p className="mb-3 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              OVERVIEW
            </p>

            <Link
              href="/admin/dashboard"
              onClick={() => setMenuOpen(false)}
              aria-current="page"
              className="flex items-center gap-3 rounded-xl border border-blue-400/15 bg-blue-600/15 px-4 py-3 text-sm font-semibold text-blue-300"
            >
              <LayoutDashboard size={18} />

              Dashboard

              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />
            </Link>

          </div>

          <div>

            <p className="mb-3 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              MANAGEMENT
            </p>

            <div className="space-y-1">

              {actions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-medium text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                  >
                    <Icon
                      size={18}
                      className="shrink-0 text-slate-500 transition-colors group-hover:text-blue-300"
                    />

                    <span className="flex-1">
                      {action.title}
                    </span>

                    <ChevronRight
                      size={14}
                      className="shrink-0 opacity-0 transition group-hover:opacity-100"
                    />
                  </Link>
                );
              })}

            </div>
          </div>

        </nav>

        {/* Sidebar Bottom */}
        <div className="border-t border-white/10 p-4">

          <div className="mb-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                <ShieldCheck size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-white">
                  Administrator
                </p>
                <p className="text-[11px] text-slate-500">
                  Authorized Access
                </p>
              </div>

            </div>

          </div>

          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-400/10 disabled:opacity-50"
          >
            {loggingOut ? (
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
            ) : (
              <LogOut size={18} />
            )}

            {loggingOut ? "Logging out..." : "Logout"}
          </button>

        </div>

      </aside>

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <div className="min-h-dvh lg:ml-[275px]">

        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#0A1120]/95 backdrop-blur-xl">

          <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">

            <div className="flex min-w-0 items-center gap-4">

              {/* Mobile Menu Button */}
              <button
                type="button"
                aria-label="Open navigation menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/5 lg:hidden"
              >
                <Menu size={21} />
              </button>

              <div className="min-w-0">

                <p className="text-[11px] font-medium tracking-wide text-slate-500">
                  THE CURIOUS CLASSROOM
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-slate-100">
                  Administration Dashboard
                </p>

              </div>
            </div>

            {/* Header Right */}
            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={refreshStats}
                disabled={refreshing}
                aria-label="Refresh dashboard statistics"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 text-sm font-medium text-slate-300 transition hover:border-blue-400/30 hover:bg-white/5 hover:text-white disabled:opacity-50 sm:px-4"
              >

                <RefreshCw
                  size={16}
                  className={
                    refreshing ? "animate-spin" : ""
                  }
                />

                <span className="hidden sm:inline">
                  Refresh
                </span>

              </button>

              <div className="hidden h-9 w-px bg-white/10 sm:block" />

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/10 text-blue-300">
                <ShieldCheck size={19} />
              </div>

            </div>

          </div>

        </header>

        {/* DASHBOARD BODY */}
        <main className="relative mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

          {/* Subtle Background Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 -z-0 h-80 w-80 rounded-full bg-blue-600/[0.06] blur-[100px]"
          />

          <div className="relative z-10">

            {/* Welcome Heading */}
            <section>

              <div className="mb-5 flex items-center gap-3">

                <span className="h-px w-7 bg-blue-400" />

                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-blue-300">
                  ADMIN CONTROL CENTER
                </span>

              </div>

              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

                <div>

                  <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Dashboard{" "}
                    <span className="text-blue-400">
                      Overview
                    </span>
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                    Welcome to The Curious Classroom.
                    Manage your students, academic
                    activities and daily operations
                    from one place.
                  </p>

                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-blue-400/15 bg-blue-500/[0.07] px-4 py-2.5">

                  <Sparkles
                    size={16}
                    className="text-blue-300"
                  />

                  <span className="text-xs font-medium text-blue-200">
                    Smart Education Management
                  </span>

                </div>

              </div>

            </section>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mt-7 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-4"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-red-300"
                />

                <p className="text-sm leading-6 text-red-200">
                  {error}
                </p>
              </div>
            )}

            {/* =====================================
                STATISTICS
            ===================================== */}

            <section
              aria-labelledby="stats-heading"
              className="mt-10"
            >

              <div className="mb-5 flex items-center justify-between gap-3">

                <h2
                  id="stats-heading"
                  className="text-lg font-semibold text-white"
                >
                  Key Statistics
                </h2>

                <p className="text-xs text-slate-500">
                  Supabase Database
                </p>

              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {statCards.map((card) => (
                  <StatCard
                    key={card.title}
                    {...card}
                  />
                ))}

              </div>

            </section>

            {/* =====================================
                BRAND BANNER
            ===================================== */}

            <section className="relative mt-8 overflow-hidden rounded-3xl border border-blue-400/10 bg-gradient-to-r from-[#12244B] via-[#142B55] to-[#10203E] p-6 sm:p-8">

              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full bg-blue-500/15 blur-[70px]"
              />

              <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">

                <div className="flex items-start gap-4">

                  <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-blue-200 sm:flex">
                    <GraduationCap size={24} />
                  </div>

                  <div>

                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300">
                      THE CURIOUS CLASSROOM
                    </p>

                    <h2 className="mt-3 text-lg font-semibold text-white sm:text-xl">
                      শিক্ষা ব্যবস্থাপনায় নতুন অভিজ্ঞতা
                    </h2>

                    <p className="mt-2 max-w-lg text-sm leading-6 text-blue-100/65">
                      A smarter workspace for managing
                      academic operations and student success.
                    </p>

                  </div>

                </div>

                <div className="shrink-0 rounded-xl bg-white px-4 py-3">

                  <Image
                    src="/shishir-bioverse.png"
                    alt="Shishir BioVerse"
                    width={150}
                    height={65}
                    className="h-auto w-[135px] object-contain"
                  />

                </div>

              </div>

            </section>

            {/* =====================================
                QUICK ACTIONS
            ===================================== */}

            <section
              aria-labelledby="actions-heading"
              className="mt-12"
            >

              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">

                <div>

                  <div className="mb-3 flex items-center gap-3">

                    <span className="h-px w-7 bg-blue-400" />

                    <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-blue-300">
                      WORKSPACE TOOLS
                    </span>

                  </div>

                  <h2
                    id="actions-heading"
                    className="text-2xl font-semibold text-white"
                  >
                    Quick Actions
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Access all your management tools
                    from one workspace.
                  </p>

                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs text-slate-400">

                  <LayoutDashboard size={15} />

                  {actions.length} Management Tools

                </div>

              </div>

                         {/* Action Cards */}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                {actions.map((action) => (
                  <ActionCard
                    key={action.href}
                    action={action}
                  />
                ))}

              </div>

            </section>

            {/* Consecutive Absent + Locked Profiles */}
            <section className="mt-12">
              <ConsecutiveAbsentSection />
            </section>








            {/* Bottom Security Message */}
            <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/[0.07] bg-[#101A2C]/70 p-5 sm:flex-row sm:items-center">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                  <ShieldCheck size={20} />
                </div>

                <div>

                  <p className="text-sm font-medium text-slate-200">
                    Administrator Workspace
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    This workspace is intended for
                    authorized administrators only.
                  </p>

                </div>

              </div>

              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-300 transition hover:text-blue-200"
              >
                Visit Website
                <ArrowUpRight size={16} />
              </Link>

            </div>

          </div>

        </main>

        {/* FOOTER */}
        <footer className="mx-auto mt-6 max-w-[1500px] border-t border-white/[0.07] px-5 py-6 sm:px-8 lg:px-10">

          <div className="flex flex-col justify-between gap-2 text-xs text-slate-500 sm:flex-row">

            <p>
              © {new Date().getFullYear()} The Curious Classroom
            </p>

            <p>
              Powered by Shishir BioVerse
            </p>

          </div>

        </footer>

      </div>

    </div>
  );
}

// =====================================
// PREMIUM STATISTIC CARD
// =====================================

function StatCard({
  icon: Icon,
  title,
  value,
  tone,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  value: number | null;
  tone: Tone;
  subtitle: string;
}) {
  const style = tones[tone];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101A2C] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400/20 hover:bg-[#142039] sm:p-6">

      {/* Top Accent */}
      <span
        aria-hidden="true"
        className={`absolute left-6 top-0 h-[2px] w-12 rounded-full ${style.line}`}
      />

      <div className="flex items-start justify-between">

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${style.icon}`}
        >
          <Icon size={23} strokeWidth={1.7} />
        </div>

        <div className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[10px] text-slate-500">
          Overview
        </div>

      </div>

      <p className="mt-6 text-sm font-medium text-slate-400">
        {title}
      </p>

      <h3 className="mt-2 text-4xl font-semibold tracking-tight text-white">
        {value === null
          ? "—"
          : value.toLocaleString("en-US")}
      </h3>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        {subtitle}
      </p>

    </div>
  );
}

// =====================================
// PREMIUM ACTION CARD
// =====================================

function ActionCard({
  action,
}: {
  action: DashboardAction;
}) {
  const Icon = action.icon;
  const style = tones[action.tone];

  return (
    <Link
      href={action.href}
      className="group relative flex min-h-[215px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101A2C] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/25 hover:bg-[#14213A] hover:shadow-[0_18px_45px_rgba(0,0,0,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
    >

      {/* Card Header */}
      <div className="flex items-start justify-between gap-4">

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${style.icon}`}
        >
          <Icon size={23} strokeWidth={1.7} />
        </div>

        <ArrowUpRight
          size={19}
          className="text-slate-600 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-300"
        />

      </div>

      {/* Category */}
      <p className="mt-5 text-[10px] font-semibold tracking-[0.17em] text-slate-500">
        {action.category}
      </p>

      {/* Title */}
      <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">
        {action.title}
      </h3>

      {/* Description */}
      <p className="mt-2 text-sm leading-6 text-slate-400">
        {action.description}
      </p>

      {/* Bottom Action */}
      <div className="mt-auto flex items-center gap-2 pt-6 text-sm font-semibold text-blue-300">

        Open Module

        <ChevronRight
          size={17}
          className="transition-transform group-hover:translate-x-1"
        />

      </div>

    </Link>
  );
}
