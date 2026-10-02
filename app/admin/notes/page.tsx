"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

  const classes = [
    "Class 9",
    "Class 10",
    "Class 11",
    "Class 12",
  ];

  function getSubjects() {
    if (
      className === "Class 11" ||
      className === "Class 12"
    ) {
      return [
        "Biology 1st Paper",
        "Biology 2nd Paper",
      ];
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
      .order("class_name", {
        ascending: true,
      })
      .order("subject", {
        ascending: true,
      })
      .order("chapter_number", {
        ascending: true,
      });

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
    if (
      !chapterNumber ||
      !chapterName.trim()
    ) {
      alert(
        "Chapter Number and Chapter Name required"
      );
      return;
    }

    const { error } = await supabase
      .from("class_notes")
      .insert({
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

    if (
      !editNote.chapter_number ||
      !editNote.chapter_name?.trim()
    ) {
      alert(
        "Chapter Number and Chapter Name required"
      );
      return;
    }

    const { error } = await supabase
      .from("class_notes")
      .update({
        chapter_number: Number(
          editNote.chapter_number
        ),
        chapter_name:
          editNote.chapter_name.trim(),
        class_note_link:
          editNote.class_note_link || "",
        marked_book_link:
          editNote.marked_book_link || "",
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
  // DELETE NOTE
  // =========================

  async function deleteNote(note: any) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmDelete) return;

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

  // =========================
  // GROUP NOTES
  // =========================

  const groupedNotes = notes.reduce(
    (acc: any, note: any) => {
      if (!acc[note.class_name]) {
        acc[note.class_name] = {};
      }

      if (!acc[note.class_name][note.subject]) {
        acc[note.class_name][note.subject] = [];
      }

      acc[note.class_name][note.subject].push(
        note
      );

      return acc;
    },
    {}
  );

  // =========================
  // UI
  // =========================

  return (
    <main
      className="
        min-h-screen
        bg-gradient-to-br
        from-blue-50
        via-white
        to-indigo-100
        p-6
      "
    >
      <div className="max-w-6xl mx-auto">

        {/* PAGE TITLE */}

        <h1
          className="
            text-4xl
            font-bold
            text-gray-800
            mb-8
          "
        >
          📚 Class Notes Management
        </h1>

        {/* =========================
            ADD NEW NOTE
        ========================= */}

        <div
          className="
            bg-white
            rounded-3xl
            shadow-xl
            p-8
          "
        >
          <h2
            className="
              text-2xl
              font-bold
              mb-6
              text-blue-700
            "
          >
            Add New Note
          </h2>

          {/* CLASS */}

          <select
            value={className}
            onChange={(e) => {
              const selectedClass =
                e.target.value;

              setClassName(selectedClass);

              setSubject(
                selectedClass === "Class 11" ||
                selectedClass === "Class 12"
                  ? "Biology 1st Paper"
                  : "Biology"
              );
            }}
            className="
              w-full
              rounded-xl
              border
              p-3
              mb-4
            "
          >
            {classes.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>

          {/* SUBJECT */}

          <select
            value={subject}
            onChange={(e) =>
              setSubject(e.target.value)
            }
            className="
              w-full
              rounded-xl
              border
              p-3
              mb-4
            "
          >
            {getSubjects().map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>

          {/* CHAPTER NUMBER */}

          <input
            type="number"
            placeholder="Chapter Number"
            value={chapterNumber}
            onChange={(e) =>
              setChapterNumber(e.target.value)
            }
            className="
              w-full
              rounded-xl
              border
              p-3
              mb-4
            "
          />

          {/* CHAPTER NAME */}

          <input
            placeholder="Chapter Name"
            value={chapterName}
            onChange={(e) =>
              setChapterName(e.target.value)
            }
            className="
              w-full
              rounded-xl
              border
              p-3
              mb-4
            "
          />

          {/* CLASS NOTE LINK */}

          <input
            placeholder="📒 Class Note Drive Link (optional)"
            value={classNoteLink}
            onChange={(e) =>
              setClassNoteLink(e.target.value)
            }
            className="
              w-full
              rounded-xl
              border
              p-3
              mb-4
            "
          />

          {/* MARKED BOOK LINK */}

          <input
            placeholder="📖 দাগানো বই Drive Link (optional)"
            value={markedBookLink}
            onChange={(e) =>
              setMarkedBookLink(e.target.value)
            }
            className="
              w-full
              rounded-xl
              border
              p-3
              mb-6
            "
          />

          {/* ADD BUTTON */}

          <button
            onClick={addNote}
            className="
              rounded-xl
              bg-blue-600
              px-6
              py-3
              text-white
              font-bold
              hover:bg-blue-700
            "
          >
            Add Note
          </button>
        </div>

        {/* =========================
            NOTES LIST
        ========================= */}

        <div
          className="
            mt-10
            space-y-8
          "
        >
          {loading ? (
            <div
              className="
                bg-white
                rounded-3xl
                shadow-lg
                p-8
                text-center
                text-gray-500
              "
            >
              Loading notes...
            </div>
          ) : (
            Object.entries(groupedNotes).map(
              ([className, subjects]: any) => (
                <div
                  key={className}
                  className="
                    bg-white
                    rounded-3xl
                    shadow-lg
                    p-6
                  "
                >
                  {/* CLASS NAME */}

                  <h2
                    className="
                      text-2xl
                      font-bold
                      text-blue-700
                      mb-5
                    "
                  >
                    📘 {className}
                  </h2>

                  {Object.entries(subjects).map(
                    ([subject, items]: any) => (
                      <div
                        key={subject}
                        className="mb-8"
                      >
                        {/* SUBJECT */}

                        <h3
                          className="
                            text-xl
                            font-bold
                            text-gray-800
                            mb-4
                          "
                        >
                          🧬 {subject}
                        </h3>

                        <div className="space-y-4">
                          {items
                            .sort(
                              (
                                a: any,
                                b: any
                              ) =>
                                (
                                  Number(
                                    a.chapter_number
                                  ) || 999
                                ) -
                                (
                                  Number(
                                    b.chapter_number
                                  ) || 999
                                )
                            )
                            .map(
                              (note: any) => (
                                <div
                                  key={note.id}
                                  className="
                                    border
                                    rounded-2xl
                                    p-5
                                    bg-gray-50
                                  "
                                >
                                  {/* CHAPTER NUMBER */}

                                  <h4
                                    className="
                                      font-bold
                                      text-lg
                                    "
                                  >
                                    অধ্যায়-
                                    {
                                      note.chapter_number
                                    }
                                  </h4>

                                  {/* CHAPTER NAME */}

                                  <p
                                    className="
                                      text-gray-600
                                      mt-1
                                    "
                                  >
                                    {
                                      note.chapter_name
                                    }
                                  </p>

                                  {/* AVAILABLE LINKS */}

                                  <div
                                    className="
                                      flex
                                      gap-3
                                      mt-3
                                      flex-wrap
                                    "
                                  >
                                    {note.class_note_link && (
                                      <span
                                        className="
                                          bg-blue-100
                                          text-blue-700
                                          px-3
                                          py-1
                                          rounded-full
                                        "
                                      >
                                        📒 Note Available
                                      </span>
                                    )}

                                    {note.marked_book_link && (
                                      <span
                                        className="
                                          bg-green-100
                                          text-green-700
                                          px-3
                                          py-1
                                          rounded-full
                                        "
                                      >
                                        📖 Book Available
                                      </span>
                                    )}
                                  </div>

                                  {/* RELEASE */}

                                  <button
                                    onClick={() =>
                                      toggleRelease(
                                        note
                                      )
                                    }
                                    className={`
                                      mt-4
                                      px-5
                                      py-2
                                      rounded-xl
                                      text-white
                                      font-bold
                                      ${
                                        note.is_released
                                          ? "bg-red-500 hover:bg-red-600"
                                          : "bg-green-600 hover:bg-green-700"
                                      }
                                    `}
                                  >
                                    {note.is_released
                                      ? "Lock"
                                      : "Release"}
                                  </button>

                                  {/* EDIT + DELETE */}

                                  <div
                                    className="
                                      flex
                                      gap-3
                                      mt-4
                                    "
                                  >
                                    <button
                                      onClick={() =>
                                        setEditNote(
                                          note
                                        )
                                      }
                                      className="
                                        px-5
                                        py-2
                                        rounded-xl
                                        bg-blue-600
                                        text-white
                                        font-bold
                                        hover:bg-blue-700
                                      "
                                    >
                                      ✏️ Edit
                                    </button>

                                    <button
                                      onClick={() =>
                                        deleteNote(
                                          note
                                        )
                                      }
                                      className="
                                        px-5
                                        py-2
                                        rounded-xl
                                        bg-red-600
                                        text-white
                                        font-bold
                                        hover:bg-red-700
                                      "
                                    >
                                      🗑️ Delete
                                    </button>
                                  </div>
                                </div>
                              )
                            )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )
            )
          )}
        </div>

        {/* =========================
            EDIT MODAL
        ========================= */}

        {editNote && (
          <div
            className="
              fixed
              inset-0
              bg-black/40
              flex
              items-center
              justify-center
              z-50
              p-4
            "
          >
            <div
              className="
                bg-white
                rounded-3xl
                p-8
                w-full
                max-w-[500px]
              "
            >
              <h2
                className="
                  text-2xl
                  font-bold
                  mb-5
                "
              >
                ✏️ Edit Note
              </h2>

              <p
                className="
                  text-gray-500
                  mb-5
                "
              >
                {editNote.class_name}
                {" - "}
                {editNote.subject}
              </p>

              {/* EDIT CHAPTER NUMBER */}

              <input
                type="number"
                value={
                  editNote.chapter_number || ""
                }
                onChange={(e) =>
                  setEditNote({
                    ...editNote,
                    chapter_number:
                      e.target.value,
                  })
                }
                placeholder="Chapter Number"
                className="
                  w-full
                  border
                  rounded-xl
                  p-3
                  mb-3
                "
              />

              {/* EDIT CHAPTER NAME */}

              <input
                value={
                  editNote.chapter_name || ""
                }
                onChange={(e) =>
                  setEditNote({
                    ...editNote,
                    chapter_name:
                      e.target.value,
                  })
                }
                placeholder="Chapter Name"
                className="
                  w-full
                  border
                  rounded-xl
                  p-3
                  mb-3
                "
              />

              {/* EDIT CLASS NOTE LINK */}

              <input
                value={
                  editNote.class_note_link || ""
                }
                onChange={(e) =>
                  setEditNote({
                    ...editNote,
                    class_note_link:
                      e.target.value,
                  })
                }
                placeholder="Class Note Link"
                className="
                  w-full
                  border
                  rounded-xl
                  p-3
                  mb-3
                "
              />

              {/* EDIT MARKED BOOK LINK */}

              <input
                value={
                  editNote.marked_book_link || ""
                }
                onChange={(e) =>
                  setEditNote({
                    ...editNote,
                    marked_book_link:
                      e.target.value,
                  })
                }
                placeholder="Marked Book Link"
                className="
                  w-full
                  border
                  rounded-xl
                  p-3
                  mb-5
                "
              />

              {/* SAVE */}

              <button
                onClick={updateNote}
                className="
                  bg-green-600
                  text-white
                  px-6
                  py-3
                  rounded-xl
                  font-bold
                  hover:bg-green-700
                "
              >
                Save
              </button>

              {/* CANCEL */}

              <button
                onClick={() =>
                  setEditNote(null)
                }
                className="
                  ml-3
                  bg-gray-400
                  text-white
                  px-6
                  py-3
                  rounded-xl
                  hover:bg-gray-500
                "
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}