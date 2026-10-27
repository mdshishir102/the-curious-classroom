import { NextResponse } from "next/server";
import { AdminApiError } from "@/lib/supabase-admin";
import { requireStudent } from "@/lib/recordedStudent";

// ভিডিও ID শুধু তখনই যাবে যখন lecture unlocked এবং স্টুডেন্টের নিজের ক্লাসের
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabaseAdmin, classLevel } = await requireStudent(req);
    const { id } = await params;

    const { data } = await supabaseAdmin
      .from("recorded_lectures")
      .select("title, youtube_id, is_locked, class_level")
      .eq("id", id)
      .maybeSingle();

    if (!data || data.class_level !== classLevel)
      return NextResponse.json({ error: "Lecture পাওয়া যায়নি।" }, { status: 404 });
    if (data.is_locked)
      return NextResponse.json({ error: "এই lecture এখনো locked।" }, { status: 403 });

    return NextResponse.json({ title: data.title, youtubeId: data.youtube_id });
  } catch (e) {
    if (e instanceof AdminApiError)
      return NextResponse.json({ error: e.message }, { status: e.status });
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}