"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Quote, UserRound } from "lucide-react";

const reviews = [
  {
    id: "review-1",
    name: "শিক্ষার্থীর নাম",
    studentClass: "HSC শিক্ষার্থী",
    text: "The Curious Classroom-এর সহজবোধ্য পড়ানোর পদ্ধতি এবং নিয়মিত গাইডলাইন আমাকে আত্মবিশ্বাসের সঙ্গে পরীক্ষার প্রস্তুতি নিতে সাহায্য করেছে।",
    isSample: true,
  },
  {
    id: "review-2",
    name: "শিক্ষার্থীর নাম",
    studentClass: "SSC শিক্ষার্থী",
    text: "নিয়মিত পরীক্ষা, মূল্যায়ন এবং শিক্ষকদের সহযোগিতার মাধ্যমে আমার পড়াশোনার উন্নতি হয়েছে।",
    isSample: true,
  },
  {
    id: "review-3",
    name: "শিক্ষার্থীর নাম",
    studentClass: "HSC শিক্ষার্থী",
    text: "কঠিন বিষয়গুলো সহজভাবে বোঝানোর কারণে পড়াশোনার প্রতি আগ্রহ ও আত্মবিশ্বাস দুটোই বেড়েছে।",
    isSample: true,
  },
];

export default function StudentSuccess() {
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
      aria-labelledby="student-stories-heading"
      className="border-b border-white/10 bg-[#080D19] px-5 py-16 text-slate-100 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <motion.div
          {...reveal}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-300">
            Student Perspectives
          </p>

          <h2
            id="student-stories-heading"
            className="mt-5 text-3xl font-semibold leading-snug text-white sm:text-4xl"
          >
            শিক্ষার্থীদের অভিজ্ঞতা
          </h2>

          <p className="mt-4 text-base leading-8 text-slate-300">
            শেখার পথচলা, পরীক্ষার প্রস্তুতি ও আত্মবিশ্বাস—
            শিক্ষার্থীদের নিজের কথায়।
          </p>
        </motion.div>

        {/* Reviews */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {reviews.map((review) => (
            <motion.figure
              key={review.id}
              {...reveal}
              className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#101A2C] p-6 sm:p-8"
            >
              <div className="flex items-center justify-between gap-4">
                <Quote
                  aria-hidden="true"
                  size={32}
                  strokeWidth={1.4}
                  className="text-blue-400"
                />

                {review.isSample && (
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs leading-5 text-slate-400">
                    নমুনা মতামত
                  </span>
                )}
              </div>

              <blockquote className="mb-8 mt-6 flex-1">
                <p className="text-base leading-8 text-slate-200">
                  {review.text}
                </p>
              </blockquote>

              <figcaption className="flex items-center gap-3 border-t border-white/10 pt-5">
                <div
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-400/15 bg-blue-400/5"
                >
                  <UserRound
                    size={20}
                    strokeWidth={1.5}
                    className="text-blue-300"
                  />
                </div>

                <div className="min-w-0">
                  <p className="font-medium leading-7 text-white">
                    {review.isSample
                      ? "নমুনা শিক্ষার্থী পরিচিতি"
                      : review.name}
                  </p>

                  <p className="mt-0.5 text-sm leading-6 text-blue-300">
                    {review.studentClass}
                  </p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}