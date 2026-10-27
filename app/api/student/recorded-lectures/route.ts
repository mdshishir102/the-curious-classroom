import { NextResponse } from "next/server";
import { AdminApiError } from "@/lib/supabase-admin";
import { requireStudent } from "@/lib/recordedStudent";

// স্টুডেন্টের নিজের ক্লাসের lecture তালিকা।
// youtube_id কখনোই এখানে পাঠানো হয় না।
export async function GET(req: Request) {
  try {
    const { supabaseAdmin, classLevel } = await requireStudent(req);

    const { data, error } = await supabaseAdmin
      .from("recorded_lectures")
      .select("id, paper, chapter_name, chapter_order, lecture_number, title, is_locked")
      .eq("class_level", classLevel)
      .order("chapter_order")
      .order("lecture_number");
    if (error) throw error;

    return NextResponse.json({ classLevel, lectures: data });
  } catch (e) {
    if (e instanceof AdminApiError)
      return NextResponse.json({ error: e.message }, { status: e.status });
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}