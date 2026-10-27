
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  period: string;
  refreshKey: number;
};

type MonthlyData = {
  key: string;
  label: string;
  income: number;
  expense: number;
};

type Transaction = {
  id: string;
  transaction_type: "income" | "expense";
  amount: number | string | null;
  transaction_date: string;
};

const money = (value: number) =>
  "৳" +
  new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 2,
  }).format(value);

const compactMoney = (value: number) => {
  if (value >= 100000) {
    return `৳${(value / 100000).toFixed(1)}L`;
  }

  if (value >= 1000) {
    return `৳${(value / 1000).toFixed(1)}k`;
  }

  return `৳${Math.round(value)}`;
};

function getSixMonths(period: string): MonthlyData[] {
  const [year, month] = period.split("-").map(Number);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return [];
  }

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      Date.UTC(year, month - 1 - (5 - index), 1)
    );

    const label = new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "2-digit",
      timeZone: "UTC",
    }).format(date);

    return {
      key: date.toISOString().slice(0, 7),
      label,
      income: 0,
      expense: 0,
    };
  });
}

export default function MonthlyTrends({
  period,
  refreshKey,
}: Props) {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const periodMonths = useMemo(
    () => getSixMonths(period),
    [period]
  );

  useEffect(() => {
    let active = true;

    async function loadTrends() {
      setLoading(true);
      setError("");

      try {
        if (periodMonths.length !== 6) {
          throw new Error("Invalid reporting period.");
        }

        const { data: auth, error: authError } =
          await supabase.auth.getUser();

        if (authError || !auth.user) {
          throw new Error("Please login as admin.");
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

        const startDate = `${periodMonths[0].key}-01`;

        const [year, month] = period
          .split("-")
          .map(Number);

        const endDate = new Date(
          Date.UTC(year, month, 1)
        )
          .toISOString()
          .slice(0, 10);

        const allTransactions: Transaction[] = [];

        // Pagination avoids the default Supabase row limit.
        const pageSize = 500;
        let offset = 0;

        while (true) {
          const { data: rows, error: dbError } =
            await supabase
              .from("personal_finance_transactions")
              .select(
                "id, transaction_type, amount, transaction_date"
              )
              .eq("owner_id", auth.user.id)
              .gte("transaction_date", startDate)
              .lt("transaction_date", endDate)
              .order("transaction_date", {
                ascending: true,
              })
              .order("id", {
                ascending: true,
              })
              .range(offset, offset + pageSize - 1);

          if (dbError) throw dbError;

          if (!active) return;

          const page = (rows ?? []) as Transaction[];

          allTransactions.push(...page);

          if (page.length < pageSize) break;

          offset += pageSize;
        }

        const result = periodMonths.map((item) => ({
          ...item,
        }));

        const monthMap = new Map(
          result.map((item) => [item.key, item])
        );

        for (const transaction of allTransactions) {
          const key =
            transaction.transaction_date.slice(0, 7);

          const monthData = monthMap.get(key);

          if (!monthData) continue;

          const amount = Number(transaction.amount ?? 0);

          if (!Number.isFinite(amount)) continue;

          if (transaction.transaction_type === "income") {
            monthData.income += amount;
          } else if (
            transaction.transaction_type === "expense"
          ) {
            monthData.expense += amount;
          }
        }

        if (active) setData(result);
      } catch (err) {
        if (!active) return;

        setData([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load financial trends."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadTrends();

    return () => {
      active = false;
    };
  }, [periodMonths, refreshKey]);

  const summary = useMemo(() => {
    const totalIncome = data.reduce(
      (sum, item) => sum + item.income,
      0
    );

    const totalExpense = data.reduce(
      (sum, item) => sum + item.expense,
      0
    );

    return {
      income: totalIncome,
      expense: totalExpense,
      net: totalIncome - totalExpense,
    };
  }, [data]);

  const maxValue = Math.max(
    0,
    ...data.flatMap((item) => [
      item.income,
      item.expense,
    ])
  );

  const chartMax =
    maxValue > 0 ? maxValue * 1.1 : 1;

  const ticks = [1, 0.75, 0.5, 0.25, 0];

  function barHeight(value: number) {
    if (value <= 0) return 0;

    return Math.min(100, (value / chartMax) * 100);
  }

  const hasData = data.some(
    (item) => item.income > 0 || item.expense > 0
  );

  const panel =
    "rounded-2xl border border-[#263550] bg-[#111c30]";

  return (
    <section className="space-y-5">
      {/* SECTION HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
            Financial Analytics
          </p>

          <h2 className="text-2xl font-bold text-white">
            Income & Expense Trends
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Compare your financial activity over the last
            six reporting months.
          </p>
        </div>

        <div className="rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-xs font-semibold text-sky-300">
          6-Month Overview
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            title: "6-Month Income",
            value: summary.income,
            color: "text-emerald-400",
            symbol: "↑",
          },
          {
            title: "6-Month Expenses",
            value: summary.expense,
            color: "text-rose-400",
            symbol: "↓",
          },
          {
            title: "Net Cash Flow",
            value: summary.net,
            color:
              summary.net >= 0
                ? "text-sky-400"
                : "text-rose-400",
            symbol: "৳",
          },
        ].map((item) => (
          <div
            key={item.title}
            className={`${panel} p-5 transition hover:border-sky-500/30`}
          >
            <div
              className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b2b44] text-xl font-bold ${item.color}`}
            >
              {item.symbol}
            </div>

            <p className="text-xs font-medium text-slate-400">
              {item.title}
            </p>

            <h3
              className={`mt-2 break-words text-2xl font-bold ${item.color}`}
            >
              {loading ? "—" : money(item.value)}
            </h3>
          </div>
        ))}
      </div>

      {/* CHART PANEL */}
      <div className={`${panel} p-5 sm:p-7`}>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              Monthly Performance
            </h3>

            <p className="mt-2 text-xs text-slate-500">
              Recorded personal income vs expenses
            </p>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-emerald-400" />
              <span className="text-xs text-slate-400">
                Income
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-rose-400" />
              <span className="text-xs text-slate-400">
                Expense
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-72 items-center justify-center text-sm text-slate-400">
            Loading financial chart...
          </div>
        ) : !hasData ? (
          <div className="flex h-72 flex-col items-center justify-center rounded-xl border border-dashed border-[#30415d] bg-[#0b1628] text-center">
            <div className="mb-4 text-4xl">▥</div>

            <p className="font-semibold text-white">
              No Financial Data
            </p>

            <p className="mt-2 max-w-sm px-4 text-sm leading-6 text-slate-400">
              Add income or expense transactions to generate
              your monthly financial chart.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[620px]">
              <div className="flex gap-3">
                {/* Y-AXIS */}
                <div className="flex h-64 w-16 shrink-0 flex-col justify-between text-right">
                  {ticks.map((ratio) => (
                    <span
                      key={ratio}
                      className="text-[10px] text-slate-500"
                    >
                      {compactMoney(chartMax * ratio)}
                    </span>
                  ))}
                </div>

                {/* BAR CHART */}
                <div className="relative h-64 flex-1 border-b border-[#354762]">
                  {/* HORIZONTAL GRID */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                    {ticks.map((ratio) => (
                      <div
                        key={ratio}
                        className="border-t border-dashed border-[#293950]"
                      />
                    ))}
                  </div>

                  {/* MONTHLY BARS */}
                  <div className="relative z-10 grid h-full grid-cols-6 gap-3 px-2">
                    {data.map((month) => (
                      <div
                        key={month.key}
                        className="flex h-full items-end justify-center gap-2"
                      >
                        <div
                          title={`${month.label} Income: ${money(month.income)}`}
                          className="w-5 rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-500 hover:brightness-125"
                          style={{
                            height: `${barHeight(month.income)}%`,
                          }}
                        />

                        <div
                          title={`${month.label} Expense: ${money(month.expense)}`}
                          className="w-5 rounded-t-md bg-gradient-to-t from-rose-600 to-rose-400 transition-all duration-500 hover:brightness-125"
                          style={{
                            height: `${barHeight(month.expense)}%`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MONTH LABELS */}
              <div className="ml-[76px] mt-4 grid grid-cols-6 gap-3 px-2">
                {data.map((month) => (
                  <div
                    key={month.key}
                    className="text-center text-xs font-semibold text-slate-400"
                  >
                    {month.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <p className="mt-6 border-t border-[#263550] pt-4 text-xs leading-6 text-slate-500">
          This chart uses recorded personal finance transactions.
          It does not include student fee collection automatically.
        </p>
      </div>

      {/* MONTHLY NET CASH FLOW */}
      {!loading && data.length > 0 && (
        <div className={`${panel} p-5 sm:p-6`}>
          <h3 className="text-lg font-bold text-white">
            Monthly Cash Flow Breakdown
          </h3>

          <p className="mt-2 text-xs text-slate-400">
            Income minus expenses for each month.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {data.map((month) => {
              const net = month.income - month.expense;

              return (
                <div
                  key={month.key}
                  className="rounded-xl border border-[#293950] bg-[#0b1628] p-4"
                >
                  <p className="text-xs font-semibold text-slate-400">
                    {month.label}
                  </p>

                  <p
                    className={`mt-3 break-words text-lg font-bold ${
                      net >= 0
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {money(net)}
                  </p>

                  <p className="mt-2 text-[11px] text-slate-500">
                    {net > 0
                      ? "Positive"
                      : net < 0
                        ? "Negative"
                        : "Balanced"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
