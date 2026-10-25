
"use client";

// =====================================
// PART 1 — IMPORTS
// =====================================

import Image from "next/image";
import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import jsPDF from "jspdf";
import QRCode from "qrcode";

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
  Wallet,
  Receipt,
  ShieldCheck,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Clock3,
  Phone,
  Copy,
  type LucideIcon,
} from "lucide-react";

// =====================================
// STUDENT TYPE
// =====================================

type Student = {
  id: string | number;

  student_id: string;

  student_name?: string | null;

  student_photo?: string | null;

  class?: string | null;

  batch?: string | null;

  whatsapp?: string | null;
};

// =====================================
// PAYMENT TYPE
// =====================================

type Payment = {
  id: string | number;

  student_id?: string | number | null;

  student_name?: string | null;

  class?: string | null;

  batch?: string | null;

  month: string;

  year: number | string;

  amount?: number | string | null;

  status?: string | null;

  payment_method?: string | null;

  payment_date?: string | null;

  transaction_id?: string | null;

  receipt_id?: string | null;
};

// =====================================
// CURRENT FEE TYPE
// =====================================

type CurrentFee = {
  month: string;

  year: number;

  paid: boolean;

  payment: Payment | null;
};

// =====================================
// STUDENT SIDEBAR NAVIGATION
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
// PAYMENT CONTACT INFORMATION
// =====================================

const paymentConfig = {
  officePhone: "+8801346071073",

  bkashNumber: "01540388217",

  paymentMethod: "Send Money",

  receiptVerifyBaseUrl:
    "https://thecuriousclassroom.vercel.app/student/verify",
};

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
// KEYBOARD FOCUS STYLE
// =====================================

const focusStyle =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]";

// =====================================
// BANGLADESH CURRENT MONTH HELPER
// =====================================

function getCurrentMonthInfo() {
  const now = new Date();

  const month = now.toLocaleString("en-US", {
    month: "long",
    timeZone: "Asia/Dhaka",
  });

  const year = Number(
    now.toLocaleString("en-US", {
      year: "numeric",
      timeZone: "Asia/Dhaka",
    })
  );

  return {
    month,
    year,
    label: `${month} ${year}`,
  };
}

// =====================================
// DATE FORMATTER
// =====================================

function formatPaymentDate(
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
// VALUE FORMATTER
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
// PAYMENT STATUS HELPER
// =====================================

function isPaymentPaid(payment: Payment): boolean {
  return payment.status?.toLowerCase() === "paid";
}

// =====================================
// PART 2 STARTS BELOW
// =====================================



/* =====================================
   PART 2 — STUDENT PAYMENT LOGIC
===================================== */

export default function StudentPaymentPage() {
  const router = useRouter();

  // =====================================
  // STUDENT & PAYMENT STATES
  // =====================================

  const [student, setStudent] =
    useState<Student | null>(null);

  const [payments, setPayments] =
    useState<Payment[]>([]);

  const [currentFee, setCurrentFee] =
    useState<CurrentFee | null>(null);

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

  // =====================================
  // CURRENT MONTH INFORMATION
  // =====================================

  const currentMonthInfo = getCurrentMonthInfo();

  // =====================================
  // PAYMENT STATISTICS
  // =====================================

  const paidPayments = useMemo(() => {
    return payments.filter(isPaymentPaid);
  }, [payments]);

  const totalPaidPayments = paidPayments.length;

  const totalPaidAmount = useMemo(() => {
    return paidPayments.reduce((total, payment) => {
      const amount = Number(payment.amount);

      if (!Number.isFinite(amount)) {
        return total;
      }

      return total + amount;
    }, 0);
  }, [paidPayments]);

  // =====================================
  // FETCH PAYMENTS FROM SUPABASE
  // =====================================

  async function fetchPaymentRows(
    studentId: Student["id"]
  ): Promise<Payment[]> {

    const { data, error: paymentError } =
      await supabase
        .from("payments")
        .select("*")
        .eq("student_id", studentId)
        .order("payment_date", {
          ascending: false,
        });

    if (paymentError) {
      throw paymentError;
    }

    return data ?? [];
  }

  // =====================================
  // UPDATE PAYMENT DATA & CURRENT FEE
  // =====================================

  function updatePaymentState(rows: Payment[]) {
    const { month, year } = getCurrentMonthInfo();

    // Find payments for the current month
    const monthlyPayments = rows.filter(
      (payment) =>
        payment.month === month &&
        Number(payment.year) === year
    );

    // Only status="paid" counts as paid
    const paidRecord =
      monthlyPayments.find(isPaymentPaid) ?? null;

    const selectedPayment =
      paidRecord ?? monthlyPayments[0] ?? null;

    setPayments(rows);

    setCurrentFee({
      month,
      year,
      paid: paidRecord !== null,
      payment: selectedPayment,
    });
  }

  // =====================================
  // STUDENT VERIFICATION
  // =====================================

  useEffect(() => {
    let active = true;

    async function initializePaymentPage() {
      setLoading(true);
      setError("");

      try {
        // Read existing student session data
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

        // Validate student information
        if (
          !studentData ||
          studentData.id == null ||
          !studentData.student_id
        ) {
          localStorage.removeItem("student");
          localStorage.removeItem("student_id");

          router.replace("/student/login");
          return;
        }

        // =====================================
        // CHECK STUDENT ACCOUNT IN DATABASE
        // =====================================

        const {
          data: currentStudent,
          error: studentError,
        } = await supabase
          .from("students")
          .select("id, student_id, login_enabled")
          .eq("id", studentData.id)
          .single();

        if (!active) return;

        if (studentError) {
          throw studentError;
        }

        if (
          !currentStudent ||
          currentStudent.login_enabled !== true ||
          String(currentStudent.student_id) !==
            String(studentData.student_id)
        ) {
          localStorage.removeItem("student");
          localStorage.removeItem("student_id");

          router.replace("/student/login");
          return;
        }

        // Existing student profile
        setStudent(studentData);

        // =====================================
        // LOAD PAYMENT HISTORY
        // =====================================

        const paymentRows =
          await fetchPaymentRows(studentData.id);

        if (!active) return;

        updatePaymentState(paymentRows);

      } catch (err) {
        console.error(
          "Student payment loading error:",
          err
        );

        if (active) {
          setError(
            "Payment তথ্য লোড করা যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করো।"
          );
        }

      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void initializePaymentPage();

    return () => {
      active = false;
    };

  }, [router]);

  // =====================================
  // REFRESH PAYMENT INFORMATION
  // =====================================

  async function refreshPayments() {
    if (!student || refreshing) return;

    setRefreshing(true);
    setError("");

    try {
      const paymentRows =
        await fetchPaymentRows(student.id);

      updatePaymentState(paymentRows);

    } catch (err) {
      console.error(
        "Payment refresh error:",
        err
      );

      setError(
        "Payment তথ্য Refresh করা যায়নি। আবার চেষ্টা করো।"
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
  // Do not close StudentPaymentPage here.
  // =====================================


/* =====================================
   PART 3 — PREMIUM PAYMENT RECEIPT
===================================== */

// =====================================
// RECEIPT DOWNLOAD STATE
// =====================================

const [
  downloadingReceiptId,
  setDownloadingReceiptId
] = useState<string | null>(null);

// =====================================
// DOWNLOAD PREMIUM RECEIPT PDF
// =====================================

async function downloadReceipt(payment: Payment) {

  // Student Verification
  if (!student) {
    setError("Student information not found.");
    return;
  }

  // Only paid payments can generate receipts
  if (!isPaymentPaid(payment)) {
    setError(
      "শুধুমাত্র Paid Payment-এর Receipt ডাউনলোড করা যাবে।"
    );
    return;
  }

  const receiptId = String(
    payment.receipt_id ?? ""
  ).trim();

  if (!receiptId) {
    setError("Receipt ID পাওয়া যায়নি।");
    return;
  }

  if (downloadingReceiptId !== null) return;

  try {

    setError("");
    setDownloadingReceiptId(receiptId);

    // =====================================
    // CREATE A4 PDF
    // =====================================

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    // =====================================
    // COLOR PALETTE
    // =====================================

    const navy = [8, 13, 25] as const;
    const blue = [37, 99, 235] as const;
    const dark = [30, 41, 59] as const;
    const muted = [100, 116, 139] as const;

    // =====================================
    // LOGO LOADING
    // =====================================

    const logo = new window.Image();

    const logoLoaded = await new Promise<boolean>(
      (resolve) => {

        logo.onload = () => resolve(true);

        logo.onerror = () => resolve(false);

        logo.src = "/logo.png";
      }
    );

    let logoData: string | null = null;

    if (logoLoaded) {

      const canvas =
        document.createElement("canvas");

      canvas.width = logo.naturalWidth;
      canvas.height = logo.naturalHeight;

      const ctx = canvas.getContext("2d");

      if (ctx) {

        ctx.drawImage(
          logo,
          0,
          0,
          canvas.width,
          canvas.height
        );

        logoData =
          canvas.toDataURL("image/png");

      }
    }

    // =====================================
    // TRANSPARENT LOGO WATERMARK
    // =====================================

    if (logoLoaded) {

      const watermarkCanvas =
        document.createElement("canvas");

      watermarkCanvas.width =
        logo.naturalWidth;

      watermarkCanvas.height =
        logo.naturalHeight;

      const watermarkCtx =
        watermarkCanvas.getContext("2d");

      if (watermarkCtx) {

        watermarkCtx.clearRect(
          0,
          0,
          watermarkCanvas.width,
          watermarkCanvas.height
        );

        watermarkCtx.globalAlpha = 0.07;

        watermarkCtx.drawImage(
          logo,
          0,
          0,
          watermarkCanvas.width,
          watermarkCanvas.height
        );

        const watermarkData =
          watermarkCanvas.toDataURL("image/png");

        const ratio = Math.min(
          155 / logo.naturalWidth,
          105 / logo.naturalHeight
        );

        const watermarkWidth =
          logo.naturalWidth * ratio;

        const watermarkHeight =
          logo.naturalHeight * ratio;

        doc.addImage(
          watermarkData,
          "PNG",
          (pageWidth - watermarkWidth) / 2,
          108,
          watermarkWidth,
          watermarkHeight
        );
      }
    }

    // =====================================
    // QR CODE VERIFICATION
    // =====================================

    const verifyUrl =
      `${paymentConfig.receiptVerifyBaseUrl}?receipt=${encodeURIComponent(receiptId)}`;

    const qrImage = await QRCode.toDataURL(
      verifyUrl,
      {
        width: 320,
        margin: 2,
        errorCorrectionLevel: "M",
      }
    );

    // =====================================
    // HEADER BACKGROUND
    // =====================================

    doc.setFillColor(...navy);

    doc.rect(
      0,
      0,
      pageWidth,
      54,
      "F"
    );

    // Blue Accent Line
    doc.setFillColor(...blue);

    doc.rect(
      0,
      53,
      pageWidth,
      1.5,
      "F"
    );

    // =====================================
    // HEADER LOGO
    // =====================================

    if (logoData) {

      doc.setFillColor(255, 255, 255);

      doc.roundedRect(
        15,
        12,
        37,
        30,
        3,
        3,
        "F"
      );

      const maxWidth = 31;
      const maxHeight = 24;

      const ratio = Math.min(
        maxWidth / logo.naturalWidth,
        maxHeight / logo.naturalHeight
      );

      const imageWidth =
        logo.naturalWidth * ratio;

      const imageHeight =
        logo.naturalHeight * ratio;

      doc.addImage(
        logoData,
        "PNG",
        15 + (37 - imageWidth) / 2,
        12 + (30 - imageHeight) / 2,
        imageWidth,
        imageHeight
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
      128,
      22,
      {
        align: "center"
      }
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(180, 204, 255);

    doc.text(
      "Academic Excellence Through Curiosity",
      128,
      31,
      {
        align: "center"
      }
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);

    doc.text(
      "OFFICIAL PAYMENT RECEIPT",
      128,
      41,
      {
        align: "center"
      }
    );

    // =====================================
    // RECEIPT INFORMATION CARD
    // =====================================

    doc.setFillColor(240, 245, 255);
    doc.setDrawColor(220, 230, 250);

    doc.roundedRect(
      15,
      64,
      180,
      31,
      3,
      3,
      "FD"
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...dark);

    doc.text(
      "RECEIPT INFORMATION",
      22,
      73
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.text(
      `Receipt ID: ${receiptId}`,
      22,
      82
    );

    const generatedDate =
      new Date().toLocaleString("en-GB", {
        timeZone: "Asia/Dhaka",
      });

    doc.text(
      `Generated: ${generatedDate}`,
      22,
      89
    );

    // PAID STATUS
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 163, 74);

    doc.text(
      "PAID",
      183,
      80,
      {
        align: "right"
      }
    );

    // =====================================
    // STUDENT INFORMATION
    // =====================================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...dark);

    doc.text(
      "STUDENT INFORMATION",
      15,
      104
    );

    doc.setDrawColor(225, 232, 242);

    doc.roundedRect(
      15,
      111,
      180,
      50,
      3,
      3,
      "S"
    );

    doc.setFontSize(9);

    const studentRows = [
      [
        "Student Name",
        student.student_name || "N/A"
      ],
      [
        "Student ID",
        student.student_id || "N/A"
      ],
      [
        "Class",
        student.class || "N/A"
      ],
      [
        "Batch",
        student.batch || "N/A"
      ],
    ];

    studentRows.forEach((row, index) => {

      const y = 122 + index * 11;

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...muted);

      doc.text(
        row[0],
        23,
        y
      );

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...dark);

      doc.text(
        ":",
        57,
        y
      );

      const valueLines =
        doc.splitTextToSize(
          String(row[1]),
          125
        );

      doc.text(
        valueLines[0] || "N/A",
        63,
        y
      );

    });

    // =====================================
    // PAYMENT DETAILS
    // =====================================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...dark);

    doc.text(
      "PAYMENT DETAILS",
      15,
      172
    );

    doc.setDrawColor(225, 232, 242);

    doc.roundedRect(
      15,
      179,
      180,
      53,
      3,
      3,
      "S"
    );

    const paymentRows = [
      [
        "Month",
        `${payment.month} ${payment.year}`
      ],
      [
        "Amount",
        `BDT ${displayValue(payment.amount)}`
      ],
      [
        "Method",
        payment.payment_method || "N/A"
      ],
      [
        "Transaction",
        payment.transaction_id || "N/A"
      ],
    ];

    paymentRows.forEach((row, index) => {

      const y = 189 + index * 11;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...muted);

      doc.text(
        row[0],
        22,
        y
      );

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...dark);

      doc.text(
        ":",
        53,
        y
      );

      const valueLines =
        doc.splitTextToSize(
          String(row[1]),
          90
        );

      doc.text(
        valueLines[0] || "N/A",
        59,
        y
      );

    });

    // =====================================
    // VERIFICATION QR CODE
    // =====================================

    doc.addImage(
      qrImage,
      "PNG",
      157,
      184,
      30,
      30
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...muted);

    doc.text(
      "Scan to verify",
      172,
      221,
      {
        align: "center"
      }
    );

    // =====================================
    // DIGITAL RECEIPT NOTE
    // =====================================

    doc.setFontSize(9);
    doc.setTextColor(...muted);

    doc.text(
      "This is a digitally generated payment receipt.",
      pageWidth / 2,
      242,
      {
        align: "center"
      }
    );

    // =====================================
    // AUTHORIZATION FOOTER
    // =====================================

    doc.setDrawColor(220, 228, 240);

    doc.line(
      15,
      249,
      195,
      249
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...blue);

    doc.text(
      "PREPARED & AUTHORIZED BY",
      15,
      258
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...dark);

    doc.text(
      "MD. Mahfuz Shaharia Shishir",
      15,
      268
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...muted);

    doc.text(
      "CEO & Founder",
      15,
      276
    );

    doc.text(
      "The Curious Classroom",
      15,
      284
    );

    // =====================================
    // PAGE NUMBER
    // =====================================

    doc.setFontSize(8);

    doc.text(
      "Page 1 of 1",
      pageWidth - 15,
      pageHeight - 10,
      {
        align: "right"
      }
    );

    // =====================================
    // SAVE PDF
    // =====================================

    const safeReceiptId =
      receiptId.replace(
        /[^a-zA-Z0-9_-]/g,
        "_"
      );

    doc.save(
      `TCCS_Receipt_${safeReceiptId}.pdf`
    );

  } catch (err) {

    console.error(
      "PDF Receipt Error:",
      err
    );

    setError(
      "Receipt PDF তৈরি করা যায়নি। আবার চেষ্টা করো।"
    );

  } finally {

    setDownloadingReceiptId(null);

  }
}

// =====================================
// PART 4 CONTINUES BELOW
// Do not close StudentPaymentPage here.
// =====================================



/* =====================================
   PART 4 — PREMIUM PAYMENT PAGE UI
===================================== */

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
        Loading Payment Portal...
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
// MAIN PAYMENT PAGE
// =====================================

return (
  <div className="relative min-h-dvh bg-[#080D19] text-slate-100">

    {/* =====================================
        MOBILE SIDEBAR OVERLAY
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

      {/* Sidebar Brand */}
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

        <p className="mb-3 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          STUDENT PORTAL
        </p>

        <div className="space-y-1">

          {studentNavigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.href === "/student/payment";

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

          <p className="mb-4 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
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
          TOP HEADER
      ===================================== */}

      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#0A1120]/95 backdrop-blur-xl">

        <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">

          <div className="flex min-w-0 items-center gap-4">

            {/* Mobile Menu */}
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

              <p className="text-[10px] font-medium tracking-wide text-slate-500">
                THE CURIOUS CLASSROOM
              </p>

              <p className="mt-1 truncate text-sm font-semibold text-white">
                Student Payments
              </p>

            </div>

          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={refreshPayments}
              disabled={refreshing}
              aria-label="Refresh payment information"
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
              <Wallet size={20} />
            </div>

          </div>

        </div>

      </header>

      {/* =====================================
          DASHBOARD MAIN AREA
      ===================================== */}

      <main className="relative mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

        {/* =====================================
            PAGE INTRODUCTION
        ===================================== */}

        <section>

          <div className="mb-5 flex items-center gap-3">

            <span className="h-px w-7 bg-blue-400" />

            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-blue-300">
              YOUR PAYMENT WORKSPACE
            </span>

          </div>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                My{" "}

                <span className="text-blue-400">
                  Payments
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                তোমার মাসিক ফি, পেমেন্ট স্ট্যাটাস,
                লেনদেনের ইতিহাস এবং ডিজিটাল
                রসিদ এক জায়গায় দেখো।
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
            ERROR NOTIFICATION
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
            STUDENT PROFILE CARD
        ===================================== */}

        <section className="mt-9">

          <div className="relative overflow-hidden rounded-3xl border border-blue-400/15 bg-gradient-to-br from-[#162A50] via-[#132441] to-[#101A2C] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)] sm:p-8">

            {/* Decorative Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-[80px]"
            />

            <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">

              {/* Student Photo */}
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

              {/* Student Identity */}
              <div className="min-w-0 flex-1">

                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-[11px] text-blue-200">

                  <ShieldCheck size={14} />

                  Student Payment Profile

                </div>

                <h2 className="break-words text-xl font-semibold text-white sm:text-2xl">
                  {student.student_name || "Student"}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Student ID: {student.student_id}
                </p>

              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-medium text-emerald-300">

                <CheckCircle2 size={15} />

                Portal Active

              </span>

            </div>

            {/* Student Information Grid */}
            <div className="relative mt-7 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">

              <div className={`${theme.innerCard} p-4`}>

                <p className="text-xs text-slate-400">
                  Student Name
                </p>

                <p className="mt-2 break-words text-sm font-semibold text-white">
                  {student.student_name || "N/A"}
                </p>

              </div>

              <div className={`${theme.innerCard} p-4`}>

                <p className="text-xs text-slate-400">
                  Class
                </p>

                <p className="mt-2 text-sm font-semibold text-white">
                  {student.class || "N/A"}
                </p>

              </div>

              <div className={`${theme.innerCard} p-4`}>

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
            PAYMENT SUMMARY
        ===================================== */}

        <section className="mt-10">

          <div className="mb-6">

            <div className="mb-3 flex items-center gap-3">

              <span className="h-px w-7 bg-blue-400" />

              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-blue-300">
                FINANCIAL OVERVIEW
              </span>

            </div>

            <h2 className="text-2xl font-semibold text-white">
              Payment Overview
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              তোমার পেমেন্ট রেকর্ডের সংক্ষিপ্ত বিবরণ
            </p>

          </div>

          {/* Payment Statistics */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">

            {/* Total Records */}
            <div className={`${theme.card} p-5 sm:p-6`}>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-300">
                <Receipt size={23} />
              </div>

              <p className="mt-5 text-sm text-slate-400">
                Total Records
              </p>

              <h3 className="mt-2 text-3xl font-semibold text-white">
                {payments.length}
              </h3>

              <p className="mt-2 text-xs text-slate-500">
                Payment records
              </p>

            </div>

            {/* Paid Payments */}
            <div className={`${theme.card} p-5 sm:p-6`}>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/15 bg-emerald-500/10 text-emerald-300">
                <CheckCircle2 size={23} />
              </div>

              <p className="mt-5 text-sm text-slate-400">
                Paid Payments
              </p>

              <h3 className="mt-2 text-3xl font-semibold text-white">
                {totalPaidPayments}
              </h3>

              <p className="mt-2 text-xs text-slate-500">
                Completed payments
              </p>

            </div>

            {/* Total Paid Amount */}
            <div className={`${theme.card} p-5 sm:p-6`}>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/10 text-violet-300">
                <Wallet size={23} />
              </div>

              <p className="mt-5 text-sm text-slate-400">
                Total Paid Amount
              </p>

              <h3 className="mt-2 break-words text-2xl font-semibold text-white">
                ৳ {totalPaidAmount.toLocaleString("en-BD")}
              </h3>

              <p className="mt-2 text-xs text-slate-500">
                Recorded paid amount
              </p>

            </div>

            {/* Current Fee */}
            <div className={`${theme.card} p-5 sm:p-6`}>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/15 bg-amber-500/10 text-amber-300">
                <CalendarDays size={23} />
              </div>

              <p className="mt-5 text-sm text-slate-400">
                Current Month
              </p>

              <h3 className="mt-2 text-lg font-semibold text-white">
                {currentMonthInfo.month}
              </h3>

              <p className="mt-2 text-xs text-slate-500">
                {currentMonthInfo.year}
              </p>

            </div>

          </div>

        </section>

        {/* =====================================
            CURRENT MONTH FEE STATUS
        ===================================== */}

        <section className="mt-10">

          <div className="mb-6">

            <div className="mb-3 flex items-center gap-3">

              <span className="h-px w-7 bg-blue-400" />

              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-blue-300">
                MONTHLY FEE STATUS
              </span>

            </div>

            <h2 className="text-2xl font-semibold text-white">
              Current Month Payment
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              চলতি মাসের ফি পরিশোধের অবস্থা
            </p>

          </div>

          <div className={`${theme.card} overflow-hidden`}>

            {/* Status Header */}
            <div className="flex flex-col justify-between gap-5 border-b border-white/[0.08] p-6 sm:flex-row sm:items-center sm:p-8">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-300">
                  <CalendarDays size={25} />
                </div>

                <div>

                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
                    CURRENT BILLING MONTH
                  </p>

                  <h3 className="mt-2 text-xl font-semibold text-white">
                    {currentFee?.month || currentMonthInfo.month}
                    {" "}
                    {currentFee?.year || currentMonthInfo.year}
                  </h3>

                </div>

              </div>

              {/* Payment Status Badge */}
              {!currentFee ? (

                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs font-semibold text-amber-300">

                  <AlertCircle size={15} />

                  Status Unavailable

                </span>

              ) : currentFee.paid ? (

                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300">

                  <CheckCircle2 size={15} />

                  Payment Completed

                </span>

              ) : (

                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-xs font-semibold text-red-300">

                  <Clock3 size={15} />

                  Payment Due

                </span>

              )}

            </div>

            {/* =====================================
                PAID / DUE CONTENT
            ===================================== */}

            <div className="p-6 sm:p-8">

              {!currentFee ? (

                <div className="rounded-2xl border border-amber-400/15 bg-amber-500/[0.06] p-5">

                  <p className="text-sm leading-7 text-amber-200">
                    পেমেন্টের তথ্য এখন পাওয়া যাচ্ছে না।
                    অনুগ্রহ করে Refresh করে আবার চেষ্টা করো।
                  </p>

                </div>

              ) : currentFee.paid ? (

                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.06] p-5 sm:p-6">

                  <div className="flex items-start gap-3">

                    <CheckCircle2
                      size={24}
                      className="mt-0.5 shrink-0 text-emerald-300"
                    />

                    <div>

                      <h4 className="text-xl font-semibold text-emerald-300">
                        Payment Successful
                      </h4>

                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        চলতি মাসের পেমেন্ট পরিশোধিত
                        হিসেবে রেকর্ড করা হয়েছে।
                      </p>

                    </div>

                  </div>

                  <div className="mt-6 grid gap-4 border-t border-emerald-400/10 pt-5 sm:grid-cols-2">

                    <div>

                      <p className="text-xs text-slate-400">
                        Paid Amount
                      </p>

                      <p className="mt-2 text-2xl font-semibold text-white">
                        ৳ {displayValue(currentFee.payment?.amount)}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-slate-400">
                        Payment Method
                      </p>

                      <p className="mt-2 text-base font-semibold text-white">
                        {currentFee.payment?.payment_method || "N/A"}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-slate-400">
                        Payment Date
                      </p>

                      <p className="mt-2 text-sm font-medium text-white">
                        {formatPaymentDate(
                          currentFee.payment?.payment_date
                        )}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-slate-400">
                        Transaction ID
                      </p>

                      <p className="mt-2 break-all text-sm font-medium text-white">
                        {currentFee.payment?.transaction_id || "N/A"}
                      </p>

                    </div>

                  </div>

                  {/* Current Month Receipt */}
                  {currentFee.payment?.receipt_id && (

                    <button
                      type="button"
                      onClick={() =>
                        downloadReceipt(currentFee.payment!)
                      }
                      disabled={downloadingReceiptId !== null}
                      className={`mt-6 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50 sm:w-auto ${focusStyle}`}
                    >

                      {downloadingReceiptId ===
                      String(currentFee.payment.receipt_id) ? (

                        <LoaderCircle
                          size={18}
                          className="animate-spin"
                        />

                      ) : (

                        <Download size={18} />

                      )}

                      Download Receipt

                    </button>

                  )}

                </div>

              ) : (

                <div className="rounded-2xl border border-red-400/15 bg-red-500/[0.05] p-5 sm:p-6">

                  <div className="flex items-start gap-3">

                    <AlertCircle
                      size={23}
                      className="mt-0.5 shrink-0 text-red-300"
                    />

                    <div>

                      <h4 className="text-xl font-semibold text-red-300">
                        Monthly Fee Pending
                      </h4>

                      <p className="mt-3 text-sm leading-7 text-slate-300">
                        চলতি মাসের ফি এখনো Paid হিসেবে
                        রেকর্ড করা হয়নি। পেমেন্টের তথ্য
                        যাচাই করতে অফিসে যোগাযোগ করতে পারো।
                      </p>

                    </div>

                  </div>

                  <a
                    href={`tel:${paymentConfig.officePhone}`}
                    className={`mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 ${focusStyle}`}
                  >

                    <Phone size={18} />

                    Contact Office

                    <ArrowUpRight size={16} />

                  </a>

                </div>

              )}

            </div>

          </div>

        </section>

        {/* =====================================
            PART 5 STARTS HERE
            Keep main and wrappers open.
        ===================================== */}





{/* =====================================
    PART 5 — PAYMENT HISTORY & FOOTER
===================================== */}

{/* =====================================
    BKASH PAYMENT INSTRUCTIONS
===================================== */}

{currentFee && !currentFee.paid && (

  <section className="mt-8">

    <div className={`${theme.card} overflow-hidden`}>

      {/* Section Header */}
      <div className="border-b border-white/[0.08] bg-gradient-to-r from-[#34142F] to-[#101A2C] p-6 sm:p-8">

        <div className="flex items-center gap-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-pink-400/20 bg-pink-500/10 text-pink-300">
            <Wallet size={24} />
          </div>

          <div>

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pink-300">
              PAYMENT METHOD
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              Pay via bKash
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              মাসিক ফি পরিশোধের নির্দেশনা
            </p>

          </div>

        </div>

      </div>

      {/* Payment Number */}
      <div className="p-6 sm:p-8">

        <div className="rounded-2xl border border-pink-400/15 bg-pink-500/[0.05] p-5 sm:p-6">

          <p className="text-sm text-slate-400">
            bKash Send Money Number
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">

            <h3 className="break-all text-2xl font-semibold tracking-wide text-pink-300 sm:text-3xl">
              {paymentConfig.bkashNumber}
            </h3>

            {/* Copy Number */}
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    paymentConfig.bkashNumber
                  );

                  window.alert(
                    "bKash number copied successfully!"
                  );
                } catch {
                  setError(
                    "Number Copy করা যায়নি। ম্যানুয়ালি কপি করো।"
                  );
                }
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-pink-400/20 bg-pink-500/10 px-4 py-2 text-sm font-medium text-pink-300 transition hover:bg-pink-500/20"
            >
              <Copy size={17} />
              Copy Number
            </button>

          </div>

          <span className="mt-5 inline-flex rounded-full border border-pink-400/20 bg-pink-500/10 px-4 py-2 text-xs font-semibold text-pink-300">
            {paymentConfig.paymentMethod}
          </span>

        </div>

        {/* Payment Steps */}
        <div className="mt-7">

          <h3 className="text-base font-semibold text-white">
            Payment Instructions
          </h3>

          <div className="mt-5 space-y-3">

            {[
              "bKash অ্যাপ খুলে Send Money নির্বাচন করো।",
              "উপরের নম্বরটি দিয়ে নির্ধারিত ফি পাঠাও।",
              "পেমেন্ট সম্পন্ন হলে Transaction ID সংরক্ষণ করো।",
              "পেমেন্ট যাচাইয়ের জন্য প্রয়োজন হলে অফিসে যোগাযোগ করো।",
            ].map((instruction, index) => (

              <div
                key={index}
                className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-[#0B1425] p-4"
              >

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-sm font-semibold text-pink-300">
                  {index + 1}
                </div>

                <p className="pt-1 text-sm leading-7 text-slate-300">
                  {instruction}
                </p>

              </div>

            ))}

          </div>

        </div>

        {/* Security Note */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-400/15 bg-amber-500/[0.05] p-4">

          <ShieldCheck
            size={19}
            className="mt-1 shrink-0 text-amber-300"
          />

          <p className="text-xs leading-6 text-slate-400">
            পেমেন্ট করার আগে নম্বরটি অফিস থেকে
            নিশ্চিত করে নাও। কখনো bKash PIN
            অথবা OTP কারও সঙ্গে শেয়ার করবে না।
          </p>

        </div>

        {/* Contact Office */}
        <a
          href={`tel:${paymentConfig.officePhone}`}
          className={`mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 ${focusStyle}`}
        >

          <Phone size={18} />

          Contact Office

          <ArrowUpRight size={16} />

        </a>

      </div>

    </div>

  </section>

)}

{/* =====================================
    PAYMENT HISTORY
===================================== */}

<section className="mt-12">

  {/* Section Heading */}
  <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

    <div>

      <div className="mb-3 flex items-center gap-3">

        <span className="h-px w-7 bg-blue-400" />

        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-blue-300">
          TRANSACTION RECORDS
        </span>

      </div>

      <h2 className="text-2xl font-semibold text-white">
        Payment History
      </h2>

      <p className="mt-2 text-sm leading-7 text-slate-400">
        তোমার সকল মাসিক পেমেন্ট এবং
        Transaction Details এখানে দেখো।
      </p>

    </div>

    {/* Payment Count */}
    <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-blue-400/15 bg-blue-500/10 px-4 py-2.5 text-xs font-medium text-blue-300">

      <Receipt size={16} />

      {payments.length} Payment Records

    </span>

  </div>

  {/* =====================================
      EMPTY PAYMENT HISTORY
  ===================================== */}

  {payments.length === 0 ? (

    <div className={`${theme.card} px-6 py-16 text-center sm:py-20`}>

      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-400/15 bg-blue-500/10">

        <Receipt
          size={37}
          strokeWidth={1.5}
          className="text-blue-300"
        />

      </div>

      <h3 className="mt-7 text-xl font-semibold text-white">
        {error
          ? "Payment History লোড করা যায়নি"
          : "No Payment History Available"}
      </h3>

      <p className="mx-auto mt-4 max-w-md text-sm leading-8 text-slate-400">
        {error
          ? "Payment তথ্য লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করো।"
          : "তোমার পেমেন্ট রেকর্ড তৈরি হলে এখানে মাস, পরিমাণ, পেমেন্ট স্ট্যাটাস এবং ডিজিটাল রসিদের তথ্য দেখতে পাবে।"}
      </p>

      <button
        type="button"
        onClick={refreshPayments}
        disabled={refreshing}
        className={`mt-7 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50 ${focusStyle}`}
      >

        <RefreshCw
          size={17}
          className={refreshing ? "animate-spin" : ""}
        />

        {refreshing
          ? "Refreshing..."
          : "Refresh Payments"}

      </button>

    </div>

  ) : (

    /* =====================================
        PAYMENT RECORDS LIST
    ===================================== */

    <div className="space-y-5">

      {payments.map((payment) => {

        const paid = isPaymentPaid(payment);

        const downloading =
          downloadingReceiptId !== null &&
          downloadingReceiptId ===
            String(payment.receipt_id);

        return (

          <article
            key={payment.id}
            className={`${theme.card} relative overflow-hidden transition-all duration-300 hover:border-blue-400/20`}
          >

            {/* Top Accent Line */}
            <div
              aria-hidden="true"
              className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"
            />

            {/* =====================================
                PAYMENT CARD HEADER
            ===================================== */}

            <div className="flex flex-col justify-between gap-5 border-b border-white/[0.07] p-6 sm:flex-row sm:items-start sm:p-7">

              <div className="flex items-start gap-4">

                {/* Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-300">

                  <CreditCard size={23} />

                </div>

                <div>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-300">
                    MONTHLY PAYMENT
                  </p>

                  <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                    {payment.month} {payment.year}
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Student Fee Record
                  </p>

                </div>

              </div>

              {/* Status */}
              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold ${
                  paid
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    : "border-amber-400/20 bg-amber-400/10 text-amber-300"
                }`}
              >

                {paid ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <Clock3 size={15} />
                )}

                {paid
                  ? "Paid"
                  : payment.status || "Pending"}

              </span>

            </div>

            {/* =====================================
                PAYMENT DETAILS
            ===================================== */}

            <div className="p-6 sm:p-7">

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

                {/* Amount */}
                <div className={`${theme.innerCard} p-4`}>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                    <Wallet size={18} />
                  </div>

                  <p className="mt-4 text-xs text-slate-400">
                    Amount
                  </p>

                  <p className="mt-2 break-words text-lg font-semibold text-white">
                    ৳ {displayValue(payment.amount)}
                  </p>

                </div>

                {/* Method */}
                <div className={`${theme.innerCard} p-4`}>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                    <CreditCard size={18} />
                  </div>

                  <p className="mt-4 text-xs text-slate-400">
                    Method
                  </p>

                  <p className="mt-2 break-words text-sm font-semibold text-white">
                    {payment.payment_method || "N/A"}
                  </p>

                </div>

                {/* Payment Date */}
                <div className={`${theme.innerCard} p-4`}>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                    <CalendarDays size={18} />
                  </div>

                  <p className="mt-4 text-xs text-slate-400">
                    Payment Date
                  </p>

                  <p className="mt-2 text-sm font-semibold text-white">
                    {formatPaymentDate(
                      payment.payment_date
                    )}
                  </p>

                </div>

                {/* Receipt ID */}
                <div className={`${theme.innerCard} p-4`}>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                    <Receipt size={18} />
                  </div>

                  <p className="mt-4 text-xs text-slate-400">
                    Receipt ID
                  </p>

                  <p className="mt-2 break-all text-sm font-semibold text-white">
                    {payment.receipt_id || "N/A"}
                  </p>

                </div>

              </div>

              {/* Transaction ID */}
              <div className="mt-4 rounded-2xl border border-white/[0.07] bg-[#0B1425] p-4">

                <p className="text-xs text-slate-400">
                  Transaction ID
                </p>

                <p className="mt-2 break-all text-sm font-semibold text-white">
                  {payment.transaction_id || "N/A"}
                </p>

              </div>

              {/* =====================================
                  RECEIPT DOWNLOAD
              ===================================== */}

              <div className="mt-6 flex flex-col justify-between gap-4 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                    <ShieldCheck size={19} />
                  </div>

                  <div>

                    <p className="text-xs font-medium text-slate-200">
                      Digital Payment Receipt
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                      The Curious Classroom
                    </p>

                  </div>

                </div>

                {paid && payment.receipt_id ? (

                  <button
                    type="button"
                    onClick={() => downloadReceipt(payment)}
                    disabled={downloadingReceiptId !== null}
                    className={`group inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60 sm:w-auto ${focusStyle}`}
                  >

                    {downloading ? (

                      <>
                        <LoaderCircle
                          size={18}
                          className="animate-spin"
                        />

                        Generating PDF...
                      </>

                    ) : (

                      <>
                        <Download size={18} />

                        Download Receipt

                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>

                    )}

                  </button>

                ) : (

                  <span className="text-xs text-slate-500">
                    {paid
                      ? "Receipt not available"
                      : "Receipt available after payment approval"}
                  </span>

                )}

              </div>

            </div>

          </article>

        );
      })}

    </div>

  )}

</section>

{/* =====================================
    QUICK NAVIGATION
===================================== */}

<section className="mt-10">

  <div className="flex flex-wrap gap-3">

    <Link
      href="/student/dashboard"
      className={`inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 ${focusStyle}`}
    >

      <ArrowLeft size={18} />

      Back to Dashboard

    </Link>

    <button
      type="button"
      onClick={refreshPayments}
      disabled={refreshing}
      className={`inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-blue-400/20 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20 disabled:opacity-50 ${focusStyle}`}
    >

      <RefreshCw
        size={17}
        className={refreshing ? "animate-spin" : ""}
      />

      Refresh Payments

    </button>

  </div>

</section>

{/* =====================================
    BRAND BANNER
===================================== */}

<section className="mt-12">

  <div className="relative overflow-hidden rounded-3xl border border-blue-400/10 bg-gradient-to-r from-[#14264A] via-[#142B53] to-[#101F3D] p-6 sm:p-8">

    {/* Decorative Glow */}
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
          তোমার শিক্ষার প্রতিটি ধাপে আমরা পাশে।
        </h2>

        <p className="mt-3 max-w-lg text-sm leading-7 text-blue-100/70">
          একাডেমিক তথ্য, মাসিক পেমেন্ট এবং
          ডিজিটাল রসিদ এখন একই প্ল্যাটফর্মে।
          শেখার পথে এগিয়ে যাও আরও সহজভাবে।
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
          PREMIUM FOOTER
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

            Student Payment Portal

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
// END — PREMIUM STUDENT PAYMENT PAGE
// =====================================

