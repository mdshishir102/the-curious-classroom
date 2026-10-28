"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardList,
  Sparkles,
  CheckCircle2,
  Clock,
  BarChart3,
  Trophy,
} from "lucide-react";

const upcomingFeatures = [
  {
    icon: CheckCircle2,
    title: "MCQ ও CQ উভয় পরীক্ষা",
    description: "একাধিক ফরম্যাটে পরীক্ষা দেওয়ার সুবিধা",
  },
  {
    icon: Clock,
    title: "Instant Result",
    description: "পরীক্ষা শেষেই সাথে সাথে ফলাফল",
  },
  {
    icon: BarChart3,
    title: "বিস্তারিত বিশ্লেষণ",
    description: "ভুল উত্তর ও দুর্বল জায়গা চিহ্নিত করা",
  },
  {
    icon: Trophy,
    title: "Rank & Leaderboard",
    description: "ক্লাসমেটদের সাথে তুলনামূলক অবস্থান",
  },
];

export default function ExamsPage() {
  return (
    <div className="min-h-screen bg-[#080D19] px-5 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Back link */}
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19] rounded-md"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard-এ ফিরে যাও
        </Link>

        {/* Header */}
        <div className="mt-6 mb-8">
          <div className="flex items-center gap-2">
            <span className="h-px w-7 bg-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              Examination Module
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Online Exams
          </h1>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            তোমার জন্য একটি সম্পূর্ণ অনলাইন পরীক্ষা ব্যবস্থা তৈরি হচ্ছে।
          </p>
        </div>

        {/* Main coming soon card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card-lift rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)] p-8 sm:p-12 text-center relative overflow-hidden"
        >
          {/* subtle glow background */}
          <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10"
          >
            <ClipboardList className="h-10 w-10 text-blue-300" />
          </motion.div>

          <h2 className="relative text-2xl font-semibold text-white sm:text-3xl">
            পরীক্ষা মডিউল শীঘ্রই আসছে
          </h2>

          <p className="relative mt-4 text-sm text-slate-400 sm:text-base max-w-md mx-auto">
            আমাদের অনলাইন পরীক্ষা ব্যবস্থাটি এখনো তৈরি হচ্ছে। সম্পূর্ণ হলেই তুমি
            এখান থেকে সরাসরি পরীক্ষা দিতে পারবে।
          </p>

          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="relative mt-8 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-gradient-to-r from-blue-500/20 to-violet-500/20 px-6 py-3 text-sm font-semibold text-blue-200"
          >
            <Sparkles className="h-4 w-4" />
            Development চলছে
          </motion.div>

          <p className="relative mt-5 text-xs text-slate-500">
            নতুন ফিচার আসার সাথে সাথে তোমাকে জানিয়ে দেওয়া হবে।
          </p>
        </motion.div>

        {/* Feature preview grid */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-px w-7 bg-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              যা যা থাকবে
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {upcomingFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="card-lift rounded-2xl border border-white/[0.07] bg-[#101A2C] p-5 flex items-start gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/10">
                    <Icon className="h-5 w-5 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          The Curious Classroom · Student Learning Portal
        </div>
      </div>
    </div>
  );
}