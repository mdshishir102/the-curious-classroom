import { NextResponse } from "next/server";
import { AdminApiError, requireAdmin } from "@/lib/supabase-admin";

// YouTube লিংক থেকে ১১ অক্ষরের video ID বের করে
function extractYouTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.hostname === "youtu.be") return u.pathname.slice(1, 12) || null;
    if (u.hostname.endsWith("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v.slice(0, 11);
      const m = u.pathname.match(/\/(embed|shorts|live)\/([\w-]{11})/);
      if (m) return m[2];
    }
  } catch {}
  return null;
}

function fail(e: unknown) {
  if (e instanceof AdminApiError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  console.error(e);
  return NextResponse.json({ error: "Server error" }, { status: 500 });
}

// সব lecture দেখাও
export async function GET(req: Request) {
  try {
    const { supabaseAdmin } = await requireAdmin(req);
    const { data, error } = await supabaseAdmin
      .from("recorded_lectures")
      .select("*")
      .order("class_level")
      .order("paper", { nullsFirst: true })
      .order("chapter_order")
      .order("lecture_number");
    if (error) throw error;
    return NextResponse.json({ lectures: data });
  } catch (e) {
    return fail(e);
  }
}

// নতুন lecture যোগ করো (শুরুতে locked থাকবে)
export async function POST(req: Request) {
  try {
    const { supabaseAdmin } = await requireAdmin(req);
    const b = await req.json();

    const youtubeId = extractYouTubeId(String(b.youtubeUrl ?? ""));
    if (!youtubeId)
      return NextResponse.json({ error: "YouTube link ঠিক নেই" }, { status: 400 });

    const classLevel = Number(b.classLevel);
    if (![9, 10, 11, 12].includes(classLevel))
      return NextResponse.json({ error: "Class ঠিক নেই" }, { status: 400 });

    const needsPaper = classLevel === 11 || classLevel === 12;
    if (needsPaper && !["1st", "2nd"].includes(b.paper))
      return NextResponse.json({ error: "Paper select করো" }, { status: 400 });

    if (!b.chapterName?.trim() || !b.title?.trim() || !Number(b.lectureNumber))
      return NextResponse.json(
        { error: "Chapter, lecture number আর title দাও" },
        { status: 400 }
      );

    const { data, error } = await supabaseAdmin
      .from("recorded_lectures")
      .insert({
        class_level: classLevel,
        paper: needsPaper ? b.paper : null,
        chapter_name: b.chapterName.trim(),
        chapter_order: Number(b.chapterOrder) || 1,
        lecture_number: Number(b.lectureNumber),
        title: b.title.trim(),
        youtube_id: youtubeId,
        is_locked: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505")
        return NextResponse.json(
          { error: "এই chapter-এ এই lecture number আগে থেকেই আছে" },
          { status: 409 }
        );
      throw error;
    }
    return NextResponse.json({ lecture: data });
  } catch (e) {
    return fail(e);
  }
}

// Lock / Unlock: { ids: ["..."], isLocked: true/false }
export async function PATCH(req: Request) {
  try {
    const { supabaseAdmin } = await requireAdmin(req);
    const { ids, isLocked } = await req.json();
    if (!Array.isArray(ids) || !ids.length || typeof isLocked !== "boolean")
      return NextResponse.json({ error: "Bad request" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from("recorded_lectures")
      .update({ is_locked: isLocked })
      .in("id", ids);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}

// Lecture ডিলিট
export async function DELETE(req: Request) {
  try {
    const { supabaseAdmin } = await requireAdmin(req);
    const { id } = await req.json();
    const { error } = await supabaseAdmin
      .from("recorded_lectures")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}