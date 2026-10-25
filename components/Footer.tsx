import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  MessageCircle,
  MapPin,
  ArrowUpRight,
  Play,
} from "lucide-react";

const phone = "01346071073";
const phoneHref = "tel:+8801346071073";

const whatsappUrl = `https://wa.me/8801346071073?text=${encodeURIComponent(
  "আসসালামু আলাইকুম। Shishir BioVerse-এর ব্যাচ ও ক্লাসের লোকেশন জানতে চাই।"
)}`;

const channelUrl =
  "https://www.youtube.com/@TheCuriousClassroom-s2s";

const quickLinks = [
  { label: "আমাদের সম্পর্কে", href: "/about" },
  { label: "আমাদের ব্যাচ", href: "/courses" },
  { label: "শিক্ষক পরিচিতি", href: "/teachers" },
  { label: "ভর্তির আবেদন", href: "/admission" },
  { label: "ফলাফল", href: "/result" },
  { label: "শিক্ষার্থী লগইন", href: "/student/login" },
];

export default function Footer() {
  const focusStyle =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#070C16]";

  return (
    <footer className="border-t border-white/10 bg-[#070C16] px-5 pb-7 pt-14 text-slate-100 sm:px-6 lg:px-8 lg:pt-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr] lg:gap-16">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              aria-label="The Curious Classroom — হোম"
              className={`inline-flex rounded-xl bg-white px-4 py-3 ${focusStyle}`}
            >
              <Image
                src="/logo.png"
                alt="The Curious Classroom"
                width={170}
                height={60}
                sizes="150px"
                className="h-auto w-[150px]"
              />
            </Link>

            <div className="mt-6 border-l-2 border-blue-400/60 pl-4">
              <p className="text-xl font-semibold tracking-tight text-white">
                SHISHIR{" "}
                <span className="font-medium text-blue-300">
                  BioVerse
                </span>
              </p>

              <p className="mt-2 text-xs tracking-wide text-slate-400">
                Where Curiosity Meets Life
              </p>
            </div>

            <p className="mt-5 max-w-sm text-sm leading-8 text-slate-400">
              The Curious Classroom-এর জীববিজ্ঞান বিভাগ
              Shishir BioVerse। শিশির ভাইয়ার সরাসরি দিকনির্দেশনায়
              SSC ও HSC শিক্ষার্থীদের জন্য অফলাইন জীববিজ্ঞান
              ক্লাস, নিয়মিত অনুশীলন ও পরীক্ষার প্রস্তুতি।
            </p>

            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-6 inline-flex min-h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300 transition-colors hover:border-blue-400/30 hover:bg-blue-400/5 hover:text-white ${focusStyle}`}
            >
              <Play
                aria-hidden="true"
                size={16}
                strokeWidth={1.7}
                className="shrink-0 text-blue-300"
              />
              YouTube-এ ফ্রি ভিডিও
              <ArrowUpRight
                aria-hidden="true"
                size={16}
                className="shrink-0"
              />
              <span className="sr-only">
                — নতুন ট্যাবে খুলবে
              </span>
            </a>
          </div>

          {/* Navigation */}
          <nav aria-labelledby="footer-links-heading">
            <h2
              id="footer-links-heading"
              className="text-base font-semibold text-white"
            >
              গুরুত্বপূর্ণ লিংক
            </h2>

            <ul className="mt-5 space-y-1">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`inline-flex min-h-11 items-center rounded-md py-2 text-sm text-slate-400 transition-colors hover:text-blue-200 ${focusStyle}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h2 className="text-base font-semibold text-white">
              যোগাযোগ
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-400">
              ভর্তি, ক্লাসের সময়, ফি ও লোকেশন জানতে সরাসরি
              ফোন করুন অথবা WhatsApp-এ মেসেজ দিন।
            </p>

            <a
              href={phoneHref}
              className={`mt-4 inline-flex min-h-11 items-center gap-3 rounded-md py-2 text-lg font-medium text-slate-200 transition-colors hover:text-blue-200 ${focusStyle}`}
            >
              <Phone
                aria-hidden="true"
                size={18}
                className="shrink-0 text-blue-300"
              />
              {phone}
            </a>

            <div className="mt-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-400/25 bg-blue-400/5 px-4 py-2.5 text-sm font-medium text-blue-200 transition-colors hover:bg-blue-400/10 ${focusStyle}`}
              >
                <MessageCircle
                  aria-hidden="true"
                  size={18}
                  className="shrink-0"
                />
                WhatsApp-এ মেসেজ দিন
                <ArrowUpRight
                  aria-hidden="true"
                  size={16}
                  className="shrink-0"
                />
                <span className="sr-only">
                  — নতুন ট্যাবে খুলবে
                </span>
              </a>
            </div>

            <div className="mt-5 flex items-start gap-3 text-sm leading-7 text-slate-400">
              <MapPin
                aria-hidden="true"
                size={18}
                className="mt-1 shrink-0 text-blue-300"
              />
              <p>
                ক্লাসের ঠিকানা ও আসার নির্দেশনা ফোন বা
                WhatsApp-এ জানিয়ে দেওয়া হবে।
              </p>
            </div>

            <Link
              href="/contact"
              className={`mt-4 inline-flex min-h-11 items-center gap-2 rounded-md py-2 text-sm font-medium text-blue-300 transition-colors hover:text-blue-200 ${focusStyle}`}
            >
              যোগাযোগের বিস্তারিত
              <ArrowUpRight aria-hidden="true" size={17} />
            </Link>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-4">
              <p className="text-sm font-medium text-slate-200">
                SSC ও HSC · জীববিজ্ঞান
              </p>

              <p className="mt-1 text-xs leading-6 text-slate-400">
                নবম–দ্বাদশ শ্রেণি · অফলাইন ব্যাচ
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row lg:mt-16">
          <p className="text-center text-xs leading-6 text-slate-400 sm:text-left">
            © {new Date().getFullYear()} The Curious Classroom.
            {" "}সর্বস্বত্ব সংরক্ষিত।
          </p>

          <Link
            href="/admin/login"
            className={`inline-flex min-h-11 items-center rounded-md px-2 text-xs text-slate-400 transition-colors hover:text-white ${focusStyle}`}
          >
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}