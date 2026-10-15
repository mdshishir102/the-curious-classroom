import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
  Play,
} from "lucide-react";

const contact = {
  address: "",
  phone: "",
  phoneHref: "", // উদাহরণ: +8801XXXXXXXXX
  email: "",
};

const quickLinks = [
  { label: "আমাদের সম্পর্কে", href: "/about" },
  { label: "কোর্সসমূহ", href: "/courses" },
  { label: "শিক্ষকবৃন্দ", href: "/teachers" },
  { label: "ভর্তি করুন", href: "/admission" },
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

            <p className="mt-6 max-w-sm text-sm leading-8 text-slate-400">
              নবম–দশম ও একাদশ–দ্বাদশ শ্রেণির বিজ্ঞান বিভাগের
              শিক্ষার্থীদের জন্য অফলাইন ক্লাস ও ডিজিটাল শেখার
              সমন্বিত আধুনিক শিক্ষা প্ল্যাটফর্ম।
            </p>

            <a
              href="https://www.youtube.com/@TheCuriousClassroom-s2s"
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-6 inline-flex min-h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300 transition-colors hover:border-blue-400/30 hover:bg-blue-400/5 hover:text-white ${focusStyle}`}
            >
              <Play
                aria-hidden="true"
                size={16}
                strokeWidth={1.7}
                className="text-blue-300"
              />
              আমাদের YouTube চ্যানেল
              <ArrowUpRight aria-hidden="true" size={16} />
              <span className="sr-only">— নতুন ট্যাবে খুলবে</span>
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
              ভর্তি ও শিক্ষা কার্যক্রম সম্পর্কে বিস্তারিত জানতে
              আমাদের সঙ্গে যোগাযোগ করুন।
            </p>

            <address className="mt-5 space-y-4 text-sm not-italic leading-7 text-slate-300">
              {contact.address && (
                <div className="flex items-start gap-3">
                  <MapPin
                    aria-hidden="true"
                    size={18}
                    className="mt-1 shrink-0 text-blue-300"
                  />
                  <span>{contact.address}</span>
                </div>
              )}

              {contact.phone && (
                <div className="flex items-center gap-3">
                  <Phone
                    aria-hidden="true"
                    size={18}
                    className="shrink-0 text-blue-300"
                  />

                  <a
                    href={`tel:${
                      contact.phoneHref ||
                      contact.phone.replace(/[\s()-]/g, "")
                    }`}
                    className={`rounded-md py-2 transition-colors hover:text-blue-200 ${focusStyle}`}
                  >
                    {contact.phone}
                  </a>
                </div>
              )}

              {contact.email && (
                <div className="flex items-start gap-3">
                  <Mail
                    aria-hidden="true"
                    size={18}
                    className="mt-3 shrink-0 text-blue-300"
                  />

                  <a
                    href={`mailto:${contact.email}`}
                    className={`min-w-0 break-words rounded-md py-2 transition-colors hover:text-blue-200 ${focusStyle}`}
                  >
                    {contact.email}
                  </a>
                </div>
              )}
            </address>

            <Link
              href="/contact"
              className={`mt-5 inline-flex min-h-11 items-center gap-2 rounded-md py-2 text-sm font-medium text-blue-300 transition-colors hover:text-blue-200 ${focusStyle}`}
            >
              যোগাযোগের বিস্তারিত
              <ArrowUpRight aria-hidden="true" size={17} />
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row lg:mt-16">
          <p className="text-center text-xs leading-6 text-slate-400 sm:text-left">
            © {new Date().getFullYear()} The Curious Classroom.
            সর্বস্বত্ব সংরক্ষিত।
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