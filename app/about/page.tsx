"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const sections = [
  {
    title: "আমাদের গল্প",
    subtitle: "Our Story",
    text: "The Curious Classroom একটি আধুনিক শিক্ষা প্রতিষ্ঠান যেখানে শিক্ষার্থীদের জন্য সহজ, মানসম্মত ও প্রযুক্তিনির্ভর শিক্ষা প্রদান করা হয়। অভিজ্ঞ শিক্ষক, আধুনিক শিক্ষাপদ্ধতি এবং নিয়মিত অনুশীলনের মাধ্যমে আমরা শিক্ষার্থীদের সফলতার পথে এগিয়ে নিয়ে যাচ্ছি।",
    image: "/about/story.jpg",
  },
  {
    title: "আমাদের লক্ষ্য",
    subtitle: "Our Mission",
    text: "আমাদের লক্ষ্য হলো প্রতিটি শিক্ষার্থীর মাঝে আত্মবিশ্বাস তৈরি করা এবং তাদের একাডেমিক ও বাস্তব জীবনের জন্য প্রস্তুত করা। প্রযুক্তির মাধ্যমে শিক্ষাকে আরও সহজ, সুন্দর ও কার্যকর করা আমাদের প্রধান উদ্দেশ্য।",
    image: "/about/mission.jpg",
  },
  {
    title: "আমাদের ভিশন",
    subtitle: "Our Vision",
    text: "বাংলাদেশের অন্যতম বিশ্বস্ত ও আধুনিক শিক্ষা প্ল্যাটফর্ম হিসেবে প্রতিষ্ঠিত হওয়া, যেখানে প্রত্যেক শিক্ষার্থী মানসম্মত শিক্ষা গ্রহণ করে নিজের স্বপ্ন পূরণ করতে পারে।",
    image: "/about/online.jpg",
  },
];

const highlights = [
  {
    value: "200+",
    label: "শিক্ষার্থী",
    description: "একসঙ্গে শেখার পথচলা",
  },
  {
    value: "10+",
    label: "অভিজ্ঞ শিক্ষক",
    description: "সঠিক নির্দেশনায় এগিয়ে চলা",
  },
  {
    value: "মানসম্মত শিক্ষা",
    label: "আমাদের অঙ্গীকার",
    description: "প্রতিটি শিক্ষার্থীর জন্য ব্যক্তিগত যত্ন",
  },
];

export default function AboutPage() {
  const reduceMotion = useReducedMotion();

  const reveal = {
    initial: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: reduceMotion ? 0 : 0.6 },
  };

  return (
    <main className="isolate overflow-hidden bg-[#080D19] text-slate-100">
      {/* Hero */}
      <section className="relative border-b border-white/10 px-6 pb-20 pt-20 md:pb-28 md:pt-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.18), transparent 65%)",
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage:
              "linear-gradient(to bottom, black, transparent)",
          }}
        />

        <motion.div
          {...reveal}
          className="relative mx-auto max-w-4xl text-center"
        >
          <span className="inline-flex items-center gap-3 rounded-full border border-blue-400/20 bg-blue-400/5 px-5 py-2.5 text-xs font-medium tracking-[0.16em] text-blue-300 sm:text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            THE CURIOUS CLASSROOM
          </span>

          <h1 className="mt-8 text-4xl font-bold leading-[1.35] tracking-tight sm:text-5xl md:text-6xl">
            আমাদের{" "}
            <span className="text-blue-400">সম্পর্কে</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg md:leading-9">
            The Curious Classroom শিক্ষার্থীদের জন্য আধুনিক প্রযুক্তি,
            অভিজ্ঞ শিক্ষক এবং সঠিক নির্দেশনার মাধ্যমে একটি সম্পূর্ণ
            শিক্ষা ব্যবস্থা তৈরি করছে।
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            {["আধুনিক শিক্ষা", "অভিজ্ঞ শিক্ষক", "ব্যক্তিগত যত্ন"].map(
              (label) => (
                <span
                  key={label}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300"
                >
                  {label}
                </span>
              )
            )}
          </div>
        </motion.div>
      </section>

      {/* Story, mission and vision */}
      <section
        aria-label="আমাদের গল্প, লক্ষ্য ও ভিশন"
        className="mx-auto max-w-6xl space-y-20 px-6 py-20 md:space-y-28 md:py-28"
      >
        {sections.map((item, index) => (
          <motion.article
            key={item.subtitle}
            {...reveal}
            className="grid items-center gap-8 md:grid-cols-2 md:gap-16"
          >
            <div
              className={`group relative ${
                index % 2 !== 0 ? "md:order-2" : ""
              }`}
            >
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-[2rem] bg-blue-500/5 blur-xl"
              />

              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111B2E] p-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 767px) 100vw, 50vw"
                    className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.03]"
                  />

                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#080D19]/70 via-transparent to-transparent"
                  />

                  <span className="absolute bottom-5 left-5 rounded-full border border-white/20 bg-[#080D19]/70 px-4 py-2 text-xs font-medium tracking-[0.15em] text-white backdrop-blur-md">
                    {item.subtitle.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium tracking-[0.18em] text-blue-400">
                  0{index + 1}
                </span>
                <span
                  aria-hidden="true"
                  className="h-px w-10 bg-blue-400/40"
                />
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  {item.subtitle}
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-semibold leading-snug text-white md:text-4xl">
                {item.title}
              </h2>

              <p className="mt-5 text-base leading-8 text-slate-300 md:text-lg md:leading-9">
                {item.text}
              </p>
            </div>
          </motion.article>
        ))}
      </section>

      {/* Teachers */}
      <section className="px-6 pb-20 md:pb-28">
        <motion.div
          {...reveal}
          className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#0E1728]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 100% 0%, rgba(37,99,235,0.13), transparent 65%)",
            }}
          />

          <div className="relative grid items-center gap-8 p-5 sm:p-8 md:grid-cols-2 md:gap-14 md:p-12">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
              <Image
                src="/about/teacher.jpg"
                alt="The Curious Classroom-এর শিক্ষকবৃন্দ"
                fill
                sizes="(max-width: 767px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            <div className="py-3">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-blue-300">
                The People Behind Your Progress
              </span>

              <h2 className="mt-5 text-3xl font-semibold leading-snug text-white md:text-4xl">
                আমাদের শিক্ষকবৃন্দ
              </h2>

              <p className="mt-5 text-base leading-8 text-slate-300 md:text-lg md:leading-9">
                অভিজ্ঞ ও দক্ষ শিক্ষকবৃন্দের মাধ্যমে শিক্ষার্থীদের জন্য
                সহজবোধ্য, মানসম্মত এবং ফলাফলভিত্তিক শিক্ষা প্রদান করা হয়।
              </p>

              <div className="mt-7 border-l-2 border-blue-400 pl-5">
                <p className="text-lg font-medium leading-8 text-blue-200">
                  সঠিক নির্দেশনা।
                  <br />
                  আত্মবিশ্বাসের সঙ্গে এগিয়ে চলা।
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Highlights */}
      <section
        aria-label="এক নজরে The Curious Classroom"
        className="border-t border-white/10 bg-[#0B1220] px-6 py-16 md:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div {...reveal} className="mb-10 text-center">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-blue-300">
              Growing Together
            </span>

            <h2 className="mt-4 text-2xl font-semibold text-white md:text-3xl">
              একসঙ্গে এগিয়ে যাওয়ার গল্প
            </h2>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            {highlights.map((item) => (
              <motion.div
                key={item.label}
                {...reveal}
                className="rounded-2xl border border-white/10 bg-[#111B2E] px-6 py-9 text-center motion-safe:transition-colors motion-safe:duration-300 hover:border-blue-400/40"
              >
                <div className="flex min-h-[3rem] items-center justify-center">
                  <p
                    className={`font-semibold leading-snug tracking-tight text-blue-300 ${
                      item.value === "মানসম্মত শিক্ষা"
                        ? "text-2xl"
                        : "text-4xl"
                    }`}
                  >
                    {item.value}
                  </p>
                </div>

                <h3 className="mt-4 text-lg font-medium text-white">
                  {item.label}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}