"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, BookOpen } from "lucide-react";





type ScheduleLite = {
  id: string | number;
  class_name?: string | null;
  subject?: string | null;
  topic?: string | null;
  schedule_date: string;
  start_time?: string | null;
  end_time?: string | null;
};

type AttendanceLite = {
  attendance_date: string;
  status: string;
};

const card =
  "rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)]";

// ---------- Greeting ----------
export function getGreeting(): { text: string; line: string } {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Dhaka",
      hour: "2-digit",
      hour12: false,
    }).format(new Date())
  );

  if (hour >= 5 && hour < 12)
    return { text: "শুভ সকাল", line: "আজকের প্রথম ক্লাসের আগে একবার নোটটা দেখে নাও।" };
  if (hour >= 12 && hour < 16)
    return { text: "শুভ দুপুর", line: "দিনের পড়া এখনো বাকি, ছোট একটা অধ্যায় শেষ করে ফেলো।" };
  if (hour >= 16 && hour < 19)
    return { text: "শুভ বিকেল", line: "আজ যা শিখেছ, ৫ মিনিটে একবার ঝালিয়ে নাও।" };
  return { text: "শুভ সন্ধ্যা", line: "কাল কোন ক্লাস আছে, একবার দেখে ঘুমাতে যাও।" };
}

// ---------- Attendance Ring ----------
export function AttendanceRing({
  percent,
  loading,
  hasData,
}: {
  percent: number;
  loading: boolean;
  hasData: boolean;
}) {
  const size = 132;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = loading || !hasData ? 0 : Math.min(100, Math.max(0, percent));
  const offset = circumference - (value / 100) * circumference;
  const color = !hasData
    ? "#475569"
    : value >= 80
      ? "#34d399"
      : value >= 60
        ? "#fbbf24"
        : "#f87171";

  return (
    <div
      role="img"
      aria-label={hasData ? `Attendance rate ${value} percent` : "No attendance data"}
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">
          {loading ? "…" : hasData ? `${value}%` : "—"}
        </span>
        <span className="mt-0.5 text-[11px] text-slate-400">Attendance</span>
      </div>
    </div>
  );
}


// ---------- Next Class Countdown ----------
function getStartMs(item: ScheduleLite): number {
  const time = item.start_time?.slice(0, 5) || "00:00";
  return new Date(`${item.schedule_date.slice(0, 10)}T${time}:00+06:00`).getTime();
}

export function NextClassCard({
  schedule,
  formatDate,
  formatTime,
}: {
  schedule: ScheduleLite | null;
  formatDate: (v?: string | null) => string;
  formatTime: (v?: string | null) => string;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  if (!schedule) {
    return (
      <div className={`${card} p-6 sm:p-7`}>
        <p className="text-sm font-semibold text-white">পরবর্তী ক্লাস</p>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          এখনো কোনো ক্লাস দেওয়া হয়নি। এই ফাঁকে Class Notes থেকে পুরোনো অধ্যায়টা ঝালিয়ে নিতে পারো।
        </p>
      </div>
    );
  }

  const diff = getStartMs(schedule) - now;
  const started = diff <= 0;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  const units = [
    { label: "দিন", value: days },
    { label: "ঘণ্টা", value: hours },
    { label: "মিনিট", value: minutes },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-400/20 bg-gradient-to-br from-[#16305E] via-[#132441] to-[#101A2C] p-6 sm:p-7">
      <p className="text-sm font-semibold text-blue-200">পরবর্তী ক্লাস</p>

      <h3 className="mt-3 text-2xl font-semibold text-white">
        {schedule.subject || "Subject not specified"}
      </h3>

      {schedule.topic && (
        <p className="mt-2 flex items-start gap-2 text-sm text-slate-300">
          <BookOpen size={16} className="mt-0.5 shrink-0 text-blue-300" />
          {schedule.topic}
        </p>
      )}

      {started ? (
        <p className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-300">
          ক্লাস এখন চলছে বা শুরু হয়ে গেছে।
        </p>
      ) : (
        <div className="mt-6 grid max-w-sm grid-cols-3 gap-3" aria-live="polite">
          {units.map((u) => (
            <div
              key={u.label}
              className="rounded-2xl border border-white/10 bg-[#0B1425]/70 px-3 py-3 text-center"
            >
              <p className="text-2xl font-bold tabular-nums text-white">
                {String(u.value).padStart(2, "0")}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">{u.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-xs text-slate-300">
        <span className="flex items-center gap-2">
          <CalendarDays size={15} className="text-blue-300" />
          {formatDate(schedule.schedule_date)}
        </span>
        <span className="flex items-center gap-2">
          <Clock3 size={15} className="text-blue-300" />
          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
        </span>
      </div>
    </div>
  );
}


// ---------- Attendance Calendar ----------
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PRIORITY: Record<string, number> = { absent: 3, late: 2, present: 1 };

const dotStyle: Record<string, string> = {
  present: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  late: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  absent: "bg-red-400/15 text-red-300 border-red-400/30",
};

export function AttendanceCalendar({
  monthLabel,
  records,
  today,
}: {
  monthLabel: string;
  records: AttendanceLite[];
  today: string;
}) {
  const [monthName, yearText] = monthLabel.split(" ");
  const monthIndex = MONTHS.indexOf(monthName);
  const year = Number(yearText);

  const statusByDay = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of records) {
      const key = r.attendance_date.slice(0, 10);
      const status = r.status?.toLowerCase();
      const existing = map.get(key);
      if (!existing || (PRIORITY[status] ?? 0) > (PRIORITY[existing] ?? 0)) {
        map.set(key, status);
      }
    }
    return map;
  }, [records]);

  if (monthIndex < 0 || !Number.isInteger(year)) return null;

  const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className={`${card} p-6 sm:p-7`}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Attendance Calendar</h3>
          <p className="mt-1 text-xs text-slate-500">{monthLabel}</p>
        </div>

        <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-emerald-400" />Present
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-amber-400" />Late
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-red-400" />Absent
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="pb-1 text-center text-[11px] font-medium text-slate-500">
            {d}
          </div>
        ))}

        {cells.map((day, index) => {
          if (day === null) return <div key={`empty-${index}`} />;

          const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const status = statusByDay.get(key);
          const isToday = key === today;

          return (
            <div
              key={key}
              title={status ? `${key}: ${status}` : key}



className={`flex h-11 items-center justify-center rounded-xl border text-xs font-medium sm:h-14 sm:text-sm ${

              status
                  ? dotStyle[status] ?? "border-white/10 text-slate-300"
                  : "border-white/[0.05] bg-white/[0.02] text-slate-500"
              } ${isToday ? "ring-2 ring-blue-400" : ""}`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}