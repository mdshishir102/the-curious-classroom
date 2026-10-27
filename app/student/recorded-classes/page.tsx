"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Lock, LoaderCircle, Play, SkipBack, SkipForward } from "lucide-react";
import { supabase } from "@/lib/supabase";
import LecturePlayer from "@/components/LecturePlayer";

type Lecture = {
  id: string;
  paper: "1st" | "2nd" | null;
  chapter_name: string;
  chapter_order: number;
  lecture_number: number;
  title: string;
  is_locked: boolean;
};

type Chapter = { name: string; order: number; items: Lecture[] };
type Playing = { id: string; title: string; youtubeId: string };

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

// লগইন করা স্টুডেন্টের টোকেন সহ API কল
async function studentFetch(url: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new ApiError("আবার লগইন করো।", 401);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.error || "কিছু একটা সমস্যা হয়েছে।", res.status);
  return data;
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function StudentRecordedClasses() {
  const router = useRouter();

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [classLevel, setClassLevel] = useState<number | null>(null);
  const [paper, setPaper] = useState<"1st" | "2nd">("1st");
  const [chapterName, setChapterName] = useState<string | null>(null);
  const [playing, setPlaying] = useState<Playing | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const hasPapers = classLevel === 11 || classLevel === 12;

  useEffect(() => {
    studentFetch("/api/student/recorded-lectures")
      .then((d) => {
        setLectures(d.lectures);
        setClassLevel(d.classLevel);
      })
      .catch((e: ApiError) => {
        if (e.status === 401) router.replace("/student/login");
        else setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const chapters: Chapter[] = useMemo(() => {
    const list = hasPapers ? lectures.filter((l) => l.paper === paper) : lectures;
    const map = new Map<string, Chapter>();
    list.forEach((l) => {
      if (!map.has(l.chapter_name)) map.set(l.chapter_name, { name: l.chapter_name, order: l.chapter_order, items: [] });
      map.get(l.chapter_name)!.items.push(l);
    });
    return [...map.values()]
      .map((c) => ({ ...c, items: c.items.sort((a, b) => a.lecture_number - b.lecture_number) }))
      .sort((a, b) => a.order - b.order);
  }, [lectures, paper, hasPapers]);

  const chapter = chapters.find((c) => c.name === chapterName) ?? null;
  const playIndex = chapter && playing ? chapter.items.findIndex((l) => l.id === playing.id) : -1;

  async function play(l: Lecture) {
    if (l.is_locked || loadingId) return;
    setLoadingId(l.id);
    setError("");
    try {
      const d = await studentFetch(`/api/student/recorded-lectures/${l.id}`);
      setPlaying({ id: l.id, title: `Lecture-${pad(l.lecture_number)} · ${l.title}`, youtubeId: d.youtubeId });
    } catch (e: any) {
      if (e.status === 401) router.replace("/student/login");
      else setError(e.message);
    } finally {
      setLoadingId(null);
    }
  }

  function openChapter(c: Chapter) {
    setChapterName(c.name);
    setPlaying(null);
    const first = c.items.find((l) => !l.is_locked);
    if (first) play(first);
  }

  function step(dir: 1 | -1) {
    if (!chapter) return;
    let i = playIndex + dir;
    while (i >= 0 && i < chapter.items.length) {
      if (!chapter.items[i].is_locked) return play(chapter.items[i]);
      i += dir;
    }
  }

  const hasPrev = !!chapter && chapter.items.slice(0, Math.max(playIndex, 0)).some((l) => !l.is_locked);
  const hasNext = !!chapter && playIndex >= 0 && chapter.items.slice(playIndex + 1).some((l) => !l.is_locked);

  return (
    <div
      className="min-h-dvh text-slate-100"
      style={{
        backgroundColor: "#080D19",
        backgroundImage:
          "radial-gradient(55rem 28rem at 90% -10%, rgba(56,189,248,.13), transparent 60%), radial-gradient(40rem 25rem at -10% 25%, rgba(99,102,241,.12), transparent 60%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <Link
          href={chapter ? "#" : "/student/dashboard"}
          onClick={(e) => {
            if (chapter) {
              e.preventDefault();
              setChapterName(null);
              setPlaying(null);
            }
          }}
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-sky-300"
        >
          <ArrowLeft size={16} />
          {chapter ? "সব Chapter" : "Dashboard"}
        </Link>

        <header className="mt-6">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-400">
            <span className="h-px w-8 bg-sky-400/70" />
            {classLevel ? `Class ${classLevel} · Biology` : "Biology"}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            {chapter ? chapter.name : "Recorded Classes"}
          </h1>
          {!chapter && (
            <p className="mt-3 max-w-lg text-sm leading-7 text-slate-400">
              মিস হয়ে যাওয়া ক্লাস বা আবার দেখতে চাও? Chapter বেছে নিয়ে lecture গুলো যতবার ইচ্ছা দেখো।
            </p>
          )}
        </header>

        {error && (
          <p role="alert" className="mt-6 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}

        {loading && (
          <div className="mt-16 flex items-center justify-center gap-3 text-sm text-slate-400">
            <LoaderCircle size={20} className="animate-spin text-sky-400" />
            লোড হচ্ছে…
          </div>
        )}

        {/* ========== CHAPTER LIST ========== */}
        {!loading && !chapter && (
          <>
            {hasPapers && (
              <div className="mt-8 inline-flex rounded-xl border border-white/10 bg-white/[0.04] p-1" role="group" aria-label="Paper">
                {(["1st", "2nd"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPaper(p)}
                    aria-pressed={paper === p}
                    className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
                      paper === p ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Biology {p} Paper
                  </button>
                ))}
              </div>
            )}

            {chapters.length === 0 && !error && (
              <p className="mt-10 rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-500">
                এখনো কোনো recorded class যোগ করা হয়নি।
              </p>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {chapters.map((c) => {
                const open = c.items.filter((l) => !l.is_locked).length;
                const pct = Math.round((open / c.items.length) * 100);
                return (
                  <button
                    key={c.name}
                    onClick={() => openChapter(c)}
                    disabled={open === 0}
                    className="group relative flex min-h-[200px] flex-col overflow-hidden rounded-3xl border border-white/[0.09] bg-[#101A2C] p-6 text-left transition duration-300 enabled:hover:-translate-y-1 enabled:hover:border-sky-400/30 enabled:hover:bg-[#14213A] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span aria-hidden className="absolute -right-2 -top-3 font-mono text-8xl font-semibold leading-none text-white/[0.05]">
                      {pad(c.order)}
                    </span>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky-400">Chapter {pad(c.order)}</p>
                    <h3 className="mt-3 text-lg font-semibold leading-snug text-white">{c.name}</h3>

                    <div className="mt-auto pt-6">
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          {c.items.length}টি lecture · {open}টি খোলা
                        </span>
                        {open === 0 ? (
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Lock size={13} /> শীঘ্রই আসছে
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 font-semibold text-sky-300">
                            দেখো <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ========== PLAYER + PLAYLIST ========== */}
        {!loading && chapter && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              {playing ? (
                <>
                  <LecturePlayer key={playing.id} youtubeId={playing.youtubeId} title={playing.title} />
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-medium text-slate-200">{playing.title}</p>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => step(-1)}
                        disabled={!hasPrev || !!loadingId}
                        aria-label="আগের lecture"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/10 disabled:opacity-30"
                      >
                        <SkipBack size={18} />
                      </button>
                      <button
                        onClick={() => step(1)}
                        disabled={!hasNext || !!loadingId}
                        aria-label="পরের lecture"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/10 disabled:opacity-30"
                      >
                        <SkipForward size={18} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid aspect-video place-items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-slate-500">
                  {loadingId ? (
                    <LoaderCircle size={26} className="animate-spin text-sky-400" />
                  ) : (
                    "ডান পাশ থেকে একটা lecture বেছে নাও"
                  )}
                </div>
              )}
            </div>

            <aside aria-label="Lecture তালিকা" className="self-start overflow-hidden rounded-3xl border border-white/[0.09] bg-[#101A2C]">
              <div className="border-b border-white/[0.08] px-5 py-4">
                <p className="text-sm font-semibold text-white">Lecture তালিকা</p>
                <p className="mt-1 text-xs text-slate-500">
                  {chapter.items.length}টি lecture · {chapter.items.filter((l) => !l.is_locked).length}টি খোলা
                </p>
              </div>
              <ol className="max-h-[480px] overflow-y-auto p-2">
                {chapter.items.map((l) => {
                  const active = playing?.id === l.id;
                  return (
                    <li key={l.id}>
                      <button
                        onClick={() => play(l)}
                        disabled={l.is_locked}
                        aria-current={active ? "true" : undefined}
                        className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                          active
                            ? "bg-sky-500/15 ring-1 ring-sky-400/30"
                            : l.is_locked
                              ? "cursor-not-allowed opacity-50"
                              : "hover:bg-white/[0.05]"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs ${
                            active ? "bg-sky-500 text-white" : "bg-white/[0.06] text-slate-300"
                          }`}
                        >
                          {pad(l.lecture_number)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-slate-100">{l.title}</span>
                          <span className="block text-[11px] text-slate-500">
                            {l.is_locked ? "Locked" : active ? "এখন চলছে" : "দেখার জন্য প্রস্তুত"}
                          </span>
                        </span>
                        {loadingId === l.id ? (
                          <LoaderCircle size={16} className="animate-spin text-sky-400" />
                        ) : l.is_locked ? (
                          <Lock size={15} className="text-slate-500" />
                        ) : (
                          <Play size={15} className={active ? "text-sky-300" : "text-slate-500"} />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}