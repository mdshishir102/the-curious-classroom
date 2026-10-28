// app/admin/attendance/page.tsx

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  CalendarDays,
  Clock,
  Radio,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  LayoutGrid,
} from "lucide-react";

function timeToMinutes(time: string) {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

function formatTime(time: string) {
  if (!time) return "";
  return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

type ClassStatus = "upcoming" | "ongoing" | "completed";

function getStatus(
  nowMin: number,
  startMin: number,
  endMin: number
): ClassStatus {
  if (nowMin < startMin) return "upcoming";
  if (nowMin >= startMin && nowMin <= endMin) return "ongoing";
  return "completed";
}

export default async function AttendancePage() {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Dhaka",
  });

  const todayLabel = new Date().toLocaleDateString("en-US", {
    timeZone: "Asia/Dhaka",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const nowClock = new Date().toLocaleTimeString("en-US", {
    timeZone: "Asia/Dhaka",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const nowTimeStr = new Date().toLocaleTimeString("en-GB", {
    timeZone: "Asia/Dhaka",
    hour12: false,
  });
  const nowMinutes = timeToMinutes(nowTimeStr);

  const { data: schedules, error } = await supabase
    .from("class_schedules")
    .select("*")
    .eq("schedule_date", today)
    .order("start_time", { ascending: true });

  const enriched = (schedules || []).map((item: any) => {
    const startMin = timeToMinutes(item.start_time);
    const endMin = timeToMinutes(item.end_time);
    const status = getStatus(nowMinutes, startMin, endMin);
    const progress =
      status === "ongoing"
        ? Math.min(
            100,
            Math.max(0, ((nowMinutes - startMin) / (endMin - startMin || 1)) * 100)
          )
        : 0;
    return { ...item, status, progress };
  });

  const ongoingCount = enriched.filter((c) => c.status === "ongoing").length;
  const upcomingList = enriched.filter((c) => c.status === "upcoming");
  const completedCount = enriched.filter((c) => c.status === "completed").length;
  const nextClassId = upcomingList.length > 0 ? upcomingList[0].id : null;

  const statusMeta: Record<
    ClassStatus,
    { label: string; dot: string; badge: string }
  > = {
    ongoing: {
      label: "লাইভ চলছে",
      dot: "bg-emerald-400",
      badge: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
    },
    upcoming: {
      label: "আসছে",
      dot: "bg-blue-400",
      badge: "bg-blue-500/10 text-blue-300 border-blue-400/15",
    },
    completed: {
      label: "সম্পন্ন",
      dot: "bg-slate-500",
      badge: "bg-white/5 text-slate-400 border-white/10",
    },
  };

  return (
    <main className="min-h-screen bg-[#080D19] p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="card-lift rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)] p-6 mb-8 flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
          <div className="flex items-center gap-5">
            <img src="/logo.png" className="h-16 w-auto object-contain" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                The Curious Classroom
              </h1>
              <p className="text-slate-400 mt-1 text-sm">
                Attendance Management Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#0B1425] px-4 py-3 text-sm text-slate-300">
            <CalendarDays className="h-4 w-4 text-blue-300" />
            <span>{todayLabel}</span>
            <span className="text-slate-600">•</span>
            <Clock className="h-4 w-4 text-blue-300" />
            <span>{nowClock}</span>
          </div>
        </div>

        {/* SUMMARY STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="card-lift rounded-2xl border border-white/[0.08] bg-[#101A2C] p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide">
              <LayoutGrid className="h-3.5 w-3.5 text-blue-300" />
              মোট ক্লাস
            </div>
            <p className="text-2xl font-semibold text-white mt-2">
              {enriched.length}
            </p>
          </div>
          <div className="card-lift rounded-2xl border border-emerald-400/15 bg-[#101A2C] p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide">
              <Radio className="h-3.5 w-3.5 text-emerald-300" />
              লাইভ এখন
            </div>
            <p className="text-2xl font-semibold text-emerald-300 mt-2">
              {ongoingCount}
            </p>
          </div>
          <div className="card-lift rounded-2xl border border-blue-400/15 bg-[#101A2C] p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide">
              <Clock className="h-3.5 w-3.5 text-blue-300" />
              আসন্ন
            </div>
            <p className="text-2xl font-semibold text-blue-300 mt-2">
              {upcomingList.length}
            </p>
          </div>
          <div className="card-lift rounded-2xl border border-white/[0.08] bg-[#101A2C] p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide">
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
              সম্পন্ন
            </div>
            <p className="text-2xl font-semibold text-slate-300 mt-2">
              {completedCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <span className="h-px w-7 bg-blue-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
            Today's Schedule
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6">
          আজকের একটিভ ক্লাসসমূহ
        </h2>

        {error && (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 text-red-300 p-4 mb-6 text-sm">
            শিডিউল লোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।
          </div>
        )}

        {!enriched || enriched.length === 0 ? (
          <div className="card-lift rounded-3xl border border-white/[0.08] bg-[#101A2C] p-10 text-center text-slate-400">
            <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            আজকের জন্য কোনো ক্লাস শিডিউল করা নেই
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enriched.map((item: any) => {
              const meta = statusMeta[item.status as ClassStatus];
              const isNext = item.id === nextClassId;
              const isCompleted = item.status === "completed";

              return (
                <div
                  key={item.id}
                  className={`card-lift rounded-3xl border bg-[#101A2C] p-6 transition hover:-translate-y-1 ${
                    isNext
                      ? "border-blue-400/40 ring-1 ring-blue-400/30"
                      : "border-white/[0.09]"
                  } ${isCompleted ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`h-14 w-14 rounded-2xl flex items-center justify-center border ${meta.badge}`}
                    >
                      {item.status === "ongoing" ? (
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
                        </span>
                      ) : (
                        <BookOpen className="h-6 w-6" />
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${meta.badge}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                      {isNext && (
                        <span className="text-[11px] font-medium text-blue-300">
                          পরবর্তী ক্লাস
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-white mt-5">
                    {item.class_name}
                  </h3>
                  <p className="text-blue-300 font-medium mt-1">
                    {item.subject}
                  </p>

                  <div className="mt-4 rounded-2xl border border-white/[0.06] bg-[#0B1425] p-4 space-y-2 text-sm text-slate-300">
                    <p className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-slate-500" />
                      {item.schedule_date}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      {formatTime(item.start_time)} - {formatTime(item.end_time)}
                    </p>
                    {item.topic && (
                      <p className="flex items-center gap-2 text-slate-400">
                        <BookOpen className="h-4 w-4 text-slate-500" />
                        {item.topic}
                      </p>
                    )}
                  </div>

                  {item.status === "ongoing" && (
                    <div className="mt-4">
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>ক্লাস চলছে</span>
                        <span>{Math.round(item.progress)}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-400 transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/admin/attendance/${item.class_name.replace(
                      " ",
                      "-"
                    )}/${item.id}`}
                    className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-blue-500/10 border border-blue-400/20 text-blue-300 py-3 font-medium hover:bg-blue-500/20 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
                  >
                    Take Attendance
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}