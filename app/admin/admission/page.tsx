"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useRef, useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Users,
  Phone,
  School,
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  MessageCircle,
  RotateCcw,
  Trash2,
  X,
  LoaderCircle,
  Clock,
  ShieldAlert,
  AlertTriangle,
  UserCheck,
} from "lucide-react";

export default function AdmissionPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("approved");
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const statusUpdatingRef = useRef(false);

  const [actionDialog, setActionDialog] = useState<{
    type: "recover" | "delete";
    student: any;
  } | null>(null);

  const [recoverTarget, setRecoverTarget] = useState<"pending" | "approved">(
    "pending"
  );

  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [actionBusy, setActionBusy] = useState(false);
  const actionBusyRef = useRef(false);

  const [approvedDeleteStudent, setApprovedDeleteStudent] =
    useState<any | null>(null);

  const [approvedDeleteID, setApprovedDeleteID] = useState("");
  const [approvedDeleteKeyword, setApprovedDeleteKeyword] = useState("");
  const [approvedDeleteAcknowledged, setApprovedDeleteAcknowledged] =
    useState(false);

  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState<{
    type: "success" | "warning";
    message: string;
  } | null>(null);

  // --- Extra UI-only states (added, no logic impact) ---
  const [revealedPasswords, setRevealedPasswords] = useState<
    Record<number, boolean>
  >({});
  const [modalPasswordVisible, setModalPasswordVisible] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>(
    {}
  );

  // ======================
  // LOAD STUDENTS
  // ======================
  async function loadStudents() {
    setLoading(true);

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setStudents(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadStudents();
  }, []);

  // ======================
  // MARK PAYMENT PAID
  // ======================
  async function markAsPaid(id: number) {
    const { error } = await supabase
      .from("students")
      .update({
        payment_status: "paid",
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Payment Verified");
    loadStudents();
  }

  // ======================
  // SEND WHATSAPP
  // ======================
  function sendWhatsApp(student: any) {
    const message = `Assalamu Alaikum ${student.student_name},

আপনার ভর্তি আবেদন অনুমোদিত হয়েছে।

Student ID:
${student.student_id}

Password:
${student.password}

Login Link:
https://thecuriousclassroom.vercel.app/student/login

ধন্যবাদ।

The Curious Classroom`;

    const url = `https://wa.me/88${student.whatsapp}?text=${encodeURIComponent(
      message
    )}`;

    window.open(url, "_blank");
  }

  // ======================
  // APPROVE / REJECT
  // ======================
  async function updateStatus(id: number, status: string) {
    if (statusUpdatingRef.current) return;

    if (status !== "approved" && status !== "rejected") return;

    statusUpdatingRef.current = true;

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        alert("আবার Admin Login করুন।");
        return;
      }

      if (status === "rejected") {
        const { data, error } = await supabase
          .from("students")
          .update({
            status: "rejected",
            login_enabled: false,
          })
          .eq("id", id)
          .eq("status", "pending")
          .select("id");

        if (error) {
          alert(error.message);
          return;
        }

        if (!data?.length) {
          alert(
            "Reject করা হয়নি। শিক্ষার্থীর status বা আপনার access পরিবর্তিত হতে পারে।"
          );
          await loadStudents();
          return;
        }

        setSelectedStudent(null);
        alert("ভর্তির আবেদন বাতিল করা হয়েছে।");
        await loadStudents();
        return;
      }

      // The server verifies admin access and payment,
      // creates the Auth account, then enables login.
      const response = await fetch("/api/admin/students/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
        body: JSON.stringify({ id }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success !== true) {
        alert(
          result?.error ||
            `Approve করা যায়নি। Server response: ${response.status}`
        );

        await loadStudents();
        return;
      }

      setSelectedStudent(null);

      if (result.alreadyApproved) {
        alert(
          `এই শিক্ষার্থী আগেই approved হয়েছে।\n\nStudent ID: ${result.studentID}`
        );
      } else {
        alert(
          `ভর্তি অনুমোদিত হয়েছে।\n\nStudent ID: ${result.studentID}\nPassword: ${result.password}`
        );
      }

      await loadStudents();
    } catch {
      alert(
        "Server-এর সঙ্গে যোগাযোগ সম্পূর্ণ হয়নি। তালিকা refresh করে status দেখুন। Pending থাকলে আবার চেষ্টা করুন।"
      );
    } finally {
      statusUpdatingRef.current = false;
    }
  }

  // =====================================
  // REJECTED ADMISSION ACTIONS
  // =====================================
  function openRejectedAction(type: "recover" | "delete", student: any) {
    if (actionBusyRef.current || statusUpdatingRef.current) {
      return;
    }

    setSelectedStudent(null);
    setActionDialog({ type, student });
    setRecoverTarget("pending");
    setDeleteConfirmText("");
    setActionError("");
  }

  function closeRejectedAction() {
    if (actionBusyRef.current) return;

    setActionDialog(null);
    setActionError("");
  }

  // Calls the secured backend API.
  async function callAdminStudentAPI(
    endpoint: string,
    payload: Record<string, unknown>
  ) {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      throw new Error("Admin session expired. Please login again.");
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || result?.success !== true) {
      throw new Error(result?.error || `Request failed (${response.status})`);
    }

    return result;
  }

  // =====================================
  // CONFIRM RECOVERY
  // =====================================
  async function confirmRecovery() {
    const dialog = actionDialog;

    if (
      !dialog ||
      dialog.type !== "recover" ||
      actionBusyRef.current ||
      statusUpdatingRef.current
    ) {
      return;
    }

    if (
      recoverTarget === "approved" &&
      dialog.student.payment_status !== "paid"
    ) {
      setActionError("Payment verify না করে Approved করা যাবে না।");
      return;
    }

    actionBusyRef.current = true;
    setActionBusy(true);
    setActionError("");
    setActionNotice(null);

    let restoredToPending = false;

    try {
      // First recover rejected admission.
      await callAdminStudentAPI("/api/admin/students/recover", {
        id: dialog.student.id,
        target: recoverTarget,
      });

      restoredToPending = true;

      if (recoverTarget === "approved") {
        // Reuse existing secure Approval API.
        const result = await callAdminStudentAPI(
          "/api/admin/students/approve",
          {
            id: dialog.student.id,
          }
        );

        setActiveTab("approved");

        setActionNotice({
          type: "success",
          message:
            `${dialog.student.student_name} has been approved. ` +
            `Student ID: ${result.studentID}`,
        });

        // Same credential display as existing flow.
        if (!result.alreadyApproved && result.password) {
          alert(
            `Admission Approved!\n\n` +
              `Student ID: ${result.studentID}\n` +
              `Password: ${result.password}`
          );
        }
      } else {
        setActiveTab("pending");

        setActionNotice({
          type: "success",
          message: `${dialog.student.student_name} has been restored to Pending.`,
        });
      }

      setActionDialog(null);
      await loadStudents();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";

      if (restoredToPending) {
        // Recovery succeeded but approval failed.
        setActiveTab("pending");

        setActionNotice({
          type: "warning",
          message:
            "Admission Pending-এ ফিরেছে, কিন্তু Approve সম্পূর্ণ হয়নি। " +
            message +
            " Pending tab থেকে আবার Approve করুন।",
        });

        setActionDialog(null);
        await loadStudents();
      } else {
        setActionError(message);
      }
    } finally {
      actionBusyRef.current = false;
      setActionBusy(false);
    }
  }

  // =====================================
  // CONFIRM PERMANENT DELETE
  // =====================================
  async function confirmDelete() {
    const dialog = actionDialog;

    if (
      !dialog ||
      dialog.type !== "delete" ||
      actionBusyRef.current ||
      statusUpdatingRef.current ||
      deleteConfirmText !== "DELETE"
    ) {
      return;
    }

    actionBusyRef.current = true;
    setActionBusy(true);
    setActionError("");
    setActionNotice(null);

    try {
      const result = await callAdminStudentAPI("/api/admin/students/delete", {
        id: dialog.student.id,
        expectedName: dialog.student.student_name,
        confirmation: "DELETE",
      });

      setActionNotice({
        type: result.cleanupRequired ? "warning" : "success",
        message: result.message || "Admission record deleted.",
      });

      setActionDialog(null);
      setActiveTab("rejected");

      await loadStudents();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Delete failed. Refresh and check."
      );
    } finally {
      actionBusyRef.current = false;
      setActionBusy(false);
    }
  }

  // =======================================
  // APPROVED STUDENT DELETE ACTIONS
  // =======================================
  function openApprovedDelete(student: any) {
    if (actionBusyRef.current || statusUpdatingRef.current) {
      return;
    }

    setApprovedDeleteStudent(student);
    setApprovedDeleteID("");
    setApprovedDeleteKeyword("");
    setApprovedDeleteAcknowledged(false);
    setActionError("");
  }

  function closeApprovedDelete() {
    if (actionBusyRef.current) return;

    setApprovedDeleteStudent(null);
    setActionError("");
  }

  // =======================================
  // CONFIRM APPROVED STUDENT DELETE
  // =======================================
  async function confirmApprovedDelete() {
    const student = approvedDeleteStudent;

    if (!student || actionBusyRef.current || statusUpdatingRef.current) {
      return;
    }

    if (
      approvedDeleteID !== String(student.student_id) ||
      approvedDeleteKeyword !== "DELETE" ||
      !approvedDeleteAcknowledged
    ) {
      setActionError("Student ID, DELETE এবং confirmation যাচাই করুন।");
      return;
    }

    actionBusyRef.current = true;
    setActionBusy(true);
    setActionError("");

    try {
      const result = await callAdminStudentAPI(
        "/api/admin/students/delete-approved",
        {
          id: student.id,
          studentID: student.student_id,
          expectedName: student.student_name,
          confirmation: "DELETE",
          noFinancialTransaction: true,
        }
      );

      setApprovedDeleteStudent(null);
      setActionNotice({
        type: result.cleanupRequired ? "warning" : "success",
        message: result.message || "Approved student deletion completed.",
      });

      setActiveTab("approved");

      await loadStudents();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Delete failed. Please refresh and retry."
      );
    } finally {
      actionBusyRef.current = false;
      setActionBusy(false);
    }
  }

  // --- Extra UI-only helper functions ---
  function togglePasswordVisibility(id: number) {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function copyToClipboard(value: string, field: string) {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  }

  function getInitials(name: string) {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }

  // ======================
  // FILTER STUDENTS
  // ======================
  const filteredStudents = students.filter((student) => {
    if (activeTab === "pending") return student.status === "pending";
    if (activeTab === "approved") return student.status === "approved";
    if (activeTab === "rejected") return student.status === "rejected";
    return true;
  });

  const pendingCount = students.filter((s) => s.status === "pending").length;
  const approvedCount = students.filter(
    (s) => s.status === "approved"
  ).length;
  const rejectedCount = students.filter(
    (s) => s.status === "rejected"
  ).length;

  const tabs = [
    {
      key: "pending",
      label: "Pending",
      count: pendingCount,
      icon: Clock,
      activeStyle: "border-amber-400/30 bg-amber-500/15 text-amber-300",
    },
    {
      key: "approved",
      label: "Approved",
      count: approvedCount,
      icon: CheckCircle2,
      activeStyle: "border-emerald-400/30 bg-emerald-400/15 text-emerald-300",
    },
    {
      key: "rejected",
      label: "Rejected",
      count: rejectedCount,
      icon: XCircle,
      activeStyle: "border-red-400/30 bg-red-500/15 text-red-300",
    },
  ];

  return (
    <main className="min-h-screen bg-[#080D19] p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <span className="h-px w-7 bg-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              Admissions
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Admission Management
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            নতুন ভর্তি আবেদন অনুমোদন, বাতিল ও পরিচালনা করো।
          </p>
        </div>

        {/* Summary stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card-lift rounded-3xl border border-amber-400/15 bg-[#101A2C] p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/15 bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Pending
              </p>
              <p className="text-xl font-semibold text-white">
                {pendingCount}
              </p>
            </div>
          </div>

          <div className="card-lift rounded-3xl border border-emerald-400/15 bg-[#101A2C] p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Approved
              </p>
              <p className="text-xl font-semibold text-white">
                {approvedCount}
              </p>
            </div>
          </div>

          <div className="card-lift rounded-3xl border border-red-400/15 bg-[#101A2C] p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10">
              <XCircle className="h-5 w-5 text-red-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Rejected
              </p>
              <p className="text-xl font-semibold text-white">
                {rejectedCount}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex flex-wrap gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19] ${
                  isActive
                    ? tab.activeStyle
                    : "border-white/[0.09] bg-[#101A2C] text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                    isActive ? "bg-black/20" : "bg-white/[0.06]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ADMISSION ACTION NOTIFICATION */}
        {actionNotice && (
          <div
            className={`mb-6 flex items-start justify-between gap-4 rounded-2xl border p-4 ${
              actionNotice.type === "success"
                ? "border-emerald-400/20 bg-emerald-400/10"
                : "border-amber-400/20 bg-amber-500/10"
            }`}
          >
            <div className="flex items-start gap-3">
              {actionNotice.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-300" />
              )}

              <div>
                <p
                  className={`font-semibold ${
                    actionNotice.type === "success"
                      ? "text-emerald-300"
                      : "text-amber-300"
                  }`}
                >
                  {actionNotice.type === "success"
                    ? "Action Completed"
                    : "Attention Required"}
                </p>

                <p className="mt-1 text-sm text-slate-300">
                  {actionNotice.message}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActionNotice(null)}
              aria-label="Dismiss notification"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.06] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/[0.09] bg-[#101A2C] p-16">
            <LoaderCircle className="h-7 w-7 animate-spin text-blue-400" />
            <p className="text-sm text-slate-400">Loading...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/[0.09] bg-[#101A2C]/60 p-16 text-center">
            <Users className="mx-auto h-10 w-10 text-slate-600" />
            <p className="mt-4 text-sm text-slate-400">No Student Found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredStudents.map((student) => {
              const hasValidPhoto =
                student.student_photo && !brokenImages[student.id];
              const isPasswordVisible = revealedPasswords[student.id];

              return (
                <div
                  key={student.id}
                  className="card-lift rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)] p-6"
                >
                  <div className="flex flex-col gap-6 md:flex-row">
                    {/* INFORMATION LEFT */}
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-white">
                        {student.student_name}
                      </h2>

                      <div className="mt-4 space-y-2 text-sm text-slate-300">
                        <p className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-blue-300" />
                          Class: <b className="text-white">{student.class}</b>
                        </p>
                        <p className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-violet-300" />
                          Batch: <b className="text-white">{student.batch}</b>
                        </p>
                        <p className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-400" />
                          Guardian: {student.guardian_name}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          WhatsApp: {student.whatsapp}
                        </p>
                        <p className="flex items-center gap-2">
                          <School className="h-4 w-4 text-slate-400" />
                          School: {student.school}
                        </p>
                      </div>

                      <div className="my-5 border-t border-white/[0.07]" />

                      <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-300">
                        <CreditCard className="h-4 w-4" />
                        Payment Information
                      </h3>

                      <div className="mt-3 space-y-2 text-sm text-slate-300">
                        <p>
                          Method:{" "}
                          <b className="text-white">
                            {student.payment_method === "bkash"
                              ? "bKash"
                              : "Offline"}
                          </b>
                        </p>

                        <p className="flex items-center gap-2">
                          Status:
                          {student.payment_status === "paid" ? (
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-0.5 text-xs font-semibold text-emerald-300">
                              PAID
                            </span>
                          ) : (
                            <span className="rounded-full border border-amber-400/15 bg-amber-500/10 px-3 py-0.5 text-xs font-semibold text-amber-300">
                              PENDING
                            </span>
                          )}
                        </p>

                        {student.payment_method === "bkash" && (
                          <>
                            <p>
                              bKash Number:{" "}
                              <span className="text-white">
                                {student.bkash_number}
                              </span>
                            </p>
                            <p>
                              Transaction ID:{" "}
                              <span className="text-white">
                                {student.transaction_id}
                              </span>
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* PHOTO RIGHT */}
                    <div className="flex justify-center md:w-56">
                      {hasValidPhoto ? (
                        <img
                          src={decodeURIComponent(student.student_photo)}
                          alt={student.student_name}
                          className="h-52 w-52 rounded-3xl border-2 border-white/[0.09] object-cover"
                          onError={() =>
                            setBrokenImages((prev) => ({
                              ...prev,
                              [student.id]: true,
                            }))
                          }
                        />
                      ) : (
                        <div className="flex h-52 w-52 items-center justify-center rounded-3xl border border-blue-400/15 bg-blue-500/10">
                          <span className="text-4xl font-semibold text-blue-300">
                            {getInitials(student.student_name)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
                  >
                    <Eye className="h-4 w-4" />
                    View Full Details
                  </button>

                  {/* ======================
                      ACTION BUTTONS (PENDING)
                  ====================== */}
                  {activeTab === "pending" && (
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() => markAsPaid(student.id)}
                        disabled={student.payment_status === "paid"}
                        className="inline-flex items-center gap-2 rounded-xl border border-amber-400/15 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {student.payment_status === "paid"
                          ? "Payment Verified"
                          : "Mark as Paid"}
                      </button>

                      <button
                        onClick={() => updateStatus(student.id, "approved")}
                        disabled={student.payment_status !== "paid"}
                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <UserCheck className="h-4 w-4" />
                        Approve
                      </button>

                      <button
                        onClick={() => updateStatus(student.id, "rejected")}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  )}

                  {/* APPROVED INFO BOX */}
                  {activeTab === "approved" && (
                    <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-5">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                        <CheckCircle2 className="h-4 w-4" />
                        Student Approved
                      </h3>

                      <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                        Student ID:{" "}
                        <b className="text-white">{student.student_id}</b>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              student.student_id,
                              `sid-${student.id}`
                            )
                          }
                          className="text-slate-500 transition hover:text-blue-300"
                        >
                          {copiedField === `sid-${student.id}` ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                        Password:{" "}
                        <b className="text-white">
                          {isPasswordVisible
                            ? student.password
                            : "••••••••"}
                        </b>
                        <button
                          onClick={() =>
                            togglePasswordVisibility(student.id)
                          }
                          className="text-slate-500 transition hover:text-blue-300"
                        >
                          {isPasswordVisible ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              student.password,
                              `pwd-${student.id}`
                            )
                          }
                          className="text-slate-500 transition hover:text-blue-300"
                        >
                          {copiedField === `pwd-${student.id}` ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      <p className="mt-2 text-sm text-slate-300">
                        Login Status:{" "}
                        <span className="font-semibold text-emerald-300">
                          Active
                        </span>
                      </p>

                      <button
                        onClick={() => sendWhatsApp(student)}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/20"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Send Login Info WhatsApp
                      </button>
                    </div>
                  )}

                  {/* APPROVED STUDENT DELETE BUTTON */}
                  {activeTab === "approved" && (
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => openApprovedDelete(student)}
                        disabled={actionBusy}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:border-red-400/40 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Student
                      </button>
                    </div>
                  )}

                  {/* REJECTED ACTIONS */}
                  {activeTab === "rejected" && (
                    <div className="mt-5 rounded-2xl border border-red-400/15 bg-red-500/5 p-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-red-300">
                        <XCircle className="h-4 w-4" />
                        Admission Rejected
                      </div>

                      <div className="mt-4 flex flex-col gap-3 border-t border-red-400/10 pt-4 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => openRejectedAction("recover", student)}
                          disabled={actionBusy}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/20 disabled:opacity-50"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Recover Admission
                        </button>

                        <button
                          type="button"
                          onClick={() => openRejectedAction("delete", student)}
                          disabled={actionBusy}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.09] bg-[#0B1425] px-6 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Permanently
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==============================
          STUDENT DETAILS MODAL
      ================================ */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/[0.09] bg-[#0B1425] p-8 shadow-2xl">
            {/* HEADER */}
            <div className="mb-8 flex items-center justify-between border-b border-white/[0.07] pb-5">
              <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                <GraduationCap className="h-6 w-6 text-blue-300" />
                Student Full Information
              </h2>

              <button
                onClick={() => setSelectedStudent(null)}
                className="rounded-full border border-red-400/20 bg-red-500/10 p-2.5 text-red-300 transition hover:bg-red-500/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* TOP SECTION */}
            <div className="grid gap-8 md:grid-cols-3">
              {/* PHOTO */}
              <div className="flex justify-center">
                {selectedStudent.student_photo &&
                !brokenImages[`modal-${selectedStudent.id}`] ? (
                  <img
                    src={decodeURIComponent(selectedStudent.student_photo)}
                    alt={selectedStudent.student_name}
                    className="h-64 w-64 rounded-3xl border-2 border-white/[0.09] object-cover"
                    onError={() =>
                      setBrokenImages((prev) => ({
                        ...prev,
                        [`modal-${selectedStudent.id}`]: true,
                      }))
                    }
                  />
                ) : (
                  <div className="flex h-64 w-64 items-center justify-center rounded-3xl border border-blue-400/15 bg-blue-500/10">
                    <span className="text-5xl font-semibold text-blue-300">
                      {getInitials(selectedStudent.student_name)}
                    </span>
                  </div>
                )}
              </div>

              {/* BASIC INFO */}
              <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
                <InfoBlock label="Name" value={selectedStudent.student_name} />
                <InfoBlock
                  label="Student ID"
                  value={selectedStudent.student_id || "Not Generated"}
                />
                <InfoBlock label="Class" value={selectedStudent.class} />
                <InfoBlock label="Batch" value={selectedStudent.batch} />
                <InfoBlock
                  label="Guardian"
                  value={selectedStudent.guardian_name}
                />
                <InfoBlock
                  label="WhatsApp"
                  value={selectedStudent.whatsapp}
                />
                <InfoBlock
                  label="Date of Birth"
                  value={selectedStudent.date_of_birth}
                />
                <InfoBlock label="School" value={selectedStudent.school} />
              </div>
            </div>

            {/* CONTACT */}
            <div className="mt-8 rounded-2xl border border-blue-400/10 bg-blue-500/5 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-300">
                <Phone className="h-4.5 w-4.5" />
                Contact Information
              </h3>

              <p className="text-sm text-slate-300">
                <b className="text-white">Email:</b>{" "}
                {selectedStudent.email || "N/A"}
              </p>

              <p className="mt-2 text-sm text-slate-300">
                <b className="text-white">Facebook:</b>{" "}
                {selectedStudent.facebook_link || "N/A"}
              </p>
            </div>

            {/* ADDRESS */}
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-white/[0.09] bg-[#101A2C] p-5">
                <h3 className="font-semibold text-blue-300">
                  Present Address
                </h3>
                <p className="mt-3 text-sm text-slate-300">
                  {selectedStudent.present_address || "N/A"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.09] bg-[#101A2C] p-5">
                <h3 className="font-semibold text-blue-300">
                  Permanent Address
                </h3>
                <p className="mt-3 text-sm text-slate-300">
                  {selectedStudent.permanent_address || "N/A"}
                </p>
              </div>
            </div>

            {/* PAYMENT */}
            <div className="mt-6 rounded-2xl border border-amber-400/15 bg-amber-500/5 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-amber-300">
                <CreditCard className="h-4.5 w-4.5" />
                Payment Information
              </h3>

              <p className="text-sm text-slate-300">
                Method:{" "}
                <b className="text-white">
                  {selectedStudent.payment_method === "bkash"
                    ? "bKash"
                    : "Offline"}
                </b>
              </p>

              <p className="mt-3 text-sm text-slate-300">
                Status:{" "}
                <b>
                  {selectedStudent.payment_status === "paid" ? (
                    <span className="text-emerald-300">PAID</span>
                  ) : (
                    <span className="text-amber-300">PENDING</span>
                  )}
                </b>
              </p>

              {selectedStudent.payment_method === "bkash" && (
                <>
                  <p className="mt-3 text-sm text-slate-300">
                    bKash Number:{" "}
                    <b className="text-white">
                      {selectedStudent.bkash_number}
                    </b>
                  </p>
                  <p className="mt-3 text-sm text-slate-300">
                    Transaction ID:{" "}
                    <b className="text-white">
                      {selectedStudent.transaction_id}
                    </b>
                  </p>
                </>
              )}
            </div>

            {/* LOGIN INFO */}
            {selectedStudent.status === "approved" && (
              <div className="mt-6 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-300">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                  Login Information
                </h3>

                <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                  Student ID:{" "}
                  <b className="text-white">{selectedStudent.student_id}</b>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        selectedStudent.student_id,
                        "modal-sid"
                      )
                    }
                    className="text-slate-500 transition hover:text-blue-300"
                  >
                    {copiedField === "modal-sid" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                  Password:{" "}
                  <b className="text-white">
                    {modalPasswordVisible
                      ? selectedStudent.password
                      : "••••••••"}
                  </b>
                  <button
                    onClick={() =>
                      setModalPasswordVisible((prev) => !prev)
                    }
                    className="text-slate-500 transition hover:text-blue-300"
                  >
                    {modalPasswordVisible ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        selectedStudent.password,
                        "modal-pwd"
                      )
                    }
                    className="text-slate-500 transition hover:text-blue-300"
                  >
                    {copiedField === "modal-pwd" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <button
                  onClick={() => sendWhatsApp(selectedStudent)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/20"
                >
                  <MessageCircle className="h-4 w-4" />
                  Send Login Info WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================
          RECOVER / DELETE MODAL
      ===================================== */}
      {actionDialog && (
        <div
          role="presentation"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admission-action-title"
            className="w-full max-w-lg rounded-3xl border border-white/[0.09] bg-[#0B1425] p-6 shadow-2xl sm:p-8"
          >
            {/* HEADER */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Admission Management
                </p>

                <h2
                  id="admission-action-title"
                  className="mt-2 text-2xl font-semibold text-white"
                >
                  {actionDialog.type === "recover"
                    ? "Recover Admission"
                    : "Delete Admission"}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Student:{" "}
                  <strong className="text-slate-200">
                    {actionDialog.student.student_name}
                  </strong>
                </p>
              </div>

              <button
                type="button"
                onClick={closeRejectedAction}
                disabled={actionBusy}
                aria-label="Close dialog"
                className="rounded-full bg-white/[0.06] p-2 text-slate-300 hover:bg-white/[0.1] disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* RECOVERY OPTIONS */}
            {actionDialog.type === "recover" ? (
              <div className="mt-6 space-y-3">
                <p className="text-sm text-slate-400">
                  Select the admission status:
                </p>

                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                    recoverTarget === "pending"
                      ? "border-amber-400/30 bg-amber-500/10"
                      : "border-white/[0.09] hover:bg-white/[0.03]"
                  }`}
                >
                  <input
                    type="radio"
                    name="recover-target"
                    checked={recoverTarget === "pending"}
                    onChange={() => setRecoverTarget("pending")}
                    disabled={actionBusy}
                    className="mt-1"
                  />

                  <span>
                    <strong className="block text-white">
                      Restore to Pending
                    </strong>
                    <span className="mt-1 block text-sm text-slate-400">
                      Application will return to the Pending Admission list.
                    </span>
                  </span>
                </label>

                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                    recoverTarget === "approved"
                      ? "border-emerald-400/30 bg-emerald-400/10"
                      : "border-white/[0.09] hover:bg-white/[0.03]"
                  }`}
                >
                  <input
                    type="radio"
                    name="recover-target"
                    checked={recoverTarget === "approved"}
                    onChange={() => setRecoverTarget("approved")}
                    disabled={actionBusy}
                    className="mt-1"
                  />

                  <span>
                    <strong className="block text-white">
                      Restore & Approve
                    </strong>
                    <span className="mt-1 block text-sm text-slate-400">
                      Verify payment and activate the student account.
                    </span>
                  </span>
                </label>

                {recoverTarget === "approved" &&
                  actionDialog.student.payment_status !== "paid" && (
                    <div className="rounded-xl border border-amber-400/15 bg-amber-500/10 p-3 text-sm text-amber-300">
                      Payment is not verified. Restore to Pending first, then
                      Mark as Paid.
                    </div>
                  )}
              </div>
            ) : (
              /* DELETE CONFIRMATION */
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300">
                  <strong>Permanent Delete</strong>
                  <p className="mt-2">
                    This action cannot be undone. The rejected admission
                    record will be removed from Supabase. Deletion may be
                    blocked if linked records require review.
                  </p>
                </div>

                <label
                  htmlFor="delete-confirm-input"
                  className="block text-sm font-semibold text-slate-300"
                >
                  Type DELETE to confirm
                </label>

                <input
                  id="delete-confirm-input"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="DELETE"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  disabled={actionBusy}
                  className="w-full rounded-xl border border-white/[0.09] bg-[#101A2C] px-4 py-3 text-white outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1425]"
                />
              </div>
            )}

            {/* ERROR MESSAGE */}
            {actionError && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300"
              >
                {actionError}
              </div>
            )}

            {/* FOOTER ACTIONS */}
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRejectedAction}
                disabled={actionBusy}
                className="rounded-xl border border-white/[0.09] px-5 py-3 font-semibold text-slate-300 hover:bg-white/[0.05] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  actionDialog.type === "recover"
                    ? confirmRecovery
                    : confirmDelete
                }
                disabled={
                  actionBusy ||
                  (actionDialog.type === "delete" &&
                    deleteConfirmText !== "DELETE") ||
                  (actionDialog.type === "recover" &&
                    recoverTarget === "approved" &&
                    actionDialog.student.payment_status !== "paid")
                }
                className={`rounded-xl px-6 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  actionDialog.type === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {actionBusy
                  ? "Processing..."
                  : actionDialog.type === "delete"
                  ? "Delete Permanently"
                  : recoverTarget === "approved"
                  ? "Recover & Approve"
                  : "Restore to Pending"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================
          APPROVED STUDENT DELETE MODAL
      ====================================== */}
      {approvedDeleteStudent && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="approved-delete-title"
            className="w-full max-w-lg rounded-3xl border border-white/[0.09] bg-[#0B1425] p-6 text-slate-100 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-red-400">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Danger Zone
                </p>

                <h2
                  id="approved-delete-title"
                  className="mt-2 text-2xl font-semibold text-white"
                >
                  Delete Approved Student
                </h2>
              </div>

              <button
                type="button"
                onClick={closeApprovedDelete}
                disabled={actionBusy}
                aria-label="Close dialog"
                className="rounded-xl bg-white/[0.06] p-2 text-slate-300 hover:bg-white/[0.1] disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* STUDENT INFORMATION */}
            <div className="mt-6 rounded-2xl border border-white/[0.09] bg-[#101A2C] p-4">
              <p className="font-semibold text-white">
                {approvedDeleteStudent.student_name}
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Student ID:{" "}
                <span className="font-semibold text-blue-300">
                  {approvedDeleteStudent.student_id}
                </span>
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Class: {approvedDeleteStudent.class}
              </p>
            </div>

            {/* WARNING */}
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
              <p className="font-semibold text-red-300">
                Permanent Deletion Warning
              </p>

              <p className="mt-2 text-sm leading-6 text-red-200">
                This action permanently removes the student's database
                profile and attempts to remove the linked Supabase Auth
                account and photo. Deletion will be blocked if protected
                related records are found.
              </p>
            </div>

            {/* STUDENT ID CONFIRMATION */}
            <div className="mt-6">
              <label
                htmlFor="approved-delete-id"
                className="block text-sm font-semibold text-slate-200"
              >
                Enter Student ID to confirm
              </label>

              <input
                id="approved-delete-id"
                type="text"
                autoComplete="off"
                spellCheck={false}
                placeholder={String(approvedDeleteStudent.student_id)}
                value={approvedDeleteID}
                onChange={(e) => setApprovedDeleteID(e.target.value)}
                disabled={actionBusy}
                className="mt-2 w-full rounded-xl border border-white/[0.09] bg-[#101A2C] px-4 py-3 text-white outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50"
              />
            </div>

            {/* DELETE KEYWORD */}
            <div className="mt-4">
              <label
                htmlFor="approved-delete-keyword"
                className="block text-sm font-semibold text-slate-200"
              >
                Type DELETE to continue
              </label>

              <input
                id="approved-delete-keyword"
                type="text"
                autoComplete="off"
                spellCheck={false}
                placeholder="DELETE"
                value={approvedDeleteKeyword}
                onChange={(e) => setApprovedDeleteKeyword(e.target.value)}
                disabled={actionBusy}
                className="mt-2 w-full rounded-xl border border-white/[0.09] bg-[#101A2C] px-4 py-3 text-white outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50"
              />
            </div>

            {/* FINANCIAL CONFIRMATION */}
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.09] bg-[#101A2C] p-4">
              <input
                type="checkbox"
                checked={approvedDeleteAcknowledged}
                onChange={(e) =>
                  setApprovedDeleteAcknowledged(e.target.checked)
                }
                disabled={actionBusy}
                className="mt-1"
              />

              <span className="text-sm leading-6 text-slate-300">
                I have verified that this student has no actual financial
                transactions, including admission fees, requiring retention,
                and understand that deletion is permanent.
              </span>
            </label>

            {/* ERROR */}
            {actionError && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300"
              >
                {actionError}
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeApprovedDelete}
                disabled={actionBusy}
                className="rounded-xl border border-white/[0.09] bg-[#101A2C] px-5 py-3 font-semibold text-slate-300 hover:bg-white/[0.05] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmApprovedDelete}
                disabled={
                  actionBusy ||
                  approvedDeleteID !==
                    String(approvedDeleteStudent.student_id) ||
                  approvedDeleteKeyword !== "DELETE" ||
                  !approvedDeleteAcknowledged
                }
                className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {actionBusy ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function InfoBlock({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#101A2C] p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <b className="text-sm text-white">{value || "N/A"}</b>
    </div>
  );
}