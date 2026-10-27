
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  period: string;
  income: number;
  expense: number;
  categories: [string, number][];
  loading: boolean;
};

type BudgetRow = {
  category: string;
  budget_amount: number | string;
};

type SaveType = "budget" | "goal";

const money = (amount: number) =>
  "৳" +
  new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 2,
  }).format(amount);

function Progress({
  value,
  color,
}: {
  value: number;
  color: string;
}) {
  const width = Number.isFinite(value)
    ? Math.min(100, Math.max(0, value))
    : 0;

  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-[#263550]">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export default function BudgetInsights({
  period,
  income,
  expense,
  categories,
  loading,
}: Props) {
  const [budget, setBudget] = useState<number | null>(null);
  const [goal, setGoal] = useState<number | null>(null);

  const [budgetInput, setBudgetInput] = useState("");
  const [goalInput, setGoalInput] = useState("");

  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState<SaveType | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const busy = loading || dataLoading;

  useEffect(() => {
    let active = true;

    async function loadBudget() {
      setDataLoading(true);
      setBudget(null);
      setGoal(null);
      setBudgetInput("");
      setGoalInput("");
      setError("");
      setNotice("");

      try {
        const { data: auth, error: authError } =
          await supabase.auth.getUser();

        if (authError || !auth.user) {
          throw new Error("Please login as admin.");
        }

        const { data: admin, error: adminError } = await supabase
          .from("admins")
          .select("auth_user_id")
          .eq("auth_user_id", auth.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (adminError) throw adminError;

        if (!admin) {
          throw new Error("Admin access required.");
        }

        const [year, month] = period.split("-").map(Number);

        if (
          !Number.isInteger(year) ||
          !Number.isInteger(month) ||
          month < 1 ||
          month > 12
        ) {
          throw new Error("Invalid reporting month.");
        }

        const { data, error: dbError } = await supabase
          .from("personal_finance_budgets")
          .select("category, budget_amount")
          .eq("owner_id", auth.user.id)
          .eq("month", month)
          .eq("year", year);

        if (dbError) throw dbError;

        if (!active) return;

        const rows = (data ?? []) as BudgetRow[];

        const budgetRow = rows.find(
          (row) => row.category === "All Expenses"
        );

        const goalRow = rows.find(
          (row) => row.category === "Savings Goal"
        );

        if (budgetRow) {
          const value = Number(budgetRow.budget_amount);
          setBudget(value);
          setBudgetInput(String(value));
        }

        if (goalRow) {
          const value = Number(goalRow.budget_amount);
          setGoal(value);
          setGoalInput(String(value));
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Unable to load budgets."
          );
        }
      } finally {
        if (active) setDataLoading(false);
      }
    }

    void loadBudget();

    return () => {
      active = false;
    };
  }, [period]);

  async function saveValue(type: SaveType) {
    if (busy || saving) return;

    setError("");
    setNotice("");

    const raw = type === "budget" ? budgetInput : goalInput;
    const amount = Number(raw);

    if (
      raw.trim() === "" ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount >= 10000000000
    ) {
      setError("Enter an amount between ৳0.01 and ৳9,999,999,999.99.");
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(raw.trim())) {
      setError("Use a valid amount with up to 2 decimal places.");
      return;
    }

    setSaving(type);

    try {
      const { data: auth, error: authError } =
        await supabase.auth.getUser();

      if (authError || !auth.user) {
        throw new Error("Your admin session has expired.");
      }

      const [year, month] = period.split("-").map(Number);

      const category =
        type === "budget" ? "All Expenses" : "Savings Goal";

      const { error: saveError } = await supabase
        .from("personal_finance_budgets")
        .upsert(
          {
            owner_id: auth.user.id,
            year,
            month,
            category,
            budget_amount: amount,
          },
          {
            onConflict: "owner_id,month,year,category",
          }
        );

      if (saveError) throw saveError;

      if (type === "budget") {
        setBudget(amount);
      } else {
        setGoal(amount);
      }

      setNotice(
        type === "budget"
          ? "Monthly budget saved successfully."
          : "Savings target saved successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save your settings."
      );
    } finally {
      setSaving(null);
    }
  }

  function submitValue(e: FormEvent, type: SaveType) {
    e.preventDefault();
    void saveValue(type);
  }

  const netCashFlow = income - expense;
  const potentialSavings = Math.max(0, netCashFlow);

  const budgetPercent =
    budget !== null && budget > 0
      ? (expense / budget) * 100
      : 0;

  const goalPercent =
    goal !== null && goal > 0
      ? (potentialSavings / goal) * 100
      : 0;

  const remainingBudget =
    budget === null ? null : budget - expense;

  const largestCategory = categories[0];

  const budgetColor =
    budgetPercent >= 100
      ? "bg-rose-400"
      : budgetPercent >= 80
        ? "bg-amber-400"
        : "bg-emerald-400";

  const insights: {
    title: string;
    description: string;
    tone: string;
  }[] = [];

  if (!busy) {
    if (budget === null) {
      insights.push({
        title: "Set your monthly budget",
        description:
          "Create an expense limit to track spending and receive budget warnings.",
        tone: "text-sky-400",
      });
    } else if (expense > budget) {
      insights.push({
        title: "Monthly budget exceeded",
        description: `You've spent ${money(expense - budget)} more than your planned monthly budget. Review non-essential expenses.`,
        tone: "text-rose-400",
      });
    } else if (budgetPercent >= 80) {
      insights.push({
        title: "You're approaching your budget limit",
        description: `You've used ${budgetPercent.toFixed(1)}% of your monthly budget. Only ${money(budget - expense)} remains.`,
        tone: "text-amber-400",
      });
    } else {
      insights.push({
        title: "Spending is within budget",
        description: `You have ${money(budget - expense)} remaining in your expense budget for this month.`,
        tone: "text-emerald-400",
      });
    }

    if (expense > income) {
      insights.push({
        title: "Expenses exceed recorded income",
        description: `Your expenses are ${money(expense - income)} higher than your income this month. Review spending and make sure all income is recorded.`,
        tone: "text-rose-400",
      });
    } else if (income === 0) {
      insights.push({
        title: "Record your income",
        description:
          "Add your monthly income to make the cash flow and savings estimates meaningful.",
        tone: "text-sky-400",
      });
    }

    if (largestCategory && expense > 0) {
      const [category, amount] = largestCategory;
      const share = (amount / expense) * 100;

      insights.push({
        title: `Highest spending: ${category}`,
        description: `${category} accounts for ${share.toFixed(1)}% of your expenses (${money(amount)}). Review this category for possible savings.`,
        tone: "text-violet-400",
      });
    }

    if (goal !== null) {
      if (potentialSavings >= goal) {
        insights.push({
          title: "Savings capacity meets your target",
          description:
            "Your recorded net cash flow is sufficient for your savings target. Actual savings still need to be set aside.",
          tone: "text-emerald-400",
        });
      } else {
        insights.push({
          title: "Savings target progress",
          description: `Your current positive cash flow is ${money(potentialSavings)} against a target of ${money(goal)}. This is potential savings, not money already saved.`,
          tone: "text-amber-400",
        });
      }
    }
  }

  const panel =
    "rounded-2xl border border-[#263550] bg-[#111c30] p-5 sm:p-6";

  const input =
    "w-full rounded-xl border border-[#30415d] bg-[#0a1425] px-4 py-3 text-sm text-white outline-none focus:border-sky-500";

  return (
    <section className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
          Financial Planning
        </p>

        <h2 className="text-2xl font-bold text-white">
          Budget & Savings Planner
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Set your monthly limits and monitor financial progress.
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      {notice && (
        <div role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* MONTHLY EXPENSE BUDGET */}
        <div className={panel}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">
                Monthly Expense Budget
              </p>
              <h3 className="mt-2 text-3xl font-bold text-white">
                {busy
                  ? "—"
                  : budget === null
                    ? "Not Set"
                    : money(budget)}
              </h3>
            </div>

            <div className="rounded-xl bg-sky-400/10 p-3 text-2xl text-sky-400">
              ◈
            </div>
          </div>

          <form
            onSubmit={(e) => submitValue(e, "budget")}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="number"
              min="0.01"
              max="9999999999.99"
              step="0.01"
              placeholder="Set monthly budget"
              aria-label="Monthly expense budget in taka"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className={input}
              required
            />

            <button
              type="submit"
              disabled={busy || saving !== null}
              className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-40"
            >
              {saving === "budget" ? "Saving..." : "Save Budget"}
            </button>
          </form>

          <div className="mt-7 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Amount Spent</span>
              <span className="font-semibold text-white">
                {busy ? "—" : money(expense)}
              </span>
            </div>

            <Progress value={busy ? 0 : budgetPercent} color={budgetColor} />

            <div className="flex justify-between text-xs">
              <span className="text-slate-500">
                {budget === null
                  ? "Set a budget to track usage"
                  : `${budgetPercent.toFixed(1)}% used`}
              </span>

              <span
                className={
                  remainingBudget !== null && remainingBudget < 0
                    ? "font-semibold text-rose-400"
                    : "text-emerald-400"
                }
              >
                {busy || remainingBudget === null
                  ? "—"
                  : remainingBudget < 0
                    ? `${money(Math.abs(remainingBudget))} over budget`
                    : `${money(remainingBudget)} remaining`}
              </span>
            </div>
          </div>
        </div>

        {/* SAVINGS TARGET */}
        <div className={panel}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">
                Monthly Savings Target
              </p>

              <h3 className="mt-2 text-3xl font-bold text-white">
                {busy ? "—" : goal === null ? "Not Set" : money(goal)}
              </h3>
            </div>

            <div className="rounded-xl bg-violet-400/10 p-3 text-2xl text-violet-400">
              ◎
            </div>
          </div>

          <form
            onSubmit={(e) => submitValue(e, "goal")}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="number"
              min="0.01"
              max="9999999999.99"
              step="0.01"
              placeholder="Set savings target"
              aria-label="Monthly savings target in taka"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className={input}
              required
            />

            <button
              type="submit"
              disabled={busy || saving !== null}
              className="shrink-0 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-40"
            >
              {saving === "goal" ? "Saving..." : "Save Target"}
            </button>
          </form>

          <div className="mt-7 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Potential Savings</span>
              <span className="font-semibold text-white">
                {busy ? "—" : money(potentialSavings)}
              </span>
            </div>

            <Progress value={busy ? 0 : goalPercent} color="bg-violet-400" />

            <div className="flex justify-between text-xs">
              <span className="text-slate-500">
                {goal === null
                  ? "Set your savings target"
                  : `${goalPercent.toFixed(1)}% of target`}
              </span>

              <span className="text-violet-400">
                {goal === null ? "—" : money(goal)}
              </span>
            </div>

            <p className="text-xs leading-5 text-slate-500">
              Potential savings are estimated from income minus expenses.
              They do not represent money actually transferred into savings.
            </p>
          </div>
        </div>
      </div>

      {/* SMART INSIGHTS */}
      <div className={panel}>
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
            Spending Intelligence
          </p>

          <h3 className="mt-2 text-xl font-bold text-white">
            Smart Financial Insights
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Practical suggestions based on your recorded transactions.
          </p>
        </div>

        {busy ? (
          <p className="py-8 text-center text-sm text-slate-400">
            Analyzing your finances...
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {insights.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="rounded-xl border border-[#2b3b55] bg-[#0b1628] p-5"
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1b2a43] text-lg font-bold ${item.tone}`}>
                    {index + 1}
                  </div>

                  <div>
                    <h4 className={`text-sm font-bold ${item.tone}`}>
                      {item.title}
                    </h4>

                    <p className="mt-2 text-xs leading-6 text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {insights.length === 0 && (
              <p className="text-sm text-slate-400">
                Add transactions to receive financial insights.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
