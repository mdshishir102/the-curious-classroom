"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdmissionCTA() {
  const reduceMotion = useReducedMotion();

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
        {/* Subtle lighting */}
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
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-300">
              Your Next Chapter
            </p>

            <h2
              id="admission-heading"
              className="mt-5 text-3xl font-semibold leading-[1.4] text-white sm:text-4xl"
            >
              আপনার সন্তানের
              <br />
              সফলতার যাত্রা শুরু করুন
            </h2>

            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
              নবম–দশম ও একাদশ–দ্বাদশ শ্রেণির বিজ্ঞান বিভাগের জন্য
              The Curious Classroom-এর সঙ্গে যুক্ত হয়ে মানসম্মত
              শিক্ষা ও সঠিক দিকনির্দেশনা পান।
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:min-w-[220px]">
            <Link
              href="/admission"
              className="inline-flex min-h-14 items-center justify-center gap-4 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#102342]"
            >
              ভর্তি করুন
              <ArrowRight
                aria-hidden="true"
                size={19}
                strokeWidth={1.8}
              />
            </Link>

            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center rounded-xl px-5 py-3 text-sm font-medium text-blue-200 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#102342]"
            >
              বিস্তারিত জানতে যোগাযোগ করুন
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}