"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function StudentNotesPage() {
  const [student, setStudent] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadStudentNotes();
  }, []);

  async function loadStudentNotes() {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = localStorage.getItem("student");

      if (!data) {
        setErrorMessage(
          "Student information not found. Please login again."
        );
        return;
      }

      let studentData;

      try {
        studentData = JSON.parse(data);
      } catch (error) {
        console.error("Invalid student data:", error);

        setErrorMessage(
          "Student information is invalid. Please login again."
        );

        return;
      }

      setStudent(studentData);

      if (!studentData?.class) {
        setErrorMessage(
          "Student class information not found."
        );

        return;
      }

      const { data: noteData, error } = await supabase
        .from("class_notes")
        .select("*")
        .eq("class_name", studentData.class)
        .order("subject", {
          ascending: true,
        })
        .order("chapter_number", {
          ascending: true,
        });

      if (error) {
        console.error("Class notes error:", error);

        setErrorMessage(error.message);

        return;
      }

      setNotes(noteData || []);
    } catch (error: any) {
      console.error(
        "Unexpected notes error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Something went wrong while loading notes."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
        "
      >
        Loading Notes...
      </div>
    );
  }

  const groupedNotes = notes.reduce(
    (acc: any, note: any) => {
      const subject =
        note?.subject || "Biology";

      if (!acc[subject]) {
        acc[subject] = [];
      }

      acc[subject].push(note);

      return acc;
    },
    {}
  );

  return (
    <main
      className="
        min-h-screen
        bg-gradient-to-br
        from-blue-50
        via-white
        to-indigo-50
        p-6
      "
    >
      <div className="max-w-5xl mx-auto">

        {/* PAGE TITLE */}

        <h1
          className="
            text-3xl
            font-bold
            text-blue-700
            mb-8
          "
        >
          📚 Class Notes
        </h1>

        {/* STUDENT CLASS */}

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
            mb-8
          "
        >
          <h2
            className="
              text-xl
              font-bold
            "
          >
            {student?.class || "Class"}
          </h2>

          <p className="text-gray-500">
            Biology Notes
          </p>
        </div>

        {/* ERROR */}

        {errorMessage && (
          <div
            className="
              bg-red-50
              border
              border-red-200
              text-red-600
              rounded-2xl
              p-5
              mb-6
            "
          >
            <p className="font-bold">
              Unable to load notes
            </p>

            <p className="text-sm mt-1">
              {errorMessage}
            </p>
          </div>
        )}

        {/* NO NOTES */}

        {!errorMessage &&
        notes.length === 0 ? (
          <div
            className="
              bg-white
              rounded-3xl
              p-6
              shadow
              text-gray-500
            "
          >
            No notes available
          </div>
        ) : (
          <div className="space-y-8">

            {Object.entries(
              groupedNotes
            ).map(
              ([subject, items]: any) => (
                <div
                  key={subject}
                  className="
                    bg-white
                    rounded-3xl
                    shadow-lg
                    p-6
                  "
                >
                  {/* SUBJECT */}

                  <h2
                    className="
                      text-2xl
                      font-bold
                      text-gray-800
                      mb-5
                    "
                  >
                    🧬 {subject}
                  </h2>

                  <div className="space-y-4">

                    {items.map(
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

                          <h3
                            className="
                              text-lg
                              font-bold
                              text-gray-800
                            "
                          >
                            📖 অধ্যায়-
                            {note.chapter_number}
                          </h3>

                          {/* CHAPTER NAME */}

                          <p
                            className="
                              text-gray-600
                              mt-1
                            "
                          >
                            {note.chapter_name}
                          </p>

                          {/* RELEASED */}

                          {note.is_released ? (
                            <div
                              className="
                                mt-4
                                flex
                                flex-col
                                gap-3
                              "
                            >
                              <div
                                className="
                                  text-green-600
                                  font-bold
                                "
                              >
                                ✅ Available
                              </div>

                              {/* CLASS NOTE */}

                              {note.class_note_link && (
                                <a
                                  href={
                                    note.class_note_link
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="
                                    bg-blue-600
                                    hover:bg-blue-700
                                    text-white
                                    px-5
                                    py-3
                                    rounded-xl
                                    font-bold
                                    text-center
                                    transition
                                  "
                                >
                                  📒 Class Note
                                </a>
                              )}

                              {/* MARKED BOOK */}

                              {note.marked_book_link && (
                                <a
                                  href={
                                    note.marked_book_link
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="
                                    bg-green-600
                                    hover:bg-green-700
                                    text-white
                                    px-5
                                    py-3
                                    rounded-xl
                                    font-bold
                                    text-center
                                    transition
                                  "
                                >
                                  📖 দাগানো বই
                                </a>
                              )}
                            </div>
                          ) : (

                            /* LOCKED */

                            <div
                              className="
                                mt-4
                                bg-gray-200
                                text-gray-600
                                px-4
                                py-3
                                rounded-xl
                                font-bold
                              "
                            >
                              🔒 Locked

                              <br />

                              এই অধ্যায়ের নোট
                              এখনো প্রকাশ করা হয়নি
                            </div>
                          )}

                        </div>
                      )
                    )}

                  </div>
                </div>
              )
            )}

          </div>
        )}

      </div>
    </main>
  );
}