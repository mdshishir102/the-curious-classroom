"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Quote, UserRound } from "lucide-react";

type StudentReview = {
  id: string;
  name: string;
  studentClass: string;
  text: string;
};

// শিক্ষার্থীর অনুমতি নিয়ে তার আসল মতামত এখানে যোগ করবে।
const reviews: StudentReview[] = [];

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

  if (reviews.length === 0) {
    return null;
  }

  const gridClass =
    reviews.length === 1
      ? "mx-auto max-w-2xl"
      : reviews.length === 2
        ? "mx-auto max-w-5xl md:grid-cols-2"
        : "md:grid-cols-2 lg:grid-cols-3";

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
            SHISHIR BioVerse
          </p>

          <h2
            id="student-stories-heading"
            className="mt-5 text-3xl font-semibold leading-snug text-white sm:text-4xl"
          >
            শিক্ষার্থীদের অভিজ্ঞতা
          </h2>

          <p className="mt-4 text-base leading-8 text-slate-300">
            শিশির ভাইয়ার সঙ্গে জীববিজ্ঞান শেখা ও পরীক্ষার
            প্রস্তুতির অভিজ্ঞতা—শিক্ষার্থীদের নিজের কথায়।
          </p>
        </motion.div>

        {/* Reviews */}
        <div
          className={`mt-10 grid gap-6 lg:mt-12 ${gridClass}`}
        >
          {reviews.map((review) => (
            <motion.figure
              key={review.id}
              {...reveal}
              className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#101A2C] p-6 sm:p-8"
            >
              <Quote
                aria-hidden="true"
                size={32}
                strokeWidth={1.4}
                className="text-blue-400"
              />

              <blockquote className="mb-8 mt-6 flex-1">
                <p className="whitespace-pre-line text-base leading-8 text-slate-200">
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
                  <p className="break-words font-medium leading-7 text-white">
                    {review.name}
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