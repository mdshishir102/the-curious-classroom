"use client";
import { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const SPEEDS = [1, 1.25, 1.5, 1.75, 2];

function loadYouTubeApi(): Promise<void> {
  return new Promise((resolve) => {
    if (window.YT?.Player) return resolve();
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(s);
    }
  });
}

const fmt = (t: number) => {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function LecturePlayer({ youtubeId, title }: { youtubeId: string; title: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const speedRef = useRef(1);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let dead = false;
    loadYouTubeApi().then(() => {
      if (dead || !mountRef.current) return;
      const holder = document.createElement("div");
      mountRef.current.innerHTML = "";
      mountRef.current.appendChild(holder);
      playerRef.current = new window.YT.Player(holder, {
        videoId: youtubeId,
        width: "100%",
        height: "100%",
        playerVars: {
          controls: 0, rel: 0, modestbranding: 1, iv_load_policy: 3,
          disablekb: 1, playsinline: 1, fs: 0, autoplay: 0,
        },
        events: {
          onReady: (e: any) => {
            setReady(true);
            setDuration(e.target.getDuration());
          },
          onStateChange: (e: any) => {
            setPlaying(e.data === 1);
            if (e.data === 1) {
              // YouTube kokhono kokhono state change e speed reset kore, tai abar set kori
              e.target.setPlaybackRate(speedRef.current);
              setDuration(e.target.getDuration());
            }
          },
        },
      });
    });
    return () => {
      dead = true;
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [youtubeId]);

  // progress bar update
  useEffect(() => {
    const t = setInterval(() => {
      const p = playerRef.current;
      if (p?.getCurrentTime) setTime(p.getCurrentTime());
    }, 500);
    return () => clearInterval(t);
  }, []);

  const toggle = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    playing ? p.pauseVideo() : p.playVideo();
  }, [playing]);

  const skip = (sec: number) => {
    const p = playerRef.current;
    if (p) p.seekTo(Math.max(0, p.getCurrentTime() + sec), true);
  };

  const changeSpeed = (s: number) => {
    speedRef.current = s;
    setSpeed(s);
    playerRef.current?.setPlaybackRate(s);
  };

  const fullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen();
  };

  return (
    <div ref={wrapRef} className="overflow-hidden rounded-2xl border border-slate-700/50 bg-black">
      <div className="relative aspect-video">
        <div ref={mountRef} className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full" />
        {/* Overlay: YouTube title/logo/link e click block kore, click korle play/pause hoy */}
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="absolute inset-0 z-10 cursor-pointer bg-transparent"
        />
        {!ready && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-slate-950 text-sm text-slate-400">
            Video load hocche…
          </div>
        )}
      </div>

      <div className="space-y-3 bg-slate-900 px-4 py-3">
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={1}
          value={time}
          onChange={(e) => {
            const v = Number(e.target.value);
            setTime(v);
            playerRef.current?.seekTo(v, true);
          }}
          aria-label="Seek"
          className="h-1.5 w-full cursor-pointer accent-blue-500"
        />

        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-200">
          <button onClick={() => skip(-10)} className="rounded-lg px-2.5 py-1.5 hover:bg-slate-800">−10s</button>
          <button
            onClick={toggle}
            className="rounded-lg bg-blue-600 px-4 py-1.5 font-medium text-white hover:bg-blue-500"
          >
            {playing ? "Pause" : "Play"}
          </button>
          <button onClick={() => skip(10)} className="rounded-lg px-2.5 py-1.5 hover:bg-slate-800">+10s</button>
          <span className="tabular-nums text-slate-400">
            {fmt(time)} / {fmt(duration)}
          </span>

          <div className="ml-auto flex items-center gap-1" role="group" aria-label="Playback speed">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => changeSpeed(s)}
                aria-pressed={speed === s}
                className={`rounded-lg px-2.5 py-1.5 tabular-nums ${
                  speed === s ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button onClick={fullscreen} className="rounded-lg px-2.5 py-1.5 hover:bg-slate-800">
            Fullscreen
          </button>
        </div>
        <p className="truncate text-xs text-slate-500">{title}</p>
      </div>
    </div>
  );
}