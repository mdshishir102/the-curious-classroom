"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function PaymentHistoryPage() {
  const params = useParams();

  const id = params.id;

  const [student, setStudent] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadHistory() {
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

    if (studentError) {
      alert(studentError.message);
      setLoading(false);
      return;
    }

    const { data: paymentData, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("student_id", id)
      .order("payment_date", { ascending: false });

    if (paymentError) {
      alert(paymentError.message);
      setLoading(false);
      return;
    }

    setStudent(studentData);
    setPayments(paymentData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const totalPaid = useMemo(
    () => payments.reduce((sum, p) => sum + Number(p.amount || 0), 0),
    [payments]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060b17] font-semibold text-slate-400">
        Loading...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060b17] font-semibold text-slate-400">
        Student paoa jay ni
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#060b17] px-6 py-12 text-slate-200">
      <div className="mx-auto max-w-4xl">
        {/* HEADER */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-10 bg-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-400">
                Finance Management
              </span>
            </div>

            <h1 className="text-4xl font-bold text-white md:text-5xl">
              Payment <span className="text-blue-400">History</span>
            </h1>
          </div>

          <Link
            href={`/admin/payment/${encodeURIComponent(student.class)}`}
            className="rounded-xl border border-white/10 bg-[#0d1426] px-5 py-3 font-medium text-slate-200 transition hover:border-white/20 hover:bg-[#121c36]"
          >
            ← Back
          </Link>
        </div>

        {/* STUDENT INFO */}
        <div className="mb-6 rounded-3xl border border-white/10 bg-[#0d1426] p-6">
          <h2 className="text-2xl font-bold text-white">
            {student.student_name}
          </h2>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#0a1020] p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Student ID
              </p>
              <p className="mt-1 font-semibold text-white">
                {student.student_id}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0a1020] p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Class
              </p>
              <p className="mt-1 font-semibold text-white">{student.class}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0a1020] p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Batch
              </p>
              <p className="mt-1 font-semibold text-white">{student.batch}</p>
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
              Total Paid
            </p>
            <p className="mt-2 text-3xl font-bold text-white">
              ৳{totalPaid.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
              Months Paid
            </p>
            <p className="mt-2 text-3xl font-bold text-white">
              {payments.length}
            </p>
          </div>
        </div>

        {/* PAYMENT LIST */}
        <div className="mb-5 flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Monthly Payments</h2>
        </div>

        {payments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-[#0d1426]/60 p-6 text-slate-400">
            Kono payment history paoa jay ni
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-white/10 border-l-4 border-l-emerald-500/70 bg-[#0d1426] p-6 transition hover:border-white/20 hover:bg-[#101a31]"
              >
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {payment.month} {payment.year}
                  </h3>

                  <div className="mt-3 space-y-1 text-sm text-slate-400">
                    <p>
                      Amount:{" "}
                      <span className="font-semibold text-emerald-300">
                        ৳{payment.amount}
                      </span>
                    </p>

                    <p>Method: {payment.payment_method}</p>

                    {payment.transaction_id && (
                      <p>Transaction: {payment.transaction_id}</p>
                    )}

                    {payment.receipt_id && (
                      <p className="text-xs text-slate-500">
                        Receipt: {payment.receipt_id}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-400">
                    ✔ Paid
                  </span>

                  <p className="mt-3 text-sm text-slate-500">
                    {payment.payment_date
                      ? new Date(payment.payment_date).toLocaleString("en-GB")
                      : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}