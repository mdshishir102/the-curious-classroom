"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Leaf,
  GraduationCap,
  Check,
  ArrowUpRight,
} from "lucide-react";

const programs = [
  {
    id: "ssc",
    label: "SSC BIOLOGY",
    title: "SSC জীববিজ্ঞান",
    classes: "নবম–দশম শ্রেণি",
    description:
      "জীববিজ্ঞানের মূল ধারণাগুলো বুঝে শেখা এবং স্কুল ও বোর্ড পরীক্ষার জন্য ধাপে ধাপে প্রস্তুতি।",
    icon: Leaf,
    topics: [
      "পাঠ্যবইয়ের অধ্যায়ভিত্তিক আলোচনা",
      "জীববিজ্ঞানের ধারণা ও ব্যাখ্যা",
      "চিত্র বুঝে শেখা",
      "পরীক্ষার প্রশ্নের অনুশীলন",
    ],
  },
  {
    id: "hsc",
    label: "HSC BIOLOGY",
    title: "HSC জীববিজ্ঞান",
    classes: "একাদশ–দ্বাদশ শ্রেণি",
    description:
      "জীববিজ্ঞান প্রথম ও দ্বিতীয় পত্রের বিষয়গুলো বুঝে শেখা এবং কলেজ ও বোর্ড পরীক্ষার প্রস্তুতি।",
    icon: GraduationCap,
    topics: [
      "জীববিজ্ঞান প্রথম পত্র",
      "জীববিজ্ঞান দ্বিতীয় পত্র",
      "চিত্র ও জৈবিক প্রক্রিয়ার ব্যাখ্যা",
      "পরীক্ষার প্রশ্নের অনুশীলন",
    ],
  },
];

export default function Programs() {
  const reduceMotion = useReducedMotion();

  const reveal = {
    initial: {
      opacity: reduceMotion ? 1 : 0,
      y: reduceMotion ? 0 : 20,
    },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: reduceMotion ? 0 : 0.5 },
  };

  return (
    <section
      id="programs"
      aria-labelledby="programs-heading"
      className="scroll-mt-28 border-b border-white/10 bg-[#0B1220] px-5 py-16 text-slate-100 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <motion.div {...reveal} className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-8 shrink-0 bg-blue-400"
            />

            <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-300">
              SHISHIR BioVerse
            </p>
          </div>

          <h2
            id="programs-heading"
            className="mt-5 text-3xl font-semibold leading-snug text-white sm:text-4xl"
          >
            আমাদের অফলাইন ব্যাচ
          </h2>

          <p className="mt-4 max-w-xl text-base leading-8 text-slate-400">
            SSC ও HSC জীববিজ্ঞান শেখো শিশির ভাইয়ার সরাসরি
            গাইডলাইনে। শ্রেণিকক্ষে আলোচনা, প্রশ্ন ও অনুশীলনের
            মাধ্যমে এগিয়ে নাও তোমার প্রস্তুতি।
          </p>
        </motion.div>

        {/* Batch cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:mt-12 lg:gap-8">
          {programs.map((program) => {
            const Icon = program.icon;

            return (
              <motion.article
                key={program.id}
                {...reveal}
                aria-labelledby={`${program.id}-heading`}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#101A2C] p-6 transition-colors duration-300 hover:border-blue-400/35 sm:p-8 lg:p-10"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"
                />

                {/* Card identity */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/10">
                    <Icon
                      aria-hidden="true"
                      size={25}
                      strokeWidth={1.5}
                      className="text-blue-300"
                    />
                  </div>

                  <span className="rounded-full border border-blue-400/20 bg-blue-400/5 px-3 py-1.5 text-xs font-medium text-blue-200">
                    অফলাইন ব্যাচ
                  </span>
                </div>

                <p className="mt-7 text-[10px] font-medium tracking-[0.16em] text-slate-500 sm:text-xs">
                  {program.label}
                </p>

                <h3
                  id={`${program.id}-heading`}
                  className="mt-3 text-2xl font-semibold leading-snug text-white lg:text-3xl"
                >
                  {program.title}
                </h3>

                <p className="mt-3 text-sm font-medium text-blue-300">
                  {program.classes}
                </p>

                <p className="mt-4 text-base leading-8 text-slate-300">
                  {program.description}
                </p>

                {/* Learning focus */}
                <div className="mt-7 border-t border-white/10 pt-6">
                  <p className="text-xs font-medium text-slate-400">
                    পড়াশোনার মূল বিষয়
                  </p>

                  <ul className="mt-4 grid gap-x-5 gap-y-4 sm:grid-cols-2">
                    {program.topics.map((topic) => (
                      <li
                        key={topic}
                        className="flex items-start gap-3 text-sm leading-6 text-slate-200"
                      >
                        <Check
                          aria-hidden="true"
                          size={16}
                          strokeWidth={1.8}
                          className="mt-1 shrink-0 text-blue-400"
                        />

                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Teacher identity */}
                <div className="mb-8 mt-6 rounded-xl border border-blue-400/10 bg-blue-400/5 px-4 py-4">
                  <p className="text-xs text-slate-400">
                    তোমার জীববিজ্ঞান শিক্ষক
                  </p>

                  <p className="mt-2 text-sm font-medium leading-7 text-blue-200">
                    মো. মাহফুজ শাহারিয়া শিশির
                  </p>
                </div>

                {/* Action */}
                <Link
                  href="/admission"
                  aria-label={`${program.title} অফলাইন ব্যাচে ভর্তির আবেদন করুন`}
                  className="mt-auto flex min-h-12 items-center justify-between gap-4 rounded-xl border border-white/15 bg-white/[0.03] px-5 py-3.5 text-sm font-medium text-white transition-colors hover:border-blue-400/40 hover:bg-blue-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#101A2C]"
                >
                  ভর্তির আবেদন করুন

                  <ArrowUpRight
                    aria-hidden="true"
                    size={19}
                    strokeWidth={1.7}
                    className="text-blue-300"
                  />
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
