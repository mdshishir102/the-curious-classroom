"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Copy,
  Check,
  MessageCircle,
  Printer,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  Cake,
  CalendarDays,
  User,
  Users,
  GraduationCap,
  MapPin,
  KeyRound,
  Smartphone,
  LoaderCircle,
} from "lucide-react";

export default function StudentProfile() {
  const params = useParams();
  const router = useRouter();

  const id = params.id;

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  async function loadStudent() {
    const { data, error } = await supabase
      .from("students")
      .select(
        `
        id,
        student_name,
        student_id,
        student_photo,
        date_of_birth,
        admission_date,
        class,
        batch,
        guardian_name,
        whatsapp,
        school,
        college,
        present_address,
        permanent_address,
        payment_method,
        payment_status,
        transaction_id,
       login_enabled,
        active_device_id,
        device_locked,
        device_locked_at,
        session_version
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setStudent(data);
    setLoading(false);
  }

  useEffect(() => {
    loadStudent();
  }, []);

  async function toggleLogin() {
    setBusy(true);

    const { error } = await supabase
      .from("students")
      .update({ login_enabled: !student.login_enabled })
      .eq("id", student.id);

    setBusy(false);

    if (error) {
      alert(error.message);
      return;
    }

    loadStudent();
  }

  // Unlock + device reset: student abar notun device e login korte parbe
  async function resetDevice() {
    const ok = confirm(
      student.device_locked
        ? "Account unlock korben? Student abar login korte parbe."
        : "Device reset korben? Student notun device theke login korte parbe."
    );

    if (!ok) return;

    setBusy(true);

    const { error } = await supabase
      .from("students")
      .update({
        device_locked: false,
        device_locked_at: null,
        active_device_id: null,
        session_version: (student.session_version || 1) + 1,
      })
      .eq("id", student.id);

    setBusy(false);

    if (error) {
      alert(error.message);
      return;
    }

    loadStudent();
  }

  function copyToClipboard(value: string, field: string) {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  }

  function getWhatsAppLink(phone: string) {
    if (!phone) return "#";
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) cleaned = "88" + cleaned;
    return `https://wa.me/${cleaned}`;
  }

  function calculateAge(dob: string) {
    if (!dob) return "N/A";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return `${age} বছর`;
  }

  function calculateTenure(admissionDate: string) {
    if (!admissionDate) return "N/A";
    const start = new Date(admissionDate);
    const today = new Date();
    const diffDays = Math.floor(
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 30) return `${diffDays} দিন`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} মাস`;
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    return `${years} বছর ${months} মাস`;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#080D19]">
        <LoaderCircle className="h-8 w-8 animate-spin text-blue-400" />
        <p className="text-sm font-medium text-slate-400">
          Loading Profile...
        </p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080D19] font-semibold text-slate-400">
        Student paoa jay ni
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#080D19] px-6 py-12 text-slate-200">
      <div className="mx-auto max-w-4xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
              Student Profile
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.09] bg-[#101A2C] px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-[#15213a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>

            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.09] bg-[#101A2C] px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-[#15213a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>
        </div>

        {/* PROFILE CARD */}
        <div className="mb-6 card-lift rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)] p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <img
              src={student.student_photo}
              onError={(e) => {
                e.currentTarget.src = "/logo.png";
              }}
              className="h-32 w-32 rounded-full border-4 border-blue-400/20 object-cover"
              alt={student.student_name}
            />

            <div className="text-center md:text-left">
              <h1 className="text-3xl font-semibold text-white">
                {student.student_name}
              </h1>

              <div className="mt-2 flex items-center justify-center gap-2 md:justify-start">
                <p className="font-semibold text-blue-300">
                  {student.student_id}
                </p>
                <button
                  onClick={() =>
                    copyToClipboard(student.student_id, "id")
                  }
                  className="text-slate-500 transition hover:text-blue-300"
                >
                  {copiedField === "id" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <p className="mt-1 text-slate-400">
                {student.class} • {student.batch}
              </p>
            </div>
          </div>

          {/* QUICK STATUS STRIP */}
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatusBadge
              icon={student.login_enabled ? ShieldCheck : ShieldAlert}
              label="Login Status"
              value={student.login_enabled ? "Active" : "Disabled"}
              tone={student.login_enabled ? "emerald" : "red"}
            />
            <StatusBadge
              icon={student.device_locked ? Lock : Smartphone}
              label="Device"
              value={student.device_locked ? "Locked" : "Normal"}
              tone={student.device_locked ? "red" : "emerald"}
            />
            <StatusBadge
              icon={CreditCard}
              label="Payment"
              value={student.payment_status || "N/A"}
              tone={
                (student.payment_status || "").toLowerCase() === "paid"
                  ? "emerald"
                  : "amber"
              }
            />
          </div>
        </div>

        <Section title="Student Information" icon={User}>
          <Item label="Student Name" value={student.student_name} />
          <Item
            label="Student ID"
            value={student.student_id}
            copyable
            onCopy={() => copyToClipboard(student.student_id, "sid")}
            copied={copiedField === "sid"}
          />
          <Item
            label="Date of Birth"
            value={student.date_of_birth}
            extra={
              student.date_of_birth && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-md border border-blue-400/15 bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-300">
                  <Cake className="h-3 w-3" />
                  {calculateAge(student.date_of_birth)}
                </span>
              )
            }
          />
          <Item
            label="Admission Date"
            value={
              student.admission_date
                ? new Date(student.admission_date).toLocaleDateString("en-GB")
                : "N/A"
            }
            extra={
              student.admission_date && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-md border border-emerald-400/15 bg-emerald-400/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
                  <CalendarDays className="h-3 w-3" />
                  {calculateTenure(student.admission_date)}
                </span>
              )
            }
          />
          <Item label="Class" value={student.class} />
          <Item label="Batch" value={student.batch} />
        </Section>

        <Section title="Guardian Information" icon={Users}>
          <Item label="Guardian Name" value={student.guardian_name} />
          <Item
            label="WhatsApp"
            value={student.whatsapp}
            extra={
              student.whatsapp && (
                <a
                  href={getWhatsAppLink(student.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center gap-1 rounded-md border border-emerald-400/15 bg-emerald-400/10 px-2 py-0.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-400/20"
                >
                  <MessageCircle className="h-3 w-3" />
                  Chat
                </a>
              )
            }
            copyable
            onCopy={() => copyToClipboard(student.whatsapp, "wa")}
            copied={copiedField === "wa"}
          />
        </Section>

        <Section title="Academic Information" icon={GraduationCap}>
          <Item label="School" value={student.school} />
          <Item label="College" value={student.college} />
        </Section>

        <Section title="Address" icon={MapPin}>
          <Item label="Present Address" value={student.present_address} />
          <Item label="Permanent Address" value={student.permanent_address} />
        </Section>

        <Section title="Payment Information" icon={CreditCard}>
          <Item label="Payment Method" value={student.payment_method} />
          <Item label="Payment Status" value={student.payment_status} />
          <Item
            label="Transaction ID"
            value={student.transaction_id}
            copyable
            onCopy={() => copyToClipboard(student.transaction_id, "txn")}
            copied={copiedField === "txn"}
          />
        </Section>

        {/* ACCOUNT CONTROL PANEL */}
        <div className="mb-6 card-lift rounded-3xl border border-amber-400/15 bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)] p-6 print:hidden">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-500/10">
              <KeyRound className="h-4.5 w-4.5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Account Control
              </h2>
              <p className="text-xs text-slate-500">
                এই অপশনগুলো সরাসরি স্টুডেন্টের লগইন অ্যাক্সেসকে প্রভাবিত করে —
                সতর্কতার সাথে ব্যবহার করুন।
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* LOGIN CONTROL */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-5">
              <div>
                <p className="text-sm font-medium text-slate-300">
                  Login Access
                </p>
                <p className="text-xs text-slate-500">
                  Current status:{" "}
                  <span
                    className={
                      student.login_enabled
                        ? "text-emerald-300 font-semibold"
                        : "text-red-300 font-semibold"
                    }
                  >
                    {student.login_enabled ? "Active" : "Disabled"}
                  </span>
                </p>
              </div>
              <button
                onClick={toggleLogin}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-6 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
              >
                {busy ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                {student.login_enabled ? "Disable Login" : "Enable Login"}
              </button>
            </div>

            {/* DEVICE LOCK CONTROL */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-300">
                  Device Lock
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {student.device_locked ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-red-400/20 bg-red-500/10 px-2 py-0.5 font-semibold text-red-300">
                      <Lock className="h-3 w-3" />
                      Locked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 font-semibold text-emerald-300">
                      <ShieldCheck className="h-3 w-3" />
                      Normal
                    </span>
                  )}
                  <span>
                    Registered Device:{" "}
                    {student.active_device_id ? "Ache (1 ta device)" : "Nai"}
                  </span>
                </div>
                {student.device_locked && (
                  <p className="mt-1 text-xs text-slate-500">
                    Locked At:{" "}
                    {student.device_locked_at
                      ? new Date(student.device_locked_at).toLocaleString(
                          "en-GB"
                        )
                      : "N/A"}
                  </p>
                )}
              </div>

              {student.device_locked ? (
                <button
                  onClick={resetDevice}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/20 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
                >
                  {busy ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Unlock className="h-4 w-4" />
                  )}
                  Unlock Account
                </button>
              ) : (
                student.active_device_id && (
                  <button
                    onClick={resetDevice}
                    disabled={busy}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-500/10 px-6 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
                  >
                    {busy ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Smartphone className="h-4 w-4" />
                    )}
                    Reset Device
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatusBadge({ icon: Icon, label, value, tone }: any) {
  const toneStyles: Record<string, string> = {
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    red: "border-red-400/20 bg-red-500/10 text-red-300",
    amber: "border-amber-400/15 bg-amber-500/10 text-amber-300",
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-4 ${toneStyles[tone]}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <div>
        <p className="text-[11px] uppercase tracking-wide opacity-80">
          {label}
        </p>
        <p className="text-sm font-semibold capitalize">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: any) {
  return (
    <div className="mb-6 card-lift rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)] p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/10">
          <Icon className="h-4.5 w-4.5 text-blue-300" />
        </div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>

      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Item({ label, value, extra, copyable, onCopy, copied }: any) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] pb-3">
      <span className="text-sm text-slate-400">{label}</span>

      <div className="flex items-center">
        <span className="text-right text-sm font-semibold text-white">
          {value || "N/A"}
        </span>
        {extra}
        {copyable && value && (
          <button
            onClick={onCopy}
            className="ml-2 text-slate-500 transition hover:text-blue-300"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}