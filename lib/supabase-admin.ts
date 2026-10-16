import { createClient } from "@supabase/supabase-js";

export class AdminApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

// Only import this file inside server-side API routes.
export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new AdminApiError(
      "Server configuration is incomplete.",
      503
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function requireAdmin(req: Request) {
  const authorization = req.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);
  const token = match?.[1];

  if (!token) {
    throw new AdminApiError(
      "Please sign in as an admin.",
      401
    );
  }

  const supabaseAdmin = createSupabaseAdmin();

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    throw new AdminApiError(
      "Your session is invalid or expired. Please sign in again.",
      401
    );
  }

  const { data: admin, error: adminError } =
    await supabaseAdmin
      .from("admins")
      .select("auth_user_id, role")
      .eq("auth_user_id", user.id)
      .maybeSingle();

  if (adminError) {
    throw new AdminApiError(
      "Unable to verify admin access.",
      503
    );
  }

  if (!admin || admin.role !== "admin") {
    throw new AdminApiError(
      "Admin access required.",
      403
    );
  }

  return {
    supabaseAdmin,
    adminUserId: user.id,
  };
}