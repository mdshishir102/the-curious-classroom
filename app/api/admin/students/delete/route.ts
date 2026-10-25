
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

// Validate student photo ownership.
function getPhotoPath(
  photo: string,
  projectUrl: string
): string | null {
  try {
    const url = new URL(photo);
    const project = new URL(projectUrl);

    if (url.origin !== project.origin) {
      return null;
    }

    const prefix =
      "/storage/v1/object/public/student-photos/";

    if (!url.pathname.startsWith(prefix)) {
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
    // =====================================
    // 1. VERIFY ADMIN
    // =====================================

    const access =
      await authorizeStudentAdmin(request);

    if (!access.ok) {
      return reply(
        { error: access.error },
        access.status
      );
    }

    const { admin, url } = access;

    // =====================================
    // 2. VALIDATE REQUEST
    // =====================================

    step = "validate-request";

    const body = await request
      .json()
      .catch(() => null);

    const id = studentRecordId(body?.id);

    const confirmation = body?.confirmation;
    const expectedName = body?.expectedName;

    if (!id) {
      return reply(
        { error: "Invalid student ID." },
        400
      );
    }

    if (
      confirmation !== "DELETE" ||
      typeof expectedName !== "string" ||
      !expectedName.trim()
    ) {
      return reply(
        {
          error:
            "Student name এবং DELETE confirmation প্রয়োজন।",
        },
        400
      );
    }

    // =====================================
    // 3. LOAD STUDENT
    // =====================================

    step = "load-student";

    const {
      data: student,
      error: studentError,
    } = await admin
      .from("students")
      .select(
        "id, student_name, student_photo, status, payment_status, auth_user_id"
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

    if (student.student_name !== expectedName) {
      return reply(
        {
          error:
            "Student information changed. Refresh and retry.",
        },
        409
      );
    }

    // =====================================
    // 4. SECURITY RESTRICTIONS
    // =====================================

    step = "security-check";

    if (student.status !== "rejected") {
      return reply(
        {
          error:
            "Only rejected admissions can be deleted.",
        },
        403
      );
    }

    // Protect verified financial records.
    if (student.payment_status !== "pending") {
      return reply(
        {
          error:
            "Payment status is not pending. Manual review required.",
        },
        409
      );
    }

    // Protect students with linked Auth accounts.
    if (student.auth_user_id) {
      return reply(
        {
          error:
            "Student has a linked Auth account. Manual review required.",
        },
        409
      );
    }

    // =====================================
    // 5. CHECK UNLINKED AUTH ACCOUNT
    // =====================================

    step = "auth-safety-check";

    const recordID = String(id);

    const generatedEmail =
      `student-${recordID}@students.invalid`;

    let authScanComplete = false;

    for (let page = 1; page <= 200; page++) {
      const { data, error } =
        await admin.auth.admin.listUsers({
          page,
          perPage: 500,
        });

      if (error) {
        throw new Error("AUTH_LOOKUP_FAILED");
      }

      const matchingAccount = data.users.some(
        (user) =>
          user.email?.toLowerCase() ===
            generatedEmail ||
          (
            user.app_metadata?.account_type ===
              "student" &&
            String(
              user.app_metadata?.student_record_id
            ) === recordID
          )
      );

      if (matchingAccount) {
        return reply(
          {
            error:
              "An existing Auth account was found. Manual cleanup is required before deleting.",
          },
          409
        );
      }

      if (data.users.length < 500) {
        authScanComplete = true;
        break;
      }
    }

    if (!authScanComplete) {
      throw new Error("AUTH_SCAN_INCOMPLETE");
    }

    // =====================================
    // 6. VALIDATE STUDENT PHOTO
    // =====================================

    step = "photo-check";

    const photo =
      typeof student.student_photo === "string"
        ? student.student_photo.trim()
        : "";

    const photoPath = photo
      ? getPhotoPath(photo, url)
      : null;

    if (photo && !photoPath) {
      return reply(
        {
          error:
            "Student photo URL could not be verified. Manual review required.",
        },
        409
      );
    }

    // Never delete a photo shared by another student.
    if (photo) {
      const {
        count,
        error: photoCheckError,
      } = await admin
        .from("students")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("student_photo", student.student_photo)
        .neq("id", id);

      if (photoCheckError) {
        throw new Error("PHOTO_CHECK_FAILED");
      }

      if ((count ?? 0) > 0) {
        return reply(
          {
            error:
              "Photo is referenced by another student. Manual review required.",
          },
          409
        );
      }
    }

    // =====================================
    // 7. DELETE STUDENT FROM DATABASE
    // =====================================

    step = "delete-database-record";

    const {
      data: deleted,
      error: deleteError,
    } = await admin
      .from("students")
      .delete()
      .eq("id", id)
      .eq("student_name", expectedName)
      .eq("status", "rejected")
      .eq("payment_status", "pending")
      .is("auth_user_id", null)
      .select("id");

    if (deleteError) {
      if (deleteError.code === "23503") {
        return reply(
          {
            error:
              "Related database records prevent deletion. Manual review required.",
          },
          409
        );
      }

      throw new Error("DATABASE_DELETE_FAILED");
    }

    if (deleted?.length !== 1) {
      return reply(
        {
          error:
            "Deletion was not completed. Refresh and check student status.",
        },
        409
      );
    }

    // =====================================
    // 8. DELETE PHOTO FROM STORAGE
    // =====================================

    step = "delete-storage-photo";

    if (photoPath) {
      const { error: storageError } =
        await admin.storage
          .from("student-photos")
          .remove([photoPath]);

      if (storageError) {
        console.error(
          "Photo cleanup failed for record:",
          id
        );

        return reply({
          success: true,
          recordDeleted: true,
          deletionComplete: false,
          cleanupRequired: true,
          message:
            "Admission record deleted, but photo cleanup failed. Manual Storage cleanup is required.",
        });
      }
    }

    // =====================================
    // 9. SUCCESS
    // =====================================

    return reply({
      success: true,
      recordDeleted: true,
      deletionComplete: true,
      cleanupRequired: false,
      deletedId: id,
      message:
        "Rejected admission and its dedicated photo have been deleted.",
    });

  } catch (error) {
    console.error(
      "Delete admission failed:",
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
          "Please refresh and check the record.",
      },
      500
    );
  }
}
