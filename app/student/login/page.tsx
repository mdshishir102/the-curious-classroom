"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  UserRound,
  LockKeyhole,
  LoaderCircle,
  MessageCircle,
  CircleAlert,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const supportUrl = `https://wa.me/8801346071073?text=${encodeURIComponent(
  "আসসালামু আলাইকুম। Student Login করতে সাহায্য প্রয়োজন।"
)}`;

export default function StudentLogin() {
  const router = useRouter();
  const submittingRef = useRef(false);

  const [studentID, setStudentID] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const focusStyle =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#101A2C]";

  const inputStyle =
    "min-h-14 w-full rounded-xl border border-white/15 bg-[#080F1D] py-3.5 pl-12 pr-4 text-base text-white outline-none transition-colors placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15 disabled:opacity-60";

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current) return;

    setError("");

    if (!studentID.trim() || !password) {
      setError("Student ID ও Password লিখুন।");
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    let navigating = false;

    try {
      // Existing login lookup retained.
      // Password verification must be implemented on the server.
      const { data: studentData, error: loginError } = await supabase
        .from("students")
        .select("*")
        .eq("student_id", studentID.trim())
        .single();

      if (loginError || !studentData) {
        setError("লগইন করা যায়নি। আপনার তথ্য পরীক্ষা করে আবার চেষ্টা করুন।");
        return;
      }

      if (!studentData.login_enabled) {
        setError("আপনার লগইন চালু নেই। সহায়তার জন্য যোগাযোগ করুন।");
        return;
      }

      localStorage.setItem("student", JSON.stringify(studentData));
      localStorage.setItem("student_id", studentData.student_id);

      router.replace("/student/dashboard");
      navigating = true;
    } catch {
      setError("লগইন করা যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।");
    } finally {
      if (!navigating) {
        submittingRef.current = false;
        setLoading(false);
      }
    }
  }

  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-[#080D19] text-slate-100">
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 10% 25%, rgba(37,99,235,0.16), transparent 50%), radial-gradient(ellipse at 95% 85%, rgba(14,165,233,0.08), transparent 45%)",
        }}
      />

      {/* Top navigation */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
        <Link
          href="/"
          aria-label="The Curious Classroom — হোম"
          className={`inline-flex shrink-0 rounded-xl bg-white px-3 py-2 ${focusStyle}`}
        >
          <Image
            src="/logo.png"
            alt="The Curious Classroom"
            width={170}
            height={60}
            sizes="(max-width: 639px) 112px, 140px"
            className="h-auto w-28 sm:w-[140px]"
          />
        </Link>

        <Link
          href="/"
          className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white ${focusStyle}`}
        >
          <ArrowLeft aria-hidden="true" size={17} />
          হোমপেজ
        </Link>
      </header>

      {/* Main content */}
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:py-14">
        {/* Brand introduction */}
        <section
          aria-labelledby="welcome-heading"
          className="hidden lg:block"
        >
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-8 bg-blue-400"
            />
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-300">
              Your Student Space
            </p>
          </div>

          <h2
            id="welcome-heading"
            className="mt-7 text-4xl font-semibold leading-[1.5] tracking-tight text-white xl:text-5xl"
          >
            শেখার পথচলায়
            <span className="mt-2 block text-blue-400">
              স্বাগতম।
            </span>
          </h2>

          <p className="mt-6 max-w-md text-base leading-8 text-slate-300">
            তোমার Student ID ও Password দিয়ে শিক্ষার্থী
            ড্যাশবোর্ডে প্রবেশ করো।
          </p>

          <div className="mt-9 max-w-sm rounded-2xl border border-white/15 bg-white p-5">
            <div className="relative h-24 w-full">
              <Image
                src="/shishir-bioverse.png"
                alt="Shishir BioVerse"
                fill
                sizes="342px"
                className="object-contain"
              />
            </div>
          </div>

          <p className="mt-5 text-sm tracking-wide text-slate-400">
            Where Curiosity Meets Life
          </p>

          <div className="mt-9 flex flex-wrap gap-3 border-t border-white/10 pt-6">
            {["SSC ও HSC", "জীববিজ্ঞান", "অফলাইন ব্যাচ"].map(
              (label) => (
                <span
                  key={label}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs text-slate-300"
                >
                  {label}
                </span>
              )
            )}
          </div>
        </section>

        {/* Login card */}
        <section
          aria-labelledby="login-heading"
          className="mx-auto w-full max-w-lg"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#101A2C] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)] sm:p-10">
            <div
              aria-hidden="true"
              className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent"
            />

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10">
              <UserRound
                aria-hidden="true"
                size={24}
                strokeWidth={1.5}
                className="text-blue-300"
              />
            </div>

            <p className="mt-6 text-xs font-medium uppercase tracking-[0.18em] text-blue-300">
              Student Portal
            </p>

            <h1
              id="login-heading"
              className="mt-3 text-3xl font-semibold leading-snug text-white"
            >
              শিক্ষার্থী লগইন
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              তোমার অ্যাকাউন্টে প্রবেশ করতে নিচের তথ্য পূরণ করো।
            </p>

            <form
              onSubmit={login}
              aria-busy={loading}
              className="mt-8"
            >
              <fieldset
                disabled={loading}
                className="m-0 min-w-0 space-y-5 border-0 p-0"
              >
                <legend className="sr-only">লগইন তথ্য</legend>

                <div>
                  <label
                    htmlFor="student-id"
                    className="mb-2.5 block text-sm font-medium text-slate-200"
                  >
                    Student ID
                  </label>

                  <div className="relative">
                    <UserRound
                      aria-hidden="true"
                      size={19}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      id="student-id"
                      name="student_id"
                      type="text"
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      value={studentID}
                      onChange={(event) => {
                        setStudentID(event.target.value);
                        setError("");
                      }}
                      placeholder="তোমার Student ID"
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="student-password"
                    className="mb-2.5 block text-sm font-medium text-slate-200"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      aria-hidden="true"
                      size={19}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      id="student-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setError("");
                      }}
                      placeholder="তোমার Password"
                      className={`${inputStyle} pr-14`}
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "পাসওয়ার্ড লুকান"
                          : "পাসওয়ার্ড দেখুন"
                      }
                      aria-controls="student-password"
                      onClick={() => setShowPassword((value) => !value)}
                      className={`absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white ${focusStyle}`}
                    >
                      {showPassword ? (
                        <EyeOff aria-hidden="true" size={19} />
                      ) : (
                        <Eye aria-hidden="true" size={19} />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3"
                  >
                    <CircleAlert
                      aria-hidden="true"
                      size={18}
                      className="mt-1 shrink-0 text-red-300"
                    />
                    <p className="text-sm leading-7 text-red-200">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 py-3.5 text-base font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60 ${focusStyle}`}
                >
                  {loading ? (
                    <>
                      <LoaderCircle
                        aria-hidden="true"
                        size={20}
                        className="motion-safe:animate-spin"
                      />
                      লগইন হচ্ছে…
                    </>
                  ) : (
                    <>
                      লগইন করো
                      <ArrowRight aria-hidden="true" size={19} />
                    </>
                  )}
                </button>
              </fieldset>
            </form>

            <div className="mt-7 border-t border-white/10 pt-6">
              <p className="text-sm leading-7 text-slate-400">
                ID বা Password নিয়ে সমস্যা হচ্ছে?
              </p>

              <a
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-blue-300 transition-colors hover:text-blue-200 ${focusStyle}`}
              >
                <MessageCircle aria-hidden="true" size={17} />
                WhatsApp-এ সহায়তা নাও
                <ArrowUpRight aria-hidden="true" size={16} />
                <span className="sr-only">
                  — নতুন ট্যাবে খুলবে
                </span>
              </a>
            </div>
          </div>

          <p className="mt-6 text-center text-sm leading-7 text-slate-400">
            এখনো ভর্তি হওনি?{" "}
            <Link
              href="/admission"
              className={`inline-block rounded-md px-1 py-2 font-medium text-blue-300 hover:text-blue-200 ${focusStyle}`}
            >
              ভর্তির আবেদন করো
            </Link>
          </p>
        </section>
      </div>

      <footer className="px-5 py-6 text-center">
        <p className="text-xs leading-6 text-slate-500">
          The Curious Classroom · Shishir BioVerse
        </p>
      </footer>
    </main>
  );
}