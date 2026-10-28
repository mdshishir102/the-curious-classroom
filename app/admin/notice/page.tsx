"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Megaphone,
  Plus,
  Type,
  AlignLeft,
  Search,
  Trash2,
  X,
  Copy,
  Check,
  Clock,
  Sparkles,
  LoaderCircle,
  Eye,
  ListChecks,
  CalendarPlus,
} from "lucide-react";

function timeAgo(dateStr: string) {
  const now = new Date().getTime();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "এইমাত্র";
  if (minutes < 60) return `${minutes} মিনিট আগে`;
  if (hours < 24) return `${hours} ঘণ্টা আগে`;
  if (days < 30) return `${days} দিন আগে`;
  return new Date(dateStr).toLocaleDateString("en-GB");
}

function isToday(dateStr: string) {
  const today = new Date().toLocaleDateString("en-CA");
  const noticeDate = new Date(dateStr).toLocaleDateString("en-CA");
  return today === noticeDate;
}

export default function AdminNoticePage() {
  const [notices, setNotices] = useState<any[]>([]);

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);

  // --- UI-only additions ---
  const [pageLoading, setPageLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function loadNotices() {
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setNotices(data || []);
    }
    setPageLoading(false);
  }

  useEffect(() => {
    loadNotices();
  }, []);

  async function addNotice() {
    if (!title || !description) {
      alert("Fill all fields");

      return;
    }

    setLoading(true);

    const { error } = await supabase.from("notices").insert({
      title: title,
      description: description,
    });

    setLoading(false);

    if (error) {
      alert(error.message);

      return;
    }

    alert("Notice Added");

    setTitle("");
    setDescription("");

    loadNotices();
  }

  // --- UI-only: delete confirmation moved to styled modal ---
  async function confirmDeleteNotice() {
    if (!deleteTarget) return;

    setDeleting(true);

    const { error } = await supabase
      .from("notices")
      .delete()
      .eq("id", deleteTarget.id);

    setDeleting(false);

    if (error) {
      alert(error.message);
      return;
    }

    setDeleteTarget(null);
    loadNotices();
  }

  function copyNotice(notice: any) {
    navigator.clipboard.writeText(`${notice.title}\n\n${notice.description}`);
    setCopiedId(notice.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  const filteredNotices = notices.filter((n) => {
    const q = search.toLowerCase();
    return (
      n.title?.toLowerCase().includes(q) ||
      n.description?.toLowerCase().includes(q)
    );
  });

  const todayCount = notices.filter(
    (n) => n.created_at && isToday(n.created_at)
  ).length;

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-[#080D19] flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400">
          <LoaderCircle className="h-5 w-5 animate-spin text-blue-400" />
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080D19] p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-px w-7 bg-blue-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
            Announcements
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-8 flex items-center gap-3">
          <Megaphone className="h-7 w-7 text-blue-300" />
          Notice Management
        </h1>

        {/* SUMMARY STATS */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="card-lift rounded-2xl border border-white/[0.08] bg-[#101A2C] p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide">
              <ListChecks className="h-3.5 w-3.5 text-blue-300" />
              মোট নোটিশ
            </div>
            <p className="text-2xl font-semibold text-white mt-2">
              {notices.length}
            </p>
          </div>
          <div className="card-lift rounded-2xl border border-emerald-400/15 bg-[#101A2C] p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide">
              <CalendarPlus className="h-3.5 w-3.5 text-emerald-300" />
              আজকে যোগ হয়েছে
            </div>
            <p className="text-2xl font-semibold text-emerald-300 mt-2">
              {todayCount}
            </p>
          </div>
        </div>

        {/* FORM */}
        <div className="card-lift rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Plus className="h-4 w-4 text-blue-300" />
            <h2 className="text-lg font-semibold text-white">Add New Notice</h2>
          </div>

          <div className="relative">
            <Type className="h-4 w-4 text-slate-500 absolute left-3.5 top-4" />
            <input
              className="w-full rounded-xl border border-white/[0.08] bg-[#0B1425] text-white placeholder:text-slate-500 pl-10 pr-16 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
              placeholder="Notice Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500">
              {title.length}
            </span>
          </div>

          <div className="relative mt-4">
            <AlignLeft className="h-4 w-4 text-slate-500 absolute left-3.5 top-4" />
            <textarea
              className="w-full rounded-xl border border-white/[0.08] bg-[#0B1425] text-white placeholder:text-slate-500 pl-10 pr-16 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
              placeholder="Notice Description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <span className="absolute right-3.5 bottom-3 text-xs text-slate-500">
              {description.length}
            </span>
          </div>

          <button
            onClick={addNotice}
            disabled={loading}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-white font-medium hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
          >
            {loading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Notice
              </>
            )}
          </button>

          {/* LIVE PREVIEW */}
          {(title || description) && (
            <div className="mt-6 border-t border-white/[0.06] pt-5">
              <div className="flex items-center gap-2 mb-3 text-xs text-slate-500 uppercase tracking-wide">
                <Eye className="h-3.5 w-3.5" />
                Preview
              </div>
              <div className="rounded-2xl border border-blue-400/15 bg-blue-500/[0.05] p-5">
                <h3 className="text-lg font-semibold text-white">
                  {title || "Notice Title"}
                </h3>
                <p className="mt-2 text-slate-400 text-sm whitespace-pre-wrap">
                  {description || "Notice description will appear here..."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* SEARCH */}
        <div className="relative mt-8 mb-6">
          <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Title বা description দিয়ে খুঁজুন..."
            className="w-full rounded-xl border border-white/[0.08] bg-[#101A2C] text-white placeholder:text-slate-500 pl-10 pr-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
          />
        </div>

        {/* NOTICE LIST */}
        <div className="space-y-4">
          {filteredNotices.length === 0 ? (
            <div className="card-lift rounded-3xl border border-white/[0.08] bg-[#101A2C] p-10 text-center text-slate-400">
              কোনো নোটিশ পাওয়া যায়নি
            </div>
          ) : (
            filteredNotices.map((notice) => {
              const isNew = notice.created_at && isToday(notice.created_at);

              return (
                <div
                  key={notice.id}
                  className="card-lift rounded-3xl border border-white/[0.09] bg-[#101A2C] p-6"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h2 className="text-xl font-semibold text-white">
                          {notice.title}
                        </h2>
                        {isNew && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 px-2.5 py-0.5 text-[11px] font-medium">
                            <Sparkles className="h-3 w-3" />
                            নতুন
                          </span>
                        )}
                      </div>

                      {notice.created_at && (
                        <p className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                          <Clock className="h-3 w-3" />
                          {timeAgo(notice.created_at)}
                        </p>
                      )}

                      <p className="text-slate-400 whitespace-pre-wrap">
                        {notice.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => copyNotice(notice)}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] text-slate-300 px-4 py-2 text-sm font-medium hover:bg-white/5 transition"
                    >
                      {copiedId === notice.id ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setDeleteTarget(notice)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 text-red-300 px-4 py-2 text-sm font-medium hover:bg-red-500/20 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="card-lift rounded-3xl border border-red-400/20 bg-[#101A2C] p-6 max-w-md w-full">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-400/20 flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-300" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  নোটিশ মুছে ফেলুন?
                </h3>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-slate-500 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-slate-400 mb-5">
              <span className="text-white font-medium">
                {deleteTarget.title}
              </span>{" "}
              — এই নোটিশটি স্থায়ীভাবে মুছে ফেলতে চান? এই কাজটি আর ফেরানো যাবে না।
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-white/[0.1] text-slate-300 py-2.5 font-medium hover:bg-white/5 transition"
              >
                বাতিল
              </button>
              <button
                onClick={confirmDeleteNotice}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-500 text-white py-2.5 font-medium hover:bg-red-600 disabled:bg-slate-700 disabled:text-slate-400 transition"
              >
                {deleting ? "মুছে ফেলা হচ্ছে..." : "হ্যাঁ, মুছুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}