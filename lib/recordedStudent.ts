import { AdminApiError, createSupabaseAdmin } from "@/lib/supabase-admin";

// লগইন করা স্টুডেন্টকে যাচাই করে এবং তার ক্লাস (9/10/11/12) বের করে
export async function requireStudent(req: Request) {
  const token = req.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) throw new AdminApiError("আবার লগইন করো।", 401);

  const supabaseAdmin = createSupabaseAdmin();

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) throw new AdminApiError("Session শেষ হয়ে গেছে। আবার লগইন করো।", 401);

  const { data: student, error } = await supabaseAdmin
    .from("students")
    .select("id, class, status, login_enabled, device_locked")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error) throw new AdminApiError("তথ্য যাচাই করা যায়নি।", 503);
  if (!student || student.status !== "approved" || !student.login_enabled)
    throw new AdminApiError("তোমার অ্যাকাউন্টে এই সেবা চালু নেই।", 403);
  if (student.device_locked)
    throw new AdminApiError("তোমার অ্যাকাউন্ট লক করা আছে। কর্তৃপক্ষের সাথে যোগাযোগ করো।", 403);

  // "Class 12" -> 12
  const classLevel = parseInt(String(student.class ?? "").replace(/\D/g, ""), 10);
  if (![9, 10, 11, 12].includes(classLevel))
    throw new AdminApiError("তোমার ক্লাসের Recorded Class এখনো নেই।", 403);

  return { supabaseAdmin, classLevel };
}