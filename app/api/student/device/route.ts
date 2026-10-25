import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const body = await req.json().catch(() => ({}));

  const deviceId = body?.deviceId;
  const mode = body?.mode; // "login" ba "check"
  const clientVersion = body?.sessionVersion;

  if (!token || !deviceId || !["login", "check"].includes(mode)) {
    return NextResponse.json({ status: "error" }, { status: 400 });
  }

  const {
    data: { user },
    error: userError,
  } = await admin.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json({ status: "error" }, { status: 401 });
  }

  const { data: student, error } = await admin
    .from("students")
    .select("id, active_device_id, device_locked, session_version")
    .eq("auth_user_id", user.id)
    .single();

  if (error || !student) {
    return NextResponse.json({ status: "error" }, { status: 404 });
  }

  if (student.device_locked) {
    return NextResponse.json({ status: "locked" });
  }

  // ===== LOGIN: notun login er chesta =====
  if (mode === "login") {
    if (!student.active_device_id) {
      await admin
        .from("students")
        .update({ active_device_id: deviceId })
        .eq("id", student.id);

      return NextResponse.json({
        status: "ok",
        sessionVersion: student.session_version,
      });
    }

    if (student.active_device_id === deviceId) {
      return NextResponse.json({
        status: "ok",
        sessionVersion: student.session_version,
      });
    }

    // Onno device theke login: lock
    await admin
      .from("students")
      .update({
        device_locked: true,
        device_locked_at: new Date().toISOString(),
      })
      .eq("id", student.id);

    return NextResponse.json({ status: "locked" });
  }

  // ===== CHECK: login thaka device er routine check =====
  if (
    clientVersion === null ||
    clientVersion === undefined ||
    Number(clientVersion) !== student.session_version ||
    student.active_device_id !== deviceId
  ) {
    return NextResponse.json({ status: "expired" });
  }

  return NextResponse.json({
    status: "ok",
    sessionVersion: student.session_version,
  });
}