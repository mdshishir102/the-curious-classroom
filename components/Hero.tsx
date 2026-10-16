import Link from "next/link";
import Image from "next/image";

const programs = [
  {
    number: "01",
    title: "SSC জীববিজ্ঞান",
    classes: "নবম–দশম শ্রেণি",
    description:
      "জীববিজ্ঞানের ভিত্তি বুঝে শেখা ও অধ্যায়ভিত্তিক অনুশীলন।",
  },
  {
    number: "02",
    title: "HSC জীববিজ্ঞান",
    classes: "একাদশ–দ্বাদশ শ্রেণি",
    description:
      "জীববিজ্ঞানের ধারণা পরিষ্কার করে বোর্ড পরীক্ষার প্রস্তুতি।",
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
            "radial-gradient(ellipse at 85% 40%, rgba(37,99,235,0.14), transparent 55%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        {/* Brand and introduction */}
        <div>
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-8 shrink-0 bg-blue-400"
            />

            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-blue-300 sm:text-xs">
              The Curious Classroom
            </p>
          </div>

         




<div className="mt-8 w-full max-w-[420px] rounded-2xl border border-white/20 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.2)] sm:p-6">
  <div className="relative h-28 w-full sm:h-36">
    <Image
      src="/shishir-bioverse.png"
      alt="SHISHIR BioVerse"
      fill
      priority
      sizes="(max-width: 640px) 100vw, 420px"
      className="object-contain"
    />
  </div>
</div>







<h1
  id="hero-heading"
  className="mt-7 text-3xl font-semibold leading-[1.6] text-slate-100 sm:text-4xl"
>
  শিশিরের ভাইয়ার সঙ্গে
  <br />
  বুঝে শেখো জীববিজ্ঞান।
</h1>







          <p className="mt-5 max-w-lg text-base leading-8 text-slate-300 sm:text-lg sm:leading-9">
            The Curious Classroom-এর জীববিজ্ঞান বিভাগ।
            নবম–দশম ও একাদশ–দ্বাদশ শ্রেণির শিক্ষার্থীদের জন্য
            শিশিরের সরাসরি গাইডলাইনে অফলাইন ক্লাস।
          </p>

          <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-blue-400/20 bg-blue-400/[0.06] px-4 py-2">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-blue-400"
            />
            <p className="text-xs font-medium text-blue-200 sm:text-sm">
              SSC ও HSC · জীববিজ্ঞান · অফলাইন ব্যাচ
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admission"
              className={`inline-flex min-h-12 items-center justify-center gap-4 rounded-xl bg-blue-600 px-7 py-3.5 font-medium text-white transition-colors hover:bg-blue-500 ${focusStyle}`}
            >
              ভর্তির আবেদন
              <ArrowIcon />
            </Link>

            <Link
              href="/student/login"
              className={`inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-7 py-3.5 font-medium text-slate-200 transition-colors hover:border-blue-400/40 hover:bg-white/5 hover:text-white ${focusStyle}`}
            >
              শিক্ষার্থী লগইন
            </Link>
          </div>

          <div className="mt-9 border-t border-white/10 pt-6">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
              Where Curiosity Meets Life
            </p>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              শ্রেণিকক্ষে শেখা, প্রশ্ন করা ও বুঝে এগিয়ে যাওয়ার সঙ্গে।
            </p>
          </div>
        </div>

        {/* Offline batches */}
        <div className="mx-auto w-full max-w-xl lg:max-w-none">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0E1728] shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-blue-300 sm:text-xs">
                  Biology with Shishir
                </p>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-300">
                  অফলাইন ক্লাস
                </span>
              </div>

              <h2 className="mt-6 text-2xl font-semibold leading-snug text-white sm:text-3xl">
                তোমার জীববিজ্ঞান ব্যাচ
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                স্কুল থেকে কলেজ—প্রতিটি ধাপে বুঝে শেখার প্রস্তুতি।
              </p>

              <div className="mt-7 space-y-4">
                {programs.map((program) => (
                  <article
                    key={program.number}
                    className="rounded-2xl border border-white/10 bg-[#131F33] p-5 transition-colors hover:border-blue-400/30 sm:p-6"
                  >
                    <div className="flex items-start gap-4">
                      <span className="pt-1 text-xs font-medium tracking-wider text-blue-300">
                        {program.number}
                      </span>

                      <div className="min-w-0">
                        <h3 className="text-xl font-semibold text-slate-50">
                          {program.title}
                        </h3>

                        <p className="mt-2 text-sm text-blue-200">
                          {program.classes}
                        </p>

                        <p className="mt-3 text-sm leading-7 text-slate-400">
                          {program.description}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-blue-400/10 bg-blue-400/[0.04] px-4 py-4">
                <p className="text-sm leading-7 text-slate-300">
                  সরাসরি ক্লাসে অংশ নাও, প্রশ্ন করো এবং
                  জীববিজ্ঞানের বিষয়গুলো বুঝে শেখো।
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 bg-[#101C30] p-4 sm:px-6">
              <Link
                href="/admission"
                className={`flex min-h-12 items-center justify-between gap-4 rounded-lg px-2 py-3 text-sm font-medium text-blue-200 transition-colors hover:bg-white/5 hover:text-white ${focusStyle}`}
              >
                ব্যাচে যোগ দিতে আবেদন করো
                <ArrowIcon />
              </Link>
            </div>
          </div>

          <p className="mt-5 text-center text-xs tracking-wide text-slate-400">
            কৌতূহল · উপলব্ধি · অনুশীলন
          </p>
        </div>
      </div>
    </section>
  );
}