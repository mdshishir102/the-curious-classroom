
import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

const authOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};

export type AdminCheck =
  | {
      ok: true;
      admin: SupabaseClient;
      url: string;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

export async function authorizeStudentAdmin(
  request: Request
): Promise<AdminCheck> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !secret || !publicKey) {
    return {
      ok: false,
      status: 503,
      error: "Supabase configuration incomplete.",
    };
  }

  const authorization =
    request.headers.get("authorization");

  const token = authorization
    ?.match(/^Bearer\s+(\S+)$/i)?.[1];

  if (!token) {
    return {
      ok: false,
      status: 401,
      error: "Please login as Admin again.",
    };
  }

  const admin = createClient(
    url,
    secret,
    authOptions
  );

  const verifier = createClient(
    url,
    publicKey,
    authOptions
  );

  const {
    data: identity,
    error: identityError,
  } = await verifier.auth.getUser(token);

  if (identityError || !identity.user) {
    return {
      ok: false,
      status: 401,
      error: "Invalid admin session.",
    };
  }

  const {
    data: permissions,
    error: permissionsError,
  } = await admin
    .from("admins")
    .select("uuid")
    .eq("auth_user_id", identity.user.id)
    .eq("role", "admin")
    .limit(1);

  if (permissionsError) {
    throw new Error("ADMIN_LOOKUP_FAILED");
  }

  if (!permissions?.length) {
    return {
      ok: false,
      status: 403,
      error: "Admin access required.",
    };
  }

  return {
    ok: true,
    admin,
    url,
  };
}

export function studentRecordId(
  value: unknown
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value <= 0
  ) {
    return null;
  }

  return value;
}
