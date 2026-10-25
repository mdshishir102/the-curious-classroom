"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function StudentProfile() {
  const params = useParams();
  const router = useRouter();

  const id = params.id;

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060b17] font-semibold text-slate-400">
        Loading Profile...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060b17] font-semibold text-slate-400">
        Student paoa jay ni
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#060b17] px-6 py-12 text-slate-200">
      <div className="mx-auto max-w-4xl">
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-blue-500" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-400">
              Student Profile
            </span>
          </div>

          <button
            onClick={() => router.back()}
            className="rounded-xl border border-white/10 bg-[#0d1426] px-5 py-3 font-medium text-slate-200 transition hover:border-white/20 hover:bg-[#121c36]"
          >
            ← Back
          </button>
        </div>

        {/* PROFILE CARD */}
        <div className="mb-6 flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-[#0d1426] p-8 md:flex-row">
          <img
            src={student.student_photo}
            onError={(e) => {
              e.currentTarget.src = "/logo.png";
            }}
            className="h-32 w-32 rounded-full border-4 border-blue-500/30 object-cover"
          />

          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-white">
              {student.student_name}
            </h1>

            <p className="mt-2 font-semibold text-blue-400">
              {student.student_id}
            </p>

            <p className="mt-1 text-slate-400">
              {student.class} • {student.batch}
            </p>
          </div>
        </div>

        <Section title="Student Information">
          <Item label="Student Name" value={student.student_name} />
          <Item label="Student ID" value={student.student_id} />
          <Item label="Date of Birth" value={student.date_of_birth} />
          <Item
            label="Admission Date"
            value={
              student.admission_date
                ? new Date(student.admission_date).toLocaleDateString("en-GB")
                : "N/A"
            }
          />
          <Item label="Class" value={student.class} />
          <Item label="Batch" value={student.batch} />
        </Section>

        <Section title="Guardian Information">
          <Item label="Guardian Name" value={student.guardian_name} />
          <Item label="WhatsApp" value={student.whatsapp} />
        </Section>

        <Section title="Academic Information">
          <Item label="School" value={student.school} />
          <Item label="College" value={student.college} />
        </Section>

        <Section title="Address">
          <Item label="Present Address" value={student.present_address} />
          <Item label="Permanent Address" value={student.permanent_address} />
        </Section>

        <Section title="Payment Information">
          <Item label="Payment Method" value={student.payment_method} />
          <Item label="Payment Status" value={student.payment_status} />
          <Item label="Transaction ID" value={student.transaction_id} />
        </Section>

        {/* LOGIN */}
        <Section title="Login Information">
          <Item
            label="Login Status"
            value={student.login_enabled ? "Active" : "Disabled"}
          />

          <button
            onClick={toggleLogin}
            disabled={busy}
            className="mt-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-6 py-3 font-semibold text-blue-300 transition hover:bg-blue-500/20 disabled:opacity-60"
          >
            {student.login_enabled ? "Disable Login" : "Enable Login"}
          </button>
        </Section>

        {/* DEVICE LOCK */}
        <Section title="Device Lock">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-slate-400">Status</span>

            {student.device_locked ? (
              <span className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm font-bold text-red-400">
                🔒 Locked
              </span>
            ) : (
              <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-bold text-emerald-400">
                Normal
              </span>
            )}
          </div>

          <Item
            label="Registered Device"
            value={student.active_device_id ? "Ache (1 ta device)" : "Nai"}
          />

          {student.device_locked && (
            <Item
              label="Locked At"
              value={
                student.device_locked_at
                  ? new Date(student.device_locked_at).toLocaleString("en-GB")
                  : "N/A"
              }
            />
          )}

          {student.device_locked ? (
            <button
              onClick={resetDevice}
              disabled={busy}
              className="mt-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-60"
            >
              🔓 Unlock Account
            </button>
          ) : (
            student.active_device_id && (
              <button
                onClick={resetDevice}
                disabled={busy}
                className="mt-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-3 font-semibold text-amber-300 transition hover:bg-amber-500/20 disabled:opacity-60"
              >
                Reset Device
              </button>
            )
          )}
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="mb-6 rounded-3xl border border-white/10 bg-[#0d1426] p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>

      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Item({ label, value }: any) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
      <span className="text-slate-400">{label}</span>

      <span className="text-right font-semibold text-white">
        {value || "N/A"}
      </span>
    </div>
  );
}