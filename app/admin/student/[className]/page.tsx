"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Search,
  Phone,
  Hash,
  Users,
  ArrowUpRight,
  Copy,
  Check,
  MessageCircle,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";

type SortOption = "newest" | "oldest" | "name-asc" | "name-desc";

export default function ClassStudentPage() {
  const params = useParams();
  const className = decodeURIComponent(params.className as string);

  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  async function loadStudents() {
    const { data, error } = await supabase
      .from("students")
      .select(
        `
  id,
  student_name,
  student_id,
  class,
  batch,
  whatsapp,
  student_photo,
  created_at
`
      )
      .eq("class", className)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setStudents(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = students
    .filter((student) => {
      if (!search) return true;

      return (
        student.student_name.toLowerCase().includes(search.toLowerCase()) ||
        student.student_id.toLowerCase().includes(search.toLowerCase()) ||
        (student.whatsapp ?? "").includes(search)
      );
    })
    .sort((a, b) => {
      if (sortOption === "name-asc") {
        return a.student_name.localeCompare(b.student_name);
      }
      if (sortOption === "name-desc") {
        return b.student_name.localeCompare(a.student_name);
      }
      if (sortOption === "oldest") {
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }
      // newest (default)
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  const avatarColorStyles = [
    { bg: "bg-blue-500/10", text: "text-blue-300", border: "border-blue-400/15" },
    { bg: "bg-violet-500/10", text: "text-violet-300", border: "border-violet-400/15" },
    { bg: "bg-emerald-400/10", text: "text-emerald-300", border: "border-emerald-400/20" },
    { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-400/15" },
  ];

  function getInitials(name: string) {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  function copyToClipboard(value: string, field: string) {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  }

  function getWhatsAppLink(phone: string) {
    if (!phone) return "#";
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) cleaned = "88" + cleaned;
    return `https://wa.me/${cleaned}`;
  }

  function isRecentlyJoined(createdAt: string) {
    if (!createdAt) return false;
    const diffDays =
      (new Date().getTime() - new Date(createdAt).getTime()) /
      (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#080D19]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
        <p className="text-sm font-medium text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#080D19] p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-px w-7 bg-blue-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                Students
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              {className}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              মোট {filteredStudents.length} জন ছাত্র-ছাত্রী
            </p>
          </div>

          <Link
            href="/admin/student"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.09] bg-[#101A2C] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-blue-400/30 hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        {/* Search bar + Sort dropdown */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              placeholder="Search Name / Student ID / Phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/[0.09] bg-[#101A2C] py-4 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 shadow-[0_16px_50px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
            />
          </div>

          <div className="relative sm:w-56">
            <ArrowUpDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="w-full appearance-none rounded-2xl border border-white/[0.09] bg-[#101A2C] py-4 pl-11 pr-4 text-sm text-white shadow-[0_16px_50px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Empty state */}
        {filteredStudents.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/[0.09] bg-[#101A2C]/60 p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-slate-600" />
            <p className="mt-4 text-sm text-slate-400">
              কোনো ছাত্র-ছাত্রী পাওয়া যায়নি।
            </p>
          </div>
        )}

        {/* Student grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {filteredStudents.map((student, index) => {
            const style = avatarColorStyles[index % avatarColorStyles.length];
            const hasValidPhoto =
              student.student_photo?.trim() && !brokenImages[student.id];
            const idFieldKey = `id-${student.id}`;
            const phoneFieldKey = `phone-${student.id}`;

            return (
              <div
                key={student.id}
                className="card-lift relative rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)] p-6"
              >
                {isRecentlyJoined(student.created_at) && (
                  <span className="absolute -top-2.5 right-5 inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                    <Sparkles className="h-3 w-3" />
                    নতুন
                  </span>
                )}

                <div className="flex gap-5 items-center">
                  {hasValidPhoto ? (
                    <img
                      src={student.student_photo.trim()}
                      onError={() => {
                        setBrokenImages((prev) => ({
                          ...prev,
                          [student.id]: true,
                        }));
                      }}
                      className="h-20 w-20 rounded-full object-cover border-2 border-white/[0.09]"
                      alt={student.student_name}
                    />
                  ) : (
                    <div
                      className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full border ${style.border} ${style.bg}`}
                    >
                      <span className={`text-xl font-semibold ${style.text}`}>
                        {getInitials(student.student_name)}
                      </span>
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-white truncate">
                      {student.student_name}
                    </h2>

                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                      <Hash className="h-3 w-3 text-slate-500 shrink-0" />
                      <span>
                        ID:{" "}
                        <span className="font-semibold text-slate-300">
                          {student.student_id}
                        </span>
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(student.student_id, idFieldKey)
                        }
                        className="text-slate-500 transition hover:text-blue-300"
                      >
                        {copiedField === idFieldKey ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      Batch:{" "}
                      <span className="text-slate-300">{student.batch}</span>
                    </p>

                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                      <Phone className="h-3 w-3 text-slate-500 shrink-0" />
                      <span>{student.whatsapp}</span>
                      <button
                        onClick={() =>
                          copyToClipboard(student.whatsapp, phoneFieldKey)
                        }
                        className="text-slate-500 transition hover:text-blue-300"
                      >
                        {copiedField === phoneFieldKey ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  {student.whatsapp && (
                    <a
                      href={getWhatsAppLink(student.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-400/15 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                  )}

                  <Link
                    href={`/admin/student/profile/${student.id}`}
                    className="group flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-blue-400/15 bg-blue-500/10 py-3 text-center text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
                  >
                    View Full Profile
                    <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}