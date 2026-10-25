import { School, BookOpen, Check } from "lucide-react";

const learningSteps = [
  {
    id: "classroom",
    label: "LEARN IN THE CLASSROOM",
    title: "ক্লাসে বুঝে শেখা",
    description:
      "শিশির ভাইয়ার সরাসরি পাঠদানে জীববিজ্ঞানের প্রতিটি বিষয় ধাপে ধাপে বোঝা।",
    icon: School,
    features: [
      "পাঠ্যবইয়ের অধ্যায়ভিত্তিক আলোচনা",
      "চিত্র ও জৈবিক প্রক্রিয়ার সহজ ব্যাখ্যা",
      "সরাসরি প্রশ্ন ও উত্তর নিয়ে আলোচনা",
      "বুঝতে অসুবিধা হওয়া বিষয়ে গাইডলাইন",
    ],
  },
  {
    id: "practice",
    label: "PRACTICE AND REVIEW",
    title: "অনুশীলনে প্রস্তুতি",
    description:
      "ক্লাসে শেখা বিষয়গুলো অনুশীলন করে নিজের প্রস্তুতি যাচাই করা।",
    icon: BookOpen,
    features: [
      "অধ্যায়ভিত্তিক প্রশ্নের অনুশীলন",
      "নিয়মিত পরীক্ষা ও মূল্যায়ন",
      "উত্তরের ভুলগুলো চিহ্নিত করে সংশোধন",
      "দুর্বল বিষয়গুলোতে উন্নতির নির্দেশনা",
    ],
  },
];

export default function LearningExperience() {
  return (
    <section
      aria-labelledby="learning-heading"
      className="border-b border-white/10 bg-[#0B1220] px-5 py-16 text-slate-100 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-300">
            Inside SHISHIR BioVerse
          </p>

          <h2
            id="learning-heading"
            className="mt-5 text-3xl font-semibold leading-[1.4] text-white sm:text-4xl"
          >
            শ্রেণিকক্ষে বোঝা,
            <span className="mt-2 block text-blue-400">
              অনুশীলনে এগিয়ে যাওয়া
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-slate-300">
            SSC ও HSC জীববিজ্ঞানের অফলাইন ক্লাসে শেখা থেকে
            পরীক্ষার প্রস্তুতি—প্রতিটি ধাপে শিশির ভাইয়ার গাইডলাইন।
          </p>
        </div>

        {/* Learning panel */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-[#101A2C] lg:mt-12">
          <div className="grid md:grid-cols-2">
            {learningSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.id}
                  aria-labelledby={`learning-${step.id}-heading`}
                  className={`p-6 sm:p-8 lg:p-12 ${
                    index === 1
                      ? "border-t border-white/10 md:border-l md:border-t-0"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/10">
                      <Icon
                        aria-hidden="true"
                        size={24}
                        strokeWidth={1.5}
                        className="text-blue-300"
                      />
                    </div>

                    <p className="text-[10px] font-medium uppercase leading-5 tracking-[0.15em] text-slate-400 sm:text-xs">
                      {step.label}
                    </p>
                  </div>

                  <h3
                    id={`learning-${step.id}-heading`}
                    className="mt-7 text-2xl font-semibold leading-snug text-white"
                  >
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400 sm:text-base">
                    {step.description}
                  </p>

                  <ul className="mt-7 space-y-4">
                    {step.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm leading-7 text-slate-200 sm:text-base"
                      >
                        <Check
                          aria-hidden="true"
                          size={17}
                          strokeWidth={1.8}
                          className="mt-1 shrink-0 text-blue-400"
                        />

                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>

          {/* Shared purpose */}
          <div className="border-t border-white/10 bg-[#0D1626] px-6 py-5 text-center">
            <p className="text-sm leading-7 text-slate-300">
              বুঝে শেখা
              <span
                aria-hidden="true"
                className="mx-3 text-blue-400"
              >
                ·
              </span>
              নিয়মিত অনুশীলন
              <span
                aria-hidden="true"
                className="mx-3 text-blue-400"
              >
                ·
              </span>
              নিজের প্রস্তুতি যাচাই
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}