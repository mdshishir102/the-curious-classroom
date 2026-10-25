"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type QuestionType = "mcq" | "cq" | "short";

type CQPart = {
  part_key: string;
  question: string;
  model_answer: string;
  max_marks: number;
};

type QuestionForm = {
  question_type: QuestionType;
  level: string;
  category: string;
  subject: string;
  paper: string;
  chapter: string;
  topic: string;
  question: string;
  stimulus: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string;
  model_answer: string;
  max_marks: number;
  difficulty: string;
  is_active: boolean;
};

type QuestionRow = {
  id: string;
  question_type: QuestionType;
  level: string;
  subject: string;
  chapter: string;
  question: string;
  is_active: boolean;
};

const labels: Record<QuestionType, string> = {
  mcq: "MCQ",
  cq: "সৃজনশীল",
  short: "সংক্ষিপ্ত প্রশ্ন",
};

function freshForm(): QuestionForm {
  return {
    question_type: "mcq",
    level: "SSC",
    category: "সাধারণ অনুশীলন",
    subject: "জীববিজ্ঞান",
    paper: "",
    chapter: "",
    topic: "",
    question: "",
    stimulus: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "A",
    explanation: "",
    model_answer: "",
    max_marks: 1,
    difficulty: "medium",
    is_active: false,
  };
}

function freshParts(): CQPart[] {
  return ["ক", "খ", "গ", "ঘ"].map((key, index) => ({
    part_key: key,
    question: "",
    model_answer: "",
    max_marks: index + 1,
  }));
}

const input =
  "mt-2 w-full rounded-xl border border-white/15 bg-[#080D19] " +
  "px-4 py-3 text-white outline-none placeholder:text-slate-600 " +
  "focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20";

const card =
  "rounded-3xl border border-white/10 bg-[#101A2C] p-5 sm:p-8";

const metaFields = [
  ["category", "পরীক্ষার বিভাগ", true],
  ["subject", "বিষয়", true],
  ["paper", "পত্র — ঐচ্ছিক", false],
  ["chapter", "অধ্যায়", true],
  ["topic", "টপিক — ঐচ্ছিক", false],
] as const;

const optionFields = [
  ["option_a", "A"],
  ["option_b", "B"],
  ["option_c", "C"],
  ["option_d", "D"],
] as const;

export default function AdminOnlineExamsPage() {
  const router = useRouter();
  const lock = useRef(false);

  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState<QuestionForm>(freshForm);
  const [parts, setParts] = useState<CQPart[]>(freshParts);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [rows, setRows] = useState<QuestionRow[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function change<K extends keyof QuestionForm>(
    key: K,
    value: QuestionForm[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function changePart(
    index: number,
    patch: Partial<CQPart>
  ) {
    setParts((current) =>
      current.map((part, i) =>
        i === index ? { ...part, ...patch } : part
      )
    );
  }

  async function loadRows() {
    const { data, error: queryError } = await supabase
      .from("online_exam_questions")
      .select(
        "id,question_type,level,subject,chapter,question,is_active"
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (queryError) throw queryError;

    setRows((data ?? []) as QuestionRow[]);
  }

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const { data, error: authError } =
          await supabase.auth.getUser();

        if (!active) return;

        if (authError || !data.user) {
          router.replace("/admin/login");
          return;
        }

        const { data: admin, error: adminError } =
          await supabase
            .from("admins")
            .select("role")
            .eq("auth_user_id", data.user.id)
            .eq("role", "admin")
            .maybeSingle();

        if (!active) return;

        if (adminError) {
          throw new Error("Admin access যাচাই করা যায়নি।");
        }

        if (!admin) {
          router.replace("/admin/login");
          return;
        }

        setReady(true);
        await loadRows();
      } catch {
        if (active) {
          setError("পেজের তথ্য লোড হয়নি। Refresh করে দেখুন।");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [router]);

  function resetForm() {
    setEditingId(null);
    setForm(freshForm());
    setParts(freshParts());
    setError("");
    setMessage("");
  }

  async function editQuestion(id: string) {
    if (lock.current) return;

    lock.current = true;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const { data: question, error: questionError } =
        await supabase
          .from("online_exam_questions")
          .select("*")
          .eq("id", id)
          .single();

      if (questionError || !question) {
        throw new Error("প্রশ্ন পাওয়া যায়নি।");
      }

      let nextParts = freshParts();

      if (question.question_type === "cq") {
        const { data: savedParts, error: partsError } =
          await supabase
            .from("online_exam_cq_parts")
            .select("part_key,question,model_answer,max_marks")
            .eq("question_id", id);

        if (partsError) throw partsError;

        nextParts = nextParts.map((part) => {
          const saved = savedParts?.find(
            (item) => item.part_key === part.part_key
          );

          return saved
            ? {
                ...saved,
                max_marks: Number(saved.max_marks),
              }
            : part;
        });
      }

      const nextForm = freshForm();

      for (const key of Object.keys(nextForm)) {
        const value = question[key];

        if (value !== undefined && value !== null) {
          Object.assign(nextForm, { [key]: value });
        }
      }

      nextForm.max_marks = Number(question.max_marks);
      nextForm.is_active = question.is_active === true;

      setForm(nextForm);
      setParts(nextParts);
      setEditingId(id);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("প্রশ্নটি খোলা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!ready || lock.current) return;

    setError("");
    setMessage("");

    const required = [
      form.category,
      form.subject,
      form.chapter,
      form.question,
    ];

    if (required.some((value) => !value.trim())) {
      setError("বিভাগ, বিষয়, অধ্যায় এবং প্রশ্ন/শিরোনাম লিখুন।");
      return;
    }

    const options = optionFields.map(
      ([key]) => form[key].trim()
    );

    if (
      form.question_type === "mcq" &&
      (options.some((value) => !value) ||
        new Set(options).size !== 4)
    ) {
      setError("MCQ-এর চারটি অপশন পূরণ করুন; অপশনগুলো আলাদা রাখুন।");
      return;
    }

    const cleanParts = parts.map((part) => ({
      ...part,
      question: part.question.trim(),
      model_answer: part.model_answer.trim(),
      max_marks: Number(part.max_marks),
    }));

    if (
      form.question_type === "cq" &&
      cleanParts.some(
        (part) =>
          !part.question ||
          !Number.isFinite(part.max_marks) ||
          part.max_marks <= 0 ||
          part.max_marks > 100
      )
    ) {
      setError("CQ-এর ক–খ–গ–ঘ প্রশ্ন ও প্রতিটি অংশের নম্বর দিন।");
      return;
    }

    const totalMarks =
      form.question_type === "cq"
        ? cleanParts.reduce((sum, part) => sum + part.max_marks, 0)
        : Number(form.max_marks);

    if (
      !Number.isFinite(totalMarks) ||
      totalMarks <= 0 ||
      totalMarks > 1000
    ) {
      setError("মোট নম্বর ০-এর বেশি এবং সর্বোচ্চ ১০০০ হতে হবে।");
      return;
    }

    lock.current = true;
    setBusy(true);

    let savedId: string | null = null;

    try {
      const mcq = form.question_type === "mcq";

      // Save as draft first. Publish only after every part saves.
      const payload = {
        ...form,
        category: form.category.trim(),
        subject: form.subject.trim(),
        paper: form.paper.trim(),
        chapter: form.chapter.trim(),
        topic: form.topic.trim(),
        question: form.question.trim(),
        stimulus: form.stimulus.trim(),
        model_answer: form.model_answer.trim(),
        explanation: form.explanation.trim(),
        max_marks: totalMarks,
        option_a: mcq ? options[0] : null,
        option_b: mcq ? options[1] : null,
        option_c: mcq ? options[2] : null,
        option_d: mcq ? options[3] : null,
        correct_option: mcq ? form.correct_option : null,
        is_active: false,
      };

      const request = editingId
        ? supabase
            .from("online_exam_questions")
            .update(payload)
            .eq("id", editingId)
        : supabase
            .from("online_exam_questions")
            .insert(payload);

      const { data: saved, error: saveError } =
        await request.select("id").single();

      if (saveError || !saved) {
        throw new Error("প্রশ্ন সেভ হয়নি।");
      }

      savedId = saved.id;
      setEditingId(saved.id);

      if (form.question_type === "cq") {
        const { error: partsError } = await supabase
          .from("online_exam_cq_parts")
          .upsert(
            cleanParts.map((part) => ({
              ...part,
              question_id: saved.id,
            })),
            { onConflict: "question_id,part_key" }
          );

        if (partsError) throw partsError;
      }

      if (form.is_active) {
        const { error: publishError } = await supabase
          .from("online_exam_questions")
          .update({ is_active: true })
          .eq("id", saved.id)
          .select("id")
          .single();

        if (publishError) throw publishError;
      }

      setEditingId(null);

      setForm({
        ...freshForm(),
        question_type: form.question_type,
        level: form.level,
        category: form.category.trim(),
        subject: form.subject.trim(),
        paper: form.paper.trim(),
        chapter: form.chapter.trim(),
        topic: form.topic.trim(),
        max_marks: form.question_type === "short" ? 2 : 1,
      });

      setParts(freshParts());

      setMessage(
        form.is_active
          ? "প্রশ্ন প্রকাশিত হয়েছে।"
          : "প্রশ্ন Draft হিসেবে সংরক্ষিত হয়েছে।"
      );

      try {
        await loadRows();
      } catch {
        setError(
          "প্রশ্ন সেভ হয়েছে, তবে তালিকা refresh হয়নি। পেজটি reload করুন।"
        );
      }
    } catch {
      setError(
        savedId
          ? "মূল প্রশ্ন Draft হিসেবে আছে, কিন্তু সম্পূর্ণ কাজ শেষ হয়নি। ফর্মের তথ্য রেখে আবার সংরক্ষণ করুন।"
          : "প্রশ্ন সেভ হয়নি। Internet ও admin login পরীক্ষা করুন।"
      );

      if (savedId) {
        try {
          await loadRows();
        } catch {
          // Keep the form available for retry.
        }
      }
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080D19] text-slate-300">
        প্রশ্নব্যাংক লোড হচ্ছে…
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#080D19] px-5 text-slate-300">
        <p role="alert">{error || "Admin login প্রয়োজন।"}</p>
        <Link href="/admin/login" className="text-blue-300 underline">
          Admin Login
        </Link>
      </main>
    );
  }

  const cqTotal = parts.reduce(
    (sum, part) => sum + (Number(part.max_marks) || 0),
    0
  );

  return (
    <main className="min-h-screen bg-[#080D19] px-5 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs tracking-[0.2em] text-blue-300">
              THE CURIOUS CLASSROOM
            </p>
            <h1 className="mt-3 text-3xl font-semibold">
              প্রশ্নব্যাংক
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              MCQ, সৃজনশীল ও সংক্ষিপ্ত প্রশ্ন পরিচালনা
            </p>
          </div>

          <Link
            href="/admin/dashboard"
            className="rounded-xl border border-white/15 px-4 py-3 text-sm text-blue-200 hover:bg-white/5"
          >
            ← Dashboard
          </Link>
        </header>

        <section className={card}>
          <h2 className="mb-6 text-xl font-semibold">
            {editingId ? "প্রশ্ন সম্পাদনা" : "নতুন প্রশ্ন"}
          </h2>




{editingId && (
  <SavedQuestionImages
    key={editingId}
    questionId={editingId}
  />
)}







          <form onSubmit={save}>
            <fieldset
              disabled={busy}
              className="min-w-0 space-y-6 disabled:opacity-60"
            >
              <legend className="sr-only">প্রশ্নের তথ্য</legend>

              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {(["mcq", "cq", "short"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    disabled={Boolean(editingId)}
                    aria-pressed={form.question_type === type}
                    onClick={() => {
                      change("question_type", type);
                      change("max_marks", type === "short" ? 2 : 1);
                    }}
                    className={`rounded-2xl border px-2 py-4 text-sm font-semibold transition ${
                      form.question_type === type
                        ? "border-blue-400 bg-blue-500/15 text-blue-200"
                        : "border-white/10 bg-[#080D19] text-slate-400 hover:border-blue-400/40"
                    }`}
                  >
                    {labels[type]}
                  </button>
                ))}
              </div>

              {editingId && (
                <p className="text-xs leading-6 text-slate-400">
                  সংরক্ষিত প্রশ্নের ধরন পরিবর্তন করা যাবে না।
                  অন্য ধরনের প্রশ্নের জন্য নতুন প্রশ্ন তৈরি করুন।
                </p>
              )}

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <label className="text-sm text-slate-300">
                  শিক্ষাস্তর
                  <select
                    value={form.level}
                    onChange={(e) => change("level", e.target.value)}
                    className={input}
                  >
                    <option value="SSC">SSC</option>
                    <option value="HSC">HSC</option>
                    <option value="Admission">ভর্তি প্রস্তুতি</option>
                  </select>
                </label>

                {metaFields.map(([key, label, required]) => (
                  <label key={key} className="text-sm text-slate-300">
                    {label}
                    <input
                      required={required}
                      maxLength={160}
                      value={form[key]}
                      onChange={(e) => change(key, e.target.value)}
                      className={input}
                    />
                  </label>
                ))}
              </div>

              <label className="block text-sm text-slate-300">
                {form.question_type === "cq"
                  ? "প্রশ্নের শিরোনাম / পরিচিতি"
                  : "প্রশ্ন"}
                <textarea
                  required
                  rows={3}
                  maxLength={10000}
                  value={form.question}
                  onChange={(e) => change("question", e.target.value)}
                  className={input}
                />
              </label>

              {form.question_type === "cq" && (
                <>
                  <label className="block text-sm text-slate-300">
                    উদ্দীপক
                    <textarea
                      rows={5}
                      maxLength={20000}
                      value={form.stimulus}
                      onChange={(e) =>
                        change("stimulus", e.target.value)
                      }
                      className={input}
                      placeholder="উদ্দীপকের সম্পূর্ণ লেখা…"
                    />
                  </label>

                  <div className="space-y-5">
                    {parts.map((part, index) => (
                      <div
                        key={part.part_key}
                        className="rounded-2xl border border-violet-400/20 bg-violet-400/5 p-4 sm:p-5"
                      >
                        <div className="grid items-start gap-4 sm:grid-cols-[1fr_110px]">
                          <label className="text-sm text-slate-300">
                            {part.part_key}) প্রশ্ন
                            <textarea
                              required
                              rows={2}
                              maxLength={10000}
                              value={part.question}
                              onChange={(e) =>
                                changePart(index, {
                                  question: e.target.value,
                                })
                              }
                              className={input}
                            />
                          </label>

                          <label className="text-sm text-slate-300">
                            নম্বর
                            <input
                              required
                              type="number"
                              min="0.5"
                              max="100"
                              step="0.5"
                              value={part.max_marks}
                              onChange={(e) =>
                                changePart(index, {
                                  max_marks: Number(e.target.value),
                                })
                              }
                              className={input}
                            />
                          </label>
                        </div>

                        <label className="mt-4 block text-sm text-slate-300">
                          নমুনা উত্তর — ঐচ্ছিক
                          <textarea
                            rows={3}
                            maxLength={20000}
                            value={part.model_answer}
                            onChange={(e) =>
                              changePart(index, {
                                model_answer: e.target.value,
                              })
                            }
                            className={input}
                          />
                        </label>
                      </div>
                    ))}
                  </div>

                  <p className="text-sm font-medium text-violet-200">
                    মোট নম্বর: {cqTotal}
                  </p>
                </>
              )}

              {form.question_type === "mcq" && (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {optionFields.map(([key, label]) => (
                      <label key={key} className="text-sm text-slate-300">
                        অপশন {label}
                        <textarea
                          required
                          rows={2}
                          maxLength={2000}
                          value={form[key]}
                          onChange={(e) => change(key, e.target.value)}
                          className={input}
                        />
                      </label>
                    ))}
                  </div>

                  <label className="block text-sm text-slate-300">
                    সঠিক উত্তর
                    <select
                      value={form.correct_option}
                      onChange={(e) =>
                        change("correct_option", e.target.value)
                      }
                      className={input}
                    >
                      {["A", "B", "C", "D"].map((value) => (
                        <option key={value} value={value}>
                          অপশন {value}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm text-slate-300">
                    ব্যাখ্যা — ঐচ্ছিক
                    <textarea
                      rows={3}
                      maxLength={10000}
                      value={form.explanation}
                      onChange={(e) =>
                        change("explanation", e.target.value)
                      }
                      className={input}
                    />
                  </label>
                </>
              )}

              {form.question_type === "short" && (
                <label className="block text-sm text-slate-300">
                  নমুনা উত্তর — ঐচ্ছিক
                  <textarea
                    rows={5}
                    maxLength={20000}
                    value={form.model_answer}
                    onChange={(e) =>
                      change("model_answer", e.target.value)
                    }
                    className={input}
                  />
                </label>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                {form.question_type !== "cq" && (
                  <label className="text-sm text-slate-300">
                    পূর্ণমান
                    <input
                      required
                      type="number"
                      min="0.5"
                      max="1000"
                      step="0.5"
                      value={form.max_marks}
                      onChange={(e) =>
                        change("max_marks", Number(e.target.value))
                      }
                      className={input}
                    />
                  </label>
                )}

                <label className="text-sm text-slate-300">
                  প্রশ্নের কঠিনতা
                  <select
                    value={form.difficulty}
                    onChange={(e) =>
                      change("difficulty", e.target.value)
                    }
                    className={input}
                  >
                    <option value="easy">সহজ</option>
                    <option value="medium">মাঝারি</option>
                    <option value="hard">কঠিন</option>
                  </select>
                </label>
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    change("is_active", e.target.checked)
                  }
                  className="mt-1 h-5 w-5 accent-emerald-500"
                />
                <span>
                  <span className="block font-medium text-emerald-200">
                    প্রশ্ন প্রকাশ করো
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-slate-400">
                    যাচাই শেষে প্রকাশ করুন। টিক না দিলে Draft থাকবে।
                  </span>
                </span>
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
                >
                  {busy
                    ? "সংরক্ষণ হচ্ছে…"
                    : editingId
                      ? "পরিবর্তন সংরক্ষণ"
                      : "প্রশ্ন সংরক্ষণ"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-white/15 px-5 py-3 hover:bg-white/5"
                >
                  ফর্ম খালি করো
                </button>
              </div>
            </fieldset>

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-xl bg-red-400/10 p-4 text-sm leading-7 text-red-200"
              >
                {error}
              </p>
            )}

            {message && (
              <p
                role="status"
                className="mt-5 rounded-xl bg-emerald-400/10 p-4 text-sm leading-7 text-emerald-200"
              >
                {message}
              </p>
            )}
          </form>
        </section>

        <section className={`${card} mt-7`}>
          <h2 className="text-xl font-semibold">সাম্প্রতিক প্রশ্ন</h2>
          <p className="mt-2 text-sm text-slate-400">
            সর্বশেষ তৈরি করা সর্বোচ্চ ৫০টি প্রশ্ন।
          </p>

          <div className="mt-6 space-y-4">
            {rows.length === 0 && (
              <p className="rounded-xl border border-dashed border-white/15 p-8 text-center text-slate-400">
                এখনো কোনো প্রশ্ন নেই।
              </p>
            )}

            {rows.map((row) => (
              <article
                key={row.id}
                className="rounded-2xl border border-white/10 bg-[#080D19] p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs leading-6 text-blue-300">
                    {labels[row.question_type]} · {row.level} ·{" "}
                    {row.subject} · {row.chapter}
                  </p>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      row.is_active
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-amber-400/10 text-amber-300"
                    }`}
                  >
                    {row.is_active ? "প্রকাশিত" : "Draft"}
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-wrap break-words leading-8">
                  {row.question}
                </p>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void editQuestion(row.id)}
                  className="mt-4 rounded-lg border border-blue-400/20 px-4 py-2 text-sm text-blue-200 hover:bg-blue-400/10 disabled:opacity-50"
                >
                  Edit
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function SavedQuestionImages({
  questionId,
}: {
  questionId: string;
}) {
  const [images, setImages] = useState<
    { label: string; url: string }[]
  >([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [imageError, setImageError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    const objectUrls: string[] = [];

    async function loadImages() {
      setLoadingImages(true);
      setImages([]);
      setImageError("");

      try {
        const { data, error } = await supabase
          .from("online_exam_questions")
          .select("question_image_path,stimulus_image_path")
          .eq("id", questionId)
          .single();

        if (error || !data) {
          throw new Error("প্রশ্নের ছবির তথ্য পাওয়া যায়নি।");
        }

        const sources = [
          {
            label: "প্রশ্নের ছবি",
            path: data.question_image_path,
          },
          {
            label: "উদ্দীপকের ছবি",
            path: data.stimulus_image_path,
          },
        ];

        const loaded: { label: string; url: string }[] = [];

        for (const source of sources) {
          if (!source.path || !active) continue;

          const { data: blob, error: downloadError } =
            await supabase.storage
              .from("exam-question-images")
              .download(source.path);

          if (!active) return;

          if (downloadError || !blob) {
            throw new Error(
              `${source.label} লোড হয়নি। আবার চেষ্টা করুন।`
            );
          }

          const url = URL.createObjectURL(blob);
          objectUrls.push(url);
          loaded.push({ label: source.label, url });
        }

        if (active) setImages(loaded);
      } catch (cause) {
        if (active) {
          setImageError(
            cause instanceof Error
              ? cause.message
              : "ছবি লোড হয়নি।"
          );
        }
      } finally {
        if (active) setLoadingImages(false);
      }
    }

    void loadImages();

    return () => {
      active = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [questionId, retry]);

  if (loadingImages) {
    return (
      <p role="status" className="mb-6 text-sm text-blue-200">
        প্রশ্নের ছবি লোড হচ্ছে…
      </p>
    );
  }

  if (imageError) {
    return (
      <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-5">
        <p role="alert" className="text-sm text-red-200">
          {imageError}
        </p>

        <button
          type="button"
          onClick={() => setRetry((value) => value + 1)}
          className="mt-3 rounded-lg border border-red-300/30 px-4 py-2 text-sm text-red-100"
        >
          আবার লোড করো
        </button>
      </div>
    );
  }

  if (images.length === 0) return null;

  return (
    <section className="mb-7 space-y-5 rounded-2xl border border-blue-400/20 bg-blue-400/5 p-4 sm:p-6">
      <div>
        <h3 className="font-semibold text-blue-200">
          সংরক্ষিত প্রশ্নের Preview
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          প্রকাশের আগে ছবির প্রশ্ন, সব অপশন ও সঠিক উত্তর মিলিয়ে নিন।
        </p>
      </div>

      {images.map((image) => (
        <figure key={image.label}>
          <figcaption className="mb-3 text-sm text-slate-300">
            {image.label}
          </figcaption>

          <div className="overflow-hidden rounded-xl bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.label}
              className="mx-auto block h-auto max-h-[900px] max-w-full object-contain"
              onError={() =>
                setImageError("ছবিটি দেখানো যায়নি। আবার লোড করুন।")
              }
            />
          </div>

          <a
            href={image.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-blue-300 underline"
          >
            বড় করে দেখো ↗
          </a>
        </figure>
      ))}
    </section>
  );
}