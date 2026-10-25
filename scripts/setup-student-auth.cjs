const { loadEnvConfig } = require("@next/env");
const { createClient } = require("@supabase/supabase-js");
const { randomUUID, randomBytes } = require("node:crypto");
const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");

loadEnvConfig(process.cwd());

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      ".env.local-এ NEXT_PUBLIC_SUPABASE_URL এবং SUPABASE_SECRET_KEY লাগবে।"
    );
  }

  const supabase = createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const terminal = readline.createInterface({ input: stdin, output: stdout });

  try {
    const studentID = (
      await terminal.question("শিক্ষার্থীর Student ID লিখুন: ")
    ).trim();

    if (!studentID) {
      throw new Error("Student ID দেওয়া হয়নি।");
    }

    const { data: student, error: lookupError } = await supabase
      .from("students")
      .select("id, student_id, student_name, auth_user_id, login_enabled")
      .eq("student_id", studentID)
      .single();

    if (lookupError || !student) {
      throw new Error(
        "এই ID দিয়ে ঠিক একজন শিক্ষার্থী পাওয়া যায়নি। Student ID পরীক্ষা করুন।"
      );
    }

    if (student.auth_user_id) {
      console.log(
        "এই শিক্ষার্থীর Auth account ইতিমধ্যে যুক্ত আছে। কোনো পরিবর্তন করা হয়নি।"
      );
      return;
    }

    if (!student.login_enabled) {
      throw new Error(
        "এই শিক্ষার্থীর login বন্ধ আছে। পরীক্ষার জন্য login চালু থাকা একজনকে বেছে নিন।"
      );
    }

    console.log(`\nশিক্ষার্থী: ${student.student_name}`);
    console.log(`Student ID: ${student.student_id}`);

    const confirmation = (
      await terminal.question(
        "\nএই শিক্ষার্থীর account তৈরি করতে YES লিখুন: "
      )
    ).trim();

    if (confirmation !== "YES") {
      console.log("কোনো পরিবর্তন করা হয়নি।");
      return;
    }

    // Internal login identifier, not a real mailbox.
    const internalEmail = `student-${randomUUID()}@example.com`;

    // Every account receives a different strong password.
    const password = `Tcc!${randomBytes(18).toString("base64url")}9a`;

    const { data: created, error: createError } =
      await supabase.auth.admin.createUser({
        email: internalEmail,
        password,
        email_confirm: true,
        app_metadata: {
          account_type: "student",
          student_record_id: String(student.id),
        },
      });

    if (createError || !created.user) {
      throw new Error(
        `Auth account তৈরি হয়নি: ${
          createError?.message || "Unknown error"
        }`
      );
    }

    const authUserId = created.user.id;

    const { data: linked, error: linkError } = await supabase
      .from("students")
      .update({ auth_user_id: authUserId })
      .eq("id", student.id)
      .is("auth_user_id", null)
      .select("id")
      .maybeSingle();

    if (linkError || !linked) {
      console.error(
        "\nAuth account তৈরি হয়েছে, কিন্তু student record-এর সঙ্গে যুক্ত হয়নি।"
      );
      console.error("নতুন Auth User ID:", authUserId);
      console.error(
        "এই অবস্থায় script আবার চালাবেন না। এই error message জানান; password নয়।"
      );
      process.exitCode = 1;
      return;
    }

    console.log("\nSUCCESS — Auth account তৈরি ও যুক্ত হয়েছে।");
    console.log("Student ID:", student.student_id);
    console.log("নতুন Password:", password);
    console.log(
      "\nPassword ব্যক্তিগতভাবে নিরাপদ স্থানে রাখুন। Chat বা screenshot-এ পাঠাবেন না।"
    );
    console.log(
      "নতুন login code বসানোর পর এই password ব্যবহার করা যাবে।"
    );
  } finally {
    terminal.close();
  }
}

main().catch((error) => {
  console.error("\nERROR:", error.message);
  process.exitCode = 1;
});