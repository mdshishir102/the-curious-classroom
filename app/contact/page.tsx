import Link from "next/link";
import {
  Phone,
  MessageCircle,
  ArrowUpRight,
  BookOpen,
  Play,
  MapPin,
} from "lucide-react";

const phone = "01346071073";
const phoneHref = "tel:+8801346071073";

const whatsappUrl = `https://wa.me/8801346071073?text=${encodeURIComponent(
  "আসসালামু আলাইকুম। Shishir BioVerse-এর ব্যাচ ও ক্লাসের লোকেশন জানতে চাই।"
)}`;

const channelUrl =
  "https://www.youtube.com/@TheCuriousClassroom-s2s";

export default function ContactPage() {
  const focusStyle =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#101A2C]";

  return (
    <main className="min-h-screen bg-[#080D19] text-slate-100">
      {/* Introduction */}
      <section
        aria-labelledby="contact-heading"
        className="relative overflow-hidden border-b border-white/10 px-5 py-16 sm:px-6 lg:px-8 lg:py-24"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.16), transparent 65%)",
          }}
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-300">
            The Curious Classroom
          </p>

          <h1
            id="contact-heading"
            className="mt-6 text-4xl font-semibold leading-snug text-white sm:text-5xl"
          >
            যোগাযোগ করুন
          </h1>

          <p className="mt-6 text-base leading-8 text-slate-300 sm:text-lg sm:leading-9">
            Shishir BioVerse-এর SSC ও HSC জীববিজ্ঞান ব্যাচে
            ভর্তি, ক্লাসের সময়, ফি ও লোকেশন জানতে সরাসরি
            ফোন করুন অথবা WhatsApp-এ মেসেজ দিন।
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {["SSC ও HSC", "জীববিজ্ঞান", "অফলাইন ক্লাস"].map(
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
        </div>
      </section>

      {/* Contact information */}
      <section
        aria-labelledby="contact-details-heading"
        className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24"
      >
        <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <div>
            <h2
              id="contact-details-heading"
              className="text-2xl font-semibold text-white sm:text-3xl"
            >
              সরাসরি শিশিরের সঙ্গে যোগাযোগ
            </h2>

            <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">
              যোগাযোগের সময় শিক্ষার্থীর শ্রেণি ও SSC বা HSC
              পরীক্ষার বছর জানালে উপযুক্ত ব্যাচের তথ্য দিতে
              সুবিধা হবে।
            </p>

            <div className="mt-8 space-y-4">
              {/* Phone */}
              <article className="rounded-2xl border border-white/10 bg-[#101A2C] p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                    <Phone aria-hidden="true" size={21} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-medium text-white">
                      ফোন করুন
                    </h3>

                    <a
                      href={phoneHref}
                      className={`mt-2 inline-flex min-h-11 items-center rounded-md text-xl font-semibold tracking-wide text-blue-200 transition-colors hover:text-white ${focusStyle}`}
                    >
                      {phone}
                    </a>

                    <p className="mt-1 text-sm leading-7 text-slate-400">
                      ব্যাচ, ভর্তি ও ক্লাসের বিস্তারিত জানতে।
                    </p>
                  </div>
                </div>
              </article>

              {/* WhatsApp */}
              <article className="rounded-2xl border border-white/10 bg-[#101A2C] p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                    <MessageCircle aria-hidden="true" size={21} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-medium text-white">
                      WhatsApp-এ মেসেজ দিন
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      আপনার প্রশ্ন লিখে পাঠান। ব্যাচের তথ্য ও
                      ক্লাসের লোকেশন জানতে পারবেন।
                    </p>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-400/25 bg-blue-400/5 px-4 py-2.5 text-sm font-medium text-blue-200 transition-colors hover:bg-blue-400/10 ${focusStyle}`}
                    >
                      WhatsApp খুলুন
                      <ArrowUpRight aria-hidden="true" size={17} />
                      <span className="sr-only">
                        — নতুন ট্যাবে খুলবে
                      </span>
                    </a>
                  </div>
                </div>
              </article>

              {/* Location */}
              <article className="rounded-2xl border border-white/10 bg-[#101A2C] p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                    <MapPin aria-hidden="true" size={21} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-medium text-white">
                      ক্লাসের লোকেশন
                    </h3>

                    <p className="mt-3 text-sm leading-8 text-slate-300">
                      ক্লাসে আসার আগে ফোন করুন অথবা WhatsApp-এ
                      মেসেজ দিন। ঠিকানা ও আসার নির্দেশনা সরাসরি
                      জানিয়ে দেওয়া হবে।
                    </p>
                  </div>
                </div>
              </article>

              {/* YouTube */}
              <article className="rounded-2xl border border-white/10 bg-[#101A2C] p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                    <Play aria-hidden="true" size={21} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-medium text-white">
                      YouTube-এ ফ্রি ভিডিও
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      চ্যানেলের নতুন ভিডিওগুলো দেখুন।
                    </p>

                    <a
                      href={channelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-3 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-medium text-blue-300 hover:text-blue-200 ${focusStyle}`}
                    >
                      চ্যানেলে যান
                      <ArrowUpRight aria-hidden="true" size={17} />
                      <span className="sr-only">
                        — নতুন ট্যাবে খুলবে
                      </span>
                    </a>
                  </div>
                </div>
              </article>
            </div>
          </div>

          {/* Admission */}
          <aside className="rounded-3xl border border-blue-400/20 bg-[#101A2C] p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/10 text-blue-300">
              <BookOpen aria-hidden="true" size={24} />
            </div>

            <p className="mt-6 text-sm font-medium text-blue-200">
              <span className="font-bold tracking-[0.1em]">
                SHISHIR
              </span>{" "}
              BioVerse
            </p>

            <h2 className="mt-4 text-2xl font-semibold leading-snug text-white">
              অফলাইন ব্যাচে ভর্তি
            </h2>

            <p className="mt-4 text-sm leading-8 text-slate-300">
              নবম থেকে দ্বাদশ শ্রেণির জীববিজ্ঞান শেখার জন্য
              শিশিরের সরাসরি দিকনির্দেশনায় যুক্ত হোন। ভর্তি
              আবেদন ফর্মে শিক্ষার্থীর তথ্য জমা দিতে পারেন।
            </p>

            <dl className="mt-6 space-y-4 border-y border-white/10 py-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">বিষয়</dt>
                <dd>জীববিজ্ঞান</dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">শ্রেণি</dt>
                <dd>নবম–দ্বাদশ</dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">ক্লাসের ধরন</dt>
                <dd>অফলাইন</dd>
              </div>
            </dl>

            <Link
              href="/admission"
              className={`mt-7 flex min-h-12 items-center justify-between gap-3 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 ${focusStyle}`}
            >
              ভর্তির আবেদন
              <ArrowUpRight aria-hidden="true" size={19} />
            </Link>

            <Link
              href="/courses"
              className={`mt-3 flex min-h-12 items-center justify-center rounded-xl px-5 py-3 text-sm font-medium text-blue-200 transition-colors hover:bg-white/5 hover:text-white ${focusStyle}`}
            >
              ব্যাচগুলো দেখুন
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}