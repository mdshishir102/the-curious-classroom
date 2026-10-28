"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  Dna,
  FileText,
  FlaskConical,
  Lock,
  LoaderCircle,
  NotebookText,
  Search,
  ShieldAlert,
  Sparkles,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

// ===================== TYPES =====================
type Student = {
  class?: string | null;
  student_name?: string | null;
};

type Note = {
  id: string | number;
  subject?: string | null;
  chapter_number?: number | string | null;
  chapter_name?: string | null;
  is_released?: boolean | null;
  class_note_link?: string | null;
  marked_book_link?: string | null;
};

// ===================== DESIGN TOKENS =====================
const card =
  "card-lift rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)]";
const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]";

// ===================== HELPERS =====================
function getSubjectIcon(subject: string): LucideIcon {
  const s = subject.toLowerCase();
  if (s.includes("biology") || s.includes("জীববিজ্ঞান")) return Dna;
  if (s.includes("chemistry") || s.includes("রসায়ন")) return FlaskConical;
  if (s.includes("physics") || s.includes("পদার্থ")) return Zap;
  if (s.includes("math") || s.includes("গণিত")) return Calculator;
  return BookOpen;
}

const subjectColorStyles = [
  "border-blue-400/15 bg-blue-500/10 text-blue-300",
  "border-violet-400/15 bg-violet-500/10 text-violet-300",
  "border-emerald-400/15 bg-emerald-500/10 text-emerald-300",
  "border-amber-400/15 bg-amber-500/10 text-amber-300",
];

// ===================== COMPONENT =====================
export default function StudentNotesPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSubject, setActiveSubject] = useState("সব");

  useEffect(() => {
    void loadStudentNotes();
  }, []);

  async function loadStudentNotes() {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = localStorage.getItem("student");
      if (!data) {
        setErrorMessage("Student information not found. Please login again.");
        return;
      }

      let studentData: Student;
      try {
        studentData = JSON.parse(data);
      } catch (error) {
        console.error("Invalid student data:", error);
        setErrorMessage("Student information is invalid. Please login again.");
        return;
      }

      setStudent(studentData);

      if (!studentData?.class) {
        setErrorMessage("Student class information not found.");
        return;
      }

      const { data: noteData, error } = await supabase
        .from("class_notes")
        .select("*")
        .eq("class_name", studentData.class)
        .order("subject", { ascending: true })
        .order("chapter_number", { ascending: true });

      if (error) {
        console.error("Class notes error:", error);
        setErrorMessage(error.message);
        return;
      }

      setNotes(noteData || []);
    } catch (error: any) {
      console.error("Unexpected notes error:", error);
      setErrorMessage(
        error?.message || "Something went wrong while loading notes."
      );
    } finally {
      setLoading(false);
    }
  }

  // ---------- Derived Data ----------
  const subjects = useMemo(() => {
    const unique = Array.from(
      new Set(notes.map((note) => note?.subject || "Biology"))
    );
    return ["সব", ...unique];
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const subject = note?.subject || "Biology";
      const matchesSubject =
        activeSubject === "সব" || subject === activeSubject;
      const matchesSearch =
        searchTerm.trim() === "" ||
        (note.chapter_name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(note.chapter_number || "").includes(searchTerm);
      return matchesSubject && matchesSearch;
    });
  }, [notes, activeSubject, searchTerm]);

  const groupedNotes = useMemo(() => {
    return filteredNotes.reduce((acc: Record<string, Note[]>, note) => {
      const subject = note?.subject || "Biology";
      if (!acc[subject]) acc[subject] = [];
      acc[subject].push(note);
      return acc;
    }, {});
  }, [filteredNotes]);

  const totalChapters = notes.length;
  const availableCount = notes.filter((n) => n.is_released).length;
  const lockedCount = totalChapters - availableCount;

  // ===================== LOADING =====================
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
            className="h-auto w-36 object-contain"
          />
        </div>
        <LoaderCircle size={30} className="animate-spin text-blue-400" />
        <p className="mt-5 text-sm text-slate-400">Loading Class Notes...</p>
      </main>
    );
  }

  // ===================== MAIN =====================
  return (
    <div className="min-h-dvh bg-[#080D19] text-slate-100">
      <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        {/* ============ HEADER ============ */}
        <Link
          href="/student/dashboard"
          className={`inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-blue-300 ${focus}`}
        >
          <ArrowLeft size={16} />
          Dashboard
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <span className="h-px w-7 bg-blue-400" />
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-blue-300">
            ACADEMIC · RESOURCES
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Class Notes
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
          তোমার ক্লাসের সকল নোট ও দাগানো বই এক জায়গায়।
        </p>

        {/* ============ STUDENT CLASS CARD ============ */}
        <div className={`${card} mt-8 p-6 sm:p-7`}>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-300">
              <NotebookText size={23} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {student?.class || "Class"}
              </h2>
              <p className="mt-1 text-sm text-slate-400">Biology Notes &amp; Books</p>
            </div>
          </div>
        </div>

        {/* ============ STATS ============ */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className={`${card} p-5 text-center sm:p-6`}>
            <p className="text-2xl font-semibold text-white sm:text-3xl">
              {totalChapters}
            </p>
            <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
              Total
            </p>
          </div>
          <div className={`${card} p-5 text-center sm:p-6`}>
            <p className="text-2xl font-semibold text-emerald-300 sm:text-3xl">
              {availableCount}
            </p>
            <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
              Available
            </p>
          </div>
          <div className={`${card} p-5 text-center sm:p-6`}>
            <p className="text-2xl font-semibold text-amber-300 sm:text-3xl">
              {lockedCount}
            </p>
            <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
              Locked
            </p>
          </div>
        </div>

        {/* ============ SEARCH + FILTER ============ */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="অধ্যায় খুঁজুন..."
              className={`w-full rounded-xl border border-white/10 bg-[#101A2C] py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none ${focus}`}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <button
                key={subject}
                type="button"
                onClick={() => setActiveSubject(subject)}
                className={`rounded-full border px-4 py-2 text-xs font-medium transition ${focus} ${
                  activeSubject === subject
                    ? "border-blue-400/30 bg-blue-500/20 text-blue-200"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* ============ ERROR ============ */}
        {errorMessage && (
          <div
            role="alert"
            className="mt-8 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-5"
          >
            <ShieldAlert size={20} className="mt-0.5 shrink-0 text-red-300" />
            <div>
              <p className="text-sm font-semibold text-red-200">
                Unable to load notes
              </p>
              <p className="mt-1 text-sm leading-6 text-red-300/80">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {/* ============ NO NOTES ============ */}
        {!errorMessage && filteredNotes.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <FileText size={32} className="mx-auto text-slate-500" />
            <p className="mt-4 text-sm text-slate-400">
              {searchTerm
                ? "কোনো অধ্যায় খুঁজে পাওয়া যায়নি।"
                : "এখনো কোনো নোট যোগ করা হয়নি।"}
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-8">
            {Object.entries(groupedNotes).map(([subject, items], subjectIndex) => {
              const SubjectIcon = getSubjectIcon(subject);
              return (
                <section key={subject}>
                  <div className="mb-5 flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
                        subjectColorStyles[subjectIndex % subjectColorStyles.length]
                      }`}
                    >
                      <SubjectIcon size={20} />
                    </div>
                    <h2 className="text-xl font-semibold text-white">{subject}</h2>
                  </div>

                  <div className="space-y-4">
                    {items.map((note) => (
                      <div
                        key={note.id}
                        className={`${card} p-5 sm:p-6`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-blue-300">
                              {note.chapter_number}
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-white">
                                অধ্যায়-{note.chapter_number}
                              </h3>
                              <p className="mt-1 text-sm text-slate-400">
                                {note.chapter_name}
                              </p>
                            </div>
                          </div>

                          {note.is_released ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-medium text-emerald-300">
                              <CheckCircle2 size={13} />
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[11px] font-medium text-amber-300">
                              <Lock size={13} />
                              Locked
                            </span>
                          )}
                        </div>

                        {note.is_released ? (
                          <div className="mt-5 grid gap-3 border-t border-white/[0.07] pt-5 sm:grid-cols-2">
                            {note.class_note_link ? (
                              <a
                                href={note.class_note_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 ${focus}`}
                              >
                                <NotebookText size={17} />
                                Class Note
                                <ArrowUpRight
                                  size={15}
                                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                />
                              </a>
                            ) : (
                              <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-slate-500">
                                Class Note শীঘ্রই আসছে
                              </span>
                            )}

                            {note.marked_book_link ? (
                              <a
                                href={note.marked_book_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 ${focus}`}
                              >
                                <BookOpen size={17} />
                                দাগানো বই
                                <ArrowUpRight
                                  size={15}
                                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                />
                              </a>
                            ) : (
                              <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-slate-500">
                                দাগানো বই শীঘ্রই আসছে
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5">
                            <Lock size={18} className="mt-0.5 shrink-0 text-slate-500" />
                            <p className="text-sm leading-6 text-slate-400">
                              এই অধ্যায়ের নোট এখনো প্রকাশ করা হয়নি।
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* ============ FOOTER NOTE ============ */}
        <div className="mt-12 flex items-center justify-center gap-2 text-xs text-slate-600">
          <Sparkles size={14} className="text-blue-400" />
          The Curious Classroom · Student Learning Portal
        </div>
      </main>
    </div>
  );
}