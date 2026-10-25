
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

export async function POST(request: Request) {
  try {
    // Verify authorized admin.
    const access = await authorizeStudentAdmin(request);

    if (!access.ok) {
      return reply(
        { error: access.error },
        access.status
      );
    }

    const body = await request.json().catch(() => null);

    const id = studentRecordId(body?.id);
    const target = body?.target;

    if (
      !id ||
      (target !== "pending" && target !== "approved")
    ) {
      return reply(
        { error: "Invalid recovery request." },
        400
      );
    }

    const { admin } = access;

    // Find student record.
    const {
      data: student,
      error: loadError,
    } = await admin
      .from("students")
      .select(
        "id, status, payment_status, auth_user_id"
      )
      .eq("id", id)
      .maybeSingle();

    if (loadError) {
      throw new Error("STUDENT_LOOKUP_FAILED");
    }

    if (!student) {
      return reply(
        { error: "Student not found." },
        404
      );
    }

    // Only rejected students can be recovered.
    if (student.status !== "rejected") {
      return reply(
        {
          error:
            "Student is not rejected. Please refresh.",
        },
        409
      );
    }

    // Existing auth links require review.
    if (student.auth_user_id) {
      return reply(
        {
          error:
            "Existing Auth account detected. Manual review required.",
        },
        409
      );
    }

    // Approval requires verified payment.
    if (
      target === "approved" &&
      student.payment_status !== "paid"
    ) {
      return reply(
        {
          error:
            "Payment not verified. Recover to Pending first, then Mark as Paid.",
        },
        409
      );
    }

    // Safely restore rejected admission.
    const {
      data: restored,
      error: restoreError,
    } = await admin
      .from("students")
      .update({
        status: "pending",
        login_enabled: false,
      })
      .eq("id", id)
      .eq("status", "rejected")
      .is("auth_user_id", null)
      .select("id");

    if (restoreError) {
      throw new Error("RECOVERY_UPDATE_FAILED");
    }

    if (restored?.length !== 1) {
      return reply(
        {
          error:
            "Student status changed. Refresh and retry.",
        },
        409
      );
    }

    return reply({
      success: true,
      status: "pending",
      requiresApproval: target === "approved",
      message:
        target === "pending"
          ? "Admission recovered to Pending."
          : "Admission restored. Approval API must run next.",
    });
  } catch (error) {
    console.error(
      "Recovery failed:",
      error instanceof Error
        ? error.message
        : "UNKNOWN"
    );

    return reply(
      {
        error:
          "Recovery failed. Please refresh and retry.",
      },
      500
    );
  }
}
