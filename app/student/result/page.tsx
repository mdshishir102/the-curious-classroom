
"use client";

// =====================================
// IMPORTS
// =====================================

import Image from "next/image";
import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Trophy,
  CreditCard,
  GraduationCap,
  UserRound,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Download,
  CalendarDays,
  ChartNoAxesColumn,
  Medal,
  FileText,
  ShieldCheck,
  LoaderCircle,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Hash,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";

// =====================================
// STUDENT TYPE
// =====================================

type Student = {
  id?: string | number;
  student_id: string;
  student_name?: string | null;
  student_photo?: string | null;
  class?: string | null;
  batch?: string | null;
};

// =====================================
// RESULT TYPE
// =====================================

type StudentResult = {
  id?: string | number;
  student_id?: string | number | null;

  exam_type?: string | null;
  exam_number?: string | number | null;

  subject?: string | null;
  chapter?: string | null;

  marks?: string | number | null;
  total_marks?: string | number | null;

  percentage?: string | number | null;
  grade?: string | null;
  position?: string | number | null;

  comment?: string | null;
  created_at?: string | null;
};

// =====================================
// SIDEBAR NAVIGATION
// =====================================

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

const studentNavigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/student/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Class Notes",
    href: "/student/notes",
    icon: BookOpen,
  },
  {
    title: "Online Exams",
    href: "/student/exams",
    icon: ClipboardList,
  },
  {
    title: "My Results",
    href: "/student/result",
    icon: Trophy,
  },
  {
    title: "My Payments",
    href: "/student/payment",
    icon: CreditCard,
  },
];

// =====================================
// PREMIUM DESIGN SYSTEM
// =====================================

const theme = {
  background: "bg-[#080D19]",

  sidebar: "bg-[#0D1627]",

  card:
    "rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)]",

  innerCard:
    "rounded-2xl border border-white/[0.07] bg-[#0B1425]",

  muted: "text-slate-400",

  accent: "text-blue-400",
};

// =====================================
// FOCUS STYLE
// =====================================

const focusStyle =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]";

// =====================================
// RESULT DATE FORMATTER
// =====================================

function formatResultDate(
  value?: string | null
): string {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
}

// =====================================
// RESULT DISPLAY HELPER
// =====================================

function displayValue(
  value: string | number | null | undefined
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "N/A";
  }

  return String(value);
}

// =====================================
// PART 2 STARTS BELOW
// =====================================



/* =====================================
   PART 2 — STUDENT RESULT LOGIC
===================================== */

export default function StudentResultPage() {
  const router = useRouter();

  // =====================================
  // STUDENT & RESULT STATES
  // =====================================

  const [student, setStudent] =
    useState<Student | null>(null);

  const [results, setResults] =
    useState<StudentResult[]>([]);

  // =====================================
  // UI STATES
  // =====================================

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    downloadingResultKey,
    setDownloadingResultKey
  ] = useState<string | null>(null);

  // =====================================
  // STUDENT VERIFICATION
  // =====================================

  useEffect(() => {
    let active = true;

    async function initializeResults() {
      setLoading(true);
      setError("");

      try {
        // Read existing student login information
        const savedStudent =
          localStorage.getItem("student");

        if (!savedStudent) {
          router.replace("/student/login");
          return;
        }

        let studentData: Student;

        try {
          studentData = JSON.parse(savedStudent);
        } catch {
          localStorage.removeItem("student");
          localStorage.removeItem("student_id");

          router.replace("/student/login");
          return;
        }

        // Check student information
        if (
          !studentData ||
          typeof studentData.student_id !== "string" ||
          !studentData.student_id.trim()
        ) {
          localStorage.removeItem("student");
          localStorage.removeItem("student_id");

          router.replace("/student/login");
          return;
        }

        const studentId =
          studentData.student_id.trim();

        // Verify student account in Supabase
        const {
          data: currentStudent,
          error: studentError,
        } = await supabase
          .from("students")
          .select("student_id, login_enabled")
          .eq("student_id", studentId)
          .maybeSingle();

        if (!active) return;

        if (studentError) {
          throw studentError;
        }

        // Block disabled or missing accounts
        if (
          !currentStudent ||
          currentStudent.login_enabled !== true
        ) {
          localStorage.removeItem("student");
          localStorage.removeItem("student_id");

          router.replace("/student/login");
          return;
        }

        // Save verified student information
        setStudent(studentData);

        // Keep existing student ID key
        localStorage.setItem(
          "student_id",
          studentId
        );

        // =====================================
        // LOAD RESULTS FROM SUPABASE
        // =====================================

        const {
          data: resultData,
          error: resultError,
        } = await supabase
          .from("results")
          .select("*")
          .eq("student_id", studentId)
          .order("created_at", {
            ascending: false,
          });

        if (!active) return;

        if (resultError) {
          throw resultError;
        }

        setResults(resultData ?? []);

      } catch (err) {
        console.error(
          "Student results loading error:",
          err
        );

        if (active) {
          setError(
            "ফলাফল লোড করা যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করো।"
          );
        }

      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void initializeResults();

    return () => {
      active = false;
    };

  }, [router]);

  // =====================================
  // REFRESH STUDENT RESULTS
  // =====================================

  async function refreshResults() {
    if (!student?.student_id || refreshing) {
      return;
    }

    setRefreshing(true);
    setError("");

    try {
      const {
        data,
        error: resultError,
      } = await supabase
        .from("results")
        .select("*")
        .eq("student_id", student.student_id.trim())
        .order("created_at", {
          ascending: false,
        });

      if (resultError) {
        throw resultError;
      }

      setResults(data ?? []);

    } catch (err) {
      console.error(
        "Result refresh error:",
        err
      );

      setError(
        "ফলাফল Refresh করা যায়নি। আবার চেষ্টা করো।"
      );

    } finally {
      setRefreshing(false);
    }
  }

  // =====================================
  // STUDENT LOGOUT
  // =====================================

  function logout() {
    localStorage.removeItem("student");
    localStorage.removeItem("student_id");

    router.replace("/student/login");
  }

  // =====================================
  // PART 3 CONTINUES BELOW
  // Do not close StudentResultPage yet.
  // =====================================



/* =====================================
   PART 3 — PREMIUM RESULT PDF
===================================== */

// =====================================
// RESULT DOWNLOAD KEY
// =====================================

function getResultKey(item: StudentResult): string {
  if (item.id != null) {
    return String(item.id);
  }

  return [
    item.exam_type ?? "",
    item.exam_number ?? "",
    item.subject ?? "",
    item.chapter ?? "",
    item.created_at ?? "",
  ].join("_");
}

// =====================================
// PREMIUM PDF GENERATOR
// =====================================

async function downloadResultPDF(item: StudentResult) {
  if (!student) {
    setError("Student information not found.");
    return;
  }

  if (downloadingResultKey !== null) return;

  const resultKey = getResultKey(item);

  try {
    setError("");
    setDownloadingResultKey(resultKey);

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 16;
    const tableWidth = pageWidth - margin * 2;

    const getFinalY = () =>
      (
        doc as jsPDF & {
          lastAutoTable?: { finalY: number };
        }
      ).lastAutoTable?.finalY ?? 60;

    // =====================================
    // HEADER BACKGROUND
    // =====================================

    doc.setFillColor(8, 13, 25);

    doc.rect(
      0,
      0,
      pageWidth,
      46,
      "F"
    );

    doc.setFillColor(37, 99, 235);

    doc.rect(
      0,
      45,
      pageWidth,
      1.5,
      "F"
    );

    // =====================================
    // LOGO
    // =====================================

    const logo = new window.Image();

    const logoLoaded = await new Promise<boolean>(
      (resolve) => {
        logo.onload = () => resolve(true);
        logo.onerror = () => resolve(false);
        logo.src = "/logo.png";
      }
    );

    if (logoLoaded) {
      const maxWidth = 27;
      const maxHeight = 23;

      const ratio = Math.min(
        maxWidth / logo.naturalWidth,
        maxHeight / logo.naturalHeight
      );

      const width = logo.naturalWidth * ratio;
      const height = logo.naturalHeight * ratio;

      doc.setFillColor(255, 255, 255);

      doc.roundedRect(
        14,
        10,
        32,
        27,
        3,
        3,
        "F"
      );

      doc.addImage(
        logo,
        "PNG",
        14 + (32 - width) / 2,
        10 + (27 - height) / 2,
        width,
        height
      );
    }

    // =====================================
    // BRAND TITLE
    // =====================================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);
    doc.setTextColor(255, 255, 255);

    doc.text(
      "The Curious Classroom",
      126,
      21,
      { align: "center" }
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(180, 204, 255);

    doc.text(
      "ACADEMIC PERFORMANCE REPORT",
      126,
      31,
      { align: "center" }
    );

    // =====================================
    // STUDENT INFORMATION
    // =====================================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);

    doc.text(
      "STUDENT INFORMATION",
      margin,
      57
    );

    autoTable(doc, {
      startY: 63,

      head: [],
      body: [
        [
          "Student Name",
          displayValue(student.student_name),
        ],
        [
          "Student ID",
          displayValue(student.student_id),
        ],
        [
          "Class",
          displayValue(student.class),
        ],
        [
          "Batch",
          displayValue(student.batch),
        ],
      ],

      theme: "grid",

      margin: {
        left: margin,
        right: margin,
        bottom: 55,
      },

      tableWidth,

      styles: {
        font: "helvetica",
        fontSize: 10,
        cellPadding: 2.5,
        lineColor: [229, 234, 242],
        lineWidth: 0.2,
        fillColor: [248, 250, 252],
        textColor: [30, 41, 59],
        overflow: "linebreak",
      },

      columnStyles: {
        0: {
          cellWidth: 48,
          fontStyle: "bold",
          textColor: [37, 99, 235],
        },
        1: {
          cellWidth: tableWidth - 48,
        },
      },
    });

    // =====================================
    // EXAM INFORMATION
    // =====================================

    const examHeadingY = getFinalY() + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);

    doc.text(
      "EXAM INFORMATION",
      margin,
      examHeadingY
    );

    autoTable(doc, {
      startY: examHeadingY + 5,

      body: [
        [
          "Exam Type",
          displayValue(item.exam_type),
        ],
        [
          "Exam Number",
          displayValue(item.exam_number),
        ],
        [
          "Subject",
          displayValue(item.subject),
        ],
        [
          "Chapter",
          displayValue(item.chapter),
        ],
      ],

      theme: "grid",

      margin: {
        left: margin,
        right: margin,
        bottom: 55,
      },

      tableWidth,

      styles: {
        font: "helvetica",
        fontSize: 10,
        cellPadding: 2.5,
        fillColor: [248, 250, 252],
        textColor: [30, 41, 59],
        lineColor: [229, 234, 242],
        lineWidth: 0.2,
        overflow: "linebreak",
      },

      columnStyles: {
        0: {
          cellWidth: 48,
          fontStyle: "bold",
          textColor: [37, 99, 235],
        },
        1: {
          cellWidth: tableWidth - 48,
        },
      },
    });

    // =====================================
    // ACADEMIC RESULT TABLE
    // =====================================

    const resultStartY = getFinalY() + 10;

    autoTable(doc, {
      startY: resultStartY,

      head: [[
        "Marks",
        "Total Marks",
        "Percentage",
        "Grade",
        "Position",
      ]],

      body: [[
        displayValue(item.marks),
        displayValue(item.total_marks),
        item.percentage != null
          ? `${item.percentage}%`
          : "N/A",
        displayValue(item.grade),
        displayValue(item.position),
      ]],

      theme: "grid",

      margin: {
        left: margin,
        right: margin,
        bottom: 55,
      },

      tableWidth,

      headStyles: {
        fillColor: [25, 92, 245],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },

      bodyStyles: {
        fillColor: [240, 245, 255],
        textColor: [30, 41, 59],
        fontStyle: "bold",
        halign: "center",
      },

      styles: {
        font: "helvetica",
        fontSize: 10,
        cellPadding: 4,
        lineColor: [225, 232, 245],
        lineWidth: 0.2,
        overflow: "linebreak",
      },
    });

    // =====================================
    // TEACHER COMMENT
    // =====================================

    if (item.comment?.trim()) {
      autoTable(doc, {
        startY: getFinalY() + 9,

        head: [["TEACHER COMMENT"]],

        body: [[item.comment]],

        theme: "grid",

        margin: {
          left: margin,
          right: margin,
          bottom: 55,
        },

        tableWidth,

        headStyles: {
          fillColor: [230, 238, 255],
          textColor: [25, 92, 245],
          fontStyle: "bold",
        },

        bodyStyles: {
          fillColor: [248, 250, 252],
          textColor: [51, 65, 85],
        },

        styles: {
          font: "helvetica",
          fontSize: 10,
          cellPadding: 4,
          overflow: "linebreak",
        },
      });
    }

    // =====================================
    // AUTHORIZATION FOOTER
    // =====================================

    if (getFinalY() > pageHeight - 56) {
      doc.addPage();
    }

    doc.setDrawColor(220, 228, 240);

    doc.line(
      margin,
      pageHeight - 47,
      pageWidth - margin,
      pageHeight - 47
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(37, 99, 235);

    doc.text(
      "PREPARED & AUTHORIZED BY",
      margin,
      pageHeight - 39
    );

    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);

    doc.text(
      "MD. Mahfuz Shaharia Shishir",
      margin,
      pageHeight - 31
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.text(
      "CEO & Founder",
      margin,
      pageHeight - 24
    );

    doc.text(
      "The Curious Classroom",
      margin,
      pageHeight - 18
    );

    // =====================================
    // PAGE NUMBERS
    // =====================================

    const totalPages = doc.getNumberOfPages();

    for (let page = 1; page <= totalPages; page++) {
      doc.setPage(page);

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);

      doc.text(
        `Page ${page} of ${totalPages}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: "right" }
      );
    }

    // =====================================
    // SAVE PDF
    // =====================================

    const safeName = (
      student.student_name || "Student"
    ).replace(/[^\p{L}\p{N}_-]+/gu, "_");

    const safeExam = (
      item.exam_type || "Result"
    ).replace(/[^\p{L}\p{N}_-]+/gu, "_");

    doc.save(
      `Result_${safeName}_${safeExam}.pdf`
    );

  } catch (err) {
    console.error("PDF generation error:", err);

    setError(
      "Result PDF তৈরি করা যায়নি। আবার চেষ্টা করো।"
    );

  } finally {
    setDownloadingResultKey(null);
  }
}

// =====================================
// PART 4 CONTINUES BELOW
// Do not close StudentResultPage yet.
// =====================================




/* =====================================
   PART 4 — PREMIUM RESULTS UI
===================================== */

// =====================================
// ACADEMIC SUMMARY CALCULATIONS
// =====================================

const totalResults = results.length;

const totalSubjects = new Set(
  results
    .map((item) => item.subject?.trim())
    .filter(Boolean)
).size;

// Calculate average using available percentages
const validPercentages = results
  .map((item) => {
    if (
      item.percentage === null ||
      item.percentage === undefined ||
      item.percentage === ""
    ) {
      return null;
    }

    const value = Number(
      String(item.percentage)
        .replace("%", "")
        .trim()
    );

    return Number.isFinite(value) ? value : null;
  })
  .filter((value): value is number => value !== null);

const averagePercentage =
  validPercentages.length > 0
    ? (
        validPercentages.reduce(
          (sum, value) => sum + value,
          0
        ) / validPercentages.length
      ).toFixed(1)
    : null;

const latestResultDate =
  results[0]?.created_at ?? null;

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
          className="h-auto w-36 object-contain"
        />

      </div>

      <LoaderCircle
        size={30}
        className="animate-spin text-blue-400"
      />

      <p className="mt-5 text-sm text-slate-400">
        Loading Academic Results...
      </p>

    </main>
  );
}

// =====================================
// STUDENT VERIFICATION FALLBACK
// =====================================

if (!student) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#080D19] p-6 text-center">

      <div className="max-w-md">

        <AlertCircle
          size={36}
          className="mx-auto text-blue-400"
        />

        <h1 className="mt-5 text-xl font-semibold text-white">
          Student Account Unavailable
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          তোমার Student Account পাওয়া যায়নি।
          আবার লগইন করো।
        </p>

        <Link
          href="/student/login"
          className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Back to Login
        </Link>

      </div>

    </main>
  );
}

// =====================================
// MAIN RESULT PAGE
// =====================================

return (
  <div className="relative min-h-dvh bg-[#080D19] text-slate-100">

    {/* =====================================
        MOBILE MENU OVERLAY
    ===================================== */}

    {menuOpen && (
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={() => setMenuOpen(false)}
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
      />
    )}

    {/* =====================================
        PREMIUM SIDEBAR
    ===================================== */}

    <aside
      className={`
        fixed inset-y-0 left-0 z-50
        flex w-[282px] flex-col
        border-r border-white/10
        bg-[#0D1627]
        shadow-[20px_0_80px_rgba(0,0,0,0.15)]
        transition-transform duration-300
        lg:translate-x-0
        ${
          menuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }
      `}
    >

      {/* Sidebar Logo */}
      <div className="border-b border-white/[0.07] px-5 py-7">

        <div className="flex items-start justify-between gap-3">

          <Link
            href="/student/dashboard"
            onClick={() => setMenuOpen(false)}
            className={`inline-flex rounded-xl bg-white px-3 py-2 ${focusStyle}`}
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
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>

        </div>

        <div className="mt-6">

          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400">
            THE CURIOUS CLASSROOM
          </p>

          <p className="mt-2 text-base font-semibold text-white">
            Student Workspace
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Your Personal Learning Space
          </p>

        </div>

      </div>

      {/* =====================================
          SIDEBAR NAVIGATION
      ===================================== */}

      <nav
        aria-label="Student navigation"
        className="flex-1 overflow-y-auto px-3 py-6"
      >

        <p className="mb-3 px-4 text-[10px] font-semibold tracking-[0.2em] text-slate-500">
          STUDENT PORTAL
        </p>

        <div className="space-y-1">

          {studentNavigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.href === "/student/result";

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                aria-current={
                  isActive ? "page" : undefined
                }
                className={`
                  group flex items-center gap-3
                  rounded-xl px-4 py-3.5
                  text-sm font-medium transition-colors
                  ${focusStyle}
                  ${
                    isActive
                      ? "border border-blue-400/15 bg-blue-600/15 text-blue-300"
                      : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                  }
                `}
              >

                <Icon
                  size={19}
                  className={
                    isActive
                      ? "text-blue-400"
                      : "text-slate-500 group-hover:text-blue-300"
                  }
                />

                <span className="flex-1">
                  {item.title}
                </span>

                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                )}

              </Link>
            );
          })}

        </div>

        {/* Academic Information */}
        <div className="mt-9 border-t border-white/[0.07] pt-6">

          <p className="mb-4 px-4 text-[10px] font-semibold tracking-[0.2em] text-slate-500">
            MY ACADEMIC SPACE
          </p>

          <div className="mx-2 rounded-2xl border border-blue-400/10 bg-blue-500/[0.06] p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                <GraduationCap size={21} />
              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-semibold text-white">
                  {student.class || "Student"}
                </p>

                <p className="mt-1 truncate text-xs text-slate-400">
                  {student.batch || "Academic Batch"}
                </p>

              </div>

            </div>

          </div>

        </div>

      </nav>

      {/* =====================================
          SIDEBAR FOOTER
      ===================================== */}

      <div className="border-t border-white/10 p-4">

        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
            <UserRound size={19} />
          </div>

          <div className="min-w-0">

            <p className="truncate text-xs font-semibold text-white">
              {student.student_name || "Student"}
            </p>

            <p className="mt-1 truncate text-[11px] text-slate-500">
              ID: {student.student_id}
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-400/10"
        >

          <LogOut size={18} />

          Logout

        </button>

      </div>

    </aside>

    {/* =====================================
        MAIN CONTENT WRAPPER
    ===================================== */}

    <div className="min-h-dvh lg:ml-[282px]">

      {/* =====================================
          TOP NAVIGATION HEADER
      ===================================== */}

      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#0A1120]/95 backdrop-blur-xl">

        <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">

          {/* Header Left */}
          <div className="flex min-w-0 items-center gap-4">

            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 lg:hidden"
            >
              <Menu size={21} />
            </button>

            <div className="min-w-0">

              <p className="text-[10px] font-medium tracking-wide text-slate-500">
                THE CURIOUS CLASSROOM
              </p>

              <p className="mt-1 truncate text-sm font-semibold text-white">
                Academic Results
              </p>

            </div>

          </div>

          {/* Header Right */}
          <div className="flex items-center gap-3">

            {/* Refresh Button */}
            <button
              type="button"
              onClick={refreshResults}
              disabled={refreshing}
              aria-label="Refresh academic results"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 text-sm font-medium text-slate-300 transition hover:border-blue-400/30 hover:bg-white/5 hover:text-white disabled:opacity-50 sm:px-4"
            >

              <RefreshCw
                size={17}
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
              <Trophy size={20} />
            </div>

          </div>

        </div>

      </header>

      {/* =====================================
          DASHBOARD MAIN AREA
      ===================================== */}

      <main className="relative mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

        {/* =====================================
            PAGE HEADING
        ===================================== */}

        <section>

          <div className="mb-5 flex items-center gap-3">

            <span className="h-px w-7 bg-blue-400" />

            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-blue-300">
              YOUR ACADEMIC JOURNEY
            </span>

          </div>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Academic{" "}

                <span className="text-blue-400">
                  Results
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                তোমার পরীক্ষার ফলাফল, নম্বর, গ্রেড
                এবং একাডেমিক অগ্রগতি দেখো
                একটি জায়গা থেকে।
              </p>

            </div>

            <Link
              href="/student/dashboard"
              className={`inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white ${focusStyle}`}
            >

              <ArrowLeft size={17} />

              Dashboard

            </Link>

          </div>

        </section>

        {/* =====================================
            STUDENT INFORMATION CARD
        ===================================== */}

        <section className="mt-9">

          <div className="relative overflow-hidden rounded-3xl border border-blue-400/15 bg-gradient-to-br from-[#162A50] via-[#132441] to-[#101A2C] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)] sm:p-8">

            {/* Decorative Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-[80px]"
            />

            <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">

              {/* Student Avatar */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-blue-400/20 bg-[#080D19] sm:h-24 sm:w-24">

                {student.student_photo ? (

                  <img
                    src={student.student_photo}
                    alt={student.student_name || "Student"}
                    className="h-full w-full object-cover"
                  />

                ) : (

                  <UserRound
                    size={36}
                    className="text-blue-300"
                  />

                )}

              </div>

              {/* Student Details */}
              <div className="min-w-0 flex-1">

                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-[11px] text-blue-200">

                  <GraduationCap size={14} />

                  Academic Record

                </div>

                <h2 className="break-words text-xl font-semibold text-white sm:text-2xl">

                  {student.student_name || "Student"}

                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Student ID: {student.student_id}
                </p>

              </div>

              {/* Status */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-xs text-blue-300">

                <FileText size={15} />

                My Result Records

              </div>

            </div>

            {/* Student Academic Info */}
            <div className="relative mt-7 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-2">

              <div className="rounded-xl border border-white/[0.07] bg-[#0B1425]/70 p-4">

                <p className="text-xs text-slate-400">
                  Class
                </p>

                <p className="mt-2 text-sm font-semibold text-white">
                  {student.class || "N/A"}
                </p>

              </div>

              <div className="rounded-xl border border-white/[0.07] bg-[#0B1425]/70 p-4">

                <p className="text-xs text-slate-400">
                  Batch
                </p>

                <p className="mt-2 text-sm font-semibold text-white">
                  {student.batch || "N/A"}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================
            ACADEMIC STATISTICS
        ===================================== */}

        <section className="mt-10">

          <div className="mb-6">

            <div className="mb-3 flex items-center gap-3">

              <span className="h-px w-7 bg-blue-400" />

              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-blue-300">
                PERFORMANCE OVERVIEW
              </span>

            </div>

            <h2 className="text-2xl font-semibold text-white">
              Academic Summary
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              তোমার প্রকাশিত পরীক্ষার ফলাফলের সারসংক্ষেপ
            </p>

          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">

            {/* Total Results */}
            <div className={`${theme.card} p-5 sm:p-6`}>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-300">

                <FileText size={23} />

              </div>

              <p className="mt-5 text-sm text-slate-400">
                Total Results
              </p>

              <h3 className="mt-2 text-3xl font-semibold text-white">
                {totalResults}
              </h3>

              <p className="mt-2 text-xs text-slate-500">
                Available records
              </p>

            </div>

            {/* Total Subjects */}
            <div className={`${theme.card} p-5 sm:p-6`}>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/10 text-violet-300">

                <BookOpen size={23} />

              </div>

              <p className="mt-5 text-sm text-slate-400">
                Subjects
              </p>

              <h3 className="mt-2 text-3xl font-semibold text-white">
                {totalSubjects}
              </h3>

              <p className="mt-2 text-xs text-slate-500">
                Unique subjects
              </p>

            </div>

            {/* Average Percentage */}
            <div className={`${theme.card} p-5 sm:p-6`}>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/15 bg-emerald-500/10 text-emerald-300">

                <ChartNoAxesColumn size={23} />

              </div>

              <p className="mt-5 text-sm text-slate-400">
                Average Score
              </p>

              <h3 className="mt-2 text-3xl font-semibold text-white">
                {averagePercentage !== null
                  ? `${averagePercentage}%`
                  : "—"}
              </h3>

              <p className="mt-2 text-xs text-slate-500">
                Available percentages
              </p>

            </div>

            {/* Latest Result */}
            <div className={`${theme.card} p-5 sm:p-6`}>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/15 bg-amber-500/10 text-amber-300">

                <CalendarDays size={23} />

              </div>

              <p className="mt-5 text-sm text-slate-400">
                Latest Result
              </p>

              <h3 className="mt-2 text-base font-semibold leading-8 text-white sm:text-lg">
                {latestResultDate
                  ? formatResultDate(latestResultDate)
                  : "—"}
              </h3>

              <p className="mt-2 text-xs text-slate-500">
                Most recent record
              </p>

            </div>

          </div>

        </section>

        {/* =====================================
            ERROR MESSAGE
        ===================================== */}

        {error && (

          <div
            role="alert"
            className="mt-8 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-5"
          >

            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-red-300"
            />

            <p className="text-sm leading-7 text-red-200">
              {error}
            </p>

            <button
              type="button"
              aria-label="Dismiss error"
              onClick={() => setError("")}
              className="ml-auto shrink-0 text-red-300 hover:text-white"
            >
              <X size={18} />
            </button>

          </div>

        )}

        {/* =====================================
            PART 5 STARTS BELOW
            Do not close main or wrapper.
        ===================================== */}



{/* =====================================
    PART 5 — PREMIUM RESULT CARDS
===================================== */}

{/* =====================================
    EXAM RESULTS SECTION
===================================== */}

<section className="mt-12">

  {/* Section Header */}
  <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

    <div>

      <div className="mb-3 flex items-center gap-3">

        <span className="h-px w-7 bg-blue-400" />

        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-blue-300">
          EXAMINATION RECORDS
        </span>

      </div>

      <h2 className="text-2xl font-semibold text-white">
        My Exam Results
      </h2>

      <p className="mt-2 text-sm leading-7 text-slate-400">
        তোমার সকল প্রকাশিত পরীক্ষার ফলাফল
        বিস্তারিতভাবে দেখো।
      </p>

    </div>

    <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-blue-400/15 bg-blue-500/10 px-4 py-2.5 text-xs font-medium text-blue-300">

      <FileText size={16} />

      {results.length} Result Records

    </span>

  </div>

  {/* =====================================
      EMPTY RESULT STATE
  ===================================== */}

  {results.length === 0 ? (

    <div className={`${theme.card} px-6 py-16 text-center sm:py-20`}>

      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-400/15 bg-blue-500/10">

        <Trophy
          size={38}
          strokeWidth={1.5}
          className="text-blue-300"
        />

      </div>

      <h3 className="mt-7 text-xl font-semibold text-white">
        {error
          ? "ফলাফল লোড করা যায়নি"
          : "এখনো কোনো ফলাফল প্রকাশিত হয়নি"}
      </h3>

      <p className="mx-auto mt-4 max-w-md text-sm leading-8 text-slate-400">
        {error
          ? "ফলাফল দেখতে আবার চেষ্টা করো।"
          : "তোমার পরীক্ষার ফলাফল প্রকাশিত হলে এখানে নম্বর, গ্রেড, পজিশন এবং বিস্তারিত রিপোর্ট দেখতে পাবে।"}
      </p>

      <button
        type="button"
        onClick={refreshResults}
        disabled={refreshing}
        className={`mt-7 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-50 ${focusStyle}`}
      >

        <RefreshCw
          size={17}
          className={refreshing ? "animate-spin" : ""}
        />

        {refreshing ? "Refreshing..." : "Refresh Results"}

      </button>

    </div>

  ) : (

    /* =====================================
        RESULT CARDS LIST
    ===================================== */

    <div className="space-y-6">

      {results.map((item, index) => {

        const resultKey = getResultKey(item);

        const downloading =
          downloadingResultKey === resultKey;

        const percentage =
          item.percentage === null ||
          item.percentage === undefined ||
          item.percentage === ""
            ? "—"
            : `${String(item.percentage)
                .replace(/%$/, "")
                .trim()}%`;

        return (

          <article
            key={`${resultKey}-${index}`}
            className={`${theme.card} relative overflow-hidden transition-all duration-300 hover:border-blue-400/20`}
          >

            {/* Top Accent Line */}
            <div
              aria-hidden="true"
              className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent"
            />

            {/* =====================================
                RESULT CARD HEADER
            ===================================== */}

            <div className="border-b border-white/[0.07] p-6 sm:p-8">

              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

                <div className="flex items-start gap-4">

                  <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 p-3 text-blue-300">

                    <GraduationCap size={26} />

                  </div>

                  <div className="min-w-0">

                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-blue-300">
                      ACADEMIC EXAMINATION
                    </p>

                    <h3 className="mt-2 break-words text-xl font-semibold text-white sm:text-2xl">
                      {item.exam_type || "Examination"}
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      {item.subject || "Subject not specified"}
                    </p>

                  </div>

                </div>

                {/* Exam Number */}
                {item.exam_number !== null &&
                  item.exam_number !== undefined && (

                  <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-blue-400/15 bg-blue-500/10 px-4 py-2.5 text-xs font-semibold text-blue-300">

                    <Hash size={16} />

                    Exam {item.exam_number}

                  </div>

                )}

              </div>

              {/* Chapter & Date */}
              <div className="mt-6 flex flex-wrap gap-3">

                {item.chapter && (

                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-slate-300">

                    <BookOpen
                      size={15}
                      className="text-blue-300"
                    />

                    {item.chapter}

                  </span>

                )}

                {item.created_at && (

                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-slate-300">

                    <CalendarDays
                      size={15}
                      className="text-blue-300"
                    />

                    {formatResultDate(item.created_at)}

                  </span>

                )}

              </div>

            </div>

            {/* =====================================
                RESULT MARKS & PERFORMANCE
            ===================================== */}

            <div className="p-6 sm:p-8">

              <div className="mb-5">

                <h4 className="text-base font-semibold text-white">
                  Performance Overview
                </h4>

                <p className="mt-2 text-xs text-slate-500">
                  Exam marks, percentage, grade and position
                </p>

              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">

                {/* Marks */}
                <div className="rounded-2xl border border-blue-400/15 bg-blue-500/[0.07] p-4 sm:p-5">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                    <FileText size={20} />
                  </div>

                  <p className="mt-4 text-xs font-medium text-slate-400">
                    Obtained Marks
                  </p>

                  <p className="mt-2 break-words text-2xl font-semibold text-white">
                    {displayValue(item.marks)}

                    <span className="ml-1 text-sm font-normal text-slate-400">
                      / {displayValue(item.total_marks)}
                    </span>
                  </p>

                </div>

                {/* Percentage */}
                <div className="rounded-2xl border border-violet-400/15 bg-violet-500/[0.07] p-4 sm:p-5">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                    <ChartNoAxesColumn size={20} />
                  </div>

                  <p className="mt-4 text-xs font-medium text-slate-400">
                    Percentage
                  </p>

                  <p className="mt-2 break-words text-2xl font-semibold text-white">
                    {percentage}
                  </p>

                </div>

                {/* Grade */}
                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.07] p-4 sm:p-5">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                    <Medal size={20} />
                  </div>

                  <p className="mt-4 text-xs font-medium text-slate-400">
                    Grade
                  </p>

                  <p className="mt-2 break-words text-2xl font-semibold text-emerald-300">
                    {displayValue(item.grade)}
                  </p>

                </div>

                {/* Position */}
                <div className="rounded-2xl border border-amber-400/15 bg-amber-500/[0.07] p-4 sm:p-5">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                    <Trophy size={20} />
                  </div>

                  <p className="mt-4 text-xs font-medium text-slate-400">
                    Position
                  </p>

                  <p className="mt-2 break-words text-2xl font-semibold text-amber-300">
                    {displayValue(item.position)}
                  </p>

                </div>

              </div>

              {/* =====================================
                  TEACHER COMMENT
              ===================================== */}

              {item.comment && (

                <div className="mt-6 rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.05] p-5 sm:p-6">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">

                      <MessageSquare size={19} />

                    </div>

                    <div className="min-w-0 flex-1">

                      <h4 className="text-sm font-semibold text-emerald-300">
                        Teacher's Comment
                      </h4>

                      <p className="mt-3 whitespace-pre-line break-words text-sm leading-8 text-slate-300">
                        {item.comment}
                      </p>

                    </div>

                  </div>

                </div>

              )}

              {/* =====================================
                  PDF DOWNLOAD ACTION
              ===================================== */}

              <div className="mt-7 flex flex-col justify-between gap-5 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">

                    <ShieldCheck size={19} />

                  </div>

                  <div>

                    <p className="text-xs font-medium text-slate-200">
                      Academic Result Report
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                      The Curious Classroom
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => downloadResultPDF(item)}
                  disabled={downloadingResultKey !== null}
                  className={`group inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/20 disabled:cursor-wait disabled:opacity-60 sm:w-auto ${focusStyle}`}
                >

                  {downloading ? (

                    <>
                      <LoaderCircle
                        size={19}
                        className="animate-spin"
                      />

                      Generating PDF...
                    </>

                  ) : (

                    <>
                      <Download size={18} />

                      Download Result PDF

                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>

                  )}

                </button>

              </div>

            </div>

          </article>

        );
      })}

    </div>

  )}

</section>

{/* =====================================
    FOOTER BRAND BANNER
===================================== */}

<section className="mt-12">

  <div className="relative overflow-hidden rounded-3xl border border-blue-400/10 bg-gradient-to-r from-[#14264A] via-[#142B53] to-[#101F3D] p-6 sm:p-8">

    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-blue-500/15 blur-[75px]"
    />

    <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">

      {/* Brand Content */}
      <div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300">
          THE CURIOUS CLASSROOM
        </p>

        <h2 className="mt-3 text-xl font-semibold text-white">
          প্রতিটি পরীক্ষাই এগিয়ে যাওয়ার সুযোগ।
        </h2>

        <p className="mt-3 max-w-lg text-sm leading-7 text-blue-100/70">
          নিয়মিত অধ্যয়ন, পরীক্ষা এবং অনুশীলনের
          মাধ্যমে নিজের অগ্রগতি মূল্যায়ন করো।
          আত্মবিশ্বাসের সঙ্গে এগিয়ে যাও
          তোমার স্বপ্নের লক্ষ্যে।
        </p>

      </div>

      {/* Shishir BioVerse Logo */}
      <div className="w-full shrink-0 rounded-2xl bg-white p-4 sm:w-[200px]">

        <div className="relative h-[90px] w-full">

          <Image
            src="/shishir-bioverse.png"
            alt="Shishir BioVerse"
            fill
            sizes="200px"
            className="object-contain"
          />

        </div>

      </div>

    </div>

  </div>

</section>

{/* =====================================
    CLOSE MAIN CONTENT
===================================== */}

      </main>

      {/* =====================================
          PAGE FOOTER
      ===================================== */}

      <footer className="mx-auto mt-8 max-w-[1500px] border-t border-white/[0.07] px-5 py-6 sm:px-8 lg:px-10">

        <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">

          <p className="text-xs leading-6 text-slate-500">
            © {new Date().getFullYear()} The Curious Classroom.
            All Rights Reserved.
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-500">

            <ShieldCheck
              size={15}
              className="text-blue-400"
            />

            Student Academic Portal

          </div>

        </div>

        <p className="mt-3 text-center text-[11px] text-slate-600 sm:text-left">
          The Curious Classroom · Shishir BioVerse
        </p>

      </footer>

    </div>

  </div>
);
}

// =====================================
// END — PREMIUM STUDENT RESULT PAGE
// =====================================
