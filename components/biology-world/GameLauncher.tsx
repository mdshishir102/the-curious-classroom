"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Gamepad2, X } from "lucide-react";

const PhaserGame = dynamic(() => import("./PhaserGame"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#080D19] text-slate-300 text-sm">
      গেম লোড হচ্ছে...
    </div>
  ),
});

export default function GameLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-blue-500 hover:to-violet-500 hover:scale-[1.02] active:scale-[0.98]"
      >
        <Gamepad2 className="h-5 w-5" />
        Biology World এ ঘুরে আসো
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="relative h-full w-full max-w-5xl mx-auto md:h-[88vh] md:rounded-3xl overflow-hidden border border-white/10 bg-[#080D19] shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-20 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition"
            >
              <X className="h-5 w-5" />
            </button>
            <PhaserGame />
          </div>
        </div>
      )}
    </>
  );
}