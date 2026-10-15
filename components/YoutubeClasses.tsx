"use client";

import { useEffect, useState } from "react";
import { Play, ArrowUpRight } from "lucide-react";

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
};

const channelUrl =
  "https://www.youtube.com/@TheCuriousClassroom-s2s";

function isVideo(value: unknown): value is Video {
  if (!value || typeof value !== "object") return false;

  const video = value as Record<string, unknown>;

  return (
    typeof video.id === "string" &&
    typeof video.title === "string" &&
    typeof video.thumbnail === "string" &&
    typeof video.url === "string"
  );
}

export default function YoutubeClasses() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadVideos() {
      try {
        const response = await fetch("/api/youtube", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Could not load videos");
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data) || !data.every(isVideo)) {
          throw new Error("Invalid video response");
        }

        setVideos(data.slice(0, 3));
      } catch {
        if (!controller.signal.aborted) {
          setError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadVideos();

    return () => controller.abort();
  }, []);

  const focusStyle =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#080D19]";

  return (
    <section
      aria-labelledby="youtube-heading"
      className="border-b border-white/10 bg-[#080D19] px-5 py-16 text-slate-100 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-blue-400"
              />
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-300">
                Learn on YouTube
              </p>
            </div>

            <h2
              id="youtube-heading"
              className="mt-5 text-3xl font-semibold leading-snug text-white sm:text-4xl"
            >
              ফ্রি অনলাইন ক্লাস
            </h2>

            <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">
              অধ্যায়ভিত্তিক আলোচনা ও পরীক্ষার প্রস্তুতি—
              আমাদের চ্যানেলের নতুন ভিডিওগুলো দেখুন।
            </p>
          </div>

          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex min-h-12 w-fit shrink-0 items-center gap-3 rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-slate-200 transition-colors hover:border-blue-400/40 hover:bg-blue-400/5 hover:text-white ${focusStyle}`}
          >
            সব ভিডিও দেখুন
            <ArrowUpRight aria-hidden="true" size={18} />
            <span className="sr-only">— নতুন ট্যাবে খুলবে</span>
          </a>
        </div>

        {/* Loading */}
        {loading && (
          <div role="status" className="mt-10">
            <span className="sr-only">ভিডিও লোড হচ্ছে…</span>

            <div
              aria-hidden="true"
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[#101A2C] motion-safe:animate-pulse"
                >
                  <div className="aspect-video bg-white/5" />
                  <div className="space-y-4 p-6">
                    <div className="h-3 w-20 rounded bg-white/10" />
                    <div className="h-4 w-full rounded bg-white/10" />
                    <div className="h-4 w-2/3 rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error or empty state */}
        {!loading && (error || videos.length === 0) && (
          <div
            role="status"
            className="mt-10 rounded-2xl border border-white/10 bg-[#101A2C] px-6 py-10 text-center"
          >
            <p className="text-base leading-8 text-slate-300">
              {error
                ? "এই মুহূর্তে ভিডিওগুলো লোড করা যাচ্ছে না।"
                : "এই মুহূর্তে এখানে দেখানোর মতো ভিডিও পাওয়া যায়নি।"}
            </p>

            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-300 hover:text-blue-200 ${focusStyle}`}
            >
              YouTube চ্যানেলে দেখুন
              <ArrowUpRight aria-hidden="true" size={17} />
              <span className="sr-only">— নতুন ট্যাবে খুলবে</span>
            </a>
          </div>
        )}

        {/* Video cards */}
        {!loading && !error && videos.length > 0 && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:mt-12 lg:grid-cols-3">
            {videos.map((video) => (
              <article key={video.id} className="h-full">
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101A2C] transition-colors duration-300 hover:border-blue-400/40 ${focusStyle}`}
                >
                  {/* Original YouTube thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-[#070C16]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={video.thumbnail}
                      alt=""
                      width={480}
                      height={270}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain"
                    />

                    <div className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white transition-colors group-hover:bg-blue-600">
                      <Play
                        aria-hidden="true"
                        size={17}
                        fill="currentColor"
                        className="ml-0.5"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-blue-300">
                      YouTube Class
                    </p>

                    <h3 className="mt-3 break-words text-lg font-semibold leading-8 text-slate-100 transition-colors group-hover:text-blue-200">
                      {video.title}
                    </h3>

                    <div className="mt-auto pt-6">
                      <div className="flex items-center justify-between border-t border-white/10 pt-4 text-sm text-slate-400">
                        <span>ভিডিও দেখুন</span>
                        <ArrowUpRight
                          aria-hidden="true"
                          size={18}
                          className="text-blue-300"
                        />
                      </div>
                    </div>

                    <span className="sr-only">
                      — YouTube-এ নতুন ট্যাবে খুলবে
                    </span>
                  </div>
                </a>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}