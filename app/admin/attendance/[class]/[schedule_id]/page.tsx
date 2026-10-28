"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Users,
  CheckCircle2,
  Clock3,
  XCircle,
  Search,
  Copy,
  Check,
  Zap,
  LoaderCircle,
} from "lucide-react";

type FilterTab = "all" | "unmarked" | "present" | "late" | "absent";

function getInitials(name: string) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ClassAttendancePage() {
  const params = useParams();

  const className = String(params.class).replaceAll("-", " ");

  const scheduleIdParam = String(params.schedule_id);

  const [scheduleId, setScheduleId] = useState<string | null>(null);

  const [students, setStudents] = useState<any[]>([]);

  const [attendance, setAttendance] = useState<any>({});

  const [saving, setSaving] = useState(false);

  // --- UI-only additions ---
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const presentCount = Object.values(attendance).filter(
    (status: any) => status === "present"
  ).length;

  const lateCount = Object.values(attendance).filter(
    (status: any) => status === "late"
  ).length;

  const absentCount = Object.values(attendance).filter(
    (status: any) => status === "absent"
  ).length;

  const markedCount = Object.keys(attendance).length;
  const progressPercent =
    students.length > 0 ? Math.round((markedCount / students.length) * 100) : 0;

  useEffect(() => {
    async function loadStudents() {
      setLoading(true);

      const { data, error } = await supabase
        .from("students")
        .select(
          `
id,
student_id,
student_name,
student_photo,
class,
batch,
school,
college,
guardian_name,
status
`
        )
        .eq("class", className);

      if (error) {
        console.log(error);
        setLoading(false);
        return;
      }

      const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Dhaka",
      });

      const { data: schedule } = await supabase
        .from("class_schedules")
        .select("id")
        .eq("id", scheduleIdParam)
        .single();

      if (!schedule) {
        setStudents(data || []);
        setLoading(false);
        return;
      }

      setScheduleId(schedule.id);

      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("*")
        .eq("attendance_date", today)
        .eq("class", className)
        .eq("schedule_id", schedule.id);

      const oldAttendance: any = {};

      attendanceData?.forEach((item: any) => {
        const student = data?.find(
          (s: any) => s.student_id === item.student_id
        );

        if (student) {
          oldAttendance[student.id] = item.status;
        }
      });

      setAttendance(oldAttendance);

      setStudents(data || []);
      setLoading(false);
    }

    loadStudents();
  }, [className, scheduleIdParam]);

  function markAttendance(id: number, status: string) {
    setAttendance({
      ...attendance,
      [id]: status,
    });
  }

  async function saveAttendance() {
    if (Object.keys(attendance).length !== students.length) {
      alert("Please mark attendance for all students");

      return;
    }

    setSaving(true);

    const currentScheduleId = scheduleId || scheduleIdParam;

    if (!currentScheduleId) {
      alert("Schedule ID missing");

      setSaving(false);

      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      alert("Admin session expired");

      setSaving(false);

      return;
    }

    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Dhaka",
    });

    const time = new Date().toLocaleTimeString("en-US", {
      timeZone: "Asia/Dhaka",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    for (const student of students) {
      const status = attendance[student.id];

      const { data: existing } = await supabase
        .from("attendance")
        .select("id")
        .eq("student_id", student.student_id)
        .eq("attendance_date", today)
        .eq("schedule_id", currentScheduleId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("attendance")
          .update({
            status: status,
            attendance_time: time,
            taken_by: session.user.id,
          })
          .eq("id", existing.id);

        if (error) {
          console.log(error);
          alert(error.message);
          setSaving(false);
          return;
        }
      } else {
        const { error } = await supabase.from("attendance").insert({
          student_id: student.student_id,
          schedule_id: currentScheduleId,
          attendance_date: today,
          attendance_time: time,
          status: status,
          class: student.class,
          batch: student.batch,
          taken_by: session.user.id,
        });

        if (error) {
          console.log(error);
          alert(error.message);
          setSaving(false);
          return;
        }
      }
    }

    alert("Attendance saved successfully");

    setSaving(false);
  }

  // --- UI-only helpers (does not touch save/validation logic) ---
  function markAllPresent() {
    const updated = { ...attendance };
    students.forEach((s) => {
      if (!updated[s.id]) {
        updated[s.id] = "present";
      }
    });
    setAttendance(updated);
  }

  function copyToClipboard(value: string, id: string) {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      student.student_id?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === "all") return true;
    if (filterTab === "unmarked") return !attendance[student.id];
    return attendance[student.id] === filterTab;
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080D19] flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400">
          <LoaderCircle className="h-5 w-5 animate-spin text-blue-400" />
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080D19] p-6 pb-28">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="card-lift rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)] p-6 mb-8 flex items-center gap-5">
          <img src="/logo.png" className="h-16 w-auto object-contain" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white">
              The Curious Classroom
            </h1>
            <p className="text-slate-400 mt-1">{className} Attendance</p>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card-lift rounded-2xl border border-white/[0.08] bg-[#101A2C] p-5">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide">
              <Users className="h-3.5 w-3.5 text-blue-300" />
              Total Students
            </div>
            <h2 className="text-3xl font-semibold text-white mt-2">
              {students.length}
            </h2>
          </div>

          <div className="card-lift rounded-2xl border border-emerald-400/15 bg-[#101A2C] p-5">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
              Present
            </div>
            <h2 className="text-3xl font-semibold text-emerald-300 mt-2">
              {presentCount}
            </h2>
          </div>

          <div className="card-lift rounded-2xl border border-amber-400/15 bg-[#101A2C] p-5">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide">
              <Clock3 className="h-3.5 w-3.5 text-amber-300" />
              Late
            </div>
            <h2 className="text-3xl font-semibold text-amber-300 mt-2">
              {lateCount}
            </h2>
          </div>

          <div className="card-lift rounded-2xl border border-red-400/15 bg-[#101A2C] p-5">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide">
              <XCircle className="h-3.5 w-3.5 text-red-300" />
              Absent
            </div>
            <h2 className="text-3xl font-semibold text-red-300 mt-2">
              {absentCount}
            </h2>
          </div>
        </div>

        {/* PROGRESS */}
        <div className="card-lift rounded-2xl border border-white/[0.08] bg-[#101A2C] p-5 mb-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Attendance Progress</span>
            <span className="text-white font-medium">
              {markedCount}/{students.length} marked ({progressPercent}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-400 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-2 mr-auto">
            <span className="h-px w-7 bg-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
              Student List
            </span>
          </div>

          <button
            onClick={markAllPresent}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 px-4 py-2 text-sm font-medium hover:bg-emerald-500/20 transition"
          >
            <Zap className="h-4 w-4" />
            Mark All Present
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or Student ID..."
              className="w-full rounded-xl border border-white/[0.08] bg-[#0B1425] text-white placeholder:text-slate-500 pl-10 pr-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {(["all", "unmarked", "present", "late", "absent"] as FilterTab[]).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium capitalize border transition ${
                    filterTab === tab
                      ? "bg-blue-500/15 border-blue-400/30 text-blue-300"
                      : "border-white/[0.08] text-slate-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>
        </div>

        {/* STUDENT LIST */}
        <div className="space-y-4">
          {filteredStudents.length === 0 ? (
            <div className="card-lift rounded-3xl border border-white/[0.08] bg-[#101A2C] p-8 text-center text-slate-400">
              কোনো ছাত্র/ছাত্রী পাওয়া যায়নি
            </div>
          ) : (
            filteredStudents.map((student) => {
              const isUnmarked = !attendance[student.id];
              const hasBrokenImage = brokenImages[student.id];

              return (
                <div
                  key={student.id}
                  className={`card-lift rounded-3xl border bg-[#101A2C] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition ${
                    isUnmarked
                      ? "border-amber-400/30 ring-1 ring-amber-400/20"
                      : "border-white/[0.09]"
                  }`}
                >
                  <div className="flex items-center gap-5">
                    {student.student_photo && !hasBrokenImage ? (
                      <img
                        src={student.student_photo}
                        onError={() =>
                          setBrokenImages((prev) => ({
                            ...prev,
                            [student.id]: true,
                          }))
                        }
                        className="w-16 h-16 rounded-2xl object-cover border border-white/[0.08]"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-400/15 flex items-center justify-center text-blue-300 font-semibold">
                        {getInitials(student.student_name)}
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {student.student_name}
                      </h3>

                      <button
                        onClick={() =>
                          copyToClipboard(student.student_id, student.id)
                        }
                        className="inline-flex items-center gap-1.5 text-slate-400 text-sm hover:text-blue-300 transition"
                      >
                        ID: {student.student_id}
                        {copiedId === student.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>

                      <p className="text-slate-500 text-sm mt-0.5">
                        Class: {student.class}
                      </p>

                      {student.class === "Class 9" ||
                      student.class === "Class 10" ? (
                        <p className="text-slate-500 text-sm">
                          School: {student.school}
                        </p>
                      ) : (
                        <p className="text-slate-500 text-sm">
                          College: {student.college}
                        </p>
                      )}

                      <p className="text-slate-500 text-sm">
                        Batch: {student.batch}
                      </p>
                      <p className="text-slate-500 text-sm">
                        Guardian: {student.guardian_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => markAttendance(student.id, "present")}
                      className={`px-5 py-3 rounded-xl font-medium text-sm transition ${
                        attendance[student.id] === "present"
                          ? "bg-emerald-500 text-white"
                          : "bg-emerald-500/10 text-emerald-300 border border-emerald-400/15 hover:bg-emerald-500/20"
                      }`}
                    >
                      Present
                    </button>

                    <button
                      onClick={() => markAttendance(student.id, "late")}
                      className={`px-5 py-3 rounded-xl font-medium text-sm transition ${
                        attendance[student.id] === "late"
                          ? "bg-amber-500 text-white"
                          : "bg-amber-500/10 text-amber-300 border border-amber-400/15 hover:bg-amber-500/20"
                      }`}
                    >
                      Late
                    </button>

                    <button
                      onClick={() => markAttendance(student.id, "absent")}
                      className={`px-5 py-3 rounded-xl font-medium text-sm transition ${
                        attendance[student.id] === "absent"
                          ? "bg-red-500 text-white"
                          : "bg-red-500/10 text-red-300 border border-red-400/15 hover:bg-red-500/20"
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* STICKY SAVE BAR */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-white/[0.08] bg-[#0B1425]/95 backdrop-blur-sm p-4 z-20">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div className="hidden sm:block text-sm text-slate-400">
            {markedCount}/{students.length} marked
          </div>
          <button
            onClick={saveAttendance}
            disabled={saving}
            className="flex-1 bg-blue-500 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
          >
            {saving ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      </div>
    </main>
  );
}