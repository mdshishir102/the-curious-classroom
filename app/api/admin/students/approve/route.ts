import { NextResponse } from "next/server";
import { createClient, type User } from "@supabase/supabase-js";

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

export async function POST(request: Request) {
  let step = "configuration";

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secret = process.env.SUPABASE_SECRET_KEY;
    const publicKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !secret || !publicKey) {
      return reply(
        { error: "Server-এর Supabase configuration অসম্পূর্ণ।" },
        503
      );
    }

    const authorization = request.headers.get("authorization");
    const token = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];

    if (!token) {
      return reply({ error: "আবার Admin Login করুন।" }, 401);
    }

    const admin = createClient(url, secret, authOptions);
    const verifier = createClient(url, publicKey, authOptions);

    // Validate the caller with Supabase Auth.
    step = "verify-admin-session";

    const { data: identity, error: identityError } =
      await verifier.auth.getUser(token);

    if (identityError || !identity.user) {
      return reply({ error: "আবার Admin Login করুন।" }, 401);
    }

    // A valid login alone does not grant admin access.
    const { data: permissions, error: permissionsError } =
      await admin
        .from("admins")
        .select("uuid")
        .eq("auth_user_id", identity.user.id)
        .eq("role", "admin")
        .limit(1);

    if (permissionsError) throw new Error("ADMIN_LOOKUP_FAILED");

    if (!permissions?.length) {
      return reply({ error: "এই কাজের জন্য Admin access প্রয়োজন।" }, 403);
    }

    const body = await request.json().catch(() => null);
    const id = body?.id;

    if (
      typeof id !== "number" ||
      !Number.isSafeInteger(id) ||
      id <= 0
    ) {
      return reply({ error: "সঠিক student record ID পাওয়া যায়নি।" }, 400);
    }

    // Reserve the login credentials atomically in PostgreSQL.
    step = "prepare-student";

    const { data: prepared, error: prepareError } =
      await admin.rpc("prepare_student_approval", {
        p_student_id: id,
      });

    if (prepareError) {
      const messages: Record<string, string> = {
        STUDENT_NOT_FOUND: "শিক্ষার্থী পাওয়া যায়নি।",
        STUDENT_NOT_PENDING: "শিক্ষার্থী এখন Pending অবস্থায় নেই।",
        PAYMENT_NOT_VERIFIED: "আগে Mark as Paid দিয়ে payment verify করুন।",
        INVALID_BATCH: "শিক্ষার্থীর SSC/HSC batch ঠিক করুন।",
        INVALID_BATCH_YEAR: "শিক্ষার্থীর batch year ঠিক করুন।",
        EXISTING_AUTH_LINK_REQUIRES_REVIEW:
          "এই শিক্ষার্থীর আগে থেকে Auth সংযোগ আছে। সেটি যাচাই প্রয়োজন।",
      };

      const knownError = Object.keys(messages).find((key) =>
        prepareError.message.includes(key)
      );

      if (knownError) {
        return reply({ error: messages[knownError] }, 409);
      }

      throw new Error("PREPARE_FAILED");
    }

    if (prepared?.already_approved === true) {
      return reply({
        success: true,
        alreadyApproved: true,
        studentID: prepared.student_id,
        message: "এই শিক্ষার্থী আগেই approved হয়েছে।",
      });
    }

    if (
      !prepared ||
      String(prepared.id) !== String(id) ||
      typeof prepared.student_id !== "string" ||
      typeof prepared.password !== "string"
    ) {
      throw new Error("INVALID_PREPARED_DATA");
    }

    const recordID = String(id);
    const email = `student-${recordID}@students.invalid`;
    const password: string = prepared.password;
    const studentID: string = prepared.student_id;

    // Recover accounts created by an interrupted earlier request.
    async function findExistingAccount(): Promise<User | null> {
      const matches: User[] = [];

      for (let page = 1; ; page++) {
        const { data, error } = await admin.auth.admin.listUsers({
          page,
          perPage: 500,
        });

        if (error) throw new Error("AUTH_LOOKUP_FAILED");

        for (const user of data.users) {
          if (
            user.email?.toLowerCase() === email ||
            (
              user.app_metadata?.account_type === "student" &&
              user.app_metadata?.student_record_id === recordID
            )
          ) {
            matches.push(user);
          }
        }

        if (data.users.length < 500) break;
      }

      if (matches.length > 1) {
        throw new Error("MULTIPLE_AUTH_MATCHES");
      }

      return matches[0] ?? null;
    }

    step = "create-auth-account";

    let account = await findExistingAccount();
    let createdNow = false;

    if (!account) {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: {
          account_type: "student",
          student_record_id: recordID,
        },
      });

      if (!error && data.user) {
        account = data.user;
        createdNow = true;
      } else {
        // Another simultaneous request may have created it.
        account = await findExistingAccount();

        if (!account) {
          throw new Error("AUTH_CREATE_FAILED");
        }
      }
    }

    step = "verify-account-ownership";

    if (
      !account.email ||
      account.app_metadata?.account_type !== "student" ||
      account.app_metadata?.student_record_id !== recordID
    ) {
      throw new Error("AUTH_OWNERSHIP_MISMATCH");
    }

    // Never reuse an admin account as a student account.
    const { data: adminLinks, error: adminLinksError } = await admin
      .from("admins")
      .select("uuid")
      .eq("auth_user_id", account.id)
      .limit(1);

    if (adminLinksError || adminLinks?.length) {
      throw new Error("AUTH_ADMIN_CONFLICT");
    }

    const { data: otherLinks, error: otherLinksError } = await admin
      .from("students")
      .select("id")
      .eq("auth_user_id", account.id)
      .neq("id", id)
      .limit(1);

    if (otherLinksError || otherLinks?.length) {
      throw new Error("AUTH_STUDENT_CONFLICT");
    }

    // A retry must verify the existing password, never reset it.
    if (!createdNow) {
      step = "verify-existing-password";

      const studentAuth = createClient(url, publicKey, authOptions);

      const { data, error } =
        await studentAuth.auth.signInWithPassword({
          email: account.email,
          password,
        });

      if (error || !data.session || data.user?.id !== account.id) {
        throw new Error("EXISTING_PASSWORD_MISMATCH");
      }

      await studentAuth.auth.signOut({ scope: "local" });
    }

    // Enable login only after the Auth account is ready.
    step = "finalize-approval";

    const { data: updated, error: updateError } = await admin
      .from("students")
      .update({
        status: "approved",
        auth_user_id: account.id,
        login_enabled: true,
      })
      .eq("id", id)
      .eq("student_id", studentID)
      .eq("status", "pending")
      .eq("payment_status", "paid")
      .is("auth_user_id", null)
      .select("id");

    if (updateError) throw new Error("APPROVAL_UPDATE_FAILED");

    if (!updated?.length) {
      // Recognize a successful simultaneous approval.
      const { data: current, error } = await admin
        .from("students")
        .select("status, auth_user_id, login_enabled, student_id")
        .eq("id", id)
        .single();

      if (
        error ||
        current?.status !== "approved" ||
        current.auth_user_id !== account.id ||
        current.login_enabled !== true ||
        current.student_id !== studentID
      ) {
        return reply(
          {
            error:
              "শিক্ষার্থীর তথ্য পরিবর্তিত হয়েছে। তালিকা refresh করে আবার দেখুন।",
          },
          409
        );
      }
    }

    // Returned only to the verified admin.
    return reply({
      success: true,
      alreadyApproved: false,
      studentID,
      password,
      message: "ভর্তি অনুমোদিত হয়েছে এবং login চালু হয়েছে।",
    });
  } catch {
    // Do not log passwords, keys, tokens or full account data.
    console.error("Student approval failed at:", step);

    return reply(
      {
        error: `Approve সম্পূর্ণ হয়নি (${step})। আবার চেষ্টা করুন; সমস্যা থাকলে এই লেখাটি পাঠান।`,
      },
      500
    );
  }
}