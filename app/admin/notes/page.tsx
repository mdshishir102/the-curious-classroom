"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  BookOpen,
  Plus,
  Hash,
  Link2,
  FileText,
  Search,
  Lock,
  Unlock,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  Copy,
  Check,
  LoaderCircle,
  ListChecks,
  BookMarked,
  LibraryBig,
} from "lucide-react";

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [className, setClassName] = useState("Class 9");
  const [subject, setSubject] = useState("Biology");

  const [chapterNumber, setChapterNumber] = useState("");
  const [chapterName, setChapterName] = useState("");

  const [classNoteLink, setClassNoteLink] = useState("");
  const [markedBookLink, setMarkedBookLink] = useState("");

  const [editNote, setEditNote] = useState<any>(null);

  // --- UI-only additions ---
  const [search, setSearch] = useState("");
  const [collapsedClasses, setCollapsedClasses] = useState<Record<string, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [formTouched, setFormTouched] = useState(false);

  const classes = ["Class 9", "Class 10", "Class 11", "Class 12"];

  function getSubjects() {
    if (className === "Class 11" || className === "Class 12") {
      return ["Biology 1st Paper", "Biology 2nd Paper"];
    }

    return ["Biology"];
  }

  // =========================
  // LOAD NOTES
  // =========================

  async function loadNotes() {
    setLoading(true);

    const { data, error } = await supabase
      .from("class_notes")
      .select("*")
      .order("class_name", { ascending: true })
      .order("subject", { ascending: true })
      .order("chapter_number", { ascending: true });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setNotes(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadNotes();
  }, []);

  // =========================
  // ADD NOTE
  // =========================

  async function addNote() {
    setFormTouched(true);

    if (!chapterNumber || !chapterName.trim()) {
      alert("Chapter Number and Chapter Name required");
      return;
    }

    const { error } = await supabase.from("class_notes").insert({
      class_name: className,
      subject: subject,
      chapter_number: Number(chapterNumber),
      chapter_name: chapterName.trim(),
      class_note_link: classNoteLink.trim(),
      marked_book_link: markedBookLink.trim(),
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Note Added");

    setChapterNumber("");
    setChapterName("");
    setClassNoteLink("");
    setMarkedBookLink("");
    setFormTouched(false);

    loadNotes();
  }

  // =========================
  // RELEASE / LOCK
  // =========================

  async function toggleRelease(note: any) {
    const { error } = await supabase
      .from("class_notes")
      .update({
        is_released: !note.is_released,
      })
      .eq("id", note.id);

    if (error) {
      alert(error.message);
      return;
    }

    loadNotes();
  }

  // =========================
  // UPDATE NOTE
  // =========================

  async function updateNote() {
    if (!editNote) return;

    if (!editNote.chapter_number || !editNote.chapter_name?.trim()) {
      alert("Chapter Number and Chapter Name required");
      return;
    }

    const { error } = await supabase
      .from("class_notes")
      .update({
        chapter_number: Number(editNote.chapter_number),
        chapter_name: editNote.chapter_name.trim(),
        class_note_link: editNote.class_note_link || "",
        marked_book_link: editNote.marked_book_link || "",
      })
      .eq("id", editNote.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Updated Successfully");

    setEditNote(null);

    loadNotes();
  }

  // =========================
  // DELETE NOTE (confirmation moved to styled modal, logic identical)
  // =========================

  async function deleteNote(note: any) {
    const { error } = await supabase
      .from("class_notes")
      .delete()
      .eq("id", note.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Note Deleted");

    loadNotes();
  }

  // --- UI-only helpers ---
  function toggleCollapse(cls: string) {
    setCollapsedClasses((prev) => ({ ...prev, [cls]: !prev[cls] }));
  }

  function copyToClipboard(value: string, key: string) {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }

  // =========================
  // GROUP NOTES (unchanged)
  // =========================

  const groupedNotes = notes.reduce((acc: any, note: any) => {
    if (!acc[note.class_name]) {
      acc[note.class_name] = {};
    }

    if (!acc[note.class_name][note.subject]) {
      acc[note.class_name][note.subject] = [];
    }

    acc[note.class_name][note.subject].push(note);

    return acc;
  }, {});

  // --- UI-only: search filter applied on top of groupedNotes (does not affect save logic) ---
  const filteredGroupedNotes: any = {};
  Object.entries(groupedNotes).forEach(([cls, subjects]: any) => {
    const subjectsFiltered: any = {};
    Object.entries(subjects).forEach(([subj, items]: any) => {
      const filteredItems = items.filter((n: any) => {
        const q = search.toLowerCase();
        return (
          n.chapter_name?.toLowerCase().includes(q) ||
          String(n.chapter_number).includes(q)
        );
      });
      if (filteredItems.length > 0) {
        subjectsFiltered[subj] = filteredItems;
      }
    });
    if (Object.keys(subjectsFiltered).length > 0) {
      filteredGroupedNotes[cls] = subjectsFiltered;
    }
  });

  const totalNotes = notes.length;
  const releasedCount = notes.filter((n) => n.is_released).length;
  const lockedCount = totalNotes - releasedCount;
  const totalClasses = Object.keys(groupedNotes).length;

  return (
    <main className="min-h-screen bg-[#080D19] p-6">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center gap-2 mb-4">
          <span className="h-px w-7 bg-blue-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
            Learning
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-8 flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-blue-300" />
          Class Notes Management
        </h1>

        {/* SUMMARY STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="card-lift rounded-2xl border border-white/[0.08] bg-[#101A2C] p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide">
              <ListChecks className="h-3.5 w-3.5 text-blue-300" />
              মোট Chapter
            </div>
            <p className="text-2xl font-semibold text-white mt-2">{totalNotes}</p>
          </div>
          <div className="card-lift rounded-2xl border border-emerald-400/15 bg-[#101A2C] p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide">
              <Unlock className="h-3.5 w-3.5 text-emerald-300" />
              Released
            </div>
            <p className="text-2xl font-semibold text-emerald-300 mt-2">{releasedCount}</p>
          </div>
          <div className="card-lift rounded-2xl border border-amber-400/15 bg-[#101A2C] p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide">
              <Lock className="h-3.5 w-3.5 text-amber-300" />
              Locked
            </div>
            <p className="text-2xl font-semibold text-amber-300 mt-2">{lockedCount}</p>
          </div>
          <div className="card-lift rounded-2xl border border-white/[0.08] bg-[#101A2C] p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide">
              <LibraryBig className="h-3.5 w-3.5 text-violet-300" />
              মোট Class
            </div>
            <p className="text-2xl font-semibold text-violet-300 mt-2">{totalClasses}</p>
          </div>
        </div>

        {/* =========================
            ADD NEW NOTE
        ========================= */}

        <div className="card-lift rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)] p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Plus className="h-5 w-5 text-blue-300" />
            <h2 className="text-xl font-semibold text-white">Add New Note</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* CLASS */}
            <select
              value={className}
              onChange={(e) => {
                const selectedClass = e.target.value;
                setClassName(selectedClass);
                setSubject(
                  selectedClass === "Class 11" || selectedClass === "Class 12"
                    ? "Biology 1st Paper"
                    : "Biology"
                );
              }}
              className="w-full rounded-xl border border-white/[0.08] bg-[#0B1425] text-white p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
            >
              {classes.map((item) => (
                <option key={item} value={item} className="bg-[#0B1425]">
                  {item}
                </option>
              ))}
            </select>

            {/* SUBJECT */}
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-[#0B1425] text-white p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
            >
              {getSubjects().map((item) => (
                <option key={item} value={item} className="bg-[#0B1425]">
                  {item}
                </option>
              ))}
            </select>

            {/* CHAPTER NUMBER */}
            <div className="relative">
              <Hash className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                placeholder="Chapter Number"
                value={chapterNumber}
                onChange={(e) => setChapterNumber(e.target.value)}
                className={`w-full rounded-xl border bg-[#0B1425] text-white placeholder:text-slate-500 pl-10 pr-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19] ${
                  formTouched && !chapterNumber
                    ? "border-red-400/40"
                    : "border-white/[0.08]"
                }`}
              />
            </div>

            {/* CHAPTER NAME */}
            <div className="relative">
              <FileText className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                placeholder="Chapter Name"
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
                className={`w-full rounded-xl border bg-[#0B1425] text-white placeholder:text-slate-500 pl-10 pr-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19] ${
                  formTouched && !chapterName.trim()
                    ? "border-red-400/40"
                    : "border-white/[0.08]"
                }`}
              />
            </div>

            {/* CLASS NOTE LINK */}
            <div className="relative">
              <Link2 className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                placeholder="📒 Class Note Drive Link (optional)"
                value={classNoteLink}
                onChange={(e) => setClassNoteLink(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0B1425] text-white placeholder:text-slate-500 pl-10 pr-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
              />
            </div>

            {/* MARKED BOOK LINK */}
            <div className="relative">
              <Link2 className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                placeholder="📖 দাগানো বই Drive Link (optional)"
                value={markedBookLink}
                onChange={(e) => setMarkedBookLink(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0B1425] text-white placeholder:text-slate-500 pl-10 pr-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
              />
            </div>
          </div>

          {/* ADD BUTTON */}
          <button
            onClick={addNote}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-white font-medium hover:bg-blue-600 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
          >
            <Plus className="h-4 w-4" />
            Add Note
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative mt-8 mb-6">
          <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Chapter name বা number দিয়ে খুঁজুন..."
            className="w-full rounded-xl border border-white/[0.08] bg-[#101A2C] text-white placeholder:text-slate-500 pl-10 pr-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
          />
        </div>

        {/* =========================
            NOTES LIST
        ========================= */}

        <div className="space-y-6">
          {loading ? (
            <div className="card-lift rounded-3xl border border-white/[0.08] bg-[#101A2C] p-10 text-center text-slate-400 flex items-center justify-center gap-2">
              <LoaderCircle className="h-5 w-5 animate-spin text-blue-400" />
              Loading notes...
            </div>
          ) : Object.keys(filteredGroupedNotes).length === 0 ? (
            <div className="card-lift rounded-3xl border border-white/[0.08] bg-[#101A2C] p-10 text-center text-slate-400">
              কোনো নোট পাওয়া যায়নি
            </div>
          ) : (
            Object.entries(filteredGroupedNotes).map(([cls, subjects]: any) => {
              const isCollapsed = collapsedClasses[cls];
              const classNoteCount = Object.values(subjects).reduce(
                (sum: number, items: any) => sum + items.length,
                0
              );

              return (
                <div
                  key={cls}
                  className="card-lift rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)] overflow-hidden"
                >
                  {/* CLASS HEADER */}
                  <button
                    onClick={() => toggleCollapse(cls)}
                    className="w-full flex items-center justify-between gap-3 p-6 text-left hover:bg-white/[0.02] transition"
                  >
                    <div className="flex items-center gap-3">
                      <BookMarked className="h-5 w-5 text-blue-300" />
                      <h2 className="text-xl font-semibold text-white">{cls}</h2>
                      <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-xs text-slate-400">
                        {classNoteCount} chapters
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform ${
                        isCollapsed ? "" : "rotate-180"
                      }`}
                    />
                  </button>

                  {!isCollapsed && (
                    <div className="px-6 pb-6 space-y-6">
                      {Object.entries(subjects).map(([subj, items]: any) => {
                        const releasedInSubject = items.filter(
                          (n: any) => n.is_released
                        ).length;
                        const subjectProgress = Math.round(
                          (releasedInSubject / items.length) * 100
                        );

                        return (
                          <div key={subj} className="border-t border-white/[0.06] pt-6">
                            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                🧬 {subj}
                              </h3>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <div className="h-1.5 w-24 rounded-full bg-white/[0.06] overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-emerald-400"
                                    style={{ width: `${subjectProgress}%` }}
                                  />
                                </div>
                                {releasedInSubject}/{items.length} released
                              </div>
                            </div>

                            <div className="space-y-4">
                              {items
                                .sort(
                                  (a: any, b: any) =>
                                    (Number(a.chapter_number) || 999) -
                                    (Number(b.chapter_number) || 999)
                                )
                                .map((note: any) => {
                                  const noteKey = `${note.id}`;
                                  return (
                                    <div
                                      key={note.id}
                                      className="rounded-2xl border border-white/[0.07] bg-[#0B1425] p-5"
                                    >
                                      <div className="flex items-start justify-between gap-3 flex-wrap">
                                        <div>
                                          <h4 className="font-semibold text-lg text-white">
                                            অধ্যায়-{note.chapter_number}
                                          </h4>
                                          <p className="text-slate-400 mt-1">
                                            {note.chapter_name}
                                          </p>
                                        </div>

                                        <span
                                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                                            note.is_released
                                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-400/20"
                                              : "bg-amber-500/10 text-amber-300 border-amber-400/15"
                                          }`}
                                        >
                                          {note.is_released ? (
                                            <Unlock className="h-3 w-3" />
                                          ) : (
                                            <Lock className="h-3 w-3" />
                                          )}
                                          {note.is_released ? "Released" : "Locked"}
                                        </span>
                                      </div>

                                      {/* AVAILABLE LINKS */}
                                      <div className="flex gap-2 mt-3 flex-wrap">
                                        {note.class_note_link && (
                                          <button
                                            onClick={() =>
                                              copyToClipboard(
                                                note.class_note_link,
                                                noteKey + "-note"
                                              )
                                            }
                                            className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-300 border border-blue-400/15 px-3 py-1.5 rounded-full text-xs hover:bg-blue-500/20 transition"
                                          >
                                            📒 Note Available
                                            {copiedKey === noteKey + "-note" ? (
                                              <Check className="h-3 w-3 text-emerald-400" />
                                            ) : (
                                              <Copy className="h-3 w-3" />
                                            )}
                                          </button>
                                        )}

                                        {note.marked_book_link && (
                                          <button
                                            onClick={() =>
                                              copyToClipboard(
                                                note.marked_book_link,
                                                noteKey + "-book"
                                              )
                                            }
                                            className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-400/15 px-3 py-1.5 rounded-full text-xs hover:bg-emerald-500/20 transition"
                                          >
                                            📖 Book Available
                                            {copiedKey === noteKey + "-book" ? (
                                              <Check className="h-3 w-3 text-emerald-400" />
                                            ) : (
                                              <Copy className="h-3 w-3" />
                                            )}
                                          </button>
                                        )}
                                      </div>

                                      {/* RELEASE */}
                                      <button
                                        onClick={() => toggleRelease(note)}
                                        className={`mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-xl text-white font-medium text-sm transition ${
                                          note.is_released
                                            ? "bg-red-500 hover:bg-red-600"
                                            : "bg-emerald-500 hover:bg-emerald-600"
                                        }`}
                                      >
                                        {note.is_released ? (
                                          <>
                                            <Lock className="h-4 w-4" />
                                            Lock
                                          </>
                                        ) : (
                                          <>
                                            <Unlock className="h-4 w-4" />
                                            Release
                                          </>
                                        )}
                                      </button>

                                      {/* EDIT + DELETE */}
                                      <div className="flex gap-3 mt-4">
                                        <button
                                          onClick={() => setEditNote(note)}
                                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-400/15 text-blue-300 font-medium text-sm hover:bg-blue-500/20 transition"
                                        >
                                          <Pencil className="h-4 w-4" />
                                          Edit
                                        </button>

                                        <button
                                          onClick={() => setDeleteTarget(note)}
                                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-400/20 text-red-300 font-medium text-sm hover:bg-red-500/20 transition"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* =========================
            EDIT MODAL
        ========================= */}

        {editNote && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card-lift rounded-3xl border border-white/[0.09] bg-[#101A2C] p-8 w-full max-w-[500px]">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-blue-300" />
                  Edit Note
                </h2>
                <button
                  onClick={() => setEditNote(null)}
                  className="text-slate-500 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-slate-400 mb-5">
                {editNote.class_name} - {editNote.subject}
              </p>

              {/* EDIT CHAPTER NUMBER */}
              <input
                type="number"
                value={editNote.chapter_number || ""}
                onChange={(e) =>
                  setEditNote({
                    ...editNote,
                    chapter_number: e.target.value,
                  })
                }
                placeholder="Chapter Number"
                className="w-full rounded-xl border border-white/[0.08] bg-[#0B1425] text-white placeholder:text-slate-500 p-3 mb-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
              />

              {/* EDIT CHAPTER NAME */}
              <input
                value={editNote.chapter_name || ""}
                onChange={(e) =>
                  setEditNote({
                    ...editNote,
                    chapter_name: e.target.value,
                  })
                }
                placeholder="Chapter Name"
                className="w-full rounded-xl border border-white/[0.08] bg-[#0B1425] text-white placeholder:text-slate-500 p-3 mb-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
              />

              {/* EDIT CLASS NOTE LINK */}
              <input
                value={editNote.class_note_link || ""}
                onChange={(e) =>
                  setEditNote({
                    ...editNote,
                    class_note_link: e.target.value,
                  })
                }
                placeholder="Class Note Link"
                className="w-full rounded-xl border border-white/[0.08] bg-[#0B1425] text-white placeholder:text-slate-500 p-3 mb-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
              />

              {/* EDIT MARKED BOOK LINK */}
              <input
                value={editNote.marked_book_link || ""}
                onChange={(e) =>
                  setEditNote({
                    ...editNote,
                    marked_book_link: e.target.value,
                  })
                }
                placeholder="Marked Book Link"
                className="w-full rounded-xl border border-white/[0.08] bg-[#0B1425] text-white placeholder:text-slate-500 p-3 mb-5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]"
              />

              <div className="flex gap-3">
                {/* SAVE */}
                <button
                  onClick={updateNote}
                  className="flex-1 bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-600 transition"
                >
                  Save
                </button>

                {/* CANCEL */}
                <button
                  onClick={() => setEditNote(null)}
                  className="flex-1 border border-white/[0.1] text-slate-300 px-6 py-3 rounded-xl font-medium hover:bg-white/5 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================
            DELETE CONFIRMATION MODAL
        ========================= */}

        {deleteTarget && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card-lift rounded-3xl border border-red-400/20 bg-[#101A2C] p-6 max-w-md w-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-400/20 flex items-center justify-center">
                    <Trash2 className="h-5 w-5 text-red-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">নোট মুছে ফেলুন?</h3>
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
                  অধ্যায়-{deleteTarget.chapter_number}: {deleteTarget.chapter_name}
                </span>{" "}
                — এই নোটটি স্থায়ীভাবে মুছে ফেলতে চান? এই কাজটি আর ফেরানো যাবে না।
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 rounded-xl border border-white/[0.1] text-slate-300 py-2.5 font-medium hover:bg-white/5 transition"
                >
                  বাতিল
                </button>
                <button
                  onClick={async () => {
                    await deleteNote(deleteTarget);
                    setDeleteTarget(null);
                  }}
                  className="flex-1 rounded-xl bg-red-500 text-white py-2.5 font-medium hover:bg-red-600 transition"
                >
                  হ্যাঁ, মুছুন
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}