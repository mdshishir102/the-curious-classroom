const { loadEnvConfig } = require("@next/env");
const { createClient } = require("@supabase/supabase-js");

loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const publicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !secret || !publicKey) {
  console.error("Required Supabase environment variables are missing.");
  process.exit(1);
}

const options = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};

const admin = createClient(url, secret, options);

function check(error, step) {
  if (error) {
    // Do not print credentials or complete API responses.
    throw new Error(
      `${step}: ${error.code || error.status || "request_failed"}`
    );
  }
}

async function main() {
  // Read all students, including rows beyond the default API limit.
  const students = [];

  for (let offset = 0; ; offset += 500) {
    const { data, error } = await admin
      .from("students")
      .select(
        "id, student_id, password, status, login_enabled, auth_user_id"
      )
      .order("id")
      .range(offset, offset + 499);

    check(error, "Read students");
    students.push(...data);
    if (data.length < 500) break;
  }

  const { data: admins, error: adminsError } = await admin
    .from("admins")
    .select("auth_user_id");

  check(adminsError, "Read admins");

  const adminIDs = new Set(
    admins.map((row) => row.auth_user_id).filter(Boolean)
  );

  const accounts = [];

  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 500,
    });

    check(error, "Read Auth users");
    accounts.push(...data.users);
    if (data.users.length < 500) break;
  }

  const candidates = students.filter(
    (s) =>
      s.status === "approved" &&
      s.login_enabled === true &&
      !s.auth_user_id
  );

  // Check all candidate IDs before creating any accounts.
  for (const s of candidates) {
    if (
      !s.student_id?.trim() ||
      typeof s.password !== "string" ||
      s.password.length < 6
    ) {
      throw new Error(`Student record ${s.id}: credentials need review.`);
    }

    const matches = students.filter(
      (row) => row.student_id === s.student_id
    );

    if (matches.length !== 1) {
      throw new Error(`Student record ${s.id}: duplicate Student ID.`);
    }
  }

  console.log(`Accounts needing migration: ${candidates.length}`);

  let linked = 0;

  for (const s of candidates) {
    console.log(`Processing student record ${s.id}...`);

    const recordID = String(s.id);
    const email = `student-${recordID}@students.invalid`;

    // Find an account left by an earlier interrupted migration.
    const matches = accounts.filter(
      (user) =>
        user.email?.toLowerCase() === email ||
        (
          user.app_metadata?.account_type === "student" &&
          user.app_metadata?.student_record_id === recordID
        )
    );

    if (matches.length > 1) {
      throw new Error(`Student record ${s.id}: multiple Auth matches.`);
    }

    let account = matches[0];

    if (account) {
      const metadata = account.app_metadata || {};

      if (
        adminIDs.has(account.id) ||
        metadata.account_type !== "student" ||
        metadata.student_record_id !== recordID ||
        !account.email ||
        students.some(
          (row) =>
            row.auth_user_id === account.id &&
            String(row.id) !== recordID
        )
      ) {
        throw new Error(`Student record ${s.id}: account ownership mismatch.`);
      }

      // Verify an existing account without changing its password.
      const verifier = createClient(url, publicKey, options);

      const { data, error } =
        await verifier.auth.signInWithPassword({
          email: account.email,
          password: s.password,
        });

      check(error, `Verify existing account for record ${s.id}`);

      if (data.user?.id !== account.id || !data.session) {
        throw new Error(`Student record ${s.id}: verification failed.`);
      }

      await verifier.auth.signOut({ scope: "local" });
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: s.password,
        email_confirm: true,
        app_metadata: {
          account_type: "student",
          student_record_id: recordID,
        },
      });

      check(error, `Create account for record ${s.id}`);

      if (!data.user) {
        throw new Error(`Student record ${s.id}: no Auth user returned.`);
      }

      account = data.user;
      accounts.push(account);
    }

    // Link only if the student is still approved, enabled and unlinked.
    const { data, error } = await admin
      .from("students")
      .update({ auth_user_id: account.id })
      .eq("id", s.id)
      .eq("student_id", s.student_id)
      .eq("status", "approved")
      .eq("login_enabled", true)
      .is("auth_user_id", null)
      .select("id");

    check(error, `Link account for record ${s.id}`);

    if (data.length !== 1) {
      throw new Error(
        `Student record ${s.id}: row changed; stopped for review.`
      );
    }

    linked++;
    console.log(`Linked student record ${s.id}`);
  }

  console.log(`DONE: ${linked} student accounts linked.`);
  console.log("Previously linked accounts were left unchanged.");
}

main().catch((error) => {
  console.error(`STOPPED: ${error.message}`);
  console.error("Completed links remain saved. Send this error for review.");
  process.exitCode = 1;
});