"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Target,
  School,
  ArrowUpRight,
  Check,
} from "lucide-react";
import AdmissionCTA from "@/components/AdmissionCTA";

const principles = [
  {
    number: "01",
    title: "বুঝে শেখা",
    description:
      "জীববিজ্ঞানের প্রতিটি ধারণা সহজ ভাষায়, চিত্র ও উদাহরণের সাহায্যে বোঝানো—যেন শিক্ষার্থী নিজের ভাষায় ব্যাখ্যা করতে পারে।",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "নিয়মিত অনুশীলন",
    description:
      "অধ্যায়ভিত্তিক অনুশীলন ও পরীক্ষার মাধ্যমে প্রস্তুতি যাচাই করা এবং ভুলগুলো বুঝে সংশোধনের সুযোগ তৈরি করা।",
    icon: Target,
  },
  {
    number: "03",
    title: "সরাসরি দিকনির্দেশনা",
    description:
      "অফলাইন ক্লাসে প্রশ্ন করা, আলোচনা করা এবং যে জায়গায় বুঝতে সমস্যা হচ্ছে সেখানে শিক্ষকের সহযোগিতা পাওয়া।",
    icon: School,
  },
];

const teachingFocus = [
  "SSC ও HSC জীববিজ্ঞানের অধ্যায়ভিত্তিক আলোচনা",
  "চিত্র, উদাহরণ ও ব্যাখ্যার মাধ্যমে ধারণা পরিষ্কার করা",
  "নিয়মিত অনুশীলন, পরীক্ষা ও ভুল সংশোধন",
  "শ্রেণিকক্ষে সরাসরি প্রশ্ন ও আলোচনা",
];

export default function AboutPage() {
  const reduceMotion = useReducedMotion();

  const reveal = {
    initial: {
      opacity: reduceMotion ? 1 : 0,
      y: reduceMotion ? 0 : 24,
    },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: reduceMotion ? 0 : 0.5 },
  };

  const focusStyle =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#0E1728]";

  return (
    <main className="isolate overflow-hidden bg-[#080D19] text-slate-100">
      {/* Introduction */}
      <section
        aria-labelledby="about-heading"
        className="relative border-b border-white/10 px-5 py-16 sm:px-6 lg:px-8 lg:py-24"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.18), transparent 65%)",
          }}
        />

        <motion.div
          {...reveal}
          className="relative mx-auto max-w-4xl text-center"
        >
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-300">
            The Curious Classroom
          </p>

          <h1
            id="about-heading"
            className="mt-6 text-4xl font-bold leading-[1.4] tracking-tight text-white sm:text-5xl"
          >
            কৌতূহল থেকে
            <span className="mt-2 block text-blue-400">
              বুঝে শেখার পথচলা।
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg sm:leading-9">
            The Curious Classroom মো. মাহফুজ শাহারিয়া শিশিরের
            প্রতিষ্ঠিত শিক্ষা উদ্যোগ। এর জীববিজ্ঞান বিভাগ
            Shishir BioVerse-এ তিনি নিজেই SSC ও HSC শিক্ষার্থীদের
            অফলাইন ক্লাসে পড়ান।
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              "SSC ও HSC",
              "জীববিজ্ঞান",
              "অফলাইন ক্লাস",
            ].map((label) => (
              <span
                key={label}
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300"
              >
                {label}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Brand relationship */}
      <section
        aria-labelledby="brand-heading"
        className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div {...reveal}>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-300">
              Our Story
            </p>

            <h2
              id="brand-heading"
              className="mt-5 text-3xl font-semibold leading-snug text-white sm:text-4xl"
            >
              একটি শিক্ষা উদ্যোগ,
              <span className="mt-2 block">
                জীববিজ্ঞানের জন্য বিশেষ পরিচয়।
              </span>
            </h2>

            <div className="mt-6 space-y-4 text-base leading-8 text-slate-300">
              <p>
                The Curious Classroom হলো মূল প্রতিষ্ঠান।
                শিক্ষার্থীদের কৌতূহলকে গুরুত্ব দিয়ে বিষয় বুঝতে
                সাহায্য করা এবং নিয়মিত অনুশীলনের অভ্যাস গড়ে
                তোলাই এই উদ্যোগের লক্ষ্য।
              </p>

              <p>
                জীববিজ্ঞান শেখানোর এই কাজের নিজস্ব পরিচয়
                Shishir BioVerse। নামের “Shishir” অংশটি শিক্ষক
                শিশিরের পরিচয় বহন করে। এখানে নবম থেকে দ্বাদশ
                শ্রেণির শিক্ষার্থীরা তাঁর সরাসরি দিকনির্দেশনায়
                জীববিজ্ঞান শেখে।
              </p>
            </div>

            <div className="mt-7 border-l-2 border-blue-400/60 pl-5">
              <p className="text-lg font-medium leading-8 text-blue-200">
                Where Curiosity Meets Life
              </p>
            </div>
          </motion.div>

          <motion.div
            {...reveal}
            className="rounded-3xl border border-white/10 bg-[#0E1728] p-6 sm:p-8"
          >
            <div className="rounded-2xl border border-white/10 bg-[#101A2C] p-5 sm:p-6">
              <p className="text-xs font-medium text-slate-400">
                মূল প্রতিষ্ঠান
              </p>

              <div className="mt-4 inline-flex rounded-xl bg-white px-5 py-4">
                <Image
                  src="/logo.png"
                  alt="The Curious Classroom"
                  width={170}
                  height={60}
                  sizes="170px"
                  className="h-auto w-[170px]"
                />
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-300">
                কৌতূহল, অনুশীলন ও আত্মবিশ্বাসকে সঙ্গে নিয়ে শেখার উদ্যোগ।
              </p>
            </div>

            <div
              aria-hidden="true"
              className="mx-auto h-8 w-px bg-blue-400/40"
            />

            <div className="rounded-2xl border border-blue-400/20 bg-blue-400/5 p-5 sm:p-6">
              <p className="text-xs font-medium text-blue-300">
                জীববিজ্ঞান বিভাগ
              </p>

              <div className="mt-4 rounded-xl bg-white p-4">
                <div className="relative h-24 w-full sm:h-28">
                  <Image
                    src="/shishir-bioverse.png"
                    alt="Shishir BioVerse"
                    fill
                    sizes="(max-width: 1023px) 80vw, 400px"
                    className="object-contain"
                  />
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-300">
                শিশিরের সঙ্গে SSC ও HSC জীববিজ্ঞানের অফলাইন ক্লাস।
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Teaching principles */}
      <section
        aria-labelledby="principles-heading"
        className="border-y border-white/10 bg-[#0B1220] px-5 py-16 sm:px-6 lg:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div {...reveal} className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-300">
              Our Approach
            </p>

            <h2
              id="principles-heading"
              className="mt-5 text-3xl font-semibold leading-snug text-white sm:text-4xl"
            >
              শেখানোর পদ্ধতি
            </h2>

            <p className="mt-4 text-base leading-8 text-slate-300">
              জীববিজ্ঞানের ধারণা পরিষ্কার করা থেকে পরীক্ষার
              প্রস্তুতি—প্রতিটি ধাপে গুরুত্ব পায় বোঝা,
              অনুশীলন ও সরাসরি সহযোগিতা।
            </p>
          </motion.div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {principles.map((item) => {
              const Icon = item.icon;

              return (
                <motion.article
                  key={item.number}
                  {...reveal}
                  className="rounded-2xl border border-white/10 bg-[#101A2C] p-6 sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/5">
                      <Icon
                        aria-hidden="true"
                        size={24}
                        strokeWidth={1.5}
                        className="text-blue-300"
                      />
                    </div>

                    <span
                      aria-hidden="true"
                      className="text-xs tracking-widest text-slate-500"
                    >
                      {item.number}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-semibold text-white">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-sm leading-8 text-slate-300">
                    {item.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Founder and teacher */}
      <section
        aria-labelledby="founder-heading"
        className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24"
      >
        <motion.div
          {...reveal}
          className="mx-auto grid max-w-6xl items-center gap-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0E1728] p-5 sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14 lg:p-12"
        >
          <div className="mx-auto w-full max-w-sm">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-[#142138]">
              <Image
                src="/teacher.png"
                alt="মো. মাহফুজ শাহারিয়া শিশির"
                fill
                sizes="(max-width: 639px) 85vw, 384px"
                className="object-contain object-bottom"
              />
            </div>
          </div>

          <div className="py-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-300">
              Founder & Biology Teacher
            </p>

            <h2
              id="founder-heading"
              className="mt-5 text-2xl font-semibold leading-[1.5] text-white sm:text-3xl"
            >
              মো. মাহফুজ শাহারিয়া শিশির
            </h2>

            <p className="mt-3 text-sm leading-7 text-blue-200">
              প্রতিষ্ঠাতা, The Curious Classroom
              <br />
              জীববিজ্ঞান শিক্ষক, Shishir BioVerse
            </p>

            <p className="mt-5 text-base leading-8 text-slate-300">
              Shishir BioVerse-এর ক্লাসগুলো শিশির নিজেই পরিচালনা
              করেন। তাঁর পাঠদানের লক্ষ্য হলো শিক্ষার্থীদের
              জীববিজ্ঞানের ধারণা বুঝতে সাহায্য করা এবং সেই
              বোঝাপড়াকে নিয়মিত অনুশীলনে কাজে লাগানো।
            </p>

            <ul className="mt-6 space-y-3">
              {teachingFocus.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-7 text-slate-300"
                >
                  <Check
                    aria-hidden="true"
                    size={17}
                    className="mt-1 shrink-0 text-blue-300"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/teachers"
              className={`mt-7 inline-flex min-h-12 items-center gap-3 rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-blue-200 transition-colors hover:border-blue-400/40 hover:bg-blue-400/5 ${focusStyle}`}
            >
              শিক্ষক পরিচিতি দেখুন
              <ArrowUpRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </motion.div>
      </section>

      <AdmissionCTA />
    </main>
  );
}