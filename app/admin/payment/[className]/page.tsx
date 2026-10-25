"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const inputCls =
  "w-full rounded-xl border border-white/10 bg-[#0a1020] px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 [color-scheme:dark]";

export default function ClassPaymentPage() {
  const params = useParams();

  const className = decodeURIComponent(params.className as string);

  const [students, setStudents] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filterMonth, setFilterMonth] = useState(
    months[new Date().getMonth()]
  );
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");
  const [showPaid, setShowPaid] = useState(true);

  // Modal state
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [payment, setPayment] = useState({
    month: "",
    year: new Date().getFullYear(),
    amount: "",
    payment_method: "",
    transaction_id: "",
  });

  // ---------- DATA LOAD ----------

  async function loadData() {
    setLoading(true);

    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("class", className)
      .eq("status", "approved")
      .order("student_name", { ascending: true });

    if (studentError) {
      alert(studentError.message);
      setLoading(false);
      return;
    }

    const list = studentData || [];
    setStudents(list);

    if (list.length > 0) {
      const ids = list.map((s) => s.id);

      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .select("*")
        .in("student_id", ids);

      if (paymentError) {
        alert(paymentError.message);
      } else {
        setPayments(paymentData || []);
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  // ---------- PAID / UNPAID CALCULATION ----------

  const paymentMap = useMemo(() => {
    const map = new Map<number, any>();
    payments.forEach((p) => {
      if (p.month === filterMonth && Number(p.year) === Number(filterYear)) {
        map.set(p.student_id, p);
      }
    });
    return map;
  }, [payments, filterMonth, filterYear]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();

    return students.filter((s) => {
      if (!q) return true;
      return (
        (s.student_name || "").toLowerCase().includes(q) ||
        (s.student_id || "").toLowerCase().includes(q) ||
        (s.whatsapp || "").includes(q)
      );
    });
  }, [students, search]);

  function isEligible(student: any) {
    if (!student.admission_date) return true;

    const admission = new Date(student.admission_date);
    const admissionIndex = admission.getFullYear() * 12 + admission.getMonth();
    const filterIndex =
      Number(filterYear) * 12 + months.indexOf(filterMonth);

    return filterIndex >= admissionIndex;
  }

  const paidStudents = filteredStudents.filter((s) => paymentMap.has(s.id));

  const unpaidStudents = filteredStudents.filter(
    (s) => !paymentMap.has(s.id) && isEligible(s)
  );

  // ---------- MODAL OPEN ----------

  function openModal(student: any) {
    setSelectedStudent(student);

    setPayment({
      month: filterMonth,
      year: filterYear,
      amount: "",
      payment_method: "",
      transaction_id: "",
    });

    setShowModal(true);
  }

  // ---------- ADD PAYMENT ----------

  async function addPayment() {
    if (
      !selectedStudent ||
      !payment.month ||
      !payment.amount ||
      !payment.payment_method
    ) {
      alert("Please fill all required fields");
      return;
    }

    setSaving(true);

    const monthNumber = String(months.indexOf(payment.month) + 1).padStart(
      2,
      "0"
    );

    const receiptNumber = Math.floor(100000 + Math.random() * 900000);

    const receiptId = `TCC-${payment.year}-${monthNumber}-${receiptNumber}`;

    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id")
      .eq("student_id", selectedStudent.id)
      .eq("month", payment.month)
      .eq("year", Number(payment.year))
      .limit(1);

    if (existingPayment && existingPayment.length > 0) {
      alert(`${payment.month} ${payment.year} payment already completed`);
      setSaving(false);
      return;
    }

    const { data: inserted, error } = await supabase
      .from("payments")
      .insert({
        student_id: selectedStudent.id,
        month: payment.month,
        year: Number(payment.year),
        amount: Number(payment.amount),
        payment_method: payment.payment_method,
        transaction_id: payment.transaction_id,
        status: "paid",
        receipt_id: receiptId,
        receipt_status: "active",
        generated_at: new Date(),
      })
      .select()
      .single();

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setPayments((prev) => [...prev, inserted]);

    setShowModal(false);
    setSelectedStudent(null);

    setPayment({
      month: "",
      year: new Date().getFullYear(),
      amount: "",
      payment_method: "",
      transaction_id: "",
    });
  }

  // ---------- UI ----------

  return (
    <main className="min-h-screen bg-[#060b17] px-6 py-12 text-slate-200">
      <div className="mx-auto max-w-6xl">
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
              {className} <span className="text-blue-400">Payments</span>
            </h1>

            <p className="mt-3 text-slate-400">
              Monthly payment collection & history
            </p>
          </div>

          <Link
            href="/admin/payment"
            className="rounded-xl border border-white/10 bg-[#0d1426] px-5 py-3 font-medium text-slate-200 transition hover:border-white/20 hover:bg-[#121c36]"
          >
            ← Classes
          </Link>
        </div>

        {/* FILTER BAR */}
        <div className="mb-10 flex flex-wrap items-center gap-4 rounded-3xl border border-white/10 bg-[#0d1426] p-5">
          <select
            className={`${inputCls} !w-auto font-semibold`}
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            className={`${inputCls} !w-auto font-semibold`}
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
          >
            {[
              new Date().getFullYear() - 1,
              new Date().getFullYear(),
              new Date().getFullYear() + 1,
            ].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <input
            className={`${inputCls} min-w-[220px] flex-1`}
            placeholder="🔍  Nam, ID ba phone diye khujun"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex gap-3">
            <span className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400">
              Unpaid: {unpaidStudents.length}
            </span>

            <span className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-400">
              Paid: {paidStudents.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-slate-400">Loading...</div>
        ) : (
          <>
            {/* UNPAID SECTION */}
            <div className="mb-5 flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <h2 className="text-2xl font-bold text-white">
                Unpaid Students
              </h2>
              <span className="text-sm text-slate-500">
                {filterMonth} {filterYear}
              </span>
            </div>

            <div className="mb-12 space-y-4">
              {unpaidStudents.length === 0 && (
                <div className="rounded-3xl border border-dashed border-white/10 bg-[#0d1426]/60 p-6 text-slate-400">
                  Kono unpaid student nai 🎉
                </div>
              )}

              {unpaidStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 border-l-4 border-l-red-500/70 bg-[#0d1426] p-6 transition hover:border-white/20 hover:bg-[#101a31]"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {student.student_name}
                    </h3>

                    <div className="mt-2 space-y-1 text-sm text-slate-400">
                      <p>ID: {student.student_id}</p>
                      <p>📱 {student.whatsapp}</p>
                      <p>Batch: {student.batch}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => openModal(student)}
                      className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                    >
                      + Add Payment
                    </button>

                    <Link
                      href={`/admin/payment/history/${student.id}`}
                      className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-semibold text-blue-300 transition hover:bg-blue-500/20"
                    >
                      History
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* PAID SECTION */}
            <button
              onClick={() => setShowPaid(!showPaid)}
              className="mb-5 flex items-center gap-3"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <h2 className="text-2xl font-bold text-white">Paid Students</h2>
              <span className="text-sm text-slate-500">
                {filterMonth} {filterYear}
              </span>
              <span className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-400">
                {showPaid ? "▲ Hide" : "▼ Show"}
              </span>
            </button>

            {showPaid && (
              <div className="space-y-4">
                {paidStudents.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-[#0d1426]/60 p-6 text-slate-400">
                    Ei month a ekhono kew payment kore ni
                  </div>
                )}

                {paidStudents.map((student) => {
                  const p = paymentMap.get(student.id);

                  return (
                    <div
                      key={student.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 border-l-4 border-l-emerald-500/70 bg-[#0d1426] p-6 transition hover:border-white/20 hover:bg-[#101a31]"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {student.student_name}
                        </h3>

                        <div className="mt-2 space-y-1 text-sm text-slate-400">
                          <p>ID: {student.student_id}</p>
                          <p>📱 {student.whatsapp}</p>
                          <p>Batch: {student.batch}</p>
                        </div>

                        <p className="mt-3 text-sm font-semibold text-emerald-300">
                          ৳{p?.amount} • {p?.payment_method} •{" "}
                          {p?.payment_date
                            ? new Date(p.payment_date).toLocaleDateString(
                                "en-GB"
                              )
                            : ""}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-400">
                          ✔ Paid
                        </span>

                        <Link
                          href={`/admin/payment/history/${student.id}`}
                          className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-semibold text-blue-300 transition hover:bg-blue-500/20"
                        >
                          History
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* PAYMENT MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d1426] p-8 shadow-2xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-blue-500" />
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-400">
                  Monthly Payment
                </span>
              </div>

              <h2 className="mb-5 text-2xl font-bold text-white">
                Add Payment
              </h2>

              <div className="mb-6 rounded-2xl border border-white/10 bg-[#0a1020] p-4">
                <p className="font-semibold text-white">
                  {selectedStudent?.student_name}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {selectedStudent?.student_id} • {payment.month}{" "}
                  {payment.year}
                </p>
              </div>

              <input
                className={`${inputCls} mb-4`}
                type="number"
                placeholder="Amount"
                value={payment.amount}
                onChange={(e) =>
                  setPayment({ ...payment, amount: e.target.value })
                }
              />

              <select
                className={`${inputCls} mb-4`}
                value={payment.payment_method}
                onChange={(e) =>
                  setPayment({ ...payment, payment_method: e.target.value })
                }
              >
                <option value="">Payment Method</option>
                <option value="bKash">bKash</option>
                <option value="Offline">Offline</option>
              </select>

              {payment.payment_method === "bKash" && (
                <input
                  className={`${inputCls} mb-4`}
                  placeholder="Transaction ID"
                  value={payment.transaction_id}
                  onChange={(e) =>
                    setPayment({ ...payment, transaction_id: e.target.value })
                  }
                />
              )}

              <div className="mt-2 flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 font-semibold text-slate-300 transition hover:bg-white/10"
                >
                  Cancel
                </button>

                <button
                  onClick={addPayment}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Payment"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}