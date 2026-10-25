
"use client";

// =====================================
// PART 1 — IMPORTS
// =====================================

import Image from "next/image";
import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  ShieldCheck,
  ShieldAlert,
  LockKeyhole,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  ReceiptText,
  CreditCard,
  CalendarDays,
  GraduationCap,
  UserRound,
  Hash,
  Clock3,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
  ScanLine,
  Wallet,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";

// =====================================
// RECEIPT VERIFICATION TYPES
// =====================================

type VerificationState =
  | "loading"
  | "verified"
  | "not_paid"
  | "invalid"
  | "error";

// =====================================
// VERIFIED RECEIPT DATA
// =====================================

type VerifiedReceipt = {
  receipt_id: string;

  status: string | null;

  month: string | null;

  year: number | string | null;

  amount: number | string | null;

  payment_method: string | null;

  payment_date: string | null;

  transaction_id: string | null;

  student_name: string | null;

  student_id: string | null;

  class: string | null;

  batch: string | null;
};

// =====================================
// VERIFICATION API RESPONSE
// =====================================

type VerificationResponse =
  | {
      success: true;

      receipt: VerifiedReceipt;
    }
  | {
      success: false;

      message: string;
    };

// =====================================
// OFFICIAL BRAND INFORMATION
// =====================================

const brand = {
  name: "The Curious Classroom",

  subtitle: "Official Payment Verification Portal",

  tagline: "Academic Excellence Through Curiosity",

  logo: "/logo.png",

  bioverseLogo: "/shishir-bioverse.png",

  homeUrl: "/",

  verificationPath: "/student/verify",
};

// =====================================
// PREMIUM DESIGN SYSTEM
// =====================================

const theme = {
  background: "bg-[#080D19]",

  card:
    "rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_20px_70px_rgba(0,0,0,0.2)]",

  innerCard:
    "rounded-2xl border border-white/[0.07] bg-[#0B1425]",

  blueBorder: "border-blue-400/15",

  accent: "text-blue-400",

  muted: "text-slate-400",

  success: "text-emerald-400",

  danger: "text-red-400",
};

// =====================================
// ACCESSIBLE FOCUS STYLE
// =====================================

const focusStyle =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]";

// =====================================
// SAFE DISPLAY VALUE
// =====================================

function displayValue(
  value: string | number | null | undefined
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "N/A";
  }

  return String(value);
}

// =====================================
// PAYMENT AMOUNT FORMATTER
// =====================================

function formatPaymentAmount(
  amount: number | string | null | undefined
): string {
  if (
    amount === null ||
    amount === undefined ||
    amount === ""
  ) {
    return "N/A";
  }

  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return "N/A";
  }

  return `৳ ${numericAmount.toLocaleString("en-BD", {
    maximumFractionDigits: 2,
  })}`;
}

// =====================================
// BANGLADESH DATE FORMATTER
// =====================================

function formatVerifyDate(
  value?: string | null
): string {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
}

// =====================================
// PAYMENT STATUS NORMALIZER
// =====================================

function isVerifiedPaid(
  status?: string | null
): boolean {
  return (
    status?.trim().toLowerCase() === "paid"
  );
}

// =====================================
// PREMIUM DETAIL ITEM TYPE
// =====================================

type DetailItem = {
  label: string;

  value: string;

  icon: LucideIcon;
};

// =====================================
// PART 2 STARTS BELOW
// =====================================



/* =====================================
   PART 3 — VERIFICATION CLIENT & UI
===================================== */

export default function VerifyReceiptPage() {

  // =====================================
  // VERIFICATION STATES
  // =====================================

  const [
    verificationState,
    setVerificationState
  ] = useState<VerificationState>("loading");

  const [
    receipt,
    setReceipt
  ] = useState<VerifiedReceipt | null>(null);

  const [
    message,
    setMessage
  ] = useState("");

  const [
    retryCount,
    setRetryCount
  ] = useState(0);

  // =====================================
  // SECURE RECEIPT VERIFICATION
  // =====================================

  useEffect(() => {

    const controller = new AbortController();

    async function verifyReceipt() {

      setVerificationState("loading");
      setReceipt(null);
      setMessage("");

      try {

        // ---------------------------------
        // READ QR CODE URL PARAMETERS
        // ---------------------------------

        const params = new URLSearchParams(
          window.location.search
        );

        const receiptId =
          params.get("receipt")?.trim() ?? "";

        const token =
          params.get("token")?.trim() ?? "";

        // ---------------------------------
        // CHECK REQUIRED PARAMETERS
        // ---------------------------------

        if (!receiptId || !token) {

          if (controller.signal.aborted) return;

          setMessage(
            "This verification link is incomplete. Please scan a newly issued receipt QR code containing a valid verification token."
          );

          setVerificationState("invalid");

          return;
        }

        // ---------------------------------
        // CALL SECURE SERVER API
        // ---------------------------------

        const response = await fetch(
          "/api/verify-receipt",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              receipt: receiptId,
              token: token,
            }),

            cache: "no-store",

            signal: controller.signal,
          }
        );

        const result =
          (await response.json()) as VerificationResponse;

        if (controller.signal.aborted) return;

        // ---------------------------------
        // HANDLE UNSUCCESSFUL VERIFICATION
        // ---------------------------------

        if (!response.ok || !result.success) {

          const errorMessage = !result.success
            ? result.message
            : "Verification failed.";

          setMessage(errorMessage);

          if (
            response.status === 400 ||
            response.status === 404
          ) {
            setVerificationState("invalid");
          } else {
            setVerificationState("error");
          }

          return;
        }

        // ---------------------------------
        // STORE VERIFIED SERVER RESPONSE
        // ---------------------------------

        const verifiedData = result.receipt;

        setReceipt(verifiedData);

        // ---------------------------------
        // REAL PAYMENT STATUS CHECK
        // ---------------------------------

        if (isVerifiedPaid(verifiedData.status)) {

          setVerificationState("verified");

        } else {

          setVerificationState("not_paid");

          setMessage(
            "This receipt exists, but its payment has not been confirmed as paid."
          );

        }

      } catch (error) {

        if (controller.signal.aborted) return;

        console.error(
          "Receipt verification error:",
          error
        );

        setMessage(
          "Unable to connect to the verification service. Please try again."
        );

        setVerificationState("error");
      }

    }

    void verifyReceipt();

    return () => {
      controller.abort();
    };

  }, [retryCount]);

  // =====================================
  // RETRY VERIFICATION
  // =====================================

  function retryVerification() {

    setRetryCount((previous) => previous + 1);

  }

  // =====================================
  // LOADING SCREEN
  // =====================================

  if (verificationState === "loading") {

    return (

      <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#080D19] px-6 text-center text-white">

        {/* Background Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 h-80 w-80 rounded-full bg-blue-600/10 blur-[100px]"
        />

        <div className="relative flex flex-col items-center">

          {/* Brand Logo */}
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white p-4 shadow-2xl">

            <Image
              src={brand.logo}
              alt={brand.name}
              width={100}
              height={100}
              priority
              className="h-full w-full object-contain"
            />

          </div>

          {/* Brand Name */}
          <h1 className="mt-7 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {brand.name}
          </h1>

          <p className="mt-2 text-xs uppercase tracking-[0.15em] text-blue-300">
            Official Receipt Verification
          </p>

          {/* Loading Icon */}
          <div className="mt-12 flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-400/15 bg-blue-500/10">

            <LoaderCircle
              size={36}
              className="animate-spin text-blue-400"
            />

          </div>

          <h2 className="mt-7 text-xl font-semibold text-white">
            Verifying Your Receipt
          </h2>

          <p className="mt-3 max-w-sm text-sm leading-7 text-slate-400">
            Please wait while we check your
            receipt against our official
            payment records.
          </p>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-500/10 px-5 py-2.5 text-xs font-medium text-blue-300">

            <ShieldCheck size={15} />

            Secure Verification in Progress

          </div>

        </div>

      </main>

    );

  }

  // =====================================
  // STATUS CONFIGURATION
  // =====================================

  const isVerified =
    verificationState === "verified";

  const isNotPaid =
    verificationState === "not_paid";

  const isInvalid =
    verificationState === "invalid";

  const statusTitle = isVerified
    ? "Payment Verified"
    : isNotPaid
    ? "Payment Not Confirmed"
    : isInvalid
    ? "Invalid Receipt"
    : "Verification Unavailable";

  const statusDescription = isVerified
    ? "This payment receipt has been successfully matched with a paid record in our official database."
    : isNotPaid
    ? "A matching receipt was found, but the payment is not currently confirmed as paid."
    : isInvalid
    ? "We could not verify this receipt using the supplied receipt ID and verification token."
    : "The verification service could not complete your request right now.";

  const statusIconClass = isVerified
    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
    : isNotPaid
    ? "border-amber-400/20 bg-amber-500/10 text-amber-300"
    : isInvalid
    ? "border-red-400/20 bg-red-500/10 text-red-300"
    : "border-blue-400/20 bg-blue-500/10 text-blue-300";

  const statusBadgeClass = isVerified
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
    : isNotPaid
    ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
    : isInvalid
    ? "border-red-400/20 bg-red-400/10 text-red-300"
    : "border-blue-400/20 bg-blue-400/10 text-blue-300";

  const statusTitleClass = isVerified
    ? "text-emerald-300"
    : isNotPaid
    ? "text-amber-300"
    : isInvalid
    ? "text-red-300"
    : "text-blue-300";

  const StatusIcon: LucideIcon = isVerified
    ? BadgeCheck
    : isNotPaid
    ? Clock3
    : isInvalid
    ? ShieldAlert
    : AlertCircle;

  // =====================================
  // MAIN VERIFICATION PAGE
  // =====================================

  return (

    <main className="relative min-h-dvh overflow-hidden bg-[#080D19] text-slate-100">

      {/* =====================================
          BACKGROUND DECORATION
      ===================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-blue-600/[0.07] blur-[110px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-96 h-96 w-96 rounded-full bg-indigo-500/[0.06] blur-[110px]"
      />

      <div className="relative mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:py-12">

        {/* =====================================
            PREMIUM BRAND HEADER
        ===================================== */}

        <header className={`${theme.card} relative overflow-hidden p-6 sm:p-8`}>

          <div
            aria-hidden="true"
            className="absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"
          />

          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">

            {/* Logo & Brand */}
            <div className="flex min-w-0 items-center gap-4">

              <Link
                href={brand.homeUrl}
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white p-2.5 sm:h-20 sm:w-20 ${focusStyle}`}
              >

                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={90}
                  height={90}
                  priority
                  className="h-full w-full object-contain"
                />

              </Link>

              <div className="min-w-0">

                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-300">
                  OFFICIAL VERIFICATION
                </p>

                <h1 className="mt-2 text-lg font-semibold tracking-tight text-white sm:text-2xl">
                  {brand.name}
                </h1>

                <p className="mt-2 text-xs text-slate-400 sm:text-sm">
                  {brand.subtitle}
                </p>

              </div>

            </div>

            {/* Security Label */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-500/10 px-4 py-2.5 text-xs font-medium text-blue-300">

              <ShieldCheck size={16} />

              Server-Checked Records

            </div>

          </div>

        </header>

        {/* =====================================
            PAGE INTRODUCTION
        ===================================== */}

        <section className="mb-8 mt-10 text-center">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-500/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-blue-300">

            <ScanLine size={15} />

            Digital Receipt Authentication

          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">

            Receipt{" "}

            <span className="text-blue-400">
              Verification
            </span>

          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400">

            Verify a payment receipt issued by
            The Curious Classroom using its
            secure verification QR code.

          </p>

        </section>

        {/* =====================================
            DYNAMIC VERIFICATION STATUS CARD
        ===================================== */}

        <section
          aria-live="polite"
          className={`${theme.card} relative overflow-hidden p-6 text-center sm:p-10`}
        >

          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-48 w-72 -translate-x-1/2 rounded-full bg-blue-500/[0.04] blur-[65px]"
          />

          <div className="relative flex flex-col items-center">

            {/* Dynamic Status Icon */}
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-3xl border ${statusIconClass}`}
            >

              <StatusIcon
                size={43}
                strokeWidth={1.7}
              />

            </div>

            {/* Status Title */}
            <h3 className={`mt-7 text-2xl font-semibold tracking-tight sm:text-3xl ${statusTitleClass}`}>

              {statusTitle}

            </h3>

            {/* Description */}
            <p className="mt-4 max-w-xl text-sm leading-8 text-slate-400">

              {statusDescription}

            </p>

            {/* Status Badge */}
            <div className={`mt-6 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold ${statusBadgeClass}`}>

              <StatusIcon size={16} />

              {isVerified
                ? "VERIFIED · PAID"
                : isNotPaid
                ? "NOT VERIFIED AS PAID"
                : isInvalid
                ? "INVALID VERIFICATION"
                : "TEMPORARILY UNAVAILABLE"}

            </div>

            {/* =====================================
                PENDING / NOT PAID STATUS
            ===================================== */}

            {isNotPaid && receipt && (

              <div className="mt-8 w-full max-w-lg rounded-2xl border border-amber-400/15 bg-amber-500/[0.05] p-5 text-left">

                <div className="flex items-start gap-3">

                  <Clock3
                    size={20}
                    className="mt-0.5 shrink-0 text-amber-300"
                  />

                  <div>

                    <h4 className="text-sm font-semibold text-amber-300">
                      Payment Awaiting Confirmation
                    </h4>

                    <p className="mt-2 text-sm leading-7 text-slate-300">
                      Recorded Status:{" "}

                      <span className="font-semibold uppercase text-amber-200">
                        {receipt.status || "Not marked paid"}
                      </span>
                    </p>

                    <p className="mt-2 text-xs leading-6 text-slate-400">
                      A payment record alone does not
                      confirm that the payment has been
                      approved.
                    </p>

                  </div>

                </div>

              </div>

            )}

            {/* =====================================
                INVALID / SERVER ERROR MESSAGE
            ===================================== */}

            {(isInvalid ||
              verificationState === "error") &&
              message && (

              <div className="mt-8 w-full max-w-lg rounded-2xl border border-white/10 bg-[#0B1425] p-5">

                <div className="flex items-start gap-3 text-left">

                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-slate-400"
                  />

                  <p className="text-sm leading-7 text-slate-300">
                    {message}
                  </p>

                </div>

              </div>

            )}

            {/* =====================================
                RETRY VERIFICATION BUTTON
            ===================================== */}

            {!isVerified && (

              <button
                type="button"
                onClick={retryVerification}
                className={`mt-7 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 ${focusStyle}`}
              >

                <RefreshCw size={18} />

                Verify Again

              </button>

            )}

            {/* VERIFIED MESSAGE */}
            {isVerified && (

              <div className="mt-8 flex items-center gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.05] px-5 py-4 text-left">

                <CheckCircle2
                  size={21}
                  className="shrink-0 text-emerald-300"
                />

                <p className="text-xs leading-6 text-slate-300 sm:text-sm">
                  This receipt matches a payment
                  currently marked as Paid in
                  The Curious Classroom's records.
                </p>

              </div>

            )}

          </div>

        </section>

        {/* =====================================
            PART 4 STARTS BELOW

            Do not close the outer div,
            main element or component yet.
        ===================================== */}



{/* =====================================
    PART 4 — VERIFIED RECEIPT DETAILS
===================================== */}

{/* =====================================
    VERIFIED RECEIPT INFORMATION
===================================== */}

{isVerified && receipt && (

  <>

    {/* =====================================
        RECEIPT INFORMATION SECTION
    ===================================== */}

    <section className="mt-10">

      {/* Section Heading */}
      <div className="mb-6">

        <div className="mb-3 flex items-center gap-3">

          <span className="h-px w-7 bg-blue-400" />

          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-blue-300">
            OFFICIAL PAYMENT RECORD
          </span>

        </div>

        <h2 className="text-2xl font-semibold text-white">
          Receipt Information
        </h2>

        <p className="mt-2 text-sm leading-7 text-slate-400">
          The following details match the
          official payment record.
        </p>

      </div>

      {/* Main Receipt Card */}
      <div className={`${theme.card} overflow-hidden`}>

        {/* =====================================
            BLUE RECEIPT HEADER
        ===================================== */}

        <div className="relative overflow-hidden border-b border-white/[0.08] bg-gradient-to-r from-[#142B53] via-[#142443] to-[#101A2C] p-6 sm:p-8">

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-blue-500/15 blur-[70px]"
          />

          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

            <div className="flex items-center gap-4">

              {/* Receipt Icon */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-300">

                <ReceiptText size={26} />

              </div>

              <div className="min-w-0">

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-300">
                  VERIFIED RECEIPT
                </p>

                <h3 className="mt-2 break-all text-lg font-semibold text-white sm:text-xl">

                  {displayValue(receipt.receipt_id)}

                </h3>

              </div>

            </div>

            {/* Paid Badge */}
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-xs font-semibold text-emerald-300">

              <BadgeCheck size={17} />

              PAYMENT PAID

            </span>

          </div>

        </div>

        {/* =====================================
            PAYMENT DETAILS GRID
        ===================================== */}

        <div className="p-6 sm:p-8">

          <div className="grid gap-4 sm:grid-cols-2">

            {([
              {
                label: "Receipt ID",
                value: displayValue(
                  receipt.receipt_id
                ),
                icon: ReceiptText,
              },
              {
                label: "Payment Month",
                value:
                  receipt.month && receipt.year
                    ? `${receipt.month} ${receipt.year}`
                    : "N/A",
                icon: CalendarDays,
              },
              {
                label: "Paid Amount",
                value: formatPaymentAmount(
                  receipt.amount
                ),
                icon: Wallet,
              },
              {
                label: "Payment Method",
                value: displayValue(
                  receipt.payment_method
                ),
                icon: CreditCard,
              },
              {
                label: "Payment Date",
                value: formatVerifyDate(
                  receipt.payment_date
                ),
                icon: CalendarDays,
              },
              {
                label: "Payment Status",
                value: "PAID",
                icon: BadgeCheck,
              },
            ] as DetailItem[]).map((item) => {

              const Icon = item.icon;

              return (

                <div
                  key={item.label}
                  className={`${theme.innerCard} flex min-w-0 items-start gap-4 p-5`}
                >

                  {/* Field Icon */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-500/10 text-blue-300">

                    <Icon size={21} />

                  </div>

                  {/* Field Information */}
                  <div className="min-w-0 flex-1">

                    <p className="text-xs text-slate-400">
                      {item.label}
                    </p>

                    <p className={`mt-2 break-words text-sm font-semibold leading-6 sm:text-base ${
                      item.label === "Payment Status"
                        ? "text-emerald-300"
                        : "text-white"
                    }`}>

                      {item.value}

                    </p>

                  </div>

                </div>

              );
            })}

          </div>

          {/* =====================================
              TRANSACTION INFORMATION
          ===================================== */}

          <div className="mt-5 rounded-2xl border border-blue-400/15 bg-blue-500/[0.05] p-5 sm:p-6">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">

                <Hash size={21} />

              </div>

              <div className="min-w-0 flex-1">

                <p className="text-xs font-medium text-slate-400">
                  Transaction ID
                </p>

                <p className="mt-2 break-all text-sm font-semibold tracking-wide text-white sm:text-base">

                  {displayValue(
                    receipt.transaction_id
                  )}

                </p>

                <p className="mt-3 text-xs leading-6 text-slate-500">
                  Transaction reference recorded
                  against this payment.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>

    {/* =====================================
        STUDENT INFORMATION SECTION
    ===================================== */}

    <section className="mt-10">

      {/* Section Heading */}
      <div className="mb-6">

        <div className="mb-3 flex items-center gap-3">

          <span className="h-px w-7 bg-blue-400" />

          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-blue-300">
            VERIFIED STUDENT RECORD
          </span>

        </div>

        <h2 className="text-2xl font-semibold text-white">
          Student Information
        </h2>

        <p className="mt-2 text-sm leading-7 text-slate-400">
          Student information associated with
          this verified payment receipt.
        </p>

      </div>

      {/* Student Card */}
      <div className={`${theme.card} overflow-hidden`}>

        {/* Student Profile Header */}
        <div className="border-b border-white/[0.08] p-6 sm:p-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

            {/* Student Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-300">

              <UserRound size={30} />

            </div>

            <div className="min-w-0 flex-1">

              <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-blue-300">
                RECEIPT OWNER
              </p>

              <h3 className="mt-2 break-words text-xl font-semibold text-white sm:text-2xl">

                {displayValue(
                  receipt.student_name
                )}

              </h3>

              <p className="mt-2 break-all text-sm text-slate-400">

                Student ID:{" "}

                {displayValue(
                  receipt.student_id
                )}

              </p>

            </div>

            {/* Academic Record Indicator */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/15 bg-blue-500/10 px-4 py-2 text-xs font-medium text-blue-300">

              <GraduationCap size={16} />

              Academic Student

            </div>

          </div>

        </div>

        {/* =====================================
            STUDENT DETAILS GRID
        ===================================== */}

        <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">

          {([
            {
              label: "Student Name",
              value: displayValue(
                receipt.student_name
              ),
              icon: UserRound,
            },
            {
              label: "Student ID",
              value: displayValue(
                receipt.student_id
              ),
              icon: Hash,
            },
            {
              label: "Class",
              value: displayValue(
                receipt.class
              ),
              icon: GraduationCap,
            },
            {
              label: "Batch",
              value: displayValue(
                receipt.batch
              ),
              icon: CalendarDays,
            },
          ] as DetailItem[]).map((item) => {

            const Icon = item.icon;

            return (

              <div
                key={item.label}
                className={`${theme.innerCard} flex min-w-0 items-start gap-4 p-5`}
              >

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-500/10 text-blue-300">

                  <Icon size={21} />

                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-xs text-slate-400">
                    {item.label}
                  </p>

                  <p className="mt-2 break-words text-sm font-semibold leading-6 text-white sm:text-base">

                    {item.value}

                  </p>

                </div>

              </div>

            );
          })}

        </div>

      </div>

    </section>

    {/* =====================================
        DATABASE CONFIRMATION NOTE
    ===================================== */}

    <section className="mt-8">

      <div className="flex items-start gap-4 rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.05] p-5 sm:p-6">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">

          <ShieldCheck size={22} />

        </div>

        <div className="min-w-0 flex-1">

          <h3 className="text-sm font-semibold text-emerald-300">
            Verified Against Official Records
          </h3>

          <p className="mt-2 text-sm leading-7 text-slate-300">
            The receipt ID and verification token
            matched a record in The Curious
            Classroom&apos;s database, and the
            associated payment is currently
            marked as Paid.
          </p>

          <p className="mt-3 text-xs leading-6 text-slate-500">
            Verification reflects the payment
            status at the time of checking.
            It is not a cryptographic digital
            signature.
          </p>

        </div>

      </div>

    </section>

  </>

)}

{/* =====================================
    UNCONFIRMED PAYMENT INFORMATION
===================================== */}

{isNotPaid && receipt && (

  <section className="mt-8">

    <div className={`${theme.card} p-6 sm:p-8`}>

      <div className="flex items-start gap-4">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10 text-amber-300">

          <Clock3 size={23} />

        </div>

        <div className="min-w-0 flex-1">

          <h3 className="text-lg font-semibold text-white">
            Payment Record Found
          </h3>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            The receipt reference exists,
            but the payment is not verified
            as completed.
          </p>

          <div className="mt-5 rounded-2xl border border-white/[0.07] bg-[#0B1425] p-5">

            <p className="text-xs text-slate-400">
              Recorded Payment Status
            </p>

            <p className="mt-2 text-base font-semibold uppercase text-amber-300">

              {displayValue(
                receipt.status
              )}

            </p>

          </div>

          <div className="mt-5 flex items-start gap-3">

            <LockKeyhole
              size={18}
              className="mt-1 shrink-0 text-slate-400"
            />

            <p className="text-xs leading-6 text-slate-400">
              Student information and
              transaction details are not
              displayed until the payment
              is confirmed as Paid.
            </p>

          </div>

        </div>

      </div>

    </div>

  </section>

)}

{/* =====================================
    PART 5 STARTS BELOW

    Keep the outer div, main and component
    open. Closing tags come in Part 5.
===================================== */}



{/* =====================================
    PART 5 — FINAL VERIFICATION UI
===================================== */}

{/* =====================================
    HOW VERIFICATION WORKS
===================================== */}

<section className="mt-12">

  <div className="mb-7">

    <div className="mb-3 flex items-center gap-3">

      <span className="h-px w-7 bg-blue-400" />

      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-blue-300">
        VERIFICATION PROCESS
      </span>

    </div>

    <h2 className="text-2xl font-semibold text-white">
      How Verification Works
    </h2>

    <p className="mt-3 text-sm leading-7 text-slate-400">
      Every receipt is checked against our
      official payment records.
    </p>

  </div>

  <div className="grid gap-4 md:grid-cols-3">

    {[
      {
        number: "01",
        title: "Scan Receipt QR",
        description:
          "Scan the QR code printed on a newly issued receipt.",
        icon: ScanLine,
      },
      {
        number: "02",
        title: "Database Verification",
        description:
          "Our server checks the receipt reference, verification token and payment record.",
        icon: LockKeyhole,
      },
      {
        number: "03",
        title: "View Payment Status",
        description:
          "See whether the payment is recorded as Paid or remains unconfirmed.",
        icon: ShieldCheck,
      },
    ].map((step) => {

      const Icon = step.icon;

      return (

        <div
          key={step.number}
          className={`${theme.card} p-6`}
        >

          <div className="flex items-center justify-between">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-300">

              <Icon size={23} />

            </div>

            <span className="text-2xl font-semibold text-white/10">
              {step.number}
            </span>

          </div>

          <h3 className="mt-6 text-base font-semibold text-white">
            {step.title}
          </h3>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            {step.description}
          </p>

        </div>

      );

    })}

  </div>

</section>

{/* =====================================
    SECURITY INFORMATION
===================================== */}

<section className="mt-10">

  <div className="rounded-3xl border border-blue-400/15 bg-gradient-to-br from-[#14294D] via-[#132341] to-[#101A2C] p-6 sm:p-8">

    <div className="flex items-start gap-4">

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-300">

        <ShieldCheck size={25} />

      </div>

      <div className="min-w-0">

        <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-blue-300">
          PAYMENT RECORD VALIDATION
        </p>

        <h3 className="mt-3 text-lg font-semibold text-white">
          Official Receipt Verification
        </h3>

        <p className="mt-3 text-sm leading-8 text-slate-300">

          This verification page checks payment
          details against The Curious Classroom's
          database through a server-side API.

          A receipt is marked as verified only
          when a matching payment record is
          currently marked as Paid.

        </p>

        <p className="mt-4 text-xs leading-7 text-slate-400">

          A matching receipt reference does not
          by itself confirm a completed payment.
          Keep verification links private, as they
          may provide access to payment information.

        </p>

      </div>

    </div>

  </div>

</section>

{/* =====================================
    QUICK NAVIGATION
===================================== */}

<section className="mt-10">

  <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">

    <Link
      href={brand.homeUrl}
      className={`inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 sm:w-auto ${focusStyle}`}
    >

      <ArrowLeft size={18} />

      Back to Homepage

    </Link>

    <button
      type="button"
      onClick={retryVerification}
      className={`inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 sm:w-auto ${focusStyle}`}
    >

      <RefreshCw size={18} />

      Check Again

    </button>

  </div>

</section>

{/* =====================================
    INSTITUTIONAL BRANDING
===================================== */}

<section className="mt-12">

  <div className="relative overflow-hidden rounded-3xl border border-blue-400/10 bg-gradient-to-r from-[#14264A] via-[#142B53] to-[#101F3D] p-6 sm:p-8">

    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-blue-500/15 blur-[75px]"
    />

    <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">

      <div className="min-w-0">

        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300">
          THE CURIOUS CLASSROOM
        </p>

        <h2 className="mt-3 text-xl font-semibold text-white">
          Learning With Trust & Transparency
        </h2>

        <p className="mt-3 max-w-lg text-sm leading-7 text-blue-100/70">
          Explore, Learn, Discover.
          Building a better learning experience
          with accessible academic and
          payment information.
        </p>

      </div>

      <div className="w-full shrink-0 rounded-2xl bg-white p-4 sm:w-[200px]">

        <div className="relative h-[90px] w-full">

          <Image
            src={brand.bioverseLogo}
            alt="Shishir BioVerse"
            fill
            sizes="200px"
            className="object-contain"
          />

        </div>

      </div>

    </div>

  </div>

</section>

{/* =====================================
    PREMIUM FOOTER
===================================== */}

<footer className="mt-12 border-t border-white/[0.08] pt-7">

  <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">

    <div>

      <p className="text-xs font-semibold text-slate-300">
        The Curious Classroom
      </p>

      <p className="mt-2 text-[11px] text-slate-500">
        © {new Date().getFullYear()} All Rights Reserved.
      </p>

    </div>

    <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/10 bg-blue-500/[0.05] px-4 py-2 text-xs text-blue-300">

      <ShieldCheck size={16} />

      Official Payment Verification Portal

    </div>

  </div>

  <p className="mt-5 text-center text-[11px] text-slate-600">
    The Curious Classroom · Shishir BioVerse
  </p>

</footer>

{/* =====================================
    CLOSE MAIN WRAPPER
===================================== */}

      </div>

    </main>

  );
}

// =====================================
// END — RECEIPT VERIFICATION PAGE
// =====================================
