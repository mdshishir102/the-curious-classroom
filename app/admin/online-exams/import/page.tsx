"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type PageResult = {
  page: number;
  image: string;
  text: string;
};

export default function PDFImportPage() {
  const router = useRouter();
  const running = useRef(false);

  const [authorized, setAuthorized] = useState(false);
  const [authError, setAuthError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [startPage, setStartPage] = useState(2);
  const [endPage, setEndPage] = useState(3);
  const [mode, setMode] = useState("text");
  const [columns, setColumns] = useState("2");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState<PageResult[]>([]);

  useEffect(() => {
    let active = true;

    async function checkAdmin() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
          router.replace("/admin/login");
          return;
        }

        const { data: admin, error: adminError } = await supabase
          .from("admins")
          .select("role")
          .eq("auth_user_id", data.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (!active) return;

        if (adminError || !admin) {
          setAuthError("এই পেজটি শুধু অ্যাডমিন ব্যবহার করতে পারবেন।");
          return;
        }

        setAuthorized(true);
      } catch {
        if (active) setAuthError("অ্যাকাউন্ট যাচাই হয়নি। পেজ reload করো।");
      }
    }

    void checkAdmin();

    return () => {
      active = false;
    };
  }, [router]);

  async function extractPages() {
    if (running.current || !authorized) return;

    setError("");

    if (!file) {
      setError("প্রথমে একটি PDF বেছে নাও।");
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setError("এই ধাপে সর্বোচ্চ ৩০ MB PDF ব্যবহার করো।");
      return;
    }

    if (
      !Number.isInteger(startPage) ||
      !Number.isInteger(endPage) ||
      startPage < 1 ||
      endPage < startPage ||
      endPage - startPage > 4
    ) {
      setError("সঠিক page range দাও। একবারে সর্বোচ্চ ৫টি পাতা পড়া যাবে।");
      return;
    }

    running.current = true;
    setBusy(true);
    setResults([]);
    setStatus("PDF খুলছি…");

    let loadingTask:
      | ReturnType<typeof import("pdfjs-dist")["getDocument"]>
      | undefined;

    let worker: import("tesseract.js").Worker | undefined;

    try {
      const pdfjs = await import("pdfjs-dist");

      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      loadingTask = pdfjs.getDocument({
        data: new Uint8Array(await file.arrayBuffer()),
        
      });

      const pdf = await loadingTask.promise;

      if (endPage > pdf.numPages) {
        throw new Error(`এই PDF-এ মোট ${pdf.numPages}টি পাতা আছে।`);
      }

      if (mode === "ocr") {
        setStatus("বাংলা OCR প্রস্তুত হচ্ছে। প্রথমবার কিছুটা সময় লাগবে…");

        const { createWorker } = await import("tesseract.js");

        worker = await createWorker(["ben", "eng"], 1, {
          logger: (message) => {
            if (message.status === "recognizing text") {
              setStatus(
                `লেখা শনাক্ত হচ্ছে… ${Math.round(
                  (message.progress ?? 0) * 100
                )}%`
              );
            }
          },
        });
      }

      for (let number = startPage; number <= endPage; number++) {
        setStatus(`পৃষ্ঠা ${number} পড়ছি…`);

        const page = await pdf.getPage(number);
        const base = page.getViewport({ scale: 1 });

        // Keep page rendering within a practical browser memory limit.
       
       
       
       const scale = Math.min(
  4,
  4000 / Math.max(base.width, base.height)
);
    






        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        await page.render({
          canvas,
          viewport,
          background: "rgb(255,255,255)",
        }).promise;

        const image = canvas.toDataURL("image/jpeg", 0.85);
        let extractedText = "";

        if (worker) {
          const pieces: string[] = [];
          const count = columns === "2" ? 2 : 1;

          for (let column = 0; column < count; column++) {
            setStatus(
              `পৃষ্ঠা ${number}: অংশ ${column + 1}/${count} পড়ছি…`
            );

            const left = Math.floor((canvas.width * column) / count);
            const right = Math.floor(
              (canvas.width * (column + 1)) / count
            );

            const crop = document.createElement("canvas");
            crop.width = right - left;
            crop.height = canvas.height;

            const context = crop.getContext("2d");

            if (!context) throw new Error("ছবি পড়ার canvas তৈরি হয়নি।");

            context.drawImage(
              canvas,
              left,
              0,
              crop.width,
              crop.height,
              0,
              0,
              crop.width,
              crop.height
            );

            const recognized = await worker.recognize(crop);
            pieces.push(recognized.data.text);

            crop.width = 0;
            crop.height = 0;
          }

          extractedText = pieces.join("\n\n");
        } else {
          const content = await page.getTextContent();

          const items = content.items.filter(
            (
              item
            ): item is Extract<
              (typeof content.items)[number],
              { str: string }
            > => "str" in item
          );

          const groups =
            columns === "2"
              ? [
                  items.filter((item) => item.transform[4] < base.width / 2),
                  items.filter((item) => item.transform[4] >= base.width / 2),
                ]
              : [items];

          extractedText = groups
            .map((group) => {
              const ordered = [...group].sort((a, b) => {
                const vertical = b.transform[5] - a.transform[5];

                return Math.abs(vertical) > 4
                  ? vertical
                  : a.transform[4] - b.transform[4];
              });

              let text = "";
              let previousY: number | null = null;

              for (const item of ordered) {
                const y = item.transform[5];

                if (previousY !== null) {
                  text += Math.abs(previousY - y) > 4 ? "\n" : " ";
                }

                text += item.str;
                previousY = y;
              }

              return text.trim();
            })
            .join("\n\n");
        }

        setResults((previous) => [
          ...previous,
          { page: number, image, text: extractedText.trim() },
        ]);

        canvas.width = 0;
        canvas.height = 0;
        page.cleanup();
      }

      setStatus("পড়া শেষ। মূল পাতার সঙ্গে লেখাগুলো মিলিয়ে দেখো।");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "PDF পড়া যায়নি। আবার চেষ্টা করো।"
      );
      setStatus("");
    } finally {
      await worker?.terminate().catch(() => undefined);
      await loadingTask?.destroy().catch(() => undefined);

      running.current = false;
      setBusy(false);
    }
  }

  function downloadText() {
    const text = results
      .map((result) => `--- Page ${result.page} ---\n${result.text}`)
      .join("\n\n");

    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = `${file?.name.replace(/\.pdf$/i, "") || "pdf"}-text.txt`;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const field =
    "mt-2 w-full rounded-xl border border-slate-700 !bg-slate-950 px-4 py-3 !text-white outline-none focus:border-blue-400 disabled:opacity-50";

  if (!authorized) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-slate-200">
        {authError || "অ্যাকাউন্ট যাচাই হচ্ছে…"}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/admin/online-exams"
          className="text-sm text-blue-300 hover:text-blue-200"
        >
          ← Question Bank
        </Link>

        <header className="mb-8 mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            The Curious Classroom
          </p>

          <h1 className="mt-3 text-3xl font-bold md:text-4xl">
            PDF Question Import
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            PDF বেছে নাও, প্রয়োজনীয় পাতা পড়ো এবং মূল পাতার সঙ্গে লেখা মিলিয়ে দেখো।
          </p>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8">
          <label className="block text-sm font-medium text-slate-200">
            PDF file
            <input
              type="file"
              accept=".pdf,application/pdf"
              disabled={busy}
              className={`${field} file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white`}
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setResults([]);
                setError("");
                setStatus("");
              }}
            />
          </label>

          <fieldset
            disabled={busy}
            className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            <label className="text-sm text-slate-300">
              শুরুর পাতা
              <input
                type="number"
                min={1}
                value={startPage}
                onChange={(event) => setStartPage(Number(event.target.value))}
                className={field}
              />
            </label>

            <label className="text-sm text-slate-300">
              শেষ পাতা
              <input
                type="number"
                min={1}
                value={endPage}
                onChange={(event) => setEndPage(Number(event.target.value))}
                className={field}
              />
            </label>

            <label className="text-sm text-slate-300">
              পড়ার পদ্ধতি
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value)}
                className={field}
              >
                <option value="text">সরাসরি লেখা — দ্রুত</option>
                <option value="ocr">বাংলা OCR — ছবির লেখা</option>
              </select>
            </label>

            <label className="text-sm text-slate-300">
              পাতার layout
              <select
                value={columns}
                onChange={(event) => setColumns(event.target.value)}
                className={field}
              >
                <option value="2">দুই কলাম</option>
                <option value="1">এক কলাম</option>
              </select>
            </label>
          </fieldset>

          <p className="mt-4 text-xs leading-6 text-slate-400">
            PDF viewer-এর page number ব্যবহার করো। একবারে সর্বোচ্চ ৫ পাতা।
            OCR প্রথমবার চালাতে language files download হওয়ার জন্য internet লাগবে।
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={extractPages}
              disabled={busy || !file}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "পড়া হচ্ছে…" : "PDF থেকে লেখা পড়ো"}
            </button>

            {results.length > 0 && !busy && (
              <button
                type="button"
                onClick={downloadText}
                className="rounded-xl border border-slate-600 px-5 py-3 text-slate-200 hover:bg-slate-800"
              >
                লেখা Download
              </button>
            )}
          </div>

          <p role="status" aria-live="polite" className="mt-4 text-sm text-blue-300">
            {status}
          </p>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-200"
            >
              {error}
            </p>
          )}
        </section>

        <div className="mt-8 space-y-6">
          {results.map((result) => (
            <section
              key={result.page}
              className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900"
            >
              <div className="border-b border-slate-800 px-6 py-4">
                <h2 className="font-semibold">পৃষ্ঠা {result.page}</h2>
                <p className="mt-1 text-xs text-slate-400">
                  প্রয়োজন হলে পাশের লেখায় সংশোধন করতে পারো।
                </p>
              </div>

              <div className="grid gap-6 p-5 lg:grid-cols-2">
              
              
              
             <QuestionCropper source={result.image} pageNumber={result.page} /> 





                <label className="block text-sm text-slate-300">
                  পাওয়া লেখা
                  <textarea
                    value={result.text}
                    disabled={busy}
                    placeholder="লেখা পাওয়া যায়নি। বাংলা OCR দিয়ে চেষ্টা করো।"
                    onChange={(event) => {
                      const text = event.target.value;

                      setResults((previous) =>
                        previous.map((item) =>
                          item.page === result.page ? { ...item, text } : item
                        )
                      );
                    }}
                    className={`${field} min-h-[580px] resize-y leading-8`}
                  />
                </label>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}



type CropPoint = {
  x: number;
  y: number;
};

function QuestionCropper({
  source,
  pageNumber,
}: {
  source: string;
  pageNumber: number;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const startRef = useRef<CropPoint | null>(null);
  const savingRef = useRef(false);

  // Keep the same ID on retry to avoid duplicate questions.
  const draftIdRef = useRef<string | null>(null);

  const [selection, setSelection] = useState<{
    start: CropPoint;
    end: CropPoint;
  } | null>(null);

  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [questionType, setQuestionType] = useState("mcq");
  const [level, setLevel] = useState("SSC");
  const [subject, setSubject] = useState("জীববিজ্ঞান");
  const [chapter, setChapter] = useState("");
  const [questionNo, setQuestionNo] = useState("");
  const [title, setTitle] = useState("");
  const [correctOption, setCorrectOption] = useState("");
  const [marks, setMarks] = useState("1");
  const [modelAnswer, setModelAnswer] = useState("");
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => {
    startRef.current = null;
    draftIdRef.current = null;
    setSelection(null);
    setPreview("");
    setMessage("");
    setSaveError("");
    setSaved(false);
    setReviewed(false);
  }, [source]);

  function getPoint(
    element: HTMLDivElement,
    clientX: number,
    clientY: number
  ): CropPoint {
    const bounds = element.getBoundingClientRect();

    return {
      x: Math.max(
        0,
        Math.min(1, (clientX - bounds.left) / bounds.width)
      ),
      y: Math.max(
        0,
        Math.min(1, (clientY - bounds.top) / bounds.height)
      ),
    };
  }

  function makeCrop(start: CropPoint, end: CropPoint) {
    const image = imageRef.current;

    if (!image || !image.naturalWidth) {
      setMessage("পাতার ছবি load হওয়া পর্যন্ত অপেক্ষা করো।");
      return;
    }

    const left = Math.floor(
      Math.min(start.x, end.x) * image.naturalWidth
    );
    const top = Math.floor(
      Math.min(start.y, end.y) * image.naturalHeight
    );
    const right = Math.ceil(
      Math.max(start.x, end.x) * image.naturalWidth
    );
    const bottom = Math.ceil(
      Math.max(start.y, end.y) * image.naturalHeight
    );

    const width = right - left;
    const height = bottom - top;

    if (width < 30 || height < 30) {
      setSelection(null);
      setMessage("প্রশ্নসহ একটু বড় অংশ নির্বাচন করো।");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      setMessage("ছবি তৈরি হয়নি। আবার চেষ্টা করো।");
      return;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);

    context.drawImage(
      image,
      left,
      top,
      width,
      height,
      0,
      0,
      width,
      height
    );

    setPreview(canvas.toDataURL("image/png"));

    draftIdRef.current = null;
    setSaved(false);
    setReviewed(false);
    setSaveError("");
    setQuestionNo("");
    setTitle("");
    setCorrectOption("");
    setModelAnswer("");
    setMessage("ছবিটি যাচাই করে নিচের তথ্য পূরণ করো।");

    canvas.width = 0;
    canvas.height = 0;
  }

  async function saveQuestion() {
    if (savingRef.current || saved) return;

    setSaveError("");

    if (!preview) {
      setSaveError("প্রথমে প্রশ্নের অংশ নির্বাচন করো।");
      return;
    }

    if (!subject.trim() || !chapter.trim() || !title.trim()) {
      setSaveError("বিষয়, অধ্যায় ও প্রশ্নের সংক্ষিপ্ত পরিচয় দাও।");
      return;
    }

    if (
      questionType === "mcq" &&
      !["A", "B", "C", "D"].includes(correctOption)
    ) {
      setSaveError("MCQ-এর সঠিক উত্তর বেছে নাও।");
      return;
    }

    const numericMarks = Number(marks);

    if (
      !Number.isFinite(numericMarks) ||
      numericMarks <= 0 ||
      numericMarks > 1000 ||
      Math.abs(numericMarks * 100 - Math.round(numericMarks * 100)) > 0.000001
    ) {
      setSaveError("নম্বর ০-এর বেশি ও সর্বোচ্চ ১০০০ দাও; দশমিকের পর সর্বোচ্চ দুই ঘর।");
      return;
    }

    if (!reviewed) {
      setSaveError("ছবিটি যাচাই করে নিচের checkbox-এ টিক দাও।");
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setMessage("প্রশ্নের ছবি সংরক্ষণ হচ্ছে…");

    try {
      const { data: auth, error: authError } =
        await supabase.auth.getUser();

      if (authError || !auth.user) {
        throw new Error("Session শেষ হয়েছে। আবার admin login করো।");
      }

      const { data: admin, error: adminError } = await supabase
        .from("admins")
        .select("role")
        .eq("auth_user_id", auth.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (adminError || !admin) {
        throw new Error("Admin permission যাচাই করা যায়নি।");
      }

      const blob = await (await fetch(preview)).blob();

      if (blob.size > 10 * 1024 * 1024) {
        throw new Error("প্রশ্নের ছবি ১০ MB-এর বেশি। ছোট অংশ নির্বাচন করো।");
      }

      if (!draftIdRef.current) {
        draftIdRef.current = crypto.randomUUID();
      }

      const id = draftIdRef.current;
      const imagePath = `${auth.user.id}/${id}.png`;

      const { error: uploadError } = await supabase.storage
        .from("exam-question-images")
        .upload(imagePath, blob, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`ছবি save হয়নি: ${uploadError.message}`);
      }

      setMessage("Question Bank-এ draft সংরক্ষণ হচ্ছে…");

      const isMCQ = questionType === "mcq";

      const { data, error: questionError } = await supabase
        .from("online_exam_questions")
        .upsert(
          {
            id,
            question_type: questionType,
            level,
            category: "সাধারণ অনুশীলন",
            subject: subject.trim(),
            paper: "",
            chapter: chapter.trim(),
            topic: "",
            question: title.trim(),
            question_image_path: imagePath,
            stimulus: "",

            // The actual option text remains inside the question image.
            option_a: isMCQ ? "ক — ছবিতে দেখো" : null,
            option_b: isMCQ ? "খ — ছবিতে দেখো" : null,
            option_c: isMCQ ? "গ — ছবিতে দেখো" : null,
            option_d: isMCQ ? "ঘ — ছবিতে দেখো" : null,
            correct_option: isMCQ ? correctOption : null,

            explanation: isMCQ ? modelAnswer.trim() : "",
            model_answer: isMCQ ? "" : modelAnswer.trim(),
            max_marks: numericMarks,
            difficulty: "medium",
            source_page: pageNumber,
            source_question_no: questionNo.trim() || null,

            // Always review before publishing.
            is_active: false,
          },
          { onConflict: "id" }
        )
        .select("id")
        .single();

      if (questionError || !data) {
        throw new Error(
          `Draft save নিশ্চিত হয়নি: ${
            questionError?.message || "কোনো confirmation পাওয়া যায়নি"
          }। একই প্রশ্নের Save আবার চাপতে পারো।`
        );
      }

      setSaved(true);
      setMessage("প্রশ্নটি Question Bank-এ Draft হিসেবে save হয়েছে।");
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Save হয়নি। আবার চেষ্টা করো।"
      );
      setMessage("");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  const field =
    "mt-2 w-full rounded-xl border border-slate-700 !bg-slate-950 px-3 py-3 !text-white outline-none focus:border-blue-400 disabled:opacity-60";

  return (
    <div className="min-w-0 space-y-4">
      <div className="rounded-xl border border-blue-800 bg-blue-950/40 p-4">
        <p className="text-sm font-semibold text-blue-200">
          প্রশ্নের অংশ নির্বাচন
        </p>

        <p className="mt-2 text-xs leading-6 text-slate-300">
          Mouse চেপে টেনে প্রশ্নের চারপাশে বক্স বানাও।
          প্রশ্নের প্রয়োজনীয় উদ্দীপক, ছবি ও সব অপশন রাখো।
          CQ হলে ক–খ–গ–ঘ-সহ পুরো প্রশ্ন রাখো।
        </p>
      </div>

      <div
        className="relative select-none overflow-hidden rounded-xl bg-white"
        style={{
          touchAction: "none",
          cursor: saving ? "wait" : "crosshair",
        }}
        onPointerDown={(event) => {
          if (
            savingRef.current ||
            event.button !== 0 ||
            !event.isPrimary
          ) return;

          event.preventDefault();

          const point = getPoint(
            event.currentTarget,
            event.clientX,
            event.clientY
          );

          event.currentTarget.setPointerCapture(event.pointerId);
          startRef.current = point;

          setSelection({ start: point, end: point });
          setPreview("");
          setMessage("");
        }}
        onPointerMove={(event) => {
          const start = startRef.current;
          if (!start) return;

          setSelection({
            start,
            end: getPoint(
              event.currentTarget,
              event.clientX,
              event.clientY
            ),
          });
        }}
        onPointerUp={(event) => {
          const start = startRef.current;
          if (!start) return;

          const end = getPoint(
            event.currentTarget,
            event.clientX,
            event.clientY
          );

          startRef.current = null;
          setSelection({ start, end });

          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }

          makeCrop(start, end);
        }}
        onPointerCancel={() => {
          startRef.current = null;
          setSelection(null);
          setPreview("");
        }}
        onLostPointerCapture={() => {
          startRef.current = null;
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          src={source}
          alt={`পৃষ্ঠা ${pageNumber}: প্রশ্ন নির্বাচন`}
          draggable={false}
          className="pointer-events-none block h-auto w-full"
        />

        {selection && (
          <div
            className="pointer-events-none absolute border-2 border-blue-500 bg-blue-500/15"
            style={{
              left: `${Math.min(selection.start.x, selection.end.x) * 100}%`,
              top: `${Math.min(selection.start.y, selection.end.y) * 100}%`,
              width: `${Math.abs(selection.end.x - selection.start.x) * 100}%`,
              height: `${Math.abs(selection.end.y - selection.start.y) * 100}%`,
            }}
          />
        )}
      </div>

      {preview && (
        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h3 className="mb-4 font-semibold">প্রশ্নের Preview</h3>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="নির্বাচিত প্রশ্ন"
            className="h-auto w-full rounded-xl bg-white"
          />

          <fieldset disabled={saving || saved} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-300">
                প্রশ্নের ধরন
                <select
                  value={questionType}
                  className={field}
                  onChange={(event) => {
                    const type = event.target.value;
                    setQuestionType(type);
                    setMarks(type === "cq" ? "10" : type === "short" ? "2" : "1");
                    setCorrectOption("");
                    setReviewed(false);
                  }}
                >
                  <option value="mcq">MCQ</option>
                  <option value="cq">CQ — সৃজনশীল</option>
                  <option value="short">Short — সংক্ষিপ্ত</option>
                </select>
              </label>

              <label className="text-sm text-slate-300">
                Level
                <select
                  value={level}
                  onChange={(event) => setLevel(event.target.value)}
                  className={field}
                >
                  <option value="SSC">SSC</option>
                  <option value="HSC">HSC</option>
                  <option value="Admission">Admission</option>
                </select>
              </label>

              <label className="text-sm text-slate-300">
                বিষয়
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className={field}
                  maxLength={150}
                />
              </label>

              <label className="text-sm text-slate-300">
                অধ্যায়
                <input
                  value={chapter}
                  onChange={(event) => setChapter(event.target.value)}
                  placeholder="যেমন: জীবন পাঠ"
                  className={field}
                  maxLength={150}
                />
              </label>

              <label className="text-sm text-slate-300">
                PDF-এর প্রশ্ন নম্বর
                <input
                  value={questionNo}
                  onChange={(event) => setQuestionNo(event.target.value)}
                  placeholder="যেমন: ৩"
                  className={field}
                  maxLength={30}
                />
              </label>

              <label className="text-sm text-slate-300">
                মোট নম্বর
                <input
                  type="number"
                  min="0.01"
                  max="1000"
                  step="0.01"
                  value={marks}
                  onChange={(event) => setMarks(event.target.value)}
                  className={field}
                />
              </label>
            </div>

            <label className="block text-sm text-slate-300">
              প্রশ্নের সংক্ষিপ্ত পরিচয়
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="যেমন: ভাইরাস — জীব ও জড়"
                className={field}
                maxLength={300}
              />
            </label>

            {questionType === "mcq" && (
              <label className="block text-sm text-slate-300">
                সঠিক উত্তর
                <select
                  value={correctOption}
                  onChange={(event) => {
                    setCorrectOption(event.target.value);
                    setReviewed(false);
                  }}
                  className={field}
                >
                  <option value="">উত্তর বেছে নাও</option>
                  <option value="A">ক / A</option>
                  <option value="B">খ / B</option>
                  <option value="C">গ / C</option>
                  <option value="D">ঘ / D</option>
                </select>
              </label>
            )}

            <label className="block text-sm text-slate-300">
              {questionType === "mcq"
                ? "উত্তরের ব্যাখ্যা — ঐচ্ছিক"
                : "নমুনা উত্তর — ঐচ্ছিক"}
              <textarea
                value={modelAnswer}
                onChange={(event) => setModelAnswer(event.target.value)}
                rows={4}
                className={field}
              />
            </label>

            <label className="flex items-start gap-3 rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-300">
              <input
                type="checkbox"
                checked={reviewed}
                onChange={(event) => setReviewed(event.target.checked)}
                className="mt-1 h-4 w-4 accent-blue-500"
              />
              <span>
                ছবিতে পুরো প্রশ্ন ও প্রয়োজনীয় সব অংশ আছে।
                প্রশ্নের সঙ্গে উত্তরসূচি নেই।
                MCQ হলে সঠিক উত্তরও যাচাই করেছি।
              </span>
            </label>
          </fieldset>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={saving || saved}
              onClick={saveQuestion}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {saving
                ? "Save হচ্ছে…"
                : saved
                  ? "Draft saved ✓"
                  : "Question Bank-এ Save"}
            </button>

            <a
              href={preview}
              download={`question-page-${pageNumber}.png`}
              className="rounded-xl border border-slate-600 px-5 py-3 text-sm text-slate-200"
            >
              ছবি Download
            </a>
          </div>
        </section>
      )}

      {message && (
        <p role="status" className="rounded-xl bg-blue-950/40 p-4 text-sm text-blue-200">
          {message}
        </p>
      )}

      {saveError && (
        <p role="alert" className="rounded-xl bg-red-950/40 p-4 text-sm text-red-200">
          {saveError}
        </p>
      )}
    </div>
  );
}