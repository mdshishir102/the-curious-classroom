
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Transaction = {
  id: string;
  transaction_date: string;
  transaction_type: "income" | "expense";
  category: string;
  payment_method: string | null;
  description: string | null;
  amount: number | string;
};

type Props = {
  period: string;
  refreshKey: number;
};

type Report = {
  start: string;
  end: string;
  rows: Transaction[];
};

const money = (value: number) =>
  "৳" +
  new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

const plainAmount = (value: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function monthEnd(period: string) {
  const [year, month] = period.split("-").map(Number);

  return new Date(Date.UTC(year, month, 0))
    .toISOString()
    .slice(0, 10);
}

// Prevent spreadsheet software from interpreting
// user-entered text as a formula.
function csvCell(value: unknown) {
  let text = String(value ?? "");

  if (/^\s*[=+\-@\t\r]/.test(text)) {
    text = "'" + text;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

// Standard jsPDF fonts cannot render Bangla text.
// Preserve such text in the CSV export instead.
function pdfText(value: string) {
  if (/[^\x20-\x7E]/.test(value)) {
    return "[Non-English text - see CSV]";
  }

  return value;
}

export default function FinanceReports({
  period,
  refreshKey,
}: Props) {
  const [startDate, setStartDate] = useState(
    `${period}-01`
  );

  const [endDate, setEndDate] = useState(
    monthEnd(period)
  );

  const [report, setReport] = useState<Report | null>(null);

  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const requestId = useRef(0);

  // Update reporting dates when the dashboard month changes.
  useEffect(() => {
    requestId.current += 1;

    setStartDate(`${period}-01`);
    setEndDate(monthEnd(period));

    setReport(null);
    setLoading(false);
    setError("");
    setMessage("");
  }, [period]);

  // Invalidate the report after adding/editing/deleting a transaction.
  useEffect(() => {
    requestId.current += 1;
    setReport(null);
    setLoading(false);
    setMessage("");
  }, [refreshKey]);

  function changeStart(value: string) {
    requestId.current += 1;
    setStartDate(value);
    setReport(null);
    setLoading(false);
    setError("");
    setMessage("");
  }

  function changeEnd(value: string) {
    requestId.current += 1;
    setEndDate(value);
    setReport(null);
    setLoading(false);
    setError("");
    setMessage("");
  }

  async function generateReport() {
    setError("");
    setMessage("");

    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    if (startDate > endDate) {
      setError("Start date cannot be after end date.");
      return;
    }

    const currentRequest = ++requestId.current;

    setLoading(true);
    setReport(null);

    try {
      const { data: auth, error: authError } =
        await supabase.auth.getUser();

      if (authError || !auth.user) {
        throw new Error("Please log in as admin.");
      }

      const { data: admin, error: adminError } =
        await supabase
          .from("admins")
          .select("auth_user_id")
          .eq("auth_user_id", auth.user.id)
          .eq("role", "admin")
          .maybeSingle();

      if (adminError) throw adminError;

      if (!admin) {
        throw new Error("Admin access required.");
      }

      const allRows: Transaction[] = [];

      const pageSize = 500;
      let offset = 0;

      // Read every matching page instead of assuming
      // the default Supabase result limit is enough.
      while (true) {
        const { data, error: dbError } = await supabase
          .from("personal_finance_transactions")
          .select(
            "id, transaction_date, transaction_type, category, payment_method, description, amount"
          )
          .eq("owner_id", auth.user.id)
          .gte("transaction_date", startDate)
          .lte("transaction_date", endDate)
          .order("transaction_date", {
            ascending: true,
          })
          .order("id", {
            ascending: true,
          })
          .range(offset, offset + pageSize - 1);

        if (dbError) throw dbError;

        if (currentRequest !== requestId.current) return;

        const page = (data ?? []) as Transaction[];

        allRows.push(...page);

        if (page.length < pageSize) break;

        offset += pageSize;
      }

      if (currentRequest !== requestId.current) return;

      setReport({
        start: startDate,
        end: endDate,
        rows: allRows,
      });

      setMessage(
        `Report generated with ${allRows.length} transaction(s).`
      );
    } catch (err) {
      if (currentRequest !== requestId.current) return;

      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate report."
      );
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  }

  const totals = useMemo(() => {
    const rows = report?.rows ?? [];

    const income = rows
      .filter((item) => item.transaction_type === "income")
      .reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      );

    const expense = rows
      .filter((item) => item.transaction_type === "expense")
      .reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      );

    return {
      income,
      expense,
      net: income - expense,
      count: rows.length,
    };
  }, [report]);

  function downloadCSV() {
    if (!report) return;

    const rows: unknown[][] = [
      [
        "Date",
        "Type",
        "Category",
        "Payment Method",
        "Description",
        "Amount (BDT)",
      ],

      ...report.rows.map((item) => [
        item.transaction_date,
        item.transaction_type,
        item.category,
        item.payment_method ?? "",
        item.description ?? "",
        Number(item.amount).toFixed(2),
      ]),

      [],
      ["SUMMARY"],
      ["Total Income (BDT)", totals.income.toFixed(2)],
      ["Total Expenses (BDT)", totals.expense.toFixed(2)],
      ["Net Cash Flow (BDT)", totals.net.toFixed(2)],
    ];

    const csv = rows
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");

    // UTF-8 BOM helps Excel display Bangla text correctly.
    const blob = new Blob(
      ["\uFEFF", csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    link.download =
      `personal-finance-${report.start}-to-${report.end}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function downloadPDF() {
    if (!report || pdfLoading) return;

    setPdfLoading(true);
    setError("");

    try {
      const [{ jsPDF }, { default: autoTable }] =
        await Promise.all([
          import("jspdf"),
          import("jspdf-autotable"),
        ]);

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      // TITLE
      doc.setFillColor(13, 25, 45);
      doc.rect(0, 0, pageWidth, 34, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.setTextColor(255, 255, 255);

      doc.text(
        "THE CURIOUS CLASSROOM",
        14,
        13
      );

      doc.setFontSize(12);
      doc.setTextColor(147, 197, 253);

      doc.text(
        "PERSONAL FINANCE STATEMENT",
        14,
        23
      );

      // REPORT DETAILS
      doc.setTextColor(45, 55, 72);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      doc.text(
        `Reporting Period: ${report.start} to ${report.end}`,
        14,
        42
      );

      doc.text(
        `Transactions: ${totals.count}`,
        14,
        49
      );

      // FINANCIAL SUMMARY
      doc.setFont("helvetica", "bold");

      doc.text(
        `Income: BDT ${plainAmount(totals.income)}`,
        14,
        60
      );

      doc.text(
        `Expenses: BDT ${plainAmount(totals.expense)}`,
        105,
        60
      );

      doc.text(
        `Net Cash Flow: BDT ${plainAmount(totals.net)}`,
        200,
        60
      );

      // TRANSACTION TABLE
      autoTable(doc, {
        startY: 69,

        head: [[
          "Date",
          "Type",
          "Category",
          "Method",
          "Description",
          "Amount (BDT)",
        ]],

        body: report.rows.map((item) => [
          item.transaction_date,
          item.transaction_type.toUpperCase(),
          pdfText(item.category),
          pdfText(item.payment_method ?? ""),
          pdfText(
            (item.description ?? "").slice(0, 100)
          ),
          plainAmount(Number(item.amount)),
        ]),

        theme: "grid",

        styles: {
          font: "helvetica",
          fontSize: 8,
          cellPadding: 3,
          overflow: "linebreak",
          textColor: [51, 65, 85],
        },

        headStyles: {
          fillColor: [23, 48, 83],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },

        alternateRowStyles: {
          fillColor: [242, 246, 252],
        },

        columnStyles: {
          4: { cellWidth: 85 },
          5: { halign: "right" },
        },

        margin: {
          left: 14,
          right: 14,
          bottom: 18,
        },

        didDrawPage: () => {
const totalPages = doc.getNumberOfPages();

          doc.setFontSize(8);
          doc.setTextColor(120, 130, 145);

          doc.text(
            `The Curious Classroom | Page ${totalPages}`,
            14,
            doc.internal.pageSize.getHeight() - 8
          );
        },
      });

      doc.save(
        `personal-finance-${report.start}-to-${report.end}.pdf`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to export PDF."
      );
    } finally {
      setPdfLoading(false);
    }
  }

  const panel =
    "rounded-2xl border border-[#263550] bg-[#111c30]";

  const dateInput =
    "w-full rounded-xl border border-[#30415d] bg-[#0a1425] px-4 py-3 text-sm text-white outline-none focus:border-sky-500 [color-scheme:dark]";

  return (
    <section className="space-y-5">
      {/* HEADER */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
          Financial Reporting
        </p>

        <h2 className="text-2xl font-bold text-white">
          Financial Report Center
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Generate detailed income and expense statements.
        </p>
      </div>

      {/* DATE RANGE */}
      <div className={`${panel} p-5 sm:p-6`}>
        <h3 className="text-lg font-bold text-white">
          Select Reporting Period
        </h3>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="report-start"
              className="mb-2 block text-xs text-slate-400"
            >
              Start Date
            </label>

            <input
              id="report-start"
              type="date"
              value={startDate}
              onChange={(e) => changeStart(e.target.value)}
              className={dateInput}
            />
          </div>

          <div>
            <label
              htmlFor="report-end"
              className="mb-2 block text-xs text-slate-400"
            >
              End Date
            </label>

            <input
              id="report-end"
              type="date"
              value={endDate}
              onChange={(e) => changeEnd(e.target.value)}
              className={dateInput}
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              disabled={loading}
              onClick={() => void generateReport()}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {loading
                ? "Generating..."
                : "Generate Report"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300"
        >
          {message}
        </div>
      )}

      {/* REPORT RESULTS */}
      {report && (
        <>
          {/* SUMMARY */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                label: "Total Income",
                amount: totals.income,
                color: "text-emerald-400",
              },
              {
                label: "Total Expenses",
                amount: totals.expense,
                color: "text-rose-400",
              },
              {
                label: "Net Cash Flow",
                amount: totals.net,
                color:
                  totals.net >= 0
                    ? "text-sky-400"
                    : "text-rose-400",
              },
            ].map((item) => (
              <div key={item.label} className={`${panel} p-5`}>
                <p className="text-sm text-slate-400">
                  {item.label}
                </p>

                <h3
                  className={`mt-3 break-words text-2xl font-bold ${item.color}`}
                >
                  {money(item.amount)}
                </h3>
              </div>
            ))}
          </div>

          {/* EXPORT BUTTONS */}
          <div className={`${panel} p-5 sm:p-6`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">
                  Download Financial Statement
                </h3>

                <p className="mt-2 text-xs text-slate-400">
                  {totals.count} transactions included in this report.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={downloadCSV}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
                >
                  ↓ Excel (CSV)
                </button>

                <button
                  type="button"
                  disabled={pdfLoading}
                  onClick={() => void downloadPDF()}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {pdfLoading
                    ? "Preparing PDF..."
                    : "↓ Download PDF"}
                </button>
              </div>
            </div>
          </div>

          {/* REPORT PREVIEW */}
          <div className={`${panel} overflow-hidden`}>
            <div className="border-b border-[#263550] p-5 sm:p-6">
              <h3 className="text-lg font-bold">
                Statement Preview
              </h3>

              <p className="mt-2 text-xs text-slate-400">
                {report.start} to {report.end}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-[#0c1729] text-slate-400">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Method</th>
                    <th className="p-4 text-right">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#263550]">
                  {report.rows.slice(0, 12).map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#192840]"
                    >
                      <td className="p-4 text-slate-400">
                        {item.transaction_date}
                      </td>

                      <td className="p-4 capitalize">
                        {item.transaction_type}
                      </td>

                      <td className="p-4 text-white">
                        {item.category}

                        {item.description && (
                          <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                            {item.description}
                          </p>
                        )}
                      </td>

                      <td className="p-4 text-slate-400">
                        {item.payment_method ?? "—"}
                      </td>

                      <td
                        className={`p-4 text-right font-bold ${
                          item.transaction_type === "income"
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {item.transaction_type === "income"
                          ? "+"
                          : "−"}
                        {money(Number(item.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {report.rows.length === 0 && (
                <p className="p-8 text-center text-sm text-slate-500">
                  No transactions found within this date range.
                </p>
              )}
            </div>

            {report.rows.length > 12 && (
              <p className="border-t border-[#263550] p-4 text-center text-xs text-slate-400">
                Showing the first 12 transactions.
                Downloads include all {report.rows.length} records.
              </p>
            )}
          </div>

          <p className="text-xs leading-6 text-slate-500">
            The Excel-compatible CSV preserves Bangla descriptions.
            Standard PDF fonts may not display Bangla notes, so
            non-English notes are replaced with a reference to
            the CSV export. Reports contain personal financial
            data; keep downloaded files private.
          </p>
        </>
      )}
    </section>
  );
}
