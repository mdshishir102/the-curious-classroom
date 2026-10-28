"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";


import {
  AlertCircle, ArrowRight, ArrowUpRight, BadgeCheck, Bell, BookOpen,
  CalendarDays, ClipboardList, Clock3, CreditCard, Download, FileText,
  GraduationCap, LayoutDashboard, LoaderCircle, LogOut, Menu, ShieldCheck,
  Sparkles, Trophy, UserRound, Wallet, X, Video, TrendingUp, type LucideIcon,
} from "lucide-react";




  import {
  getGreeting,
  AttendanceRing,
  NextClassCard,
  AttendanceCalendar,
} from "@/components/student/DashboardWidgets";
import { CountUp, useRevealOnScroll } from "@/components/student/Motion";

// ===================== TYPES =====================

type Student = {
  id: string | number;
  student_id: string;
  student_name?: string | null;
  student_photo?: string | null;
  class?: string | null;
  batch?: string | null;
  whatsapp?: string | null;
};

type Schedule = {
  id: string | number;
  class_name?: string | null;
  subject?: string | null;
  topic?: string | null;
  schedule_date: string;
  start_time?: string | null;
  end_time?: string | null;
};

type Attendance = {
  id: string | number;
  attendance_date: string;
  status: string;
  class_schedules?: { subject?: string | null } | null;
};

type Notice = {
  id: string | number;
  title?: string | null;
  description?: string | null;
  created_at?: string | null;
};

type Exam = {
  id: string | number;
  subject?: string | null;
  exam_type?: string | null;
  exam_date: string;
  exam_time?: string | null;
};

type Result = {
  id: string | number;
  subject?: string | null;
  exam_type?: string | null;
  marks?: number | string | null;
  grade?: string | null;
};

type Payment = {
  id: string | number;
  month: string;
  year: number | string;
  status?: string | null;
  amount?: number | string | null;
  payment_method?: string | null;
  payment_date?: string | null;
  transaction_id?: string | null;
  receipt_id?: string | null;
  student_name?: string | null;
  student_id?: string | null;
  class?: string | null;
  batch?: string | null;
};

type Discount = {
  monthly_fee?: number | string | null;
  reason?: string | null;
};

// ===================== DESIGN =====================

const card =

  "card-lift rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)]";




const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]";

// ===================== CONFIG =====================

type StudentNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
  external?: boolean;
};

const studentNavItems: StudentNavItem[] = [
  { title: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard, description: "Student overview" },
  { title: "Class Notes", href: "/student/notes", icon: BookOpen, description: "Biology Notes & Books" },
    { title: "Recorded Classes", href: "/student/recorded-classes", icon: Video, description: "Biology lecture archive" },
  { title: "Online Exams", href: "/student/exams", icon: ClipboardList, description: "Online examination" },
  { title: "My Results", href: "/student/result", icon: Trophy, description: "Academic progress" },
  { title: "My Payments", href: "/student/payment", icon: CreditCard, description: "Monthly fee history" },
];


const progressTrackerItem: StudentNavItem = {
  title: "Progress Tracker",
  href: "https://progress.battlesofbiology.org",
  icon: TrendingUp,
  description: "সিলেবাস সম্পন্নতা ট্র্যাক করুন",
  external: true,
};




const studentGuidelines = [
  {
    title: "নিয়মিত উপস্থিতির নিয়ম",
    description:
      "প্রত্যেক শিক্ষার্থীর নিয়মিত ক্লাসে উপস্থিত থাকা বাধ্যতামূলক। টানা ৩ (তিন) দিনের বেশি অনুপস্থিত থাকলে কর্তৃপক্ষ প্রয়োজন অনুযায়ী ব্যবস্থা গ্রহণ করতে পারবে।",
  },
  {
    title: "অনুপস্থিতির ক্ষেত্রে করণীয়",
    description:
      "কোনো অনিবার্য কারণে ক্লাসে উপস্থিত হতে না পারলে অবশ্যই পূর্বেই শিক্ষক বা কর্তৃপক্ষকে অবহিত করতে হবে।",
  },
  {
    title: "পরীক্ষায় অনুপস্থিতির নিয়ম",
    description:
      "কোনো পরীক্ষায় অনুপস্থিত থাকলে নির্ধারিত ১০০ টাকা জরিমানা প্রদান করতে হবে। জরিমানা পরিশোধ না করা পর্যন্ত পরবর্তী ক্লাস বা পরীক্ষায় অংশগ্রহণের অনুমতি দেওয়া হবে না।",
  },
  {
    title: "দীর্ঘ অনুপস্থিতির নিয়ম",
    description:
      "কোনো শিক্ষার্থী টানা ৬ (ছয়) দিন অনুপস্থিত থাকলে তার ভর্তি বাতিল হতে পারে। পুনরায় ক্লাসে অংশগ্রহণের জন্য নতুন করে ভর্তি প্রক্রিয়া সম্পন্ন করতে হবে।",
  },
  {
    title: "মাসিক ফি পরিশোধের নিয়ম",
    description:
      "প্রতি মাসের ১৫ তারিখের মধ্যে নির্ধারিত মাসিক ফি পরিশোধ করতে হবে। কোনো বিশেষ সমস্যা থাকলে নির্ধারিত সময়ের পূর্বেই কর্তৃপক্ষকে জানাতে হবে।",
  },
  {
    title: "শৃঙ্খলা ও আচরণবিধি",
    description:
      "The Curious Classroom-এর শিক্ষার পরিবেশ, নিয়ম-কানুন ও শৃঙ্খলা বজায় রাখা প্রত্যেক শিক্ষার্থীর দায়িত্ব। সকল শিক্ষার্থীকে প্রতিষ্ঠানের নিয়মাবলি যথাযথভাবে মেনে চলতে হবে।",
  },
];

// ===================== HELPERS =====================

function getDhakaToday(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values: Record<string, string> = {};
  for (const part of parts) values[part.type] = part.value;
  return `${values.year}-${values.month}-${values.day}`;
}

function formatDate(value?: string | null): string {
  if (!value) return "N/A";
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatTime(value?: string | null): string {
  if (!value) return "N/A";
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return value;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return value;
  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${String(minute).padStart(2, "0")} ${period}`;
}

function getCurrentMonthInfo() {
  const today = getDhakaToday();
  const [yearText, monthText] = today.split("-");
  const year = Number(yearText);
  const monthNumber = Number(monthText);
  const month = new Intl.DateTimeFormat("en-US", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
  return { month, year, label: `${month} ${year}` };
}

function getAttendanceStatus(status: string) {
  switch (status?.toLowerCase()) {
    case "present":
      return { label: "Present", color: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" };
    case "late":
      return { label: "Late", color: "border-amber-400/20 bg-amber-400/10 text-amber-300" };
    case "absent":
      return { label: "Absent", color: "border-red-400/20 bg-red-400/10 text-red-300" };
    default:
      return { label: status || "Unknown", color: "border-white/10 bg-white/5 text-slate-300" };
  }
}



// ===================== COMPONENT =====================

export default function StudentDashboard() {
  const router = useRouter();

  const [student, setStudent] = useState<Student | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [fees, setFees] = useState<Payment[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [discountFee, setDiscountFee] = useState<Discount | null>(null);

  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [feesLoaded, setFeesLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [error, setError] = useState("");
  const [attendanceMonth, setAttendanceMonth] = useState(
    () => getCurrentMonthInfo().label
  );
  const [downloadingReceiptId, setDownloadingReceiptId] = useState<string | null>(null);

  const currentMonthInfo = getCurrentMonthInfo();

  const currentMonthPayment = useMemo(() => {
    const matching = fees.filter(
      (payment) =>
        payment.month === currentMonthInfo.month &&
        Number(payment.year) === currentMonthInfo.year
    );
    return (
      matching.find((payment) => payment.status?.toLowerCase() === "paid") ??
      matching[0] ??
      null
    );
  }, [fees, currentMonthInfo.month, currentMonthInfo.year]);

  const feeDue =
    feesLoaded && currentMonthPayment?.status?.toLowerCase() !== "paid"
      ? { month: currentMonthInfo.month, year: currentMonthInfo.year }
      : null;

  const attendanceMonths = useMemo(() => {
    const [year, month] = getDhakaToday().split("-").map(Number);
    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(Date.UTC(year, month - 1 - index, 1));
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(date);
    });
  }, []);

  const totalClass = attendanceData.length;
  const presentCount = attendanceData.filter((i) => i.status === "present").length;
  const absentCount = attendanceData.filter((i) => i.status === "absent").length;
  const lateCount = attendanceData.filter((i) => i.status === "late").length;
  const attendancePercentage =
    totalClass > 0
      ? Math.round(((presentCount + lateCount) / totalClass) * 100)
      : 0;

  // ---------- Load dashboard ----------
  useEffect(() => {
    let active = true;

    async function initializeDashboard() {
      setLoading(true);

      try {
        const savedStudent = localStorage.getItem("student");

        if (!savedStudent) {
          router.replace("/student/login");
          return;
        }

        let studentData: Student;

        try {
          studentData = JSON.parse(savedStudent);
        } catch {
          localStorage.removeItem("student");
          router.replace("/student/login");
          return;
        }

        if (!studentData || studentData.id == null || !studentData.student_id) {
          localStorage.removeItem("student");
          router.replace("/student/login");
          return;
        }

        const { data: currentStudent, error: studentError } = await supabase
          .from("students")
          .select("login_enabled")
          .eq("id", studentData.id)
          .single();

        if (!active) return;
        if (studentError) throw studentError;

        if (!currentStudent || !currentStudent.login_enabled) {
          localStorage.removeItem("student");
          localStorage.removeItem("student_id");
          router.replace("/student/login");
          return;
        }

        setStudent(studentData);

        const className = studentData.class?.trim();

        const scheduleRequest = className
          ? supabase
              .from("class_schedules")
              .select("*")
              .ilike("class_name", `%${className}%`)
              .order("schedule_date", { ascending: true })
          : Promise.resolve({ data: [] as Schedule[], error: null });

        const [
          scheduleResponse,
          noticeResponse,
          examResponse,
          paymentResponse,
          discountResponse,
          resultResponse,
        ] = await Promise.all([
          scheduleRequest,
          supabase.from("notices").select("*").order("created_at", { ascending: false }),
          supabase.from("exams").select("*").order("exam_date", { ascending: true }),
          supabase
            .from("payments")
            .select("*")
            .eq("student_id", studentData.id)
            .order("payment_date", { ascending: false }),
          supabase
            .from("student_fee_settings")
            .select("*")
            .eq("student_id", studentData.id)
            .eq("academic_year", getCurrentMonthInfo().year)
            .maybeSingle(),
          supabase.from("results").select("*").eq("student_id", studentData.id),
        ]);

        if (!active) return;

        const today = getDhakaToday();
        const currentTime = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Dhaka",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date());

        const upcomingSchedules = (scheduleResponse.data ?? []).filter(
          (item: Schedule) => {
            if (item.schedule_date > today) return true;
            if (item.schedule_date === today) {
              return !item.end_time || item.end_time.slice(0, 5) > currentTime;
            }
            return false;
          }
        );

        setSchedules(upcomingSchedules);
        setNotices(noticeResponse.data ?? []);
        setExams(examResponse.data ?? []);
        setFees(paymentResponse.data ?? []);
        setFeesLoaded(!paymentResponse.error);
        setDiscountFee(discountResponse.data ?? null);
        setResults(resultResponse.data ?? []);

        // DEBUG: kon query fail korche ta console-e dekhabe
        console.table({
          schedule: scheduleResponse.error?.message,
          notice: noticeResponse.error?.message,
          exam: examResponse.error?.message,
          payment: paymentResponse.error?.message,
          discount: discountResponse.error?.message,
          result: resultResponse.error?.message,
        });

        if (
          scheduleResponse.error ||
          noticeResponse.error ||
          examResponse.error ||
          paymentResponse.error ||
          discountResponse.error ||
          resultResponse.error
        ) {
          setError("কিছু তথ্য লোড করা যায়নি। পরে আবার চেষ্টা করুন।");
        }
      } catch (err) {
        console.error("Student dashboard error:", err);
        if (active) setError("Dashboard তথ্য লোড করতে সমস্যা হচ্ছে।");
      } finally {
        if (active) setLoading(false);
      }
    }

    void initializeDashboard();

    return () => {
      active = false;
    };
  }, [router]);

  // ---------- Load attendance by month ----------
  useEffect(() => {
    const studentId = student?.student_id;
    if (!studentId) return;

    let active = true;

    async function loadAttendance() {
      setAttendanceLoading(true);

      try {
        const [monthName, yearText] = attendanceMonth.split(" ");
        const months = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December",
        ];
        const monthNumber = months.indexOf(monthName) + 1;
        const year = Number(yearText);

        if (monthNumber < 1 || !Number.isInteger(year)) {
          throw new Error("Invalid attendance month");
        }

        const firstDay = `${year}-${String(monthNumber).padStart(2, "0")}-01`;
        const lastDate = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
        const lastDay = `${year}-${String(monthNumber).padStart(2, "0")}-${lastDate}`;

        const { data, error: attendanceError } = await supabase
          .from("attendance")
          .select("*")
          .eq("student_id", studentId)
          .gte("attendance_date", firstDay)
          .lte("attendance_date", lastDay)
          .order("attendance_date", { ascending: false });

        if (!active) return;
        if (attendanceError) throw attendanceError;

        const records: Attendance[] = data ?? [];
        setAttendanceData(records);

        if (attendanceMonth === getCurrentMonthInfo().label) {
          const today = getDhakaToday();
          setTodayAttendance(records.filter((i) => i.attendance_date === today));
        }
      } catch (err) {
        console.error("Attendance error:", err);
        if (active) setError("Attendance তথ্য লোড করা যাচ্ছে না।");
      } finally {
        if (active) setAttendanceLoading(false);
      }
    }

    void loadAttendance();

    return () => {
      active = false;
    };
  }, [student?.student_id, attendanceMonth]);

  function logout() {
    localStorage.removeItem("student");
    localStorage.removeItem("student_id");
    router.replace("/student/login");
  }

  const isCurrentMonthPaid =
    currentMonthPayment?.status?.toLowerCase() === "paid";

  const quickAccessItems = studentNavItems.filter(
    (item) => item.href !== "/student/dashboard"
  );

  const latestNotices = useMemo(() => notices.slice(0, 3), [notices]);
  const recentResults = useMemo(() => results.slice(0, 3), [results]);
  useRevealOnScroll(!loading && !!student);




  // ---------- Receipt PDF ----------
  async function downloadReceipt(payment: Payment) {
    const receiptId = String(payment.receipt_id ?? "").trim();

    if (!receiptId) {
      setError("এই পেমেন্টের Receipt ID পাওয়া যায়নি।");
      return;
    }

    if (payment.status?.toLowerCase() !== "paid") {
      setError("শুধুমাত্র পরিশোধিত পেমেন্টের রসিদ ডাউনলোড করা যাবে।");
      return;
    }

    if (downloadingReceiptId) return;

    try {
      setError("");
      setDownloadingReceiptId(receiptId);

      const [{ default: jsPDF }, { default: QRCode }] = await Promise.all([
        import("jspdf"),
        import("qrcode"),
      ]);

      const doc = new jsPDF();

      const verifyUrl = `https://thecuriousclassroom.vercel.app/student/verify?receipt=${encodeURIComponent(receiptId)}`;
      const qrImage = await QRCode.toDataURL(verifyUrl, { width: 300, margin: 2 });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(25, 92, 245);
      doc.text("The Curious Classroom", 20, 25);

      doc.setFontSize(13);
      doc.setTextColor(55, 65, 81);
      doc.text("OFFICIAL DIGITAL PAYMENT RECEIPT", 20, 40);

      doc.setDrawColor(220, 225, 235);
      doc.line(20, 47, 190, 47);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(40, 50, 65);
      doc.text(`Receipt ID: ${receiptId}`, 20, 60);
      doc.text(
        `Generated: ${new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}`,
        20,
        70
      );

      doc.setFont("helvetica", "bold");
      doc.text("STUDENT INFORMATION", 20, 85);

      doc.setFont("helvetica", "normal");
      doc.text(`Student Name: ${payment.student_name || student?.student_name || "N/A"}`, 20, 96);
      doc.text(`Student ID: ${payment.student_id || student?.student_id || "N/A"}`, 20, 106);
      doc.text(`Class: ${payment.class || student?.class || "N/A"}`, 20, 116);
      doc.text(`Batch: ${payment.batch || student?.batch || "N/A"}`, 20, 126);

      doc.setFont("helvetica", "bold");
      doc.text("PAYMENT INFORMATION", 20, 143);

      doc.setFont("helvetica", "normal");
      doc.text(`Month: ${payment.month} ${payment.year}`, 20, 154);
      doc.text(`Amount: BDT ${payment.amount ?? "N/A"}`, 20, 164);
      doc.text(`Payment Method: ${payment.payment_method || "N/A"}`, 20, 174);
      doc.text(`Transaction ID: ${payment.transaction_id || "N/A"}`, 20, 184);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 150, 95);
      doc.text("Payment Status: PAID", 20, 195);

      doc.setTextColor(40, 50, 65);
      doc.setFontSize(10);
      doc.text("Scan To Verify Receipt", 20, 209);
      doc.addImage(qrImage, "PNG", 20, 214, 43, 43);

      doc.setFontSize(8);
      doc.text(doc.splitTextToSize(verifyUrl, 165), 20, 268);

      const safeReceiptId = receiptId.replace(/[^a-zA-Z0-9_-]/g, "_");
      doc.save(`TCCS_Receipt_${safeReceiptId}.pdf`);
    } catch (err) {
      console.error("Receipt download error:", err);
      setError("Receipt PDF তৈরি করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setDownloadingReceiptId(null);
    }
  }

  // ===================== LOADING / FALLBACK =====================

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
        <p className="mt-5 text-sm text-slate-400">Loading Student Dashboard...</p>
      </main>
    );
  }

  if (!student) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#080D19] p-6 text-center">
        <div>
          <ShieldCheck size={36} className="mx-auto text-blue-400" />
          <p className="mt-5 text-sm text-slate-300">Student account unavailable.</p>
          <Link
            href="/student/login"
            className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Login
          </Link>
        </div>
      </main>
    );
  }


  return (
    <div className="relative min-h-dvh bg-[#080D19] text-slate-100">
      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ============ SIDEBAR ============ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[282px] flex-col border-r border-white/10 bg-[#0D1627] shadow-[20px_0_80px_rgba(0,0,0,0.15)] transition-transform duration-300 lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/[0.07] px-5 py-7">
          <div className="flex items-start justify-between gap-3">
            <Link
              href="/student/dashboard"
              onClick={() => setMenuOpen(false)}
              className={`inline-flex rounded-xl bg-white px-3 py-2 ${focus}`}
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
            <p className="mt-2 text-base font-semibold text-white">Student Workspace</p>
            <p className="mt-1 text-xs text-slate-500">Your Personal Learning Space</p>
          </div>
        </div>

        <nav aria-label="Student navigation" className="flex-1 overflow-y-auto px-3 py-6">
          <p className="mb-3 px-4 text-[10px] font-semibold tracking-[0.2em] text-slate-500">
            STUDENT PORTAL
          </p>

          <div className="space-y-1">
            {studentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === "/student/dashboard";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-colors ${focus} ${
                    isActive
                      ? "border border-blue-400/15 bg-blue-600/15 text-blue-300"
                      : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <Icon
                    size={19}
                    className={isActive ? "text-blue-400" : "text-slate-500 group-hover:text-blue-300"}
                  />
                  <span className="flex-1">{item.title}</span>
{isActive && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />}                </Link>
              );
            })}
          </div>

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



      {/* ============ MAIN WRAPPER ============ */}
      <div className="min-h-dvh lg:ml-[282px]">
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#0A1120]/95 backdrop-blur-xl">
          <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
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
                  Student Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-blue-400/15 bg-blue-500/[0.06] px-4 py-2.5 text-xs text-blue-300 sm:flex">
                <Sparkles size={15} />
                Learning Workspace
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/10 text-blue-300">
                <UserRound size={20} />
              </div>
            </div>
          </div>
        </header>

        <main className="relative mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {/* ============ WELCOME ============ */}
          <section>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-7 bg-blue-400" />
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-blue-300">
                YOUR LEARNING SPACE
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Welcome Back,{" "}
              <span className="text-shimmer">
                {student.student_name?.split(" ")[0] || "Student"}!
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              {getGreeting().text}! {getGreeting().line}
            </p>
          </section>

          {/* ============ PROFILE CARD ============ */}
          <section aria-labelledby="student-profile-heading" className="mt-9">
            <div className="relative overflow-hidden rounded-3xl border border-blue-400/15 bg-gradient-to-br from-[#162A50] via-[#132441] to-[#101A2C] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)] sm:p-8">
              <div
                aria-hidden="true"
className="glow-pulse pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-[80px]"

              />

              <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <div className="shrink-0">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-blue-400/25 bg-[#080D19] shadow-xl sm:h-28 sm:w-28">
                    {student.student_photo ? (
                      <img
                        src={student.student_photo}
                        alt={student.student_name || "Student"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound size={43} className="text-blue-300" />
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-[11px] font-medium text-blue-200">
                    <BadgeCheck size={14} />
                    Student Profile
                  </div>

                  <h2
                    id="student-profile-heading"
                    className="break-words text-2xl font-semibold text-white sm:text-3xl"
                  >
                    {student.student_name || "Student"}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    The Curious Classroom Student Portal
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-medium text-emerald-300">
<span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />                  Portal Active
                </div>
              </div>

              <div className="relative mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-7 sm:grid-cols-4 sm:gap-4">
                <ProfileInfo label="Student ID" value={student.student_id} icon={UserRound} />
                <ProfileInfo label="Class" value={student.class || "N/A"} icon={GraduationCap} />
                <ProfileInfo label="Batch" value={student.batch || "N/A"} icon={BookOpen} />
                <ProfileInfo label="Phone" value={student.whatsapp || "N/A"} icon={CreditCard} />
              </div>
            </div>
          </section>

          {/* ============ NEW: NEXT CLASS ============ */}
          <section className="mt-10">
            <NextClassCard
              schedule={schedules[0] ?? null}
              formatDate={formatDate}
              formatTime={formatTime}
            />
          </section>

          {/* ============ ATTENDANCE OVERVIEW ============ */}
          <section className="mt-10">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-px w-7 bg-blue-400" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-blue-300">
                    ACADEMIC OVERVIEW
                  </span>
                </div>
                <h2 className="text-2xl font-semibold text-white">Attendance Overview</h2>
                <p className="mt-2 text-sm text-slate-400">
                  তোমার মাসিক ক্লাসে উপস্থিতির বিবরণ
                </p>
              </div>

              <select
                aria-label="Select attendance month"
                value={attendanceMonth}
                onChange={(event) => setAttendanceMonth(event.target.value)}
                className={`min-h-11 rounded-xl border border-white/10 bg-[#101A2C] px-4 py-2 text-sm text-slate-200 outline-none ${focus}`}
              >
                {attendanceMonths.map((month) => (
                  <option key={month} value={month} className="bg-[#101A2C]">
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <div className={`${card} p-5 sm:p-6`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-300">
                  <CalendarDays size={23} />
                </div>
                <p className="mt-5 text-sm text-slate-400">Total Classes</p>
                <h3 className="mt-2 text-3xl font-semibold text-white">
                 
                 
                 {attendanceLoading ? "…" : <CountUp value={totalClass} />}
                
                
                
                </h3>



                <p className="mt-2 text-xs text-slate-500">Recorded classes</p>
              </div>

              <div className={`${card} p-5 sm:p-6`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/15 bg-emerald-500/10 text-emerald-300">
                  <BadgeCheck size={23} />
                </div>
                <p className="mt-5 text-sm text-slate-400">Present</p>
                <h3 className="mt-2 text-3xl font-semibold text-white">
                  
                  
{attendanceLoading ? "…" : <CountUp value={presentCount} />}                
                
                
                </h3>
                <p className="mt-2 text-xs text-emerald-400/80">Successfully attended</p>
              </div>

              <div className={`${card} p-5 sm:p-6`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/15 bg-amber-500/10 text-amber-300">
                  <Clock3 size={23} />
                </div>
                <p className="mt-5 text-sm text-slate-400">Late</p>
                <h3 className="mt-2 text-3xl font-semibold text-white">
                 
                 
                 
{attendanceLoading ? "…" : <CountUp value={lateCount} />}               
               
               
               
                </h3>
                <p className="mt-2 text-xs text-amber-400/80">Late arrivals</p>
              </div>

              <div className={`${card} p-5 sm:p-6`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/15 bg-red-500/10 text-red-300">
                  <AlertCircle size={23} />
                </div>
                <p className="mt-5 text-sm text-slate-400">Absent</p>
                <h3 className="mt-2 text-3xl font-semibold text-white">
                
                
                
{attendanceLoading ? "…" : <CountUp value={absentCount} />}               
               
               
               
                </h3>
                <p className="mt-2 text-xs text-red-400/80">Missed classes</p>
              </div>
            </div>

            {/* NEW: Attendance ring */}
            <div className={`${card} mt-5 p-6`}>
              <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-base font-semibold text-white">Monthly Attendance Rate</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {attendanceMonth} · Present ও Late ক্লাসের ভিত্তিতে হিসাব
                  </p>
                </div>

                <AttendanceRing
                  percent={attendancePercentage}
                  loading={attendanceLoading}
                  hasData={totalClass > 0}
                />
              </div>
            </div>
          </section>



          {/* ============ UPCOMING CLASSES & TODAY ============ */}
          <section className="mt-10 grid gap-6 xl:grid-cols-2">
            <div className={`${card} p-6 sm:p-7`}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-300">
                  <CalendarDays size={23} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Upcoming Classes</h2>
                  <p className="mt-1 text-xs text-slate-500">তোমার পরবর্তী ক্লাসের সময়সূচি</p>
                </div>
              </div>

              {schedules.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                  <CalendarDays size={29} className="mx-auto text-slate-500" />
                  <p className="mt-4 text-sm text-slate-400">No upcoming class available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {schedules.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/[0.07] bg-[#0B1425] p-5 transition-colors hover:border-blue-400/20"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-blue-300">
                            {item.class_name || "Class"}
                          </p>
                          <h3 className="mt-2 text-base font-semibold text-white">
                            {item.subject || "Subject not specified"}
                          </h3>
                        </div>
                        <span className="rounded-full border border-blue-400/15 bg-blue-500/10 px-3 py-1.5 text-[11px] text-blue-300">
                          Upcoming
                        </span>
                      </div>

                      {item.topic && (
                        <div className="mt-4 flex items-start gap-2 text-sm text-slate-400">
                          <BookOpen size={16} className="mt-0.5 shrink-0 text-blue-400" />
                          <span>{item.topic}</span>
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 border-t border-white/[0.07] pt-4">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <CalendarDays size={15} className="text-blue-300" />
                          {formatDate(item.schedule_date)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock3 size={15} className="text-blue-300" />
                          {formatTime(item.start_time)} - {formatTime(item.end_time)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`${card} p-6 sm:p-7`}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/15 bg-emerald-500/10 text-emerald-300">
                  <ClipboardList size={23} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Today&apos;s Attendance</h2>
                  <p className="mt-1 text-xs text-slate-500">আজকের উপস্থিতির সর্বশেষ তথ্য</p>
                </div>
              </div>

              {attendanceLoading ? (
                <div className="flex min-h-[160px] items-center justify-center gap-3 text-sm text-slate-400">
                  <LoaderCircle size={19} className="animate-spin text-blue-400" />
                  Loading attendance...
                </div>
              ) : todayAttendance.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                  <ClipboardList size={30} className="mx-auto text-slate-500" />
                  <p className="mt-4 text-sm text-slate-400">No attendance update today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAttendance.map((item) => {
                    const statusInfo = getAttendanceStatus(item.status);
                    return (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-[#0B1425] p-5"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {formatDate(item.attendance_date)}
                          </p>
                          {item.class_schedules?.subject && (
                            <p className="mt-2 text-xs text-slate-400">
                              {item.class_schedules.subject}
                            </p>
                          )}
                        </div>
                        <span
                          className={`inline-flex rounded-full border px-4 py-2 text-xs font-semibold ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* ============ NEW: ATTENDANCE CALENDAR ============ */}
          <section className="mt-10">
            <AttendanceCalendar
              monthLabel={attendanceMonth}
              records={attendanceData}
              today={getDhakaToday()}
            />
          </section>

          {/* ============ ATTENDANCE HISTORY ============ */}
          <section className="mt-10">
            <div className={`${card} p-6 sm:p-7`}>
              <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-semibold text-white">Attendance History</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {attendanceMonth} মাসের বিস্তারিত উপস্থিতি
                  </p>
                </div>
                <span className="w-fit rounded-full border border-blue-400/15 bg-blue-500/10 px-4 py-2 text-xs text-blue-300">
                  {attendanceLoading ? "Loading..." : `${attendanceData.length} Records`}
                </span>
              </div>

              {attendanceLoading ? (
                <div className="flex items-center justify-center gap-3 py-10 text-sm text-slate-400">
                  <LoaderCircle size={20} className="animate-spin text-blue-400" />
                  Loading records...
                </div>
              ) : attendanceData.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
                  <CalendarDays size={32} className="mx-auto text-slate-500" />
                  <p className="mt-4 text-sm text-slate-400">No attendance record available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attendanceData.map((item) => {
                    const statusInfo = getAttendanceStatus(item.status);
                    return (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-[#0B1425] px-5 py-4 transition-colors hover:bg-[#122039]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-blue-300">
                            <CalendarDays size={19} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {formatDate(item.attendance_date)}
                            </p>
                            {item.class_schedules?.subject && (
                              <p className="mt-1 text-xs text-slate-400">
                                {item.class_schedules.subject}
                              </p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`rounded-full border px-4 py-2 text-xs font-semibold ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>



          {/* ============ ERROR ============ */}
          {error && (
            <div
              role="alert"
              className="mt-8 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-5"
            >
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-300" />
              <p className="text-sm leading-7 text-red-200">{error}</p>
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

          {/* ============ NOTICES & EXAMS ============ */}
          <section className="mt-12">
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-7 bg-blue-400" />
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-blue-300">
                  STAY INFORMED
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-white">Notices &amp; Examinations</h2>
              <p className="mt-2 text-sm text-slate-400">
                গুরুত্বপূর্ণ নোটিশ এবং আসন্ন পরীক্ষার তথ্য
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className={`${card} p-6 sm:p-7`}>
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-300">
                      <Bell size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Notice Board</h3>
                      <p className="mt-1 text-xs text-slate-500">Latest announcements</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-blue-400/15 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-300">
                    {notices.length} Notices
                  </span>
                </div>

                {latestNotices.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center">
                    <Bell size={30} className="mx-auto text-slate-500" />
                    <p className="mt-4 text-sm text-slate-400">No notice available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {latestNotices.map((notice) => (
                      <div
                        key={notice.id}
                        className="rounded-2xl border border-white/[0.07] bg-[#0B1425] p-5 transition-colors hover:border-blue-400/20"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold leading-6 text-white">
                              {notice.title || "Announcement"}
                            </h4>
                            {notice.description && (
                              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-400">
                                {notice.description}
                              </p>
                            )}
                            {notice.created_at && (
                              <p className="mt-3 text-xs text-slate-500">
                                {formatDate(notice.created_at)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={`${card} p-6 sm:p-7`}>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/10 text-violet-300">
                    <ClipboardList size={23} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Upcoming Exams</h3>
                    <p className="mt-1 text-xs text-slate-500">পরীক্ষার সময়সূচি</p>
                  </div>
                </div>

                {exams.filter((exam) => exam.exam_date >= getDhakaToday()).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center">
                    <CalendarDays size={30} className="mx-auto text-slate-500" />
                    <p className="mt-4 text-sm text-slate-400">No upcoming exam available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {exams
                      .filter((exam) => exam.exam_date >= getDhakaToday())
                      .slice(0, 3)
                      .map((exam) => (
                        <div
                          key={exam.id}
                          className="rounded-2xl border border-white/[0.07] bg-[#0B1425] p-5 transition-colors hover:border-violet-400/20"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h4 className="text-base font-semibold text-white">
                                {exam.subject || "Exam"}
                              </h4>
                              <p className="mt-2 text-xs text-violet-300">
                                {exam.exam_type || "Examination"}
                              </p>
                            </div>
                            <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-[11px] font-medium text-violet-300">
                              Scheduled
                            </span>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 border-t border-white/[0.07] pt-4">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <CalendarDays size={15} className="text-violet-300" />
                              {formatDate(exam.exam_date)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <Clock3 size={15} className="text-violet-300" />
                              {formatTime(exam.exam_time)}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ============ PAYMENTS ============ */}
          <section className="mt-12">
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-7 bg-blue-400" />
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-blue-300">
                  FINANCIAL OVERVIEW
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-white">My Payments</h2>
              <p className="mt-2 text-sm text-slate-400">
                মাসিক ফি, পেমেন্ট স্ট্যাটাস ও রসিদের তথ্য
              </p>
            </div>

            <div className={`${card} p-6 sm:p-8`}>
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-300">
                    <Wallet size={25} />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                      CURRENT MONTH
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-white">
                      {currentMonthInfo.label}
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">Monthly Fee Overview</p>
                  </div>
                </div>

                {!feesLoaded ? (
                  <span className="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300">
                    Status Unavailable
                  </span>
                ) : isCurrentMonthPaid ? (
                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300">
                    <BadgeCheck size={16} />
                    Payment Completed
                  </span>
                ) : (
                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-xs font-semibold text-red-300">
                    <AlertCircle size={16} />
                    Payment Due
                  </span>
                )}
              </div>

              {currentMonthPayment ? (
                <div className="mt-7 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B1425] p-5">
                    <p className="text-xs text-slate-500">Payment Amount</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      ৳ {currentMonthPayment.amount ?? "N/A"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B1425] p-5">
                    <p className="text-xs text-slate-500">Payment Method</p>
                    <p className="mt-2 text-base font-semibold text-white">
                      {currentMonthPayment.payment_method || "N/A"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B1425] p-5">
                    <p className="text-xs text-slate-500">Transaction ID</p>
                    <p className="mt-2 break-all text-sm font-semibold text-white">
                      {currentMonthPayment.transaction_id || "N/A"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B1425] p-5">
                    <p className="text-xs text-slate-500">Payment Date</p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {formatDate(currentMonthPayment.payment_date)}
                    </p>
                  </div>
                </div>
              ) : feesLoaded ? (
                <div className="mt-7 rounded-2xl border border-amber-400/15 bg-amber-500/[0.06] p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="mt-0.5 shrink-0 text-amber-300" />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-200">
                        Current Month Payment Pending
                      </h4>
                      <p className="mt-2 text-sm leading-7 text-slate-400">
                        {feeDue?.month || currentMonthInfo.month} মাসের ফি এখনো পরিশোধিত হিসেবে
                        রেকর্ড করা হয়নি। প্রতি মাসের ১৫ তারিখের মধ্যে ফি পরিশোধ করতে হবে।
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-6 text-sm text-slate-400">
                  Payment information could not be loaded.
                </p>
              )}

              <div className="mt-7 flex flex-wrap gap-3 border-t border-white/10 pt-6">
                <Link
                  href="/student/payment"
                  className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 ${focus}`}
                >
                  View Payments
                  <ArrowRight size={17} />
                </Link>

                {isCurrentMonthPaid && currentMonthPayment?.receipt_id && (
                  <button
                    type="button"
                    onClick={() => downloadReceipt(currentMonthPayment)}
                    disabled={downloadingReceiptId !== null}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
                  >
                    {downloadingReceiptId === String(currentMonthPayment.receipt_id) ? (
                      <LoaderCircle size={17} className="animate-spin" />
                    ) : (
                      <Download size={17} />
                    )}
                    Download Receipt
                  </button>
                )}
              </div>
            </div>

            {discountFee && (
              <div className={`${card} mt-5 p-6 sm:p-8`}>
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/15 bg-amber-500/10 text-amber-300">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Special Fee Discount</h3>
                    <p className="mt-1 text-xs text-slate-400">Your Academic Fee Benefits</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/[0.07] bg-[#0B1425] p-5">
                    <p className="text-sm text-slate-400">Regular Monthly Fee</p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {student.class === "Class 9" ? "৳ 1,500" : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-5">
                    <p className="text-sm text-slate-400">Your Discounted Fee</p>
                    <p className="mt-3 text-2xl font-semibold text-emerald-300">
                      ৳ {discountFee.monthly_fee ?? "N/A"}
                    </p>
                  </div>
                </div>

                {discountFee.reason && (
                  <div className="mt-4 rounded-2xl border border-amber-400/10 bg-amber-400/[0.05] p-5">
                    <p className="text-xs font-medium text-amber-300">Discount Reason</p>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{discountFee.reason}</p>
                  </div>
                )}
              </div>
            )}

            {fees.length > 0 && (
              <div className={`${card} mt-5 p-6 sm:p-7`}>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Recent Payments</h3>
                    <p className="mt-2 text-xs text-slate-500">Your latest payment records</p>
                  </div>
                  <Link
                    href="/student/payment"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-300 hover:text-blue-200"
                  >
                    View All
                    <ArrowUpRight size={16} />
                  </Link>
                </div>

                <div className="space-y-3">
                  {fees.slice(0, 4).map((payment) => {
                    const paid = payment.status?.toLowerCase() === "paid";
                    return (
                      <div
                        key={payment.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-[#0B1425] p-4 sm:p-5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                            <CreditCard size={19} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {payment.month} {payment.year}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              ৳ {payment.amount ?? "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                              paid
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                : "border-amber-400/20 bg-amber-400/10 text-amber-300"
                            }`}
                          >
                            {paid ? "Paid" : payment.status || "Pending"}
                          </span>

                          {paid && payment.receipt_id && (
                            <button
                              type="button"
                              aria-label={`Download receipt for ${payment.month} ${payment.year}`}
                              title="Download Receipt"
                              onClick={() => downloadReceipt(payment)}
                              disabled={downloadingReceiptId !== null}
                              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-blue-300 transition hover:bg-white/10 disabled:opacity-50"
                            >
                              {downloadingReceiptId === String(payment.receipt_id) ? (
                                <LoaderCircle size={18} className="animate-spin" />
                              ) : (
                                <Download size={18} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>




          {/* ============ ACADEMIC PROGRESS ============ */}
          <section className="mt-12">
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-7 bg-blue-400" />
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-blue-300">
                  ACADEMIC PERFORMANCE
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-white">Academic Progress</h2>
              <p className="mt-2 text-sm text-slate-400">তোমার পরীক্ষার ফলাফল ও অগ্রগতি</p>
            </div>

            <div className={`${card} p-6 sm:p-8`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/10 text-violet-300">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Recent Exam Results</h3>
                    <p className="mt-1 text-xs text-slate-400">Latest academic records</p>
                  </div>
                </div>

                <Link
                  href="/student/result"
                  className={`inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20 ${focus}`}
                >
                  View All Results
                  <ArrowUpRight size={17} />
                </Link>
              </div>

              <div className="mt-7">
                {recentResults.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
                    <Trophy size={32} className="mx-auto text-slate-500" />
                    <p className="mt-4 text-sm text-slate-400">No result available yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-[#0B1425] p-5 transition-colors hover:border-violet-400/20"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                            <FileText size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white">
                              {result.subject || "Subject"}
                            </h4>
                            <p className="mt-1 text-xs text-slate-400">
                              {result.exam_type || "Examination"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-7">
                          <div className="text-right">
                            <p className="text-[11px] text-slate-500">Marks</p>
                            <p className="mt-1 text-xl font-semibold text-white">
                              {result.marks ?? "—"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] text-slate-500">Grade</p>
                            <p className="mt-1 text-lg font-semibold text-emerald-300">
                              {result.grade || "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ============ QUICK ACCESS ============ */}
          <section className="mt-12">
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-7 bg-blue-400" />
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-blue-300">
                  LEARNING RESOURCES
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-white">Quick Access</h2>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                তোমার প্রয়োজনীয় একাডেমিক সেবাগুলো এক জায়গায়।
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {quickAccessItems.map((item, index) => {
                const Icon = item.icon;
                const iconStyles = [
                  "border-blue-400/15 bg-blue-500/10 text-blue-300",
                  "border-violet-400/15 bg-violet-500/10 text-violet-300",
                  "border-emerald-400/15 bg-emerald-500/10 text-emerald-300",
                  "border-amber-400/15 bg-amber-500/10 text-amber-300",
                ];

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex min-h-[205px] flex-col rounded-2xl border border-white/[0.08] bg-[#101A2C] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/25 hover:bg-[#14213A] hover:shadow-[0_18px_45px_rgba(0,0,0,0.18)] ${focus}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                          iconStyles[index % iconStyles.length]
                        }`}
                      >
                        <Icon size={23} strokeWidth={1.7} />
                      </div>
                      <ArrowUpRight
                        size={19}
                        className="text-slate-600 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-300"
                      />
                    </div>

                    <h3 className="mt-6 text-base font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-xs leading-6 text-slate-400">{item.description}</p>

                    <div className="mt-auto flex items-center gap-2 pt-5 text-xs font-semibold text-blue-300">
                      Open Module
                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ============ GUIDELINES ============ */}
          <section className="mt-12">
            <div className={`${card} overflow-hidden`}>
              <div className="relative overflow-hidden border-b border-white/[0.08] bg-gradient-to-r from-[#14274A] to-[#101A2C] p-6 sm:p-8">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-14 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-[70px]"
                />
                <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-300">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300">
                        STUDENT GUIDELINES
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                        গুরুত্বপূর্ণ নিয়মাবলি
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-slate-400">
                        The Curious Classroom-এর শিক্ষার্থীদের জন্য প্রয়োজনীয় নির্দেশনা।
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-medium text-blue-200">
                    <ClipboardList size={15} />
                    {studentGuidelines.length} Guidelines
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="grid gap-4 lg:grid-cols-2">
                  {(guidelinesOpen ? studentGuidelines : studentGuidelines.slice(0, 2)).map(
                    (guideline, index) => (
                      <div
                        key={guideline.title}
                        className="rounded-2xl border border-white/[0.07] bg-[#0B1425] p-5 transition-colors hover:border-blue-400/15 sm:p-6"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/10 text-sm font-semibold text-blue-300">
                            {String(index + 1).padStart(2, "0")}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold leading-7 text-white">
                              {guideline.title}
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-slate-400">
                              {guideline.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="mt-7 flex justify-center">
                  <button
                    type="button"
                    aria-expanded={guidelinesOpen}
                    onClick={() => setGuidelinesOpen((previous) => !previous)}
                    className={`inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-blue-400/20 bg-blue-500/10 px-6 py-3 text-sm font-semibold text-blue-300 transition-all hover:border-blue-400/40 hover:bg-blue-500/20 ${focus}`}
                  >
                    {guidelinesOpen ? "কম দেখাও" : "সব নিয়মাবলি দেখুন"}
                    <ArrowRight
                      size={17}
                      className={`transition-transform duration-300 ${
                        guidelinesOpen ? "-rotate-90" : "rotate-90"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ============ BRAND ============ */}
          <section className="mt-10">
            <div className="relative overflow-hidden rounded-3xl border border-blue-400/10 bg-gradient-to-r from-[#14264A] via-[#142B53] to-[#101F3D] p-6 sm:p-8">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-blue-500/15 blur-[75px]"
              />
              <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300">
                    THE CURIOUS CLASSROOM
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-white">
                    কৌতূহল থেকেই সফলতার শুরু।
                  </h2>
                  <p className="mt-3 max-w-lg text-sm leading-7 text-blue-100/70">
                    তোমার শেখার প্রতিটি ধাপে আমরা আছি পাশে। নিয়মিত ক্লাস, পরীক্ষা ও অনুশীলনের
                    মাধ্যমে এগিয়ে যাও স্বপ্নের লক্ষ্যে।
                  </p>
                </div>

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
        </main>

        <footer className="mx-auto mt-8 max-w-[1500px] border-t border-white/[0.07] px-5 py-6 sm:px-8 lg:px-10">
          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <p className="text-xs leading-6 text-slate-500">
              © {new Date().getFullYear()} The Curious Classroom. All Rights Reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={15} className="text-blue-400" />
              Student Learning Portal
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

// ===================== PROFILE INFO CARD =====================

function ProfileInfo({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/[0.09] bg-[#0B1425]/80 p-4">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-white sm:text-base">
        {value || "N/A"}
      </p>
    </div>
  );
}
