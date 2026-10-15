import Link from "next/link";

const programs = [
  {
    number: "01",
    title: "SSC বিজ্ঞান",
    classes: "নবম–দশম শ্রেণি",
    description: "বিষয়ভিত্তিক শেখা ও নিয়মিত অনুশীলন",
  },
  {
    number: "02",
    title: "HSC বিজ্ঞান",
    classes: "একাদশ–দ্বাদশ শ্রেণি",
    description: "ধারণা পরিষ্কার করে পরীক্ষার প্রস্তুতি",
  },
];

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function Hero() {
  const focusStyle =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#080D19]";

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden border-b border-white/10 bg-[#080D19] px-5 py-16 text-white sm:px-6 lg:px-8 lg:py-24"
    >
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 85% 45%, rgba(37,99,235,0.12), transparent 55%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        {/* Introduction */}
        <div>
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-8 bg-blue-400"
            />
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-blue-300 sm:text-xs">
              The Curious Classroom
            </p>
          </div>

          <h1
            id="hero-heading"
            className="mt-7 text-4xl font-bold leading-[1.4] tracking-tight text-slate-50 sm:text-5xl xl:text-[56px]"
          >
            কৌতূহল থেকে শুরু হোক
            <span className="mt-2 block text-blue-400">
              সফলতার যাত্রা
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-8 text-slate-300 sm:text-lg sm:leading-9">
            নবম থেকে দ্বাদশ শ্রেণির বিজ্ঞান বিভাগের জন্য অভিজ্ঞ
            শিক্ষকদের নির্দেশনা, নিয়মিত পরীক্ষা ও ব্যক্তিগত যত্ন।
            অনলাইন এবং অফলাইন—একসঙ্গে।
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admission"
              className={`inline-flex min-h-12 items-center justify-center gap-4 rounded-xl bg-blue-600 px-7 py-3.5 font-medium text-white transition-colors hover:bg-blue-500 ${focusStyle}`}
            >
              ভর্তি করুন
              <ArrowIcon />
            </Link>

            <Link
              href="/student/login"
              className={`inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-7 py-3.5 font-medium text-slate-200 transition-colors hover:border-blue-400/40 hover:bg-white/5 hover:text-white ${focusStyle}`}
            >
              শিক্ষার্থী লগইন
            </Link>
          </div>

          <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-6 border-t border-white/10 pt-7">
            <div className="flex flex-col">
              <dt className="mt-2 text-sm text-slate-400">
                শিক্ষার্থী
              </dt>
              <dd className="order-first text-3xl font-semibold text-white">
                200<span className="text-blue-400">+</span>
              </dd>
            </div>

            <div className="flex flex-col border-l border-white/10 pl-8">
              <dt className="mt-2 text-sm text-slate-400">
                সমন্বিত শিক্ষা ব্যবস্থা
              </dt>
              <dd className="order-first text-xl font-medium leading-9 text-white">
                Offline <span className="text-blue-400">+</span> Online
              </dd>
            </div>
          </dl>
        </div>

        {/* Learning programs panel */}
        <div className="mx-auto w-full max-w-xl lg:max-w-none">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0E1728] shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-blue-300 sm:text-xs">
                  Learn with curiosity
                </p>

                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-blue-400"
                />
              </div>

              <h2 className="mt-5 text-2xl font-semibold leading-snug text-white sm:text-3xl">
                তোমার পরবর্তী ধাপ
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                সঠিক ভিত্তি থেকে আত্মবিশ্বাসী প্রস্তুতি।
              </p>

              <div className="mt-7 space-y-3">
                {programs.map((program) => (
                  <article
                    key={program.number}
                    className="rounded-2xl border border-white/10 bg-[#131F33] p-5 sm:p-6"
                  >
                    <div className="flex items-start gap-4">
                      <span className="pt-1 text-xs font-medium tracking-wider text-blue-300">
                        {program.number}
                      </span>

                      <div className="min-w-0">
                        <h3 className="text-xl font-semibold text-slate-50">
                          {program.title}
                        </h3>

                        <p className="mt-1 text-sm text-blue-200">
                          {program.classes}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-slate-400">
                          {program.description}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
                {[
                  "নিয়মিত পরীক্ষা",
                  "ক্লাস নোট",
                  "ব্যক্তিগত গাইডলাইন",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-xs leading-6 text-slate-300 sm:text-sm"
                  >
                    <svg
                      aria-hidden="true"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 text-blue-400"
                    >
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-white/10 bg-[#101C30] p-4 sm:px-6">
              <Link
                href="/courses"
                className={`flex min-h-12 items-center justify-between gap-4 rounded-lg px-2 py-3 text-sm font-medium text-blue-200 transition-colors hover:bg-white/5 hover:text-white ${focusStyle}`}
              >
                কোর্সসমূহ দেখুন
                <ArrowIcon />
              </Link>
            </div>
          </div>

          <p className="mt-5 text-center text-xs tracking-wide text-slate-400">
            কৌতূহল · অনুশীলন · আত্মবিশ্বাস
          </p>
        </div>
      </div>
    </section>
  );
}