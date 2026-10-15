import { School, MonitorPlay, Check } from "lucide-react";

const learningModes = [
  {
    id: "offline",
    label: "IN THE CLASSROOM",
    title: "অফলাইন ক্লাসরুম",
    description: "সরাসরি অংশগ্রহণ, ব্যক্তিগত সহযোগিতা।",
    icon: School,
    features: [
      "সরাসরি শিক্ষকের দিকনির্দেশনা",
      "নিয়মিত ক্লাস ও পরীক্ষা",
      "প্রশ্নোত্তর ও ইন্টার‌্যাক্টিভ শেখার সুযোগ",
      "ব্যক্তিগত দুর্বলতা চিহ্নিত করে সহযোগিতা",
    ],
  },
  {
    id: "online",
    label: "BEYOND THE CLASSROOM",
    title: "অনলাইন লার্নিং",
    description: "নিজের সময়ে, নিজের গতিতে শেখা।",
    icon: MonitorPlay,
    features: [
      "রেকর্ডেড ক্লাস সুবিধা",
      "ডিজিটাল নোট ও শিক্ষাসামগ্রী",
      "পরীক্ষার আগে রিভিশন সাপোর্ট",
      "যেকোনো সময় শেখার সুযোগ",
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
            A Connected Learning Experience
          </p>

          <h2
            id="learning-heading"
            className="mt-5 text-3xl font-semibold leading-[1.4] text-white sm:text-4xl"
          >
            অফলাইন ও অনলাইন শিক্ষার
            <span className="block text-blue-400">
              সমন্বিত অভিজ্ঞতা
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-slate-300">
            শ্রেণিকক্ষের শিক্ষার সঙ্গে আধুনিক ডিজিটাল সুবিধার
            সমন্বয়ে আরও কার্যকর শেখার পরিবেশ।
          </p>
        </div>

        {/* Unified learning panel */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-[#101A2C] lg:mt-12">
          <div className="grid md:grid-cols-2">
            {learningModes.map((mode, index) => {
              const Icon = mode.icon;

              return (
                <article
                  key={mode.id}
                  aria-labelledby={`${mode.id}-heading`}
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
                      {mode.label}
                    </p>
                  </div>

                  <h3
                    id={`${mode.id}-heading`}
                    className="mt-7 text-2xl font-semibold leading-snug text-white"
                  >
                    {mode.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400 sm:text-base">
                    {mode.description}
                  </p>

                  <ul className="mt-7 space-y-4">
                    {mode.features.map((feature) => (
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
              শ্রেণিকক্ষে বুঝে শেখা
              <span
                aria-hidden="true"
                className="mx-3 text-blue-400"
              >
                +
              </span>
              অনলাইনে আরও অনুশীলন
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}