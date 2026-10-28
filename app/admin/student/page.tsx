"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  BookOpen,
  Users,
  ArrowRight,
  LoaderCircle,
  ArrowLeft,
  Crown,
  BarChart3,
  GraduationCap,
} from "lucide-react";

export default function AdminStudentPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadStudents() {
    const { data, error } = await supabase
      .from("students")
      .select("id, class")
      .eq("status", "approved");

    if (error) {
      alert(error.message);
      return;
    }

    setStudents(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const classes = ["Class 9", "Class 10", "Class 11", "Class 12"];

  function getClassCount(className: string) {
    return students.filter((student) => student.class === className).length;
  }

  // Color cycle pattern (same as Dashboard Quick Access)
  const colorStyles = [
    {
      icon: "text-blue-300",
      iconBg: "bg-blue-500/10",
      iconBorder: "border-blue-400/15",
      line: "bg-blue-400",
      label: "text-blue-300",
      link: "text-blue-300",
      bar: "bg-blue-400",
    },
    {
      icon: "text-violet-300",
      iconBg: "bg-violet-500/10",
      iconBorder: "border-violet-400/15",
      line: "bg-violet-400",
      label: "text-violet-300",
      link: "text-violet-300",
      bar: "bg-violet-400",
    },
    {
      icon: "text-emerald-300",
      iconBg: "bg-emerald-400/10",
      iconBorder: "border-emerald-400/20",
      line: "bg-emerald-400",
      label: "text-emerald-300",
      link: "text-emerald-300",
      bar: "bg-emerald-400",
    },
    {
      icon: "text-amber-300",
      iconBg: "bg-amber-500/10",
      iconBorder: "border-amber-400/15",
      line: "bg-amber-400",
      label: "text-amber-300",
      link: "text-amber-300",
      bar: "bg-amber-400",
    },
  ];

  const totalApproved = students.length;

  // Extra computed stats
  const classCounts = classes.map((c) => getClassCount(c));
  const maxCount = Math.max(...classCounts, 0);
  const topClassIndex = classCounts.indexOf(maxCount);
  const activeClassesCount = classCounts.filter((c) => c > 0).length;
  const averagePerClass =
    activeClassesCount > 0 ? Math.round(totalApproved / activeClassesCount) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#080D19]">
        <LoaderCircle className="h-8 w-8 animate-spin text-blue-400" />
        <p className="text-sm font-medium text-slate-400">
          Loading Students...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#080D19] p-6">
      <div className="mx-auto max-w-7xl">
        {/* Back link */}
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19] rounded-md"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard-এ ফিরে যাও
        </Link>

        {/* Header */}
        <div className="mt-6 mb-10">
          <div className="flex items-center gap-2">
            <span className="h-px w-7 bg-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              Students
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Student Management
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            ক্লাস অনুযায়ী ছাত্র-ছাত্রীদের তথ্য পরিচালনা করো।
          </p>
        </div>

        {/* Overview stats row */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="card-lift rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)] p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10">
              <Users className="h-6 w-6 text-blue-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Total Approved Students
              </p>
              <p className="text-2xl font-semibold text-white">
                {totalApproved}
              </p>
            </div>
          </div>

          <div className="card-lift rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)] p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
              <GraduationCap className="h-6 w-6 text-emerald-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Active Classes
              </p>
              <p className="text-2xl font-semibold text-white">
                {activeClassesCount}{" "}
                <span className="text-sm font-normal text-slate-500">
                  / {classes.length}
                </span>
              </p>
            </div>
          </div>

          <div className="card-lift rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)] p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/15 bg-amber-500/10">
              <BarChart3 className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Average Per Class
              </p>
              <p className="text-2xl font-semibold text-white">
                {averagePerClass}
              </p>
            </div>
          </div>
        </div>

        {/* Class cards grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {classes.map((item, index) => {
            const style = colorStyles[index % colorStyles.length];
            const count = classCounts[index];
            const percentage =
              totalApproved > 0 ? Math.round((count / totalApproved) * 100) : 0;
            const isTopClass = index === topClassIndex && maxCount > 0;

            return (
              <Link
                key={item}
                href={`/admin/student/${encodeURIComponent(item)}`}
                className="card-lift relative rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)] p-7 transition hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
              >
                {isTopClass && (
                  <span className="absolute -top-2.5 right-5 inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                    <Crown className="h-3 w-3" />
                    Most Students
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${style.iconBorder} ${style.iconBg}`}
                  >
                    <BookOpen className={`h-7 w-7 ${style.icon}`} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                </div>

                <h2 className="mt-5 text-xl font-semibold text-white">
                  {item}
                </h2>

                <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
                  Total Students
                </p>

                <p className="mt-1 text-3xl font-semibold text-white">
                  {count}
                </p>

                {/* Percentage distribution bar */}
                <div className="mt-4">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={`h-full rounded-full ${style.bar} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    মোট ছাত্রের {percentage}%
                  </p>
                </div>

                <div
                  className={`mt-5 inline-flex items-center gap-1 text-sm font-semibold ${style.link}`}
                >
                  View Students
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}