
import { NextResponse } from "next/server";

import {
  authorizeStudentAdmin,
  studentRecordId,
} from "@/lib/server/adminStudentActions";

export const runtime = "nodejs";

function reply(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function photoStoragePath(
  photo: string,
  projectUrl: string
): string | null {
  try {
    const url = new URL(photo);
    const project = new URL(projectUrl);

    const prefix =
      "/storage/v1/object/public/student-photos/";

    if (
      url.origin !== project.origin ||
      !url.pathname.startsWith(prefix)
    ) {
      return null;
    }

    const path = decodeURIComponent(
      url.pathname.slice(prefix.length)
    );

    if (
      !path ||
      path.includes("\\") ||
      path.split("/").some(
        (part) =>
          !part ||
          part === "." ||
          part === ".."
      )
    ) {
      return null;
    }

    return path;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let step = "authorization";

  try {
    // ====================================
    // 1. VERIFY ADMIN SESSION
    // ====================================

    const access =
      await authorizeStudentAdmin(request);

    if (!access.ok) {
      return reply(
        { error: access.error },
        access.status
      );
    }

    const { admin, url } = access;

    // ====================================
    // 2. VALIDATE CONFIRMATION
    // ====================================

    step = "validate-request";

    const body = await request
      .json()
      .catch(() => null);

    const id = studentRecordId(body?.id);

    const typedStudentID = body?.studentID;
    const expectedName = body?.expectedName;

    if (
      !id ||
      typeof typedStudentID !== "string" ||
      !typedStudentID.trim() ||
      typeof expectedName !== "string" ||
      body?.confirmation !== "DELETE" ||
      body?.noFinancialTransaction !== true
    ) {
      return reply(
        {
          error:
            "Student ID এবং সব Delete confirmation প্রয়োজন।",
        },
        400
      );
    }

    // ====================================
    // 3. FETCH STUDENT RECORD
    // ====================================

    step = "load-student";

    const {
      data: student,
      error: studentError,
    } = await admin
      .from("students")
      .select(
        "id, student_id, student_name, status, auth_user_id, student_photo"
      )
      .eq("id", id)
      .maybeSingle();

    if (studentError) {
      throw new Error("STUDENT_LOOKUP_FAILED");
    }

    if (!student) {
      return reply(
        { error: "Student not found." },
        404
      );
    }

    if (student.status !== "approved") {
      return reply(
        {
          error:
            "Only approved students are allowed.",
        },
        409
      );
    }

    if (
      student.student_id !== typedStudentID ||
      student.student_name !== expectedName
    ) {
      return reply(
        {
          error:
            "Student information mismatch. Refresh and retry.",
        },
        409
      );
    }

    // ====================================
    // 4. CHECK LINKED STUDENT DATA
    // ====================================

    step = "check-linked-records";

    const checks = [
      {
        table: "payments",
        field: "student_id",
        value: id,
        label: "Payment History",
      },
      {
        table: "results",
        field: "student_id",
        value: id,
        label: "Student Results",
      },
      {
        table: "attendance",
        field: "student_id",
        value: typedStudentID,
        label: "Attendance Records",
      },
      {
        table: "student_fee_settings",
        field: "student_id",
        value: id,
        label: "Fee Settings",
      },
    ];

    for (const check of checks) {
      const { count, error } = await admin
        .from(check.table)
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq(check.field, check.value);

      if (error || count === null) {
        return reply(
          {
            error:
              `${check.label} যাচাই করা যায়নি। ` +
              "Database schema review প্রয়োজন।",
          },
          409
        );
      }

      if (count > 0) {
        return reply(
          {
            error:
              `${check.label} পাওয়া গেছে। ` +
              "এই শিক্ষার্থীর তথ্য স্থায়ীভাবে " +
              "মুছতে আগে manual review প্রয়োজন।",
          },
          409
        );
      }
    }

    // ====================================
    // 5. VERIFY SUPABASE AUTH OWNERSHIP
    // ====================================

    step = "verify-auth-account";

    const authID = student.auth_user_id;

    if (!authID) {
      return reply(
        {
          error:
            "Student Auth link missing. Manual review required.",
        },
        409
      );
    }

    const {
      data: authData,
      error: authError,
    } = await admin.auth.admin.getUserById(authID);

    if (authError || !authData.user) {
      return reply(
        {
          error:
            "Student Auth account not found. Manual review required.",
        },
        409
      );
    }

    const account = authData.user;

    if (
      account.app_metadata?.account_type !==
        "student" ||
      String(
        account.app_metadata?.student_record_id
      ) !== String(id)
    ) {
      return reply(
        {
          error:
            "Auth ownership verification failed.",
        },
        409
      );
    }

    // Protect administrator accounts.
    const {
      data: adminLinks,
      error: adminLinkError,
    } = await admin
      .from("admins")
      .select("uuid")
      .eq("auth_user_id", authID)
      .limit(1);

    if (adminLinkError || adminLinks?.length) {
      return reply(
        { error: "Protected Auth account." },
        409
      );
    }

    // Protect Auth accounts shared with students.
    const {
      data: otherStudents,
      error: otherStudentsError,
    } = await admin
      .from("students")
      .select("id")
      .eq("auth_user_id", authID)
      .neq("id", id)
      .limit(1);

    if (
      otherStudentsError ||
      otherStudents?.length
    ) {
      return reply(
        {
          error:
            "Auth account is linked to another student.",
        },
        409
      );
    }

    // ====================================
    // 6. CHECK STUDENT PHOTO
    // ====================================

    step = "verify-student-photo";

    const photo =
      typeof student.student_photo === "string"
        ? student.student_photo.trim()
        : "";

    const path = photo
      ? photoStoragePath(photo, url)
      : null;

    if (photo && !path) {
      return reply(
        {
          error:
            "Photo ownership could not be verified.",
        },
        409
      );
    }

    if (photo) {
      const {
        count,
        error: photoError,
      } = await admin
        .from("students")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("student_photo", student.student_photo)
        .neq("id", id);

      if (photoError || count === null) {
        return reply(
          {
            error: "Photo reference check failed.",
          },
          409
        );
      }

      if (count > 0) {
        return reply(
          {
            error:
              "Photo is shared with another student.",
          },
          409
        );
      }
    }

    // ====================================
    // 7. DELETE DATABASE RECORD
    // ====================================

    step = "delete-database-record";

    const {
      data: deleted,
      error: deleteError,
    } = await admin
      .from("students")
      .delete()
      .eq("id", id)
      .eq("student_id", typedStudentID)
      .eq("status", "approved")
      .eq("auth_user_id", authID)
      .select("id");

    if (deleteError) {
      return reply(
        {
          error:
            "Database deletion blocked. Related data or constraints require review.",
        },
        409
      );
    }

    if (deleted?.length !== 1) {
      return reply(
        {
          error:
            "Student record changed. Refresh and retry.",
        },
        409
      );
    }

    // ====================================
    // 8. REMOVE AUTH ACCOUNT
    // ====================================

    step = "delete-auth-account";

    const cleanupWarnings: string[] = [];

    const { error: authDeleteError } =
      await admin.auth.admin.deleteUser(authID);

    if (authDeleteError) {
      console.error(
        "Auth cleanup required for student record:",
        id
      );

      cleanupWarnings.push(
        "Supabase Auth account cleanup failed."
      );
    }

    // ====================================
    // 9. REMOVE STORAGE PHOTO
    // ====================================

    step = "delete-storage-photo";

    if (path) {
      const { error: storageError } =
        await admin.storage
          .from("student-photos")
          .remove([path]);

      if (storageError) {
        console.error(
          "Photo cleanup required for student record:",
          id
        );

        cleanupWarnings.push(
          "Student photo cleanup failed."
        );
      }
    }

    // ====================================
    // 10. RESPONSE
    // ====================================

    const cleanupRequired =
      cleanupWarnings.length > 0;

    return reply({
      success: true,
      recordDeleted: true,
      deletionComplete: !cleanupRequired,
      cleanupRequired,
      warnings: cleanupWarnings,
      deletedId: id,
      message: cleanupRequired
        ? "Student database record deleted, but manual cleanup is required."
        : "Approved student record, Auth account and photo deleted.",
    });

  } catch (error) {
    console.error(
      "Approved student delete failed:",
      step,
      error instanceof Error
        ? error.message
        : "UNKNOWN"
    );

    return reply(
      {
        success: false,
        error:
          `Delete failed (${step}). ` +
          "Please refresh and verify the student record.",
      },
      500
    );
  }
}
