"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { UserRound, BookOpen } from "lucide-react";

type Teacher = {
  id: string;
  name: string | null;
  subject: string;
  description: string;
  image: string | null;
};

const teachers: Teacher[] = [
  {
    id: "biology",
    name: "মো. মাহফুজ শাহারিয়া শিশির",
    subject: "জীববিজ্ঞান",
    description:
      "অভিজ্ঞ শিক্ষক ও The Curious Classroom-এর প্রতিষ্ঠাতা।",
    image: "/teacher.png",
  },
  {
    id: "physics",
    name: null,
    subject: "পদার্থবিজ্ঞান",
    description:
      "বিষয়ভিত্তিক দক্ষতা ও নিয়মিত শিক্ষার্থী গাইডলাইন।",
    image: null,
  },
  {
    id: "chemistry",
    name: null,
    subject: "রসায়ন",
    description:
      "সহজ পদ্ধতিতে বিষয় বোঝানো এবং পরীক্ষাভিত্তিক প্রস্তুতি।",
    image: null,
  },
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
        <motion.div
          {...reveal}
          className="grid gap-5 lg:grid-cols-2 lg:items-end lg:gap-16"
        >
          <div>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-blue-400"
              />

              <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-300">
                Meet Our Educators
              </p>
            </div>

            <h2
              id="teachers-heading"
              className="mt-5 text-3xl font-semibold leading-snug text-white sm:text-4xl"
            >
              আমাদের শিক্ষকবৃন্দ
            </h2>
          </div>

          <p className="max-w-xl text-base leading-8 text-slate-300">
            অভিজ্ঞ শিক্ষকবৃন্দের তত্ত্বাবধানে বিষয়ভিত্তিক শিক্ষা,
            নিয়মিত মূল্যায়ন এবং ব্যক্তিগত দিকনির্দেশনা।
          </p>
        </motion.div>

        {/* Teacher profiles */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <motion.article
              key={teacher.id}
              {...reveal}
              aria-labelledby={`teacher-${teacher.id}`}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101A2C]"
            >
              {/* Portrait or neutral placeholder */}
              <div className="relative aspect-[4/3] overflow-hidden border-b border-white/10 bg-[#142138]">
                {teacher.image ? (
                  <Image
                    src={teacher.image}
                    alt={teacher.name ?? teacher.subject}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    className="object-contain object-bottom"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                    <div
                      aria-hidden="true"
                      className="flex h-20 w-20 items-center justify-center rounded-full border border-blue-300/15 bg-blue-300/5"
                    >
                      <UserRound
                        size={36}
                        strokeWidth={1.2}
                        className="text-blue-200/70"
                      />
                    </div>

                    <p className="text-sm text-slate-400">
                      {teacher.subject}
                    </p>
                  </div>
                )}
              </div>

              {/* Profile details */}
              <div className="flex flex-1 flex-col p-6 lg:p-7">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/15 bg-blue-400/5 px-3 py-1.5 text-xs font-medium text-blue-200">
                  <BookOpen
                    aria-hidden="true"
                    size={14}
                    strokeWidth={1.6}
                  />
                  {teacher.subject}
                </div>

                <h3
                  id={`teacher-${teacher.id}`}
                  className="mt-5 text-xl font-semibold leading-8 text-white"
                >
                  {teacher.name ?? `${teacher.subject} শিক্ষক`}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {teacher.description}
                </p>

                {!teacher.name && (
                  <p className="mt-auto pt-5 text-xs leading-6 text-slate-400">
                    বিস্তারিত পরিচিতি শিগগিরই যুক্ত হবে
                  </p>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}