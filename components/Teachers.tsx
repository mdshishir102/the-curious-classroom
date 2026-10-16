"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Check, ArrowUpRight } from "lucide-react";

const teachingFocus = [
  "SSC ও HSC জীববিজ্ঞানের অফলাইন ক্লাস",
  "ধারণা, চিত্র ও জৈবিক প্রক্রিয়ার ব্যাখ্যা",
  "সরাসরি প্রশ্নোত্তর ও পড়াশোনার গাইডলাইন",
];

export default function Teachers() {
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
      id="teachers"
      aria-labelledby="teachers-heading"
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
              Meet Your Teacher
            </p>
          </div>

          <h2
            id="teachers-heading"
            className="mt-5 text-3xl font-semibold leading-snug text-white sm:text-4xl"
          >
            প্রতিষ্ঠাতা ও শিক্ষক পরিচিতি
          </h2>

          <p className="mt-4 text-base leading-8 text-slate-300">
            The Curious Classroom-এর পেছনের মানুষ এবং
            তোমার জীববিজ্ঞান শিক্ষক।
          </p>
        </motion.div>

        {/* Founder profile */}
        <motion.article
          {...reveal}
          aria-labelledby="teacher-shishir"
          className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-[#101A2C] lg:mt-12"
        >
          <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
            {/* Portrait */}
            <div className="border-b border-white/10 bg-[#142138] lg:border-b-0 lg:border-r">
              <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
                <Image
                  src="/teacher.png"
                  alt="মো. মাহফুজ শাহারিয়া শিশির — জীববিজ্ঞান শিক্ষক"
                  fill
                  sizes="(max-width: 1023px) 100vw, 40vw"
                  className="object-contain object-bottom"
                />
              </div>

              <div className="border-t border-white/10 px-6 py-5 text-center">
                <p className="text-lg font-bold tracking-[0.12em] text-white">
                  SHISHIR
                  <span className="ml-2 font-medium tracking-normal text-blue-300">
                    BioVerse
                  </span>
                </p>

                <p className="mt-2 text-xs tracking-wide text-slate-400">
                  Where Curiosity Meets Life
                </p>
              </div>
            </div>

            {/* Profile details */}
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/5 px-3 py-1.5 text-xs font-medium text-blue-200">
                <BookOpen
                  aria-hidden="true"
                  size={14}
                  strokeWidth={1.6}
                />
                জীববিজ্ঞান শিক্ষক
              </div>

              <h3
                id="teacher-shishir"
                className="mt-6 text-2xl font-semibold leading-[1.6] text-white sm:text-3xl"
              >
                মো. মাহফুজ শাহারিয়া
                <span className="text-blue-400"> শিশির</span>
              </h3>

              <p className="mt-3 text-sm font-medium leading-7 text-blue-200">
                প্রতিষ্ঠাতা, The Curious Classroom
              </p>

              <p className="mt-5 text-base leading-8 text-slate-300">
                নিজের প্রতিষ্ঠিত The Curious Classroom-এর
                জীববিজ্ঞান বিভাগ SHISHIR BioVerse-এ নবম–দশম
                ও একাদশ–দ্বাদশ শ্রেণির শিক্ষার্থীদের সরাসরি
                পাঠদান করেন শিশির।
              </p>

              <p className="mt-4 text-base leading-8 text-slate-400">
                তাঁর ক্লাসে গুরুত্ব পায় বিষয় বুঝে শেখা, প্রশ্ন
                করা এবং অনুশীলনের মাধ্যমে প্রস্তুতি এগিয়ে
                নেওয়া। জীববিজ্ঞানের জটিল ধারণাগুলোকে সহজ
                ব্যাখ্যায় শিক্ষার্থীদের কাছে তুলে ধরাই
                পাঠদানের মূল লক্ষ্য।
              </p>

              <ul className="mt-7 space-y-4 border-t border-white/10 pt-6">
                {teachingFocus.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-7 text-slate-200"
                  >
                    <Check
                      aria-hidden="true"
                      size={17}
                      strokeWidth={1.8}
                      className="mt-1 shrink-0 text-blue-400"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/admission"
                className="mt-8 inline-flex min-h-12 w-fit items-center justify-center gap-4 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#101A2C]"
              >
                অফলাইন ব্যাচে ভর্তির আবেদন
                <ArrowUpRight
                  aria-hidden="true"
                  size={18}
                  strokeWidth={1.7}
                />
              </Link>
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
}