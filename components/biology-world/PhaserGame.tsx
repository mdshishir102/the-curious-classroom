"use client";

import { useEffect, useRef, useState } from "react";
import type Phaser from "phaser";
import { createCircularAvatarDataUrl } from "./utils/circularAvatar";

export default function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [factText, setFactText] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let destroyed = false;

    async function initGame() {
      try {
        const avatarUrl = await createCircularAvatarDataUrl("/avatar.png", 128);

        const PhaserLib = (await import("phaser")).default;
        const { CellCityScene } = await import("./scenes/CellCityScene");

        if (destroyed || !containerRef.current) return;

        const scene = new CellCityScene(
          { onFact: (text: string) => setFactText(text) },
          avatarUrl
        );

        const config: Phaser.Types.Core.GameConfig = {
          type: PhaserLib.AUTO,
          parent: containerRef.current,
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
          backgroundColor: "#0b1f14",
          physics: {
            default: "arcade",
            arcade: { gravity: { x: 0, y: 0 }, debug: false },
          },
          scene: [scene],
          scale: {
            mode: PhaserLib.Scale.RESIZE,
            autoCenter: PhaserLib.Scale.CENTER_BOTH,
          },
        };

        gameRef.current = new PhaserLib.Game(config);
        setReady(true);
      } catch (err: any) {
        console.error("Biology World init error:", err);
        setErrorMsg(err?.message || "গেম লোড করতে সমস্যা হয়েছে");
      }
    }

    initGame();

    return () => {
      destroyed = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {!ready && !errorMsg && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-sm">
          জগৎ তৈরি হচ্ছে...
        </div>
      )}

      {errorMsg && (
        <div className="absolute inset-0 flex items-center justify-center text-red-300 text-sm px-6 text-center">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl bg-black/50 px-4 py-2 text-xs text-white backdrop-blur-sm">
        🎮 Arrow keys / WASD দিয়ে হাঁটুন • মোবাইলে টাচ করে ড্র্যাগ করুন
      </div>

      {factText && (
        <div className="absolute inset-x-4 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[420px] rounded-2xl border border-emerald-400/30 bg-[#101A2C]/95 p-5 shadow-2xl backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm leading-6 text-slate-200">🧬 {factText}</p>
            <button
              onClick={() => setFactText(null)}
              className="shrink-0 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}