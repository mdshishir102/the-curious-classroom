
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// =====================================
// SECURE RECEIPT VERIFICATION API
// =====================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =====================================
// DISABLE RESPONSE CACHING
// =====================================

function respond(
  data: Record<string, unknown>,
  status = 200
) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control":
        "private, no-store, max-age=0",
      Pragma: "no-cache",
    },
  });
}

// =====================================
// VALIDATE UUID TOKEN FORMAT
// =====================================

function isValidToken(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

// =====================================
// VERIFY RECEIPT — POST REQUEST
// =====================================

export async function POST(request: NextRequest) {
  try {
    // ---------------------------------
    // READ REQUEST
    // ---------------------------------

    const body: unknown = await request
      .json()
      .catch(() => null);

    const input =
      body !== null && typeof body === "object"
        ? (body as Record<string, unknown>)
        : {};

    const receiptId =
      typeof input.receipt === "string"
        ? input.receipt.trim()
        : "";

    const token =
      typeof input.token === "string"
        ? input.token.trim()
        : "";

    // ---------------------------------
    // INPUT VALIDATION
    // ---------------------------------

    if (
      !receiptId ||
      receiptId.length > 120 ||
      !isValidToken(token)
    ) {
      return respond(
        {
          success: false,
          message:
            "Invalid or incomplete receipt verification link.",
        },
        400
      );
    }

    // ---------------------------------
    // SERVER-ONLY SUPABASE CLIENT
    // ---------------------------------

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(
        "Receipt verification server is not configured."
      );

      return respond(
        {
          success: false,
          message:
            "Verification service is temporarily unavailable.",
        },
        503
      );
    }

    const admin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // =====================================
    // STEP 1 — VERIFY SECRET TOKEN
    // =====================================

    const {
      data:verifiedToken,
      error:tokenError,
    } = await admin
      .from("receipt_verification_tokens")
      .select("receipt_id")
      .eq("receipt_id", receiptId)
      .eq("verification_token", token)
      .maybeSingle();

    if (tokenError) {
      throw tokenError;
    }

    if (!verifiedToken) {
      return respond(
        {
          success: false,
          message:
            "This receipt could not be verified.",
        },
        404
      );
    }

    // =====================================
    // STEP 2 — GET REAL PAYMENT RECORD
    // =====================================

    const {
      data:payment,
      error:paymentError,
    } = await admin
      .from("payments")
      .select(
        `
        receipt_id,
        student_id,
        status,
        month,
        year,
        amount,
        payment_method,
        payment_date,
        transaction_id
        `
      )
      .eq("receipt_id", receiptId)
      .maybeSingle();

    if (paymentError) {
      throw paymentError;
    }

    if (!payment) {
      return respond(
        {
          success: false,
          message:
            "No matching payment record was found.",
        },
        404
      );
    }

    // =====================================
    // STEP 3 — CHECK PAYMENT STATUS
    // =====================================

    const paymentStatus = String(
      payment.status ?? ""
    )
      .trim()
      .toLowerCase();

    const isPaid = paymentStatus === "paid";

    // =====================================
    // STEP 4 — STUDENT INFORMATION
    // Only include details for paid records.
    // =====================================

    let studentName: string | null = null;
    let studentId: string | null = null;
    let studentClass: string | null = null;
    let studentBatch: string | null = null;

    if (isPaid) {
      const {
        data:student,
        error:studentError,
      } = await admin
        .from("students")
        .select(
          "student_name, student_id, class, batch"
        )
        .eq("id", payment.student_id)
        .maybeSingle();

      if (studentError) {
        throw studentError;
      }

      if (!student) {
        return respond(
          {
            success: false,
            message:
              "Receipt owner could not be verified.",
          },
          404
        );
      }

      studentName =
        student.student_name ?? null;

      studentId =
        student.student_id ?? null;

      studentClass =
        student.class ?? null;

      studentBatch =
        student.batch ?? null;
    }

    // =====================================
    // STEP 5 — RETURN SAFE RESPONSE
    // =====================================

    return respond({
      success: true,

      receipt: {
        receipt_id: String(payment.receipt_id),

        status: paymentStatus || null,

        month: payment.month ?? null,

        year: payment.year ?? null,

        amount: payment.amount ?? null,

        payment_method:
          payment.payment_method ?? null,

        payment_date:
          payment.payment_date ?? null,

        transaction_id:
          isPaid
            ? payment.transaction_id ?? null
            : null,

        student_name: studentName,

        student_id: studentId,

        class: studentClass,

        batch: studentBatch,
      },
    });

  } catch (error) {
    console.error(
      "Receipt verification server error:",
      error
    );

    return respond(
      {
        success: false,
        message:
          "Receipt verification is unavailable. Please try again.",
      },
      500
    );
  }
}
