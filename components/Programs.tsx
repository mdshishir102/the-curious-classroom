"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Atom,
  GraduationCap,
  Check,
  ArrowUpRight,
} from "lucide-react";

const programs = [
  {
    id: "ssc",
    label: "SECONDARY",
    title: "SSC বিজ্ঞান বিভাগ",
    classes: "নবম–দশম শ্রেণি",
    description:
      "নবম ও দশম শ্রেণির শিক্ষার্থীদের জন্য বোর্ড পরীক্ষা উপযোগী সম্পূর্ণ প্রস্তুতি।",
    icon: Atom,
    subjects: [
      "পদার্থবিজ্ঞান",
      "রসায়ন",
      "জীববিজ্ঞান",
      "উচ্চতর গণিত",
    ],
    feature: "নিয়মিত পরীক্ষা ও মূল্যায়ন",
  },
  {
    id: "hsc",
    label: "HIGHER SECONDARY",
    title: "HSC বিজ্ঞান বিভাগ",
    classes: "একাদশ–দ্বাদশ শ্রেণি",
    description:
      "একাদশ ও দ্বাদশ শ্রেণির শিক্ষার্থীদের জন্য বোর্ড পরীক্ষা এবং উচ্চশিক্ষার প্রস্তুতি।",
    icon: GraduationCap,
    subjects: [
      "পদার্থবিজ্ঞান",
      "রসায়ন",
      "জীববিজ্ঞান",
      "উচ্চতর গণিত",
    ],
    feature: "বিশ্ববিদ্যালয় ভর্তি প্রস্তুতি",
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
              className="h-px w-8 bg-blue-400"
            />
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-300">
              Our Programs
            </p>
          </div>

          <h2
            id="programs-heading"
            className="mt-5 text-3xl font-semibold leading-snug text-white sm:text-4xl"
          >
            আমাদের শিক্ষা কার্যক্রম
          </h2>

          <p className="mt-4 max-w-xl text-base leading-8 text-slate-400">
            SSC ও HSC বিজ্ঞান বিভাগের শিক্ষার্থীদের জন্য পরিকল্পিত
            ও ফলাফলভিত্তিক শিক্ষা ব্যবস্থা।
          </p>
        </motion.div>

        {/* Program cards */}
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

                  <span className="text-[10px] font-medium tracking-[0.16em] text-slate-400 sm:text-xs">
                    {program.label}
                  </span>
                </div>

                <p className="mt-7 text-sm font-medium text-blue-300">
                  {program.classes}
                </p>

                <h3
                  id={`${program.id}-heading`}
                  className="mt-2 text-2xl font-semibold leading-snug text-white lg:text-3xl"
                >
                  {program.title}
                </h3>

                <p className="mt-4 text-base leading-8 text-slate-300">
                  {program.description}
                </p>

                {/* Subjects */}
                <div className="mt-7 border-t border-white/10 pt-6">
                  <p className="text-xs font-medium text-slate-400">
                    অন্তর্ভুক্ত বিষয়সমূহ
                  </p>

                  <ul className="mt-4 grid gap-x-5 gap-y-4 sm:grid-cols-2">
                    {program.subjects.map((subject) => (
                      <li
                        key={subject}
                        className="flex items-center gap-3 text-sm leading-6 text-slate-200"
                      >
                        <Check
                          aria-hidden="true"
                          size={16}
                          strokeWidth={1.8}
                          className="shrink-0 text-blue-400"
                        />
                        {subject}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Additional support */}
                <div className="mb-8 mt-6 flex items-start gap-3 rounded-xl border border-blue-400/10 bg-blue-400/5 px-4 py-3.5">
                  <Check
                    aria-hidden="true"
                    size={17}
                    strokeWidth={1.8}
                    className="mt-0.5 shrink-0 text-blue-300"
                  />
                  <p className="text-sm leading-6 text-blue-200">
                    {program.feature}
                  </p>
                </div>

                {/* Action */}
                <Link
                  href="/admission"
                  aria-label={`${program.title} — ভর্তির আবেদন করুন`}
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