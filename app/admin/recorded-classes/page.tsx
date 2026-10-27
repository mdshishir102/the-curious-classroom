"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Lecture = {
  id: string;
  class_level: number;
  paper: string | null;
  chapter_name: string;
  chapter_order: number;
  lecture_number: number;
  title: string;
  youtube_id: string;
  is_locked: boolean;
};

// লগইন করা অ্যাডমিনের টোকেন সহ API কল
async function adminFetch(method: string, body?: unknown) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("আবার Admin Login করুন।");
  const res = await fetch("/api/admin/recorded-lectures", {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: "no-store",
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

const blank = {
  classLevel: 9,
  paper: "1st",
  chapterName: "",
  chapterOrder: "1",
  lectureNumber: "1",
  title: "",
  youtubeUrl: "",
};

const FILTERS: [string, string][] = [
  ["all", "সব"],
  ["9", "Class 9"],
  ["10", "Class 10"],
  ["11-1st", "11 · 1st"],
  ["11-2nd", "11 · 2nd"],
  ["12-1st", "12 · 1st"],
  ["12-2nd", "12 · 2nd"],
];

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-sky-400/60 focus:bg-white/[0.07] focus:ring-4 focus:ring-sky-400/10";

const keyOf = (l: Lecture) => `${l.class_level}${l.paper ? "-" + l.paper : ""}`;

function LockIcon({ locked }: { locked: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="11" width="16" height="10" rx="2.5" />
      {locked ? <path d="M8 11V8a4 4 0 0 1 8 0v3" /> : <path d="M8 11V8a4 4 0 0 1 7.5-2" />}
    </svg>
  );
}

export default function AdminRecordedClasses() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [form, setForm] = useState(blank);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");

  const needsPaper = form.classLevel >= 11;
  const paperValue = needsPaper ? form.paper : null;

  async function load() {
    try {
      const d = await adminFetch("GET");
      if (d?.lectures) setLectures(d.lectures);
    } catch (e: any) {
      setMsg({ ok: false, text: e.message });
    }
  }
  useEffect(() => {
    load();
  }, []);

  // এই class/paper-এর আগের chapter নামগুলো (suggestion)
  const chapterNames = useMemo(
    () =>
      [
        ...new Set(
          lectures
            .filter((l) => l.class_level === form.classLevel && (l.paper ?? null) === paperValue)
            .map((l) => l.chapter_name)
        ),
      ],
    [lectures, form.classLevel, paperValue]
  );

  // পুরোনো chapter-এর নাম লিখলে serial আর পরের lecture number নিজেই বসে যাবে
  function onChapter(v: string) {
    const hit = lectures.filter(
      (l) => l.class_level === form.classLevel && (l.paper ?? null) === paperValue && l.chapter_name === v
    );
    if (hit.length) {
      setForm({
        ...form,
        chapterName: v,
        chapterOrder: String(hit[0].chapter_order),
        lectureNumber: String(Math.max(...hit.map((h) => h.lecture_number)) + 1),
      });
    } else setForm({ ...form, chapterName: v });
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await adminFetch("POST", { ...form, paper: paperValue });
      setMsg({ ok: true, text: "যোগ হয়েছে। Lecture এখন locked অবস্থায় আছে।" });
      setForm({ ...form, lectureNumber: String(Number(form.lectureNumber) + 1), title: "", youtubeUrl: "" });
      load();
    } catch (err: any) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function setLock(ids: string[], isLocked: boolean) {
    // সাথে সাথে UI বদলাও, তারপর server-এ পাঠাও
    setLectures((prev) => prev.map((l) => (ids.includes(l.id) ? { ...l, is_locked: isLocked } : l)));
    try {
      await adminFetch("PATCH", { ids, isLocked });
    } catch (e: any) {
      alert(e.message);
      load();
    }
  }

  async function remove(id: string) {
    if (!confirm("এই lecture ডিলিট করবে?")) return;
    try {
      await adminFetch("DELETE", { id });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  }

  const total = lectures.length;
  const open = lectures.filter((l) => !l.is_locked).length;

  const groups = useMemo(() => {
    const map = new Map<string, { label: string; chapters: Map<string, { order: number; items: Lecture[] }> }>();
    lectures
      .filter((l) => filter === "all" || keyOf(l) === filter)
      .forEach((l) => {
        const k = keyOf(l);
        if (!map.has(k)) map.set(k, { label: `Class ${l.class_level}${l.paper ? ` · Biology ${l.paper} Paper` : " · Biology"}`, chapters: new Map() });
        const ch = map.get(k)!.chapters;
        if (!ch.has(l.chapter_name)) ch.set(l.chapter_name, { order: l.chapter_order, items: [] });
        ch.get(l.chapter_name)!.items.push(l);
      });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));
  }, [lectures, filter]);

  return (
    <div
      className="min-h-screen text-slate-100"
      style={{
        backgroundColor: "#070b17",
        backgroundImage:
          "radial-gradient(60rem 30rem at 85% -10%, rgba(56,189,248,.14), transparent 60%), radial-gradient(40rem 25rem at -10% 20%, rgba(99,102,241,.12), transparent 60%), linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)",
        backgroundSize: "auto, auto, 44px 44px, 44px 44px",
      }}
    >
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        {/* Header */}
        <Link href="/admin/dashboard" className="text-sm text-slate-400 transition hover:text-sky-300">
          ← Dashboard
        </Link>
        <header className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-400">
              <span className="h-px w-8 bg-sky-400/70" /> Academic · Archive
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Recorded Classes</h1>
            <p className="mt-2 max-w-md text-sm text-slate-400">
              ভিডিও যোগ করো, তারপর যখন ইচ্ছা unlock করো। Unlock না করা পর্যন্ত স্টুডেন্টরা কিছুই দেখবে না।
            </p>
          </div>

          <dl className="flex divide-x divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
            {[
              ["Total", total, "text-white"],
              ["Unlocked", open, "text-emerald-300"],
              ["Locked", total - open, "text-slate-400"],
            ].map(([label, n, color]) => (
              <div key={label as string} className="px-5 py-3 text-center">
                <dd className={`font-mono text-2xl font-semibold tabular-nums ${color}`}>{n}</dd>
                <dt className="mt-0.5 text-[10px] uppercase tracking-widest text-slate-500">{label}</dt>
              </div>
            ))}
          </dl>
        </header>

        {/* Composer */}
        <form onSubmit={add} className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">নতুন lecture</h2>
            <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-slate-400">শুরুতে locked</span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div>
              <p className="mb-2 text-xs text-slate-400">Class</p>
              <div className="inline-flex rounded-xl border border-white/10 bg-black/30 p-1" role="group">
                {[9, 10, 11, 12].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, classLevel: c })}
                    aria-pressed={form.classLevel === c}
                    className={`rounded-lg px-4 py-1.5 font-mono text-sm tabular-nums transition ${
                      form.classLevel === c ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {needsPaper && (
              <div>
                <p className="mb-2 text-xs text-slate-400">Biology Paper</p>
                <div className="inline-flex rounded-xl border border-white/10 bg-black/30 p-1" role="group">
                  {["1st", "2nd"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm({ ...form, paper: p })}
                      aria-pressed={form.paper === p}
                      className={`rounded-lg px-4 py-1.5 text-sm transition ${
                        form.paper === p ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {p} Paper
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-6">
            <label className="space-y-2 sm:col-span-4">
              <span className="text-xs text-slate-400">Chapter name</span>
              <input
                className={field}
                list="chapter-suggestions"
                required
                value={form.chapterName}
                onChange={(e) => onChapter(e.target.value)}
                placeholder="যেমন: কোষ ও এর গঠন"
              />
              <datalist id="chapter-suggestions">
                {chapterNames.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </label>
            <label className="space-y-2 sm:col-span-1">
              <span className="text-xs text-slate-400">Chapter #</span>
              <input className={`${field} font-mono`} type="number" min={1} required value={form.chapterOrder} onChange={(e) => setForm({ ...form, chapterOrder: e.target.value })} />
            </label>
            <label className="space-y-2 sm:col-span-1">
              <span className="text-xs text-slate-400">Lecture #</span>
              <input className={`${field} font-mono`} type="number" min={1} required value={form.lectureNumber} onChange={(e) => setForm({ ...form, lectureNumber: e.target.value })} />
            </label>
            <label className="space-y-2 sm:col-span-3">
              <span className="text-xs text-slate-400">Lecture title</span>
              <input className={field} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="যেমন: কোষ প্রাচীরের গঠন" />
            </label>
            <label className="space-y-2 sm:col-span-3">
              <span className="text-xs text-slate-400">YouTube link (Unlisted)</span>
              <input className={field} required value={form.youtubeUrl} onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })} placeholder="https://youtu.be/…" />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:brightness-110 disabled:opacity-60"
            >
              {saving ? "যোগ হচ্ছে…" : "Lecture যোগ করো"}
            </button>
            {msg && <p className={`text-sm ${msg.ok ? "text-emerald-300" : "text-rose-300"}`}>{msg.text}</p>}
          </div>
        </form>

        {/* Library */}
        <section className="mt-14">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(([v, label]) => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                aria-pressed={filter === v}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  filter === v ? "border-sky-400/60 bg-sky-400/15 text-sky-200" : "border-white/10 text-slate-400 hover:border-white/25 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {groups.length === 0 && (
            <p className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-500">এখানে এখনো কোনো lecture নেই।</p>
          )}

          {groups.map(([k, g]) => (
            <div key={k} className="mt-10">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{g.label}</h2>

              <div className="mt-4 space-y-5">
                {[...g.chapters.entries()]
                  .sort(([, a], [, b]) => a.order - b.order)
                  .map(([name, ch]) => {
                    const unlocked = ch.items.filter((i) => !i.is_locked).length;
                    const allOpen = unlocked === ch.items.length;
                    const pct = Math.round((unlocked / ch.items.length) * 100);
                    return (
                      <article key={name} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
                        <div className="flex flex-wrap items-center gap-4 border-b border-white/10 p-5">
                          <span className="font-mono text-4xl font-semibold leading-none text-white/15">{String(ch.order).padStart(2, "0")}</span>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-lg font-medium">{name}</h3>
                            <div className="mt-2 flex items-center gap-3">
                              <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
                                <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs tabular-nums text-slate-400">
                                {unlocked}/{ch.items.length} unlocked
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setLock(ch.items.map((i) => i.id), allOpen)}
                            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                          >
                            {allOpen ? "সব Lock করো" : "সব Unlock করো"}
                          </button>
                        </div>

                        <ul>
                          {ch.items
                            .sort((a, b) => a.lecture_number - b.lecture_number)
                            .map((l) => (
                              <li key={l.id} className="flex items-center gap-4 border-b border-white/5 p-4 last:border-0">
                                <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-black">
                                  <img
                                    src={`https://i.ytimg.com/vi/${l.youtube_id}/mqdefault.jpg`}
                                    alt=""
                                    className={`h-full w-full object-cover transition ${l.is_locked ? "opacity-40 grayscale" : ""}`}
                                  />
                                  <span className={`absolute inset-0 grid place-items-center ${l.is_locked ? "text-white" : "text-transparent"}`}>
                                    <LockIcon locked />
                                  </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="font-mono text-xs tabular-nums text-sky-300">Lecture-{String(l.lecture_number).padStart(2, "0")}</p>
                                  <p className="truncate text-sm text-slate-200">{l.title}</p>
                                </div>

                                <button
                                  role="switch"
                                  aria-checked={!l.is_locked}
                                  aria-label={`Lecture ${l.lecture_number} ${l.is_locked ? "unlock করো" : "lock করো"}`}
                                  onClick={() => setLock([l.id], !l.is_locked)}
                                  className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                                    l.is_locked
                                      ? "border-white/10 bg-white/5 text-slate-400 hover:border-white/25"
                                      : "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                                  }`}
                                >
                                  <LockIcon locked={l.is_locked} />
                                  {l.is_locked ? "Locked" : "Unlocked"}
                                </button>

                                <button onClick={() => remove(l.id)} className="text-xs text-slate-500 transition hover:text-rose-400">
                                  Delete
                                </button>
                              </li>
                            ))}
                        </ul>
                      </article>
                    );
                  })}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}