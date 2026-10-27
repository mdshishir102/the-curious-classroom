"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const ABSENT_LIMIT = 3;

// ---------- Helpers ----------
function normalizeWhatsApp(raw) {
  if (!raw) return null;
  let n = String(raw).replace(/[^\d]/g, "");
  if (n.startsWith("880")) return n;
  if (n.startsWith("0")) return "88" + n;
  if (n.length === 10) return "880" + n;
  return n;
}



function buildMessage(student, days) {
  const lastPresent = student.lastPresent
    ? new Date(student.lastPresent).toLocaleDateString("bn-BD", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return `আসসালামু আলাইকুম,

প্রিয় ${student.student_name},

*The Curious Classroom* এর পক্ষ থেকে আপনাকে শুভেচ্ছা।

আমাদের রেকর্ড অনুযায়ী আপনি টানা *${days} দিন* ক্লাসে অনুপস্থিত রয়েছেন।${
    lastPresent ? `\nআপনার সর্বশেষ উপস্থিতি ছিল: ${lastPresent}।` : ""
  }

নিয়মিত ক্লাসে উপস্থিত থাকা আপনার পড়াশোনার ধারাবাহিকতা ও পরীক্ষার প্রস্তুতির জন্য অত্যন্ত গুরুত্বপূর্ণ। তাই আপনাকে বিনীতভাবে অনুরোধ করা হচ্ছে, পরবর্তী ক্লাসে অবশ্যই উপস্থিত থাকুন।

⚠️ *গুরুত্বপূর্ণ নোটিশ:*
পরবর্তী ক্লাসে উপস্থিত না থাকলে নিয়ম অনুযায়ী আপনার অ্যাকাউন্টটি সাময়িকভাবে লক করা হবে।

অনুপস্থিতির পেছনে কোনো যৌক্তিক কারণ থাকলে (অসুস্থতা বা অন্য কোনো সমস্যা), অনুগ্রহ করে এই নম্বরে আমাদের জানান, আমরা সহযোগিতা করতে প্রস্তুত।

ধন্যবাদান্তে,
*অ্যাডমিনিস্ট্রেশন*
*The Curious Classroom*
_Embrace Your Curiosity_

━━━━━━━━━━━━━━
_Powered by *Shishir BioVerse*_`;
}





// ---------- Main Component ----------
export default function ConsecutiveAbsentSection() {
  const [absentStudents, setAbsentStudents] = useState([]);
  const [lockedStudents, setLockedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);

    const { data: students, error: sErr } = await supabase
      .from("students")
      .select(
        "id, student_id, student_name, class, batch, whatsapp, status, is_locked, locked_at"
      )
      .eq("status", "approved");

    if (sErr) console.error("students error:", sErr);

    const active = (students || []).filter((s) => !s.is_locked);
    const locked = (students || []).filter((s) => s.is_locked);

    const since = new Date();
    since.setDate(since.getDate() - 60);

    const { data: records, error: aErr } = await supabase
      .from("attendance")
      .select("student_id, attendance_date, status")
      .gte("attendance_date", since.toISOString().slice(0, 10))
      .order("attendance_date", { ascending: false });

    if (aErr) console.error("attendance error:", aErr);

    // attendance.student_id (text) = students.student_id (text)
    const byStudent = {};
    (records || []).forEach((r) => {
      (byStudent[r.student_id] ||= []).push(r);
    });

    const result = [];
    active.forEach((s) => {
      const list = byStudent[s.student_id] || [];
      let streak = 0;
      let lastPresent = null;
      for (const r of list) {
        const st = String(r.status || "").toLowerCase();
        if (st === "absent") {
          streak++;
        } else if (st === "present") {
          lastPresent = r.attendance_date;
          break;
        }
      }
      if (streak >= ABSENT_LIMIT) {
        result.push({ ...s, streak, lastPresent });
      }
    });

    result.sort((a, b) => b.streak - a.streak);
    setAbsentStudents(result);
    setLockedStudents(locked);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sendWhatsApp = (s) => {
    const phone = normalizeWhatsApp(s.whatsapp);
    if (!phone) return alert("এই শিক্ষার্থীর WhatsApp নম্বর পাওয়া যায়নি।");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(
      buildMessage(s, s.streak)
    )}`;
    window.open(url, "_blank");
  };

  const lockProfile = async (s) => {
    if (!confirm(`${s.student_name}-এর প্রোফাইল লক করবেন?`)) return;
    setBusyId(s.id);
    const { error } = await supabase
      .from("students")
      .update({
        is_locked: true,
        locked_at: new Date().toISOString(),
        lock_reason: `টানা ${s.streak} দিন অনুপস্থিত`,
      })
      .eq("id", s.id);
    if (error) alert("লক করা যায়নি: " + error.message);
    setBusyId(null);
    load();
  };

  const unlockProfile = async (s) => {
    if (!confirm(`${s.student_name}-এর প্রোফাইল আনলক করবেন?`)) return;
    setBusyId(s.id);
    const { error } = await supabase
      .from("students")
      .update({ is_locked: false, locked_at: null, lock_reason: null })
      .eq("id", s.id);
    if (error) alert("আনলক করা যায়নি: " + error.message);
    setBusyId(null);
    load();
  };

  return (
    <div className="space-y-10">
      {/* ===== Consecutive Absent ===== */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <span className="h-px w-8 bg-amber-400" />
          <span className="text-xs tracking-[0.25em] text-amber-400">
            ATTENDANCE ALERT
          </span>
        </div>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              টানা ৩ দিন অনুপস্থিত
            </h2>
            <p className="text-sm text-slate-400">
              এই শিক্ষার্থীদের সাথে যোগাযোগ করুন অথবা প্রোফাইল লক করুন।
            </p>
          </div>
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-300">
            {absentStudents.length} জন
          </span>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : absentStudents.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-6 text-slate-400">
            🎉 কোনো শিক্ষার্থী টানা ৩ দিন অনুপস্থিত নেই।
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {absentStudents.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-white/10 bg-[#0f172a] p-5"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-lg font-bold text-blue-400">
                    {s.student_name?.[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">
                      {s.student_name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {s.class} • {s.batch} • {s.student_id}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      s.streak >= 5
                        ? "bg-red-500/15 text-red-400"
                        : "bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {s.streak} দিন
                  </span>
                </div>

                <p className="mb-1 text-xs text-slate-400">
                  WhatsApp: {s.whatsapp || "—"}
                </p>
                <p className="mb-4 text-xs text-slate-500">
                  সর্বশেষ উপস্থিতি: {s.lastPresent || "পাওয়া যায়নি"}
                </p>

                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs leading-relaxed text-red-300">
                  কোনো শিক্ষার্থী টানা ৬ (ছয়) দিন অনুপস্থিত থাকলে তার ভর্তি বাতিল
                  হতে পারে। পুনরায় ক্লাসে অংশগ্রহণের জন্য নতুন করে ভর্তি প্রক্রিয়া
                  সম্পন্ন করতে হবে।
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => sendWhatsApp(s)}
                    className="flex-1 rounded-xl bg-emerald-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
                  >
                    WhatsApp বার্তা
                  </button>
                  <button
                    onClick={() => lockProfile(s)}
                    disabled={busyId === s.id}
                    className="flex-1 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {busyId === s.id ? "..." : "প্রোফাইল লক"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== Profile Locked ===== */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <span className="h-px w-8 bg-red-400" />
          <span className="text-xs tracking-[0.25em] text-red-400">
            PROFILE LOCKED
          </span>
        </div>
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-white">লক করা প্রোফাইল</h2>
          <span className="rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 text-xs text-red-300">
            {lockedStudents.length} জন
          </span>
        </div>

        {lockedStudents.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-6 text-slate-400">
            কোনো প্রোফাইল লক করা নেই।
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {lockedStudents.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-red-500/20 bg-[#0f172a] p-5"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/15 text-lg font-bold text-red-400">
                    {s.student_name?.[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">
                      {s.student_name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {s.class} • {s.batch} • {s.student_id}
                    </p>
                  </div>
                  <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-400">
                    Locked
                  </span>
                </div>
                <p className="mb-4 text-xs text-slate-500">
                  লক করা হয়েছে:{" "}
                  {s.locked_at
                    ? new Date(s.locked_at).toLocaleDateString("bn-BD")
                    : "—"}
                </p>
                <button
                  onClick={() => unlockProfile(s)}
                  disabled={busyId === s.id}
                  className="w-full rounded-xl bg-blue-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
                >
                  {busyId === s.id ? "..." : "আনলক করুন"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}