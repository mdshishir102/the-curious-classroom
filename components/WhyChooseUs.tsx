"use client";

import {
  BookOpen,
  GraduationCap,
  ChartNoAxesCombined,
  Monitor,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const features = [
  {
    number: "01",
    title: "ধারণাভিত্তিক শিক্ষা",
    description:
      "প্রতিটি বিষয় সহজভাবে বুঝে শেখা এবং নিয়মিত অনুশীলনের মাধ্যমে শক্ত ভিত্তি তৈরি করা।",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "অভিজ্ঞ শিক্ষকের গাইডলাইন",
    description:
      "দক্ষ ও অভিজ্ঞ শিক্ষকদের নিয়মিত তত্ত্বাবধান এবং ব্যক্তিগত সহযোগিতা।",
    icon: GraduationCap,
  },
  {
    number: "03",
    title: "নিয়মিত পরীক্ষা ও মূল্যায়ন",
    description:
      "পরিকল্পিত পরীক্ষায় অগ্রগতি পর্যবেক্ষণ এবং দুর্বল বিষয়গুলোতে উন্নতির নির্দেশনা।",
    icon: ChartNoAxesCombined,
  },
  {
    number: "04",
    title: "আধুনিক শিক্ষা ব্যবস্থা",
    description:
      "অফলাইন ক্লাসের পাশাপাশি অনলাইন সুবিধায় নিজের সুবিধামতো শেখার সুযোগ।",
    icon: Monitor,
  },
];

export default function WhyChooseUs() {
  const reduceMotion = useReducedMotion();

  const reveal = {
    initial: {
      opacity: reduceMotion ? 1 : 0,
      y: reduceMotion ? 0 : 18,
    },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: reduceMotion ? 0 : 0.5 },
  };

  return (
    <section
      aria-labelledby="why-choose-heading"
      className="border-b border-white/10 bg-[#080D19] px-5 py-16 text-slate-100 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.4fr] lg:gap-16">
        {/* Introduction */}
        <motion.div {...reveal} className="lg:pt-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-8 bg-blue-400"
            />
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-300">
              The Way We Teach
            </p>
          </div>

          <h2
            id="why-choose-heading"
            className="mt-5 text-3xl font-semibold leading-snug tracking-tight text-white sm:text-4xl"
          >
            কেন
            <span className="mt-2 block">
              The Curious
              <br />
              Classroom?
            </span>
          </h2>

          <p className="mt-5 max-w-md text-base leading-8 text-slate-300">
            শিক্ষার্থীদের শেখার আগ্রহ, দক্ষতা ও আত্মবিশ্বাস গড়ে
            তুলতে আমাদের শিক্ষা পদ্ধতির চারটি ভিত্তি।
          </p>

          <div className="mt-8 border-l-2 border-blue-400/60 pl-5">
            <p className="text-lg font-medium leading-8 text-blue-200">
              বুঝে শেখা।
              <br />
              অনুশীলনে এগিয়ে যাওয়া।
            </p>
          </div>
        </motion.div>

        {/* Teaching principles */}
        <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.number}
                {...reveal}
                className="bg-[#0E1728] p-6 sm:p-7 lg:p-8"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/5">
                    <Icon
                      aria-hidden="true"
                      size={23}
                      strokeWidth={1.5}
                      className="text-blue-300"
                    />
                  </div>

                  <span
                    aria-hidden="true"
                    className="text-xs font-medium tracking-[0.15em] text-slate-500"
                  >
                    {feature.number}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-semibold leading-8 text-slate-50">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
                  {feature.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}