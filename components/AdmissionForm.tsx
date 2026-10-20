"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  LoaderCircle,
  Upload,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const inputClass =
  "min-h-12 w-full rounded-xl border border-white/15 bg-[#0A1220] px-4 py-3 text-base text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15 disabled:opacity-60";

const focusClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#101A2C]";

const initialForm = {
  student_name: "",
  guardian_name: "",
  whatsapp: "",
  facebook_link: "",
  email: "",
  date_of_birth: "",
  class: "",
  batch: "",
  present_address: "",
  permanent_address: "",
  school: "",
  college: "",
  admission_fee_amount: "",
  admission_fee_paid: "",
  admission_fee_method: "",
  admission_fee_status: "pending",
  transaction_id: "",
  rules_accept: false,
};

const classOptions = [
  { value: "Class 9", label: "নবম শ্রেণি" },
  { value: "Class 10", label: "দশম শ্রেণি" },
  { value: "Class 11", label: "একাদশ শ্রেণি" },
  { value: "Class 12", label: "দ্বাদশ শ্রেণি" },
];

const rules = [
  {
    title: "১. নিয়মিত উপস্থিতির নিয়ম",
    text: "প্রত্যেক শিক্ষার্থীর নিয়মিত ক্লাসে উপস্থিত থাকা বাধ্যতামূলক। টানা ৩ (তিন) দিনের বেশি অনুপস্থিত থাকলে কর্তৃপক্ষ প্রয়োজন অনুযায়ী ব্যবস্থা গ্রহণ করতে পারবে।",
  },
  {
    title: "২. অনুপস্থিতির ক্ষেত্রে করণীয়",
    text: "কোনো অনিবার্য কারণে ক্লাসে উপস্থিত হতে না পারলে অবশ্যই পূর্বেই শিক্ষক বা কর্তৃপক্ষকে অবহিত করতে হবে।",
  },
  {
    title: "৩. পরীক্ষায় অনুপস্থিতির নিয়ম",
    text: "কোনো পরীক্ষায় অনুপস্থিত থাকলে নির্ধারিত ১০০ টাকা জরিমানা প্রদান করতে হবে। জরিমানা পরিশোধ না করা পর্যন্ত পরবর্তী ক্লাস বা পরীক্ষায় অংশগ্রহণের অনুমতি দেওয়া হবে না।",
  },
  {
    title: "৪. দীর্ঘ অনুপস্থিতির নিয়ম",
    text: "কোনো শিক্ষার্থী টানা ৬ (ছয়) দিন অনুপস্থিত থাকলে তার ভর্তি বাতিল করা হতে পারে। পুনরায় ক্লাসে অংশগ্রহণের জন্য নতুন করে ভর্তি প্রক্রিয়া সম্পন্ন করতে হবে।",
  },
  {
    title: "৫. মাসিক ফি পরিশোধের নিয়ম",
    text: "প্রতি মাসের ১৫ তারিখের মধ্যে নির্ধারিত মাসিক ফি পরিশোধ করতে হবে। কোনো বিশেষ সমস্যা থাকলে নির্ধারিত সময়ের পূর্বেই কর্তৃপক্ষকে জানাতে হবে।",
  },
  {
    title: "৬. শৃঙ্খলা ও আচরণবিধি",
    text: "The Curious Classroom-এর শিক্ষার পরিবেশ, নিয়ম-কানুন ও শৃঙ্খলা বজায় রাখা প্রত্যেক শিক্ষার্থীর দায়িত্ব। সকল শিক্ষার্থীকে প্রতিষ্ঠানের নিয়মাবলি যথাযথভাবে মেনে চলতে হবে।",
  },
];

function Field({
  id,
  label,
  children,
  required = false,
}: {
  id: string;
  label: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-200"
      >
        {label}
        {required && <span className="ml-1 text-blue-300">*</span>}
      </label>
      {children}
    </div>
  );
}

function FormSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={`section-${number}`}
      className="rounded-2xl border border-white/10 bg-[#101A2C] p-5 sm:p-7"
    >
      <div className="mb-6 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-400/15 bg-blue-400/5 text-xs text-blue-300"
        >
          {number}
        </span>

        <h2
          id={`section-${number}`}
          className="text-xl font-semibold text-white"
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export default function AdmissionForm() {
  const [form, setForm] = useState(initialForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const rulesDialogRef = useRef<HTMLDialogElement>(null);
  const submittingRef = useRef(false);

  const isHsc =
    form.class === "Class 11" || form.class === "Class 12";

  const selectedClassLabel =
    classOptions.find((item) => item.value === form.class)?.label;

  useEffect(() => {
    if (!photo) {
      setPhotoPreview("");
      return;
    }

    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [photo]);

  useEffect(() => {
    const dialog = rulesDialogRef.current;

    if (showRules) {
      if (dialog && !dialog.open) dialog.showModal();

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = previousOverflow;
        if (dialog?.open) dialog.close();
      };
    }

    if (dialog?.open) dialog.close();
  }, [showRules]);

  useEffect(() => {
    if (!showRules || countdown === 0) return;

    const timer = window.setTimeout(() => {
      setCountdown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [showRules, countdown]);

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = event.target;

    if (name === "class") {
      const year = new Date().getFullYear();
      const ssc = value === "Class 9" || value === "Class 10";
      const hsc = value === "Class 11" || value === "Class 12";
      const examYear =
        value === "Class 9" || value === "Class 11"
          ? year + 2
          : year + 1;

      setForm((previous) => ({
        ...previous,
        class: value,
        batch:
          ssc || hsc
            ? `${ssc ? "SSC" : "HSC"} ${String(examYear).slice(-2)}`
            : "",
        admission_fee_amount: ssc ? "500" : hsc ? "700" : "",
        college: ssc ? "" : previous.college,
      }));
      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "admission_fee_method" && value !== "online"
        ? { transaction_id: "" }
        : {}),
    }));
  }

  function openRules() {
    setCountdown(form.rules_accept ? 0 : 30);
    setShowRules(true);
  }

  async function uploadPhoto() {
    if (!photo) throw new Error("শিক্ষার্থীর ছবি নির্বাচন করুন।");

    const extension =
      photo.name.split(".").pop()?.trim().toLowerCase() || "jpg";

    const fileName =
      `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("student-photos")
      .upload(fileName, photo, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("student-photos")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function submitAdmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current || success) return;
    setError("");

    if (
      form.admission_fee_method === "online" &&
      !form.transaction_id.trim()
    ) {
      setError("অনলাইন পেমেন্টের Transaction ID লিখুন।");
      return;
    }

    if (!form.rules_accept) {
      setError("নিয়মাবলি পড়ে সম্মতির বাটনে চাপুন।");
      return;
    }

    if (!photo) {
      setError("শিক্ষার্থীর ছবি নির্বাচন করুন।");
      return;
    }

    const paid = Number(form.admission_fee_paid);

    if (!Number.isFinite(paid) || paid < 0) {
      setError("প্রদত্ত ভর্তি ফির সঠিক পরিমাণ লিখুন।");
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    try {
      const { data: existing, error: checkError } = await supabase
        .from("students")
        .select("id")
        .eq("whatsapp", form.whatsapp)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        setError("এই WhatsApp নম্বর দিয়ে ইতিমধ্যে আবেদন করা হয়েছে।");
        return;
      }

      const photoURL = await uploadPhoto();
      const today = new Date().toISOString().split("T")[0];

      const { error: insertError } = await supabase
        .from("students")
        .insert({
          student_name: form.student_name,
          student_photo: photoURL,
          guardian_name: form.guardian_name,
          whatsapp: form.whatsapp,
          email: form.email || null,
          facebook_link: form.facebook_link || null,
          date_of_birth: form.date_of_birth,
          class: form.class,
          batch: form.batch,
          school: form.school || null,
          college: form.college || null,
          present_address: form.present_address,
          permanent_address: form.permanent_address,
          admission_fee_amount: Number(form.admission_fee_amount),
          admission_fee_paid: paid,
          admission_fee_method: form.admission_fee_method,
          transaction_id: form.transaction_id,
          admission_fee_status: form.admission_fee_status,
          status: "pending",
          admission_date: today,
        });

      if (insertError) throw insertError;

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "auto" });
   
   
   
 } catch (err: unknown) {
  const failure = err as {
    code?: string;
    message?: string;
    status?: number;
    statusCode?: number | string;
  } | null;

  console.error("Admission submission failed", {
    code: failure?.code ?? null,
    message: failure?.message ?? "Unknown error",
    status: failure?.status ?? failure?.statusCode ?? null,
  });

  setError(
    "আবেদন জমা দেওয়া যায়নি। আপনার পূরণ করা তথ্য ফর্মে আছে—আবার চেষ্টা করুন।"
  );
}




    
    
    
    finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080D19] px-5 py-16 text-white">
        <div
          role="status"
          className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#101A2C] p-8 text-center sm:p-12"
        >
          <CheckCircle2
            aria-hidden="true"
            size={48}
            strokeWidth={1.5}
            className="mx-auto text-blue-400"
          />

          <p className="mt-6 text-sm font-medium text-blue-300">
            SHISHIR BioVerse
          </p>

          <h1 className="mt-3 text-3xl font-semibold">
            আবেদন জমা হয়েছে
          </h1>

          <p className="mt-5 leading-8 text-slate-300">
            Shishir BioVerse-এর অফলাইন জীববিজ্ঞান ব্যাচে
            আপনার ভর্তি আবেদন জমা হয়েছে। তথ্য ও পেমেন্ট
            যাচাইয়ের পর ভর্তি নিশ্চিত করা হবে।
          </p>

          <Link
            href="/"
            className={`mt-8 inline-flex items-center gap-3 rounded-xl bg-blue-600 px-6 py-3.5 font-medium hover:bg-blue-500 ${focusClass}`}
          >
            হোমপেজে ফিরুন
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#080D19] px-5 py-8 text-slate-100 sm:px-6 lg:py-12"
      style={{ colorScheme: "dark" }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-5">
          <Link
            href="/"
            aria-label="The Curious Classroom — হোম"
            className={`rounded-xl bg-white px-3 py-2 ${focusClass}`}
          >
            <Image
              src="/logo.png"
              alt="The Curious Classroom"
              width={150}
              height={70}
              className="h-auto w-32"
            />
          </Link>

          <Link
            href="/"
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-slate-300 hover:text-white ${focusClass}`}
          >
            <ArrowLeft aria-hidden="true" size={17} />
            হোমপেজ
          </Link>
        </div>

        <header className="mb-9 mt-10 lg:mt-14">
          <p className="text-lg font-medium text-blue-200">
            <span className="font-bold tracking-[0.12em]">
              SHISHIR
            </span>{" "}
            BioVerse
          </p>

          <h1 className="mt-4 text-3xl font-semibold leading-snug sm:text-4xl">
            অফলাইন ব্যাচে ভর্তি আবেদন
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
            শিশিরের সরাসরি দিকনির্দেশনায় SSC ও HSC জীববিজ্ঞান
            শেখার শুরু হোক এখান থেকেই। আবেদন করতে নিচের
            তথ্যগুলো সঠিকভাবে পূরণ করুন।
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "SSC ও HSC",
              "জীববিজ্ঞান",
              "অফলাইন ক্লাস",
            ].map((label) => (
              <span
                key={label}
                className="rounded-full border border-blue-400/15 bg-blue-400/5 px-3 py-1.5 text-xs leading-6 text-blue-200"
              >
                {label}
              </span>
            ))}
          </div>

          <p className="mt-5 text-sm text-slate-400">
            <span className="text-blue-300">*</span> চিহ্নিত তথ্য আবশ্যক।
          </p>
        </header>

        <form onSubmit={submitAdmission}>
          <fieldset
            disabled={loading}
            className="m-0 min-w-0 border-0 p-0"
          >
            <legend className="sr-only">ভর্তি আবেদনের তথ্য</legend>

            <div className="grid items-start gap-7 lg:grid-cols-[1fr_300px]">
              <div className="min-w-0 space-y-6">
                <FormSection number="01" title="শিক্ষার্থীর তথ্য">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      id="student_name"
                      label="শিক্ষার্থীর নাম"
                      required
                    >
                      <input
                        id="student_name"
                        name="student_name"
                        required
                        value={form.student_name}
                        onChange={handleChange}
                        placeholder="সম্পূর্ণ নাম লিখুন"
                        className={inputClass}
                      />
                    </Field>

                    <Field
                      id="date_of_birth"
                      label="জন্ম তারিখ"
                      required
                    >
                      

<input
  id="date_of_birth"
  name="date_of_birth"
  type="date"
  required
  value={form.date_of_birth}
  onChange={handleChange}
  onClick={(event) => {
    const input = event.currentTarget;

    try {
      if (typeof input.showPicker === "function") {
        input.showPicker();
      }
    } catch {
      // Calendar না খুললেও keyboard দিয়ে তারিখ লেখা যাবে।
      input.focus();
    }
  }}
  className={inputClass}
  style={{ colorScheme: "light" }}
/>





                    </Field>

                    <div className="sm:col-span-2">
                      <Field
                        id="student_photo"
                        label="শিক্ষার্থীর ছবি"
                        required
                      >
                        <div className="rounded-xl border border-dashed border-blue-400/30 bg-[#0A1220] p-4 sm:p-5">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                              {photoPreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={photoPreview}
                                  alt="নির্বাচিত শিক্ষার্থীর ছবির প্রিভিউ"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Upload
                                  aria-hidden="true"
                                  size={25}
                                  className="text-blue-300"
                                />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="mb-3 text-sm leading-6 text-slate-400">
                                শিক্ষার্থীর পরিষ্কার ছবি নির্বাচন করুন।
                              </p>

                              <input
                                id="student_photo"
                                type="file"
                                accept="image/*"
                                required
                                onChange={(event) =>
                                  setPhoto(event.target.files?.[0] ?? null)
                                }
                                className="block w-full min-w-0 rounded-lg text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-400/10 file:px-3 file:py-2.5 file:text-sm file:font-medium file:text-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                              />
                            </div>
                          </div>
                        </div>
                      </Field>
                    </div>
                  </div>
                </FormSection>

                <FormSection number="02" title="অভিভাবকের তথ্য">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      id="guardian_name"
                      label="অভিভাবকের নাম"
                      required
                    >
                      <input
                        id="guardian_name"
                        name="guardian_name"
                        required
                        value={form.guardian_name}
                        onChange={handleChange}
                        placeholder="সম্পূর্ণ নাম লিখুন"
                        className={inputClass}
                      />
                    </Field>

                    <Field
                      id="whatsapp"
                      label="WhatsApp নম্বর"
                      required
                    >
                      <input
                        id="whatsapp"
                        name="whatsapp"
                        type="tel"
                        inputMode="tel"
                        required
                        value={form.whatsapp}
                        onChange={handleChange}
                        placeholder="01XXXXXXXXX"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </FormSection>

                <FormSection number="03" title="শিক্ষাগত তথ্য">
                  <div className="mb-6 rounded-xl border border-blue-400/15 bg-blue-400/5 px-4 py-4">
                    <p className="text-sm font-medium text-blue-200">
                      জীববিজ্ঞান · অফলাইন ব্যাচ
                    </p>
                    <p className="mt-1 text-xs leading-6 text-slate-400">
                      শ্রেণি নির্বাচন করে আপনার ব্যাচের তথ্য দেখুন।
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="class" label="শ্রেণি" required>
                      <select
                        id="class"
                        name="class"
                        required
                        value={form.class}
                        onChange={handleChange}
                        className={inputClass}
                      >
                        <option value="">শ্রেণি নির্বাচন করুন</option>
                        {classOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field id="batch" label="নির্ধারিত ব্যাচ">
                      <input
                        id="batch"
                        readOnly
                        value={form.batch}
                        placeholder="শ্রেণি নির্বাচন করলে দেখাবে"
                        className={`${inputClass} text-blue-200`}
                      />
                    </Field>

                    <Field id="school" label="স্কুলের নাম" required>
                      <input
                        id="school"
                        name="school"
                        required
                        value={form.school}
                        onChange={handleChange}
                        placeholder="স্কুলের সম্পূর্ণ নাম"
                        className={inputClass}
                      />
                    </Field>

                    {isHsc && (
                      <Field id="college" label="কলেজের নাম" required>
                        <input
                          id="college"
                          name="college"
                          required
                          value={form.college}
                          onChange={handleChange}
                          placeholder="কলেজের সম্পূর্ণ নাম"
                          className={inputClass}
                        />
                      </Field>
                    )}
                  </div>
                </FormSection>

                <FormSection number="04" title="ভর্তি ফি">
                  <div
                    aria-live="polite"
                    className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-400/15 bg-blue-400/5 px-4 py-4"
                  >
                    <span className="text-sm text-slate-300">
                      নির্ধারিত ভর্তি ফি
                    </span>
                    <span className="font-semibold text-blue-200">
                      {form.admission_fee_amount
                        ? `৳ ${form.admission_fee_amount}`
                        : "প্রথমে শ্রেণি নির্বাচন করুন"}
                    </span>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      id="admission_fee_paid"
                      label="প্রদত্ত ভর্তি ফি (টাকা)"
                      required
                    >
                      <input
                        id="admission_fee_paid"
                        name="admission_fee_paid"
                        type="number"
                        min="0"
                        required
                        value={form.admission_fee_paid}
                        onChange={handleChange}
                        placeholder="প্রদত্ত টাকার পরিমাণ"
                        className={inputClass}
                      />
                    </Field>

                    <Field
                      id="admission_fee_method"
                      label="পেমেন্ট মাধ্যম"
                      required
                    >
                      <select
                        id="admission_fee_method"
                        name="admission_fee_method"
                        required
                        value={form.admission_fee_method}
                        onChange={handleChange}
                        className={inputClass}
                      >
                        <option value="">মাধ্যম নির্বাচন করুন</option>
                        <option value="offline">সরাসরি পরিশোধ</option>
                        <option value="online">অনলাইন পেমেন্ট</option>
                      </select>
                    </Field>

                    {form.admission_fee_method === "online" && (
                      <div className="sm:col-span-2">
                        <Field
                          id="transaction_id"
                          label="Transaction ID"
                          required
                        >
                          <input
                            id="transaction_id"
                            name="transaction_id"
                            required
                            value={form.transaction_id}
                            onChange={handleChange}
                            placeholder="পেমেন্টের Transaction ID"
                            className={inputClass}
                          />
                        </Field>
                      </div>
                    )}
                  </div>

                  <p className="mt-5 text-xs leading-6 text-slate-400">
                    পেমেন্টের তথ্য যাচাইয়ের জন্য সঠিক পরিমাণ ও
                    প্রযোজ্য ক্ষেত্রে Transaction ID লিখুন।
                  </p>
                </FormSection>

                <FormSection number="05" title="ঠিকানার তথ্য">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      id="present_address"
                      label="বর্তমান ঠিকানা"
                      required
                    >
                      <textarea
                        id="present_address"
                        name="present_address"
                        required
                        rows={4}
                        value={form.present_address}
                        onChange={handleChange}
                        placeholder="বর্তমান ঠিকানা লিখুন"
                        className={`${inputClass} resize-y`}
                      />
                    </Field>

                    <Field
                      id="permanent_address"
                      label="স্থায়ী ঠিকানা"
                      required
                    >
                      <textarea
                        id="permanent_address"
                        name="permanent_address"
                        required
                        rows={4}
                        value={form.permanent_address}
                        onChange={handleChange}
                        placeholder="স্থায়ী ঠিকানা লিখুন"
                        className={`${inputClass} resize-y`}
                      />
                    </Field>
                  </div>
                </FormSection>
              </div>

              {/* Application summary */}
              <aside className="rounded-2xl border border-white/10 bg-[#101A2C] p-6 lg:sticky lg:top-28">
                <p className="text-sm font-medium text-blue-300">
                  SHISHIR BioVerse
                </p>

                <h2 className="mt-3 text-xl font-semibold text-white">
                  আবেদনের সারসংক্ষেপ
                </h2>

                <dl className="mt-6 space-y-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">বিষয়</dt>
                    <dd>জীববিজ্ঞান</dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">ক্লাসের ধরন</dt>
                    <dd>অফলাইন</dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">শ্রেণি</dt>
                    <dd className="text-right">
                      {selectedClassLabel || "নির্বাচন করা হয়নি"}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">ব্যাচ</dt>
                    <dd>{form.batch || "—"}</dd>
                  </div>

                  <div className="flex justify-between gap-4 border-t border-white/10 pt-4">
                    <dt className="text-slate-400">ভর্তি ফি</dt>
                    <dd className="font-medium text-blue-200">
                      {form.admission_fee_amount
                        ? `৳ ${form.admission_fee_amount}`
                        : "—"}
                    </dd>
                  </div>
                </dl>

                <button
                  type="button"
                  onClick={openRules}
                  className={`mt-7 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-400/25 px-3 py-3 text-sm font-medium text-blue-200 hover:bg-blue-400/5 ${focusClass}`}
                >
                  <FileText aria-hidden="true" size={17} />
                  কোচিংয়ের নিয়মাবলি পড়ুন
                </button>

                <p
                  aria-live="polite"
                  className="mt-3 text-xs leading-6 text-slate-400"
                >
                  {form.rules_accept
                    ? "নিয়মাবলিতে আপনার সম্মতি দেওয়া হয়েছে।"
                    : "আবেদন জমা দেওয়ার আগে নিয়মাবলি পড়ে সম্মতি দিন।"}
                </p>

                {error && (
                  <div
                    role="alert"
                    className="mt-5 rounded-xl border border-red-400/25 bg-red-400/10 p-4 text-sm leading-7 text-red-200"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`mt-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60 ${focusClass}`}
                >
                  {loading ? (
                    <>
                      <LoaderCircle
                        aria-hidden="true"
                        size={18}
                        className="motion-safe:animate-spin"
                      />
                      জমা দেওয়া হচ্ছে…
                    </>
                  ) : (
                    <>
                      ভর্তি আবেদন জমা দিন
                      <ArrowRight aria-hidden="true" size={17} />
                    </>
                  )}
                </button>

                <p className="mt-4 text-xs leading-6 text-slate-400">
                  আবেদন জমা হওয়ার পর তথ্য ও পেমেন্ট যাচাই
                  করে ভর্তি নিশ্চিত করা হবে।
                </p>

                <Link
                  href="/contact"
                  className={`mt-4 inline-flex min-h-11 items-center gap-2 rounded-md text-sm text-blue-300 hover:text-blue-200 ${focusClass}`}
                >
                  সহায়তার জন্য যোগাযোগ করুন
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
              </aside>
            </div>
          </fieldset>
        </form>
      </div>

      {/* Rules dialog */}
      <dialog
        ref={rulesDialogRef}
        aria-labelledby="rules-heading"
        onCancel={() => setShowRules(false)}
        onClose={() => setShowRules(false)}
        className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-white/15 bg-[#101A2C] p-0 text-slate-100 shadow-2xl backdrop:bg-black/75"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
          <div>
            <p className="text-sm font-medium text-blue-300">
              SHISHIR BioVerse
            </p>

            <p className="mt-1 text-xs text-slate-400">
              The Curious Classroom
            </p>

            <h2
              id="rules-heading"
              className="mt-3 text-xl font-semibold"
            >
              কোচিংয়ের নিয়মাবলি
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowRules(false)}
            aria-label="নিয়মাবলি বন্ধ করুন"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 hover:bg-white/5 ${focusClass}`}
          >
            <X aria-hidden="true" size={19} />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {rules.map((rule) => (
            <div key={rule.title}>
              <h3 className="font-medium text-blue-200">
                {rule.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                {rule.text}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 p-5 sm:p-6">
          <p className="mb-4 text-center text-sm text-slate-400">
            {countdown > 0
              ? `সম্মতি দেওয়ার আগে ${countdown} সেকেন্ড অপেক্ষা করুন।`
              : "নিয়মাবলি পড়ে নিচের বাটনে সম্মতি দিন।"}
          </p>

          <button
            type="button"
            disabled={countdown > 0}
            onClick={() => {
              setForm((previous) => ({
                ...previous,
                rules_accept: true,
              }));
              setShowRules(false);
              setError("");
            }}
            className={`min-h-12 w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`}
          >
            আমি নিয়মাবলি পড়েছি ও সম্মত আছি
          </button>
        </div>
      </dialog>
    </div>
  );
}