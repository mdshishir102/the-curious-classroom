import Hero from "@/components/Hero";
import Programs from "@/components/Programs";
import WhyChooseUs from "@/components/WhyChooseUs";
import LearningExperience from "@/components/LearningExperience";
import YoutubeClasses from "@/components/YoutubeClasses";
import Teachers from "@/components/Teachers";
import StudentSuccess from "@/components/StudentSuccess";
import AdmissionCTA from "@/components/AdmissionCTA";
import GameLauncher from "@/components/biology-world/GameLauncher";
import { Gamepad2, Sparkles, Map, Coins } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080D19]">
      <Hero />
      <Programs />
      <WhyChooseUs />
      <LearningExperience />
      <YoutubeClasses />
      <Teachers />
      <StudentSuccess />

      {/* 🎮 BIOLOGY WORLD SECTION */}
      <section className="relative py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="card-lift relative overflow-hidden rounded-3xl border border-white/[0.09] bg-[#101A2C] p-8 md:p-10 text-center shadow-[0_16px_50px_rgba(0,0,0,0.12)]">
            {/* Decorative glow */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
                <Gamepad2 className="h-7 w-7 text-blue-300" />
              </div>

              <div className="mb-3 flex justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/15 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-violet-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Break Time
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-semibold text-white">
                Biology World এ ঘুরে আসো
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
                পড়ার ফাঁকে একটু বিশ্রাম নাও! কোষের ভেতরে ঘুরে বেড়াও, মজার fun fact
                আবিষ্কার করো — আর তোমার প্রিয় স্যারকে গেমের ভেতরেই খুঁজে পাও! 😄
              </p>

              {/* Mini feature hints */}
              <div className="mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-[#0B1425] px-3 py-1.5 text-xs text-slate-300">
                  <Map className="h-3.5 w-3.5 text-emerald-400" />
                  ঘুরে বেড়াও
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-[#0B1425] px-3 py-1.5 text-xs text-slate-300">
                  <Coins className="h-3.5 w-3.5 text-amber-400" />
                  Fun Fact কুড়াও
                </span>
              </div>

              <div className="mt-7 flex justify-center">
                <GameLauncher />
              </div>

              <p className="mt-4 text-xs text-slate-500">
                সম্পূর্ণ ফ্রি • কোনো লগইন লাগবে না
              </p>
            </div>
          </div>
        </div>
      </section>

      <AdmissionCTA />
    </main>
  );
}