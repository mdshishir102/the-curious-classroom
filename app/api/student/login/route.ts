import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const authOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};

function reply(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function invalidLogin() {
  return reply(
    { error: "Student ID অথবা Password সঠিক নয়, অথবা লগইন বন্ধ আছে।" },
    401
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    const studentID =
      typeof body?.studentID === "string"
        ? body.studentID.trim()
        : "";

    const password =
      typeof body?.password === "string"
        ? body.password
        : "";

    if (
      !studentID ||
      studentID.length > 100 ||
      !password ||
      password.length > 1024
    ) {
      return invalidLogin();
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    const publicKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !secretKey || !publicKey) {
      return reply(
        { error: "Server-এর Supabase configuration অসম্পূর্ণ।" },
        503
      );
    }

    // This client stays on the server.
    const admin = createClient(url, secretKey, authOptions);

    const { data: student, error: studentError } = await admin
      .from("students")
      .select(
        "id, student_id, student_name, student_photo, class, batch, whatsapp, auth_user_id, login_enabled"
      )
      .eq("student_id", studentID)
      .single();

    if (
      studentError ||
      !student?.auth_user_id ||
      student.login_enabled !== true
    ) {
      return invalidLogin();
    }

    const { data: account, error: accountError } =
      await admin.auth.admin.getUserById(student.auth_user_id);

    if (
      accountError ||
      !account.user?.email ||
      account.user.app_metadata?.account_type !== "student" ||
      account.user.app_metadata?.student_record_id !== String(student.id)
    ) {
      return invalidLogin();
    }

    // Supabase Auth verifies the password.
    // Never compare against the students.password column.
    const authClient = createClient(url, publicKey, authOptions);

    const { data: login, error: loginError } =
      await authClient.auth.signInWithPassword({
        email: account.user.email,
        password,
      });

    if (
      loginError ||
      !login.session ||
      login.user?.id !== student.auth_user_id
    ) {
      return invalidLogin();
    }

    return reply({
      session: {
        access_token: login.session.access_token,
        refresh_token: login.session.refresh_token,
      },
      student: {
        id: student.id,
        student_id: student.student_id,
        student_name: student.student_name,
        student_photo: student.student_photo,
        class: student.class,
        batch: student.batch,
        whatsapp: student.whatsapp,
      },
    });
  } catch {
    return reply(
      { error: "লগইন করতে সমস্যা হচ্ছে। কিছুক্ষণ পর আবার চেষ্টা করুন।" },
      500
    );
  }
}