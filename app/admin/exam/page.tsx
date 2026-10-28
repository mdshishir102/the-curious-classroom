"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  BookOpen,
  Tag,
  CalendarDays,
  Clock,
  GraduationCap,
  Users,
  Search,
  Trash2,
  Plus,
  ListChecks,
  CheckCircle2,
  Radio,
  LoaderCircle,
  X,
} from "lucide-react";

type ExamStatus = "today" | "upcoming" | "completed";

function getExamStatus(dateStr: string): ExamStatus {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Dhaka",
  });

  if (dateStr === today) return "today";
  if (dateStr > today) return "upcoming";
  return "completed";
}

function daysUntil(dateStr: string) {
  const today = new Date(
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" })
  );
  const target = new Date(dateStr);
  const diff = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff;
}

const quickClasses = ["Class 9", "Class 10", "Class 11", "Class 12"];

export default function AdminExamPage() {
  const [exams, setExams] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<any>({
    subject: "",
    exam_type: "",
    exam_date: "",
    exam_time: "",
    class: "",
    batch: "",
  });

  // --- UI-only additions ---
  const [pageLoading, setPageLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadExams() {
    const { data, error } = await supabase
      .from("exam_schedule")
      .select("*")
      .order("exam_date", { ascending: true });

    if (!error) {
      setExams(data || []);
    }
    setPageLoading(false);
  }

  useEffect(() => {
    loadExams();
  }, []);

  async function addExam() {
    if (
      !form.subject ||
      !form.exam_type ||
      !form.exam_date ||
      !form.exam_time ||
      !form.class ||
      !form.batch
    ) {
      alert("Fill all fields");

      return;
    }

    setLoading(true);

    const { error } = await supabase.from("exam_schedule").insert({
      subject: form.subject,
      exam_type: form.exam_type,
      exam_date: form.exam_date,
      exam_time: form.exam_time,
      class: form.class,
      batch: form.batch,
    });

    setLoading(false);

    if (error) {
      alert(error.message);

      return;
    }

    alert("Exam Added Successfully");

    setForm({
      subject: "",
      exam_type: "",
      exam_date: "",
      exam_time: "",
      class: "",
      batch: "",
    });

    loadExams();
  }

  // --- UI-only: delete confirmation moved to styled modal ---
  function requestDelete(exam: any) {
    setDeleteTarget(exam);
  }

  async function confirmDeleteExam() {
    if (!deleteTarget) return;

    setDeleting(true);

    const { error } = await supabase
      .from("exam_schedule")
      .delete()
      .eq("id", deleteTarget.id);

    setDeleting(false);

    if (error) {
      alert(error.message);
      return;
    }

    setDeleteTarget(null);
    loadExams();
  }

  const statusMeta: Record<
    ExamStatus,
    { label: string; badge: string; dot: string }
  > = {
    today: {
      label: "আজকে",
      badge: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
      dot: "bg-emerald-400",
    },
    upcoming: {
      label: "আসছে",
      badge: "bg-blue-500/10 text-blue-300 border-blue-400/15",
      dot: "bg-blue-400",
    },
    completed: {
      label: "সম্পন্ন",
      badge: "bg-white/5 text-slate-400 border-white/10",
      dot: "bg-slate-500",
    },
  };

  const enrichedExams = exams.map((exam) => ({
    ...exam,
    status: getExamStatus(exam.exam_date),
  }));

  const filteredExams = enrichedExams.filter((exam) => {
    const q = search.toLowerCase();
    return (
      exam.subject?.toLowerCase().includes(q) ||
      exam.class?.toLowerCase().includes(q) ||
      exam.batch?.toLowerCase().includes(q)
    );
  });

  const todayCount = enrichedExams.filter((e) => e.status === "today").length;
  const upcomingCount = enrichedExams.filter(
    (e) => e.status === "upcoming"
  ).length;
  const completedCount = enrichedExams.filter(
    (e) => e.status === "completed"
  ).length;

  if (pageLoading) {
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
    <main className="min-h-screen bg-[#080D19] p-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-px w-7 bg-blue-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
            Academic Tools
          </span>
        </div>

        <h1 className="mb-8 text-2xl sm:text-3xl font-semibold text-white">
          Exam Schedule Management
        </h1>

        {/* SUMMARY STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="card-lift rounded-2xl border border-white/[0.08] bg-[#101A2C] p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide">
              <ListChecks className="h-3.5 w-3.5 text-blue-300" />
              মোট পরীক্ষা
            </div>
            <p className="text-2xl font-semibold text-white mt-2">
              {exams.length}
            </p>
          </div>
          <div className="card-lift rounded-2xl border border-emerald-400/15 bg-[#101A2C] p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide">
              <Radio className="h-3.5 w-3.5 text-emerald-300" />
              আজকে
            </div>
            <p className="text-2xl font-semibold text-emerald-300 mt-2">
              {todayCount}
            </p>
          </div>
          <div className="card-lift rounded-2xl border border-blue-400/15 bg-[#101A2C] p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide">
              <Clock className="h-3.5 w-3.5 text-blue-300" />
              আসন্ন
            </div>
            <p className="text-2xl font-semibold text-blue-300 mt-2">
              {upcomingCount}
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

        {/* FORM */}
        <div className="card-lift rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)] p-6 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <Plus className="h-4 w-4 text-blue-300" />
            <h2 className="text-lg font-semibold text-white">
              Add New Exam
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="relative">
              <BookOpen className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                className="w-full rounded-xl border border-white/[0.08] bg-[#0B1425] text-white placeholder:text-slate-500 pl-10 pr-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
                placeholder="Subject"
                value={form.subject}
                onChange={(e) =>
                  setForm({
                    ...form,
                    subject: e.target.value,
                  })
                }
              />
            </div>

            <div className="relative">
              <Tag className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                className="w-full rounded-xl border border-white/[0.08] bg-[#0B1425] text-white placeholder:text-slate-500 pl-10 pr-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
                placeholder="Exam Type (MCQ, CQ, Weekly...)"
                value={form.exam_type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    exam_type: e.target.value,
                  })
                }
              />
            </div>

            <div className="relative">
              <CalendarDays className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                className="w-full rounded-xl border border-white/[0.08] bg-[#0B1425] text-white pl-10 pr-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19] [color-scheme:dark]"
                type="date"
                value={form.exam_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    exam_date: e.target.value,
                  })
                }
              />
            </div>

            <div className="relative">
              <Clock className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                className="w-full rounded-xl border border-white/[0.08] bg-[#0B1425] text-white placeholder:text-slate-500 pl-10 pr-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
                placeholder="Exam Time (Example: 10:00 AM)"
                value={form.exam_time}
                onChange={(e) =>
                  setForm({
                    ...form,
                    exam_time: e.target.value,
                  })
                }
              />
            </div>

            <div className="relative">
              <GraduationCap className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                className="w-full rounded-xl border border-white/[0.08] bg-[#0B1425] text-white placeholder:text-slate-500 pl-10 pr-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
                placeholder="Class"
                value={form.class}
                onChange={(e) =>
                  setForm({
                    ...form,
                    class: e.target.value,
                  })
                }
              />
            </div>

            <div className="relative">
              <Users className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                className="w-full rounded-xl border border-white/[0.08] bg-[#0B1425] text-white placeholder:text-slate-500 pl-10 pr-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
                placeholder="Batch"
                value={form.batch}
                onChange={(e) =>
                  setForm({
                    ...form,
                    batch: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Quick class chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs text-slate-500 self-center mr-1">
              Quick fill:
            </span>
            {quickClasses.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, class: c })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  form.class === c
                    ? "bg-blue-500/15 border-blue-400/30 text-blue-300"
                    : "border-white/[0.08] text-slate-400 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            onClick={addExam}
            disabled={loading}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-white font-medium hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
          >
            {loading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Exam
              </>
            )}
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative mb-6">
          <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject, class or batch..."
            className="w-full rounded-xl border border-white/[0.08] bg-[#101A2C] text-white placeholder:text-slate-500 pl-10 pr-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
          />
        </div>

        {/* EXAM LIST */}
        <div className="space-y-4">
          {filteredExams.length === 0 ? (
            <div className="card-lift rounded-3xl border border-white/[0.08] bg-[#101A2C] p-10 text-center text-slate-400">
              কোনো পরীক্ষা পাওয়া যায়নি
            </div>
          ) : (
            filteredExams.map((exam) => {
              const meta = statusMeta[exam.status as ExamStatus];
              const dayDiff = daysUntil(exam.exam_date);

              return (
                <div
                  key={exam.id}
                  className={`card-lift rounded-3xl border bg-[#101A2C] p-6 transition ${
                    exam.status === "completed"
                      ? "border-white/[0.07] opacity-60"
                      : "border-white/[0.09]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h2 className="text-xl font-semibold text-white">
                          {exam.subject}
                        </h2>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${meta.badge}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${meta.dot}`}
                          />
                          {meta.label}
                        </span>
                        {exam.status === "upcoming" && dayDiff <= 3 && (
                          <span className="text-[11px] font-medium text-amber-300">
                            {dayDiff === 0
                              ? "আজই"
                              : `${dayDiff} দিন বাকি`}
                          </span>
                        )}
                      </div>

                      <p className="text-blue-300 text-sm font-medium">
                        {exam.exam_type}
                      </p>

                      <div className="mt-3 space-y-1 text-sm text-slate-400">
                        <p className="flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                          {exam.exam_date}
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                          {exam.exam_time}
                        </p>
                        <p className="flex items-center gap-2">
                          <GraduationCap className="h-3.5 w-3.5 text-slate-500" />
                          {exam.class} - {exam.batch}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => requestDelete(exam)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 text-red-300 px-4 py-2.5 text-sm font-medium hover:bg-red-500/20 transition self-start"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="card-lift rounded-3xl border border-red-400/20 bg-[#101A2C] p-6 max-w-md w-full">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-400/20 flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-300" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  পরীক্ষা মুছে ফেলুন?
                </h3>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-slate-500 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-slate-400 mb-5">
              আপনি কি নিশ্চিত যে{" "}
              <span className="text-white font-medium">
                {deleteTarget.subject} ({deleteTarget.exam_type})
              </span>{" "}
              — এই পরীক্ষাটি স্থায়ীভাবে মুছে ফেলতে চান? এই কাজটি আর ফেরানো যাবে না।
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-white/[0.1] text-slate-300 py-2.5 font-medium hover:bg-white/5 transition"
              >
                বাতিল
              </button>
              <button
                onClick={confirmDeleteExam}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-500 text-white py-2.5 font-medium hover:bg-red-600 disabled:bg-slate-700 disabled:text-slate-400 transition"
              >
                {deleting ? "মুছে ফেলা হচ্ছে..." : "হ্যাঁ, মুছুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}