
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  ShieldCheck,
  LoaderCircle,
  CircleAlert,
  Users,
  ClipboardCheck,
  GraduationCap,
  Shield,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function AdminLogin() {
  const router = useRouter();
  const submittingRef = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const focusStyle =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#101A2C]";

  const inputStyle =
    "min-h-14 w-full rounded-xl border border-white/15 bg-[#080F1D] py-3.5 pl-12 pr-4 text-base text-white outline-none transition-colors placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15 disabled:opacity-60";

  // Original Supabase Admin Login Logic
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current) return;

    setError("");

    if (!email.trim() || !password) {
      setError("Admin Email ও Password লিখুন।");
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    let navigating = false;

    try {
      const {
        data: authData,
        error: authError,
      } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError || !authData.user) {
        setError("Invalid email or password");
        return;
      }

      const {
        data: admin,
        error: adminError,
      } = await supabase
        .from("admins")
        .select("*")
        .eq("auth_user_id", authData.user.id)
        .single();

      if (adminError || !admin) {
        await supabase.auth.signOut();
        setError("Admin access denied");
        return;
      }

      if (admin.role !== "admin") {
        await supabase.auth.signOut();
        setError("Unauthorized access");
        return;
      }

      localStorage.setItem(
        "admin",
        JSON.stringify(admin)
      );

      router.push("/admin/dashboard");
      navigating = true;

    } catch (error) {
      console.error("Admin login error:", error);
      setError("Something went wrong");

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

      {/* Header */}
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
            priority
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

      {/* Main Content */}
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:py-14">

        {/* Left Brand Section */}
        <section
          aria-labelledby="admin-welcome-heading"
          className="hidden lg:block"
        >

          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-8 bg-blue-400"
            />

            <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-300">
              Your Admin Workspace
            </p>
          </div>

          <h2
            id="admin-welcome-heading"
            className="mt-7 text-4xl font-semibold leading-[1.5] tracking-tight text-white xl:text-5xl"
          >
            স্মার্ট শিক্ষা
            <br />
            ব্যবস্থাপনায়

            <span className="mt-2 block text-blue-400">
              স্বাগতম।
            </span>
          </h2>

          <p className="mt-6 max-w-md text-base leading-8 text-slate-300">
            The Curious Classroom-এর কেন্দ্রীয় অ্যাডমিন
            প্যানেলে স্বাগতম। শিক্ষার্থী, ভর্তি, পরীক্ষা
            এবং ফলাফল ব্যবস্থাপনা করুন একটি আধুনিক
            ও সুসংগঠিত প্ল্যাটফর্মে।
          </p>

          {/* Shishir BioVerse Logo */}
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

          {/* Feature Tags */}
          <div className="mt-9 flex flex-wrap gap-3 border-t border-white/10 pt-6">

            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs text-slate-300">
              <Users size={14} />
              শিক্ষার্থী
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs text-slate-300">
              <ClipboardCheck size={14} />
              পরীক্ষা ও ফলাফল
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs text-slate-300">
              <GraduationCap size={14} />
              একাডেমিক ম্যানেজমেন্ট
            </span>

          </div>

        </section>

        {/* Admin Login Card */}
        <section
          aria-labelledby="admin-login-heading"
          className="mx-auto w-full max-w-lg"
        >

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#101A2C] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)] sm:p-10">

            {/* Top Highlight */}
            <div
              aria-hidden="true"
              className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent"
            />

            {/* Admin Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10">

              <ShieldCheck
                aria-hidden="true"
                size={24}
                strokeWidth={1.5}
                className="text-blue-300"
              />

            </div>

            <p className="mt-6 text-xs font-medium uppercase tracking-[0.18em] text-blue-300">
              Admin Portal
            </p>

            <h1
              id="admin-login-heading"
              className="mt-3 text-3xl font-semibold leading-snug text-white"
            >
              অ্যাডমিন লগইন
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করতে
              আপনার অনুমোদিত অ্যাকাউন্টের তথ্য
              প্রদান করুন।
            </p>

            {/* Login Form */}
            <form
              onSubmit={login}
              aria-busy={loading}
              className="mt-8"
            >

              <fieldset
                disabled={loading}
                className="m-0 min-w-0 space-y-5 border-0 p-0"
              >

                <legend className="sr-only">
                  Admin Login Information
                </legend>

                {/* Email Input */}
                <div>

                  <label
                    htmlFor="admin-email"
                    className="mb-2.5 block text-sm font-medium text-slate-200"
                  >
                    Admin Email
                  </label>

                  <div className="relative">

                    <Mail
                      aria-hidden="true"
                      size={19}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      id="admin-email"
                      name="email"
                      type="email"
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError("");
                      }}
                      placeholder="তোমার Admin Email"
                      className={inputStyle}
                    />

                  </div>
                </div>

                {/* Password Input */}
                <div>

                  <label
                    htmlFor="admin-password"
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
                      id="admin-password"
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
                      aria-controls="admin-password"
                      aria-pressed={showPassword}
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
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

                {/* Error Message */}
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

                {/* Login Button */}
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
                      লগইন করুন
                      <ArrowRight aria-hidden="true" size={19} />
                    </>
                  )}

                </button>

              </fieldset>

            </form>

            {/* Security Information */}
            <div className="mt-7 border-t border-white/10 pt-6">

              <div className="flex items-start gap-3">

                <Shield
                  aria-hidden="true"
                  size={18}
                  className="mt-1 shrink-0 text-blue-300"
                />

                <div>

                  <p className="text-sm font-medium text-slate-300">
                    Authorized Administrator Access
                  </p>

                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    এই প্যানেলটি শুধুমাত্র অনুমোদিত
                    অ্যাডমিনদের জন্য সংরক্ষিত।
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* Student Portal Link */}
          <p className="mt-6 text-center text-sm leading-7 text-slate-400">

            শিক্ষার্থী হিসেবে প্রবেশ করতে চান?{" "}

            <Link
              href="/student/login"
              className={`inline-block rounded-md px-1 py-2 font-medium text-blue-300 hover:text-blue-200 ${focusStyle}`}
            >
              Student Login →
            </Link>

          </p>

        </section>

      </div>

      {/* Footer */}
      <footer className="px-5 py-6 text-center">

        <p className="text-xs leading-6 text-slate-500">
          The Curious Classroom · Shishir BioVerse
        </p>

      </footer>

    </main>
  );
}
