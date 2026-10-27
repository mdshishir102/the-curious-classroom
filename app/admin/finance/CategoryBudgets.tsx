
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  period: string;
  categories: [string, number][];
  loading: boolean;
};

type BudgetRecord = {
  category: string;
  budget_amount: number | string;
};

const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Family",
  "Rent",
  "Bills",
  "Education",
  "Medical",
  "Entertainment",
  "Business Expense",
  "Other Expense",
];

const money = (value: number) =>
  "৳" +
  new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 2,
  }).format(value);

export default function CategoryBudgets({
  period,
  categories,
  loading,
}: Props) {
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState("Food");
  const [amount, setAmount] = useState("");

  const [dataLoading, setDataLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [refresh, setRefresh] = useState(0);

  const busy = loading || dataLoading;

  const [year, month] = period.split("-").map(Number);

  const spentByCategory = useMemo(
    () => Object.fromEntries(categories),
    [categories]
  );

  useEffect(() => {
    let active = true;

    async function loadBudgets() {
      setDataLoading(true);
      setAuthorized(false);
      setBudgets({});
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

        const { data, error: dbError } = await supabase
          .from("personal_finance_budgets")
          .select("category, budget_amount")
          .eq("owner_id", auth.user.id)
          .eq("year", year)
          .eq("month", month);

        if (dbError) throw dbError;
        if (!active) return;

        const nextBudgets: Record<string, number> = {};

        ((data ?? []) as BudgetRecord[]).forEach((row) => {
          if (
            row.category !== "All Expenses" &&
            row.category !== "Savings Goal"
          ) {
            nextBudgets[row.category] = Number(row.budget_amount);
          }
        });

        setBudgets(nextBudgets);
        setAuthorized(true);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load budgets."
          );
        }
      } finally {
        if (active) setDataLoading(false);
      }
    }

    void loadBudgets();

    return () => {
      active = false;
    };
  }, [year, month, refresh]);

  const availableCategories = useMemo(
    () =>
      Array.from(
        new Set([
          ...EXPENSE_CATEGORIES,
          ...categories.map(([name]) => name),
          ...Object.keys(budgets),
        ])
      ).filter(
        (name) =>
          name !== "All Expenses" && name !== "Savings Goal"
      ),
    [categories, budgets]
  );

  const visibleCategories = availableCategories
    .filter(
      (name) =>
        Object.prototype.hasOwnProperty.call(budgets, name) ||
        (spentByCategory[name] ?? 0) > 0
    )
    .sort(
      (a, b) =>
        (spentByCategory[b] ?? 0) - (spentByCategory[a] ?? 0)
    );

  function chooseCategory(category: string) {
    setSelectedCategory(category);
    setAmount(
      budgets[category] === undefined
        ? ""
        : String(budgets[category])
    );
  }

  async function saveBudget(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!authorized || saving) return;

    setError("");
    setNotice("");

    const value = Number(amount);

    if (
      !/^\d+(\.\d{1,2})?$/.test(amount.trim()) ||
      !Number.isFinite(value) ||
      value <= 0 ||
      value >= 10000000000
    ) {
      setError("Enter a valid budget amount greater than zero.");
      return;
    }

    if (!availableCategories.includes(selectedCategory)) {
      setError("Please select a valid expense category.");
      return;
    }

    setSaving(true);

    try {
      const { data: auth, error: authError } =
        await supabase.auth.getUser();

      if (authError || !auth.user) {
        throw new Error("Admin session expired.");
      }

      const { data, error: saveError } = await supabase
        .from("personal_finance_budgets")
        .upsert(
          {
            owner_id: auth.user.id,
            year,
            month,
            category: selectedCategory,
            budget_amount: value,
          },
          {
            onConflict: "owner_id,month,year,category",
          }
        )
        .select("category, budget_amount")
        .single();

      if (saveError) throw saveError;

      setBudgets((previous) => ({
        ...previous,
        [data.category]: Number(data.budget_amount),
      }));

      setNotice(`${selectedCategory} budget saved successfully.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save budget."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteBudget(category: string) {
    if (!authorized || deleting) return;

    if (!window.confirm(`Remove the ${category} budget?`)) {
      return;
    }

    setDeleting(category);
    setError("");
    setNotice("");

    try {
      const { data: auth, error: authError } =
        await supabase.auth.getUser();

      if (authError || !auth.user) {
        throw new Error("Admin session expired.");
      }

      const { data, error: deleteError } = await supabase
        .from("personal_finance_budgets")
        .delete()
        .eq("owner_id", auth.user.id)
        .eq("year", year)
        .eq("month", month)
        .eq("category", category)
        .select("id");

      if (deleteError) throw deleteError;

      if (!data?.length) {
        throw new Error("No budget record was deleted.");
      }

      setBudgets((previous) => {
        const updated = { ...previous };
        delete updated[category];
        return updated;
      });

      if (category === selectedCategory) setAmount("");

      setNotice(`${category} budget removed.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete budget."
      );
    } finally {
      setDeleting(null);
    }
  }

  const panel =
    "rounded-2xl border border-[#263550] bg-[#111c30] p-5 sm:p-6";

  const input =
    "w-full rounded-xl border border-[#30415d] bg-[#0a1425] px-4 py-3 text-sm text-white outline-none focus:border-sky-500";

  return (
    <section className="space-y-5">
      {/* HEADER */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
          Expense Control
        </p>

        <h2 className="text-2xl font-bold text-white">
          Category Budget Manager
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Set spending limits for individual expense categories.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300"
        >
          {notice}
        </div>
      )}

      {/* CREATE / UPDATE BUDGET */}
      <div className={panel}>
        <h3 className="text-lg font-bold text-white">
          Set Category Budget
        </h3>

        <p className="mt-2 text-xs text-slate-400">
          Define how much you want to spend in each category per month.
        </p>

        <form
          onSubmit={saveBudget}
          className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <div>
            <label className="mb-2 block text-xs text-slate-400">
              Expense Category
            </label>

            <select
              value={selectedCategory}
              onChange={(e) => chooseCategory(e.target.value)}
              className={input}
            >
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs text-slate-400">
              Monthly Limit (৳)
            </label>

            <input
              type="number"
              min="0.01"
              max="9999999999.99"
              step="0.01"
              required
              placeholder="Enter budget amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={input}
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={busy || !authorized || saving}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-40"
            >
              {saving ? "Saving..." : "Save Category Budget"}
            </button>
          </div>
        </form>
      </div>

      {/* CATEGORY PROGRESS */}
      <div className={panel}>
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white">
            Category Spending Overview
          </h3>

          <p className="mt-2 text-xs text-slate-400">
            Actual spending compared with your category limits.
          </p>
        </div>

        {busy ? (
          <div className="py-10 text-center text-sm text-slate-400">
            Loading category budgets...
          </div>
        ) : visibleCategories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#30415d] p-8 text-center">
            <p className="font-semibold text-white">
              No category budgets yet
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Add a budget or record an expense to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {visibleCategories.map((category) => {
              const spent = spentByCategory[category] ?? 0;

              const limit = budgets[category];

              const hasBudget = limit !== undefined;

              const usage = hasBudget && limit > 0
                ? (spent / limit) * 100
                : 0;

              const overBudget = hasBudget && spent > limit;

              const reachedLimit = hasBudget && spent === limit;

              const warning =
                hasBudget && usage >= 80 && usage < 100;

              const barColor = overBudget || reachedLimit
                ? "bg-rose-400"
                : warning
                  ? "bg-amber-400"
                  : "bg-emerald-400";

              return (
                <div
                  key={category}
                  className="rounded-xl border border-[#2a3a54] bg-[#0b1628] p-5"
                >
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-white">
                        {category}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500">
                        {hasBudget
                          ? `Budget: ${money(limit)}`
                          : "No budget configured"}
                      </p>
                    </div>

                    {hasBudget && (
                      <button
                        type="button"
                        disabled={deleting !== null}
                        onClick={() => void deleteBudget(category)}
                        className="text-xs font-semibold text-rose-400 hover:text-rose-300 disabled:opacity-40"
                      >
                        {deleting === category ? "Removing..." : "Remove"}
                      </button>
                    )}
                  </div>

                  <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500">
                        Amount Spent
                      </p>
                      <p className="mt-1 text-xl font-bold text-white">
                        {money(spent)}
                      </p>
                    </div>

                    <span
                      className={`text-sm font-bold ${
                        overBudget || reachedLimit
                          ? "text-rose-400"
                          : warning
                            ? "text-amber-400"
                            : "text-emerald-400"
                      }`}
                    >
                      {hasBudget
                        ? `${usage.toFixed(1)}%`
                        : "—"}
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-[#263550]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{
                        width: `${Math.min(100, Math.max(0, usage))}%`,
                      }}
                    />
                  </div>

                  <p className="mt-3 text-xs text-slate-400">
                    {!hasBudget
                      ? "Set a limit to enable spending alerts."
                      : overBudget
                        ? `${money(spent - limit)} over budget`
                        : reachedLimit
                          ? "Budget limit reached"
                          : warning
                            ? `Budget warning: only ${money(limit - spent)} left`
                            : `${money(limit - spent)} remaining`}
                  </p>

                  {!hasBudget && (
                    <button
                      type="button"
                      onClick={() => chooseCategory(category)}
                      className="mt-4 text-xs font-semibold text-sky-400 hover:text-sky-300"
                    >
                      Set Budget
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs leading-6 text-slate-500">
        Category limits are tracked independently of the overall monthly
        expense budget. Setting a category limit does not add an expense
        or change your financial balance.
      </p>
    </section>
  );
}
