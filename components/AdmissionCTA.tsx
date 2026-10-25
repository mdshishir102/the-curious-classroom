"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdmissionCTA() {
  const reduceMotion = useReducedMotion();

  const focusStyle =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#102342]";

  return (
    <section
      aria-labelledby="admission-heading"
      className="bg-[#080D19] px-5 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <motion.div
        initial={{
          opacity: reduceMotion ? 1 : 0,
          y: reduceMotion ? 0 : 20,
        }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.5 }}
        viewport={{ once: true, amount: 0.2 }}
        className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-3xl border border-blue-400/20 bg-[#102342] px-6 py-10 sm:p-10 lg:p-14"
      >
        {/* Background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 100% 50%, rgba(37,99,235,0.2), transparent 65%)",
          }}
        />

        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-14">
          <div className="max-w-2xl">
            <p className="text-sm font-medium tracking-wide text-blue-200">
              <span className="font-bold tracking-[0.12em]">
                SHISHIR
              </span>{" "}
              BioVerse
            </p>

            <p className="mt-4 text-xs font-medium leading-6 text-slate-300 sm:text-sm">
              SSC ও HSC · জীববিজ্ঞান · অফলাইন ব্যাচ
            </p>

            <h2
              id="admission-heading"
              className="mt-5 text-3xl font-semibold leading-[1.4] text-white sm:text-4xl"
            >
              জীববিজ্ঞান বুঝে শেখার
              <span className="mt-2 block text-blue-300">
                শুরুটা হোক শিশির ভাইয়ার।
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
              নবম–দশম ও একাদশ–দ্বাদশ শ্রেণির জীববিজ্ঞান
              প্রস্তুতিতে যোগ দাও Shishir BioVerse-এর অফলাইন
              ব্যাচে। সরাসরি ক্লাসে বুঝে শেখা, প্রশ্ন করার সুযোগ
              এবং নিয়মিত অনুশীলনে এগিয়ে নাও তোমার প্রস্তুতি।
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:min-w-[220px]">
            <Link
              href="/admission"
              className={`inline-flex min-h-14 items-center justify-center gap-4 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition-colors hover:bg-blue-500 ${focusStyle}`}
            >
              ভর্তির আবেদন
              <ArrowRight
                aria-hidden="true"
                size={19}
                strokeWidth={1.8}
              />
            </Link>

            <Link
              href="/contact"
              className={`inline-flex min-h-12 items-center justify-center rounded-xl px-5 py-3 text-sm font-medium text-blue-200 transition-colors hover:bg-white/5 hover:text-white ${focusStyle}`}
            >
              ব্যাচের বিস্তারিত জানুন
            </Link>

            <p className="text-center text-xs leading-6 text-slate-400">
              ক্লাসের সময় ও ফি জানতে যোগাযোগ করুন।
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}