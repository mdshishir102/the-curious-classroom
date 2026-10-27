
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BudgetInsights from "./BudgetInsights";
import SavingsTracker from "./SavingsTracker";
import CategoryBudgets from "./CategoryBudgets";
import MonthlyTrends from "./MonthlyTrends";
import FinanceReports from "./FinanceReports";
import GoalsGrowth from "./GoalsGrowth";

type EntryType = "income" | "expense";

type Transaction = {
  id: string;
  transaction_type: EntryType;
  amount: number | string;
  category: string;
  payment_method: string;
  description: string | null;
  transaction_date: string;
};


const FINANCE_TABS = [
  { id: "overview", label: "Overview" },
  { id: "transactions", label: "Transactions" },
  { id: "budgets", label: "Budgets" },
  { id: "savings", label: "Savings" },
  { id: "goals", label: "Goals" },
  { id: "analytics", label: "Analytics" },
  { id: "reports", label: "Reports" },
] as const;

type FinanceTab =
  (typeof FINANCE_TABS)[number]["id"];




const incomeCategories = [
  "Teaching",
  "Salary",
  "Freelancing",
  "Business",
  "Other Income",
];

const expenseCategories = [
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

const methods = [
  "Cash",
  "bKash",
  "Nagad",
  "Bank Transfer",
  "Card",
  "Other",
];

const money = (value: number) =>
  "৳" + new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 2,
  }).format(value);

function todayDhaka() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (name: string) =>
    parts.find((p) => p.type === name)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

const emptyForm = (type: EntryType, date: string) => ({
  transaction_type: type,
  amount: "",
  category:
    type === "income" ? incomeCategories[0] : expenseCategories[0],
  payment_method: "Cash",
  description: "",
  transaction_date: date,
});

type FormData = ReturnType<typeof emptyForm>;

export default function PersonalFinancePage() {
  const [period, setPeriod] = useState(() => todayDhaka().slice(0, 7));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [activeTab, setActiveTab] =
  useState<FinanceTab>("overview");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormData>(
    () => emptyForm("expense", todayDhaka())
  );

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setAuthorized(false);
      setError("");

      try {
        const { data: auth, error: authError } =
          await supabase.auth.getUser();

        if (authError || !auth.user) {
          throw new Error("Please login with your admin account.");
        }

        const { data: admin, error: adminError } = await supabase
          .from("admins")
          .select("auth_user_id")
          .eq("auth_user_id", auth.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (adminError) throw adminError;

        if (!admin) {
          throw new Error("Only authorized admins can access this page.");
        }

        const [year, month] = period.split("-").map(Number);

        const start = `${period}-01`;
        const end = new Date(Date.UTC(year, month, 1))
          .toISOString()
          .slice(0, 10);

        const { data, error: dbError } = await supabase
          .from("personal_finance_transactions")
          .select("*")
          .eq("owner_id", auth.user.id)
          .gte("transaction_date", start)
          .lt("transaction_date", end)
          .order("transaction_date", { ascending: false });

        if (dbError) throw dbError;

        if (!active) return;

        setTransactions(data ?? []);
        setAuthorized(true);
      } catch (err) {
        if (!active) return;
        setTransactions([]);
        setError(err instanceof Error ? err.message : "Loading failed.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, [period, refresh]);

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;

    const categories: Record<string, number> = {};

    transactions.forEach((item) => {
      const amount = Number(item.amount) || 0;

      if (item.transaction_type === "income") {
        income += amount;
      } else {
        expense += amount;
        categories[item.category] =
          (categories[item.category] || 0) + amount;
      }
    });

    return {
      income,
      expense,
      balance: income - expense,
      categories: Object.entries(categories).sort(
        (a, b) => b[1] - a[1]
      ),
    };
  }, [transactions]);

  function openForm(type: EntryType, item?: Transaction) {
    if (item) {
      setEditingId(item.id);
      setForm({
        transaction_type: item.transaction_type,
        amount: String(item.amount),
        category: item.category,
        payment_method: item.payment_method,
        description: item.description ?? "",
        transaction_date: item.transaction_date,
      });
    } else {
      setEditingId(null);
      const date = todayDhaka().startsWith(period)
        ? todayDhaka()
        : `${period}-01`;

      setForm(emptyForm(type, date));
    }

    setError("");
    setFormOpen(true);
  }

  async function saveTransaction(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!authorized) return;

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid amount greater than zero.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      transaction_type: form.transaction_type,
      amount,
      category: form.category,
      payment_method: form.payment_method,
      description: form.description.trim() || null,
      transaction_date: form.transaction_date,
    };

    try {
      const result = editingId
        ? await supabase
            .from("personal_finance_transactions")
            .update(payload)
            .eq("id", editingId)
        : await supabase
            .from("personal_finance_transactions")
            .insert(payload);

      if (result.error) throw result.error;

      setFormOpen(false);
      setMessage(
        editingId ? "Transaction updated!" : "Transaction saved!"
      );

      setPeriod(form.transaction_date.slice(0, 7));
      setRefresh((v) => v + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save transaction."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteTransaction(item: Transaction) {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    const { error: deleteError } = await supabase
      .from("personal_finance_transactions")
      .delete()
      .eq("id", item.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setMessage("Transaction deleted!");
    setRefresh((v) => v + 1);
  }

  const inputClass =
    "w-full rounded-xl border border-[#30415d] bg-[#0a1425] px-4 py-3 text-sm text-white outline-none focus:border-blue-500";

  return (
    <main className="min-h-screen bg-[#080f1d] px-5 py-8 text-white md:px-10">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/admin/dashboard"
              className="text-sm text-sky-400 hover:text-sky-300"
            >
              ← Back to Admin Dashboard
            </Link>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
              THE CURIOUS CLASSROOM
            </p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Personal <span className="text-sky-400">Finance</span>
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              Manage your income, expenses and financial activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              disabled={!authorized || loading}
              onClick={() => openForm("income")}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40"
            >
              + Add Income
            </button>

            <button
              disabled={!authorized || loading}
              onClick={() => openForm("expense")}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500 disabled:opacity-40"
            >
              + Add Expense
            </button>
          </div>
        </div>

        {/* FILTER */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#263550] bg-[#111c30] p-5">
          <div>
            <h2 className="font-semibold">Financial Overview</h2>
            <p className="mt-1 text-xs text-slate-400">
              Select your reporting month
            </p>
          </div>

          <div className="flex gap-3">
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-xl border border-[#30415d] bg-[#0a1425] px-4 py-3 text-sm text-white [color-scheme:dark]"
            />

            <button
              onClick={() => setRefresh((v) => v + 1)}
              disabled={loading}
              className="rounded-xl border border-[#30415d] px-4 py-3 text-sm hover:bg-[#1c2c46] disabled:opacity-40"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div role="status" className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-sky-300">
            {message}
          </div>
        )}



{/* PREMIUM FINANCE NAVIGATION */}

<div className="rounded-2xl border border-[#263550] bg-[#111c30] p-2 shadow-xl shadow-black/10">

  <nav
    aria-label="Personal finance sections"
    className="flex gap-2 overflow-x-auto"
  >
    {FINANCE_TABS.map((tab) => {
      const selected = activeTab === tab.id;

      return (
        <button
          key={tab.id}
          type="button"
          aria-pressed={selected}
          onClick={() => setActiveTab(tab.id)}
          className={`
            flex shrink-0 items-center justify-center
            gap-2 rounded-xl px-5 py-3
            text-sm font-semibold
            transition-all duration-200
            ${
              selected
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-slate-400 hover:bg-[#1c2c46] hover:text-white"
            }
          `}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              selected ? "bg-white" : "bg-slate-600"
            }`}
          />

          {tab.label}
        </button>
      );
    })}
  </nav>
</div>





        {/* SUMMARY CARDS */}



<div
  className={
    activeTab === "overview"
      ? "grid grid-cols-1 gap-5 md:grid-cols-3"
      : "hidden"
  }
>



          {[
            {
              title: "Monthly Income",
              value: stats.income,
              color: "text-emerald-400",
              label: "↑",
              note: "Total money received",
            },
            {
              title: "Monthly Expenses",
              value: stats.expense,
              color: "text-rose-400",
              label: "↓",
              note: "Total money spent",
            },
            {
              title: "Net Cash Flow",
              value: stats.balance,
              color: "text-sky-400",
              label: "৳",
              note: "Income minus expenses",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-[#263550] bg-[#111c30] p-6 transition hover:-translate-y-1 hover:border-sky-500/30"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a2942] text-2xl font-bold ${card.color}`}>
                {card.label}
              </div>

              <p className="mt-6 text-sm text-slate-400">{card.title}</p>

              <h2 className={`mt-2 text-3xl font-bold ${card.color}`}>
                {loading ? "—" : money(card.value)}
              </h2>

              <p className="mt-3 text-xs text-slate-500">{card.note}</p>
            </div>
          ))}
        </div>






{/* BUDGET TAB */}

{activeTab === "budgets" && (
  <div className="space-y-8">
    <BudgetInsights
      period={period}
      income={stats.income}
      expense={stats.expense}
      categories={stats.categories}
      loading={loading}
    />

    <CategoryBudgets
      period={period}
      categories={stats.categories}
      loading={loading}
    />
  </div>
)}

{/* SAVINGS TAB */}

{activeTab === "savings" && (
  <SavingsTracker period={period} />
)}


{/* GOALS TAB */}

{activeTab === "goals" && (
  <GoalsGrowth
    period={period}
    income={stats.income}
    expense={stats.expense}
  />
)}




{/* ANALYTICS TAB */}

{activeTab === "analytics" && (
  <MonthlyTrends
    period={period}
    refreshKey={refresh}
  />
)}

{/* REPORTS TAB */}

{activeTab === "reports" && (
  <FinanceReports
    period={period}
    refreshKey={refresh}
  />
)}






        {/* CATEGORY ANALYTICS */}
<section
  hidden={activeTab !== "overview"}
  className="rounded-2xl border border-[#263550] bg-[#111c30] p-6"
>          <h2 className="text-xl font-bold">Expense Breakdown</h2>
          <p className="mt-2 text-sm text-slate-400">
            Where your money is going this month
          </p>

          <div className="mt-7 space-y-6">
            {!loading && stats.categories.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">
                No expenses recorded this month.
              </p>
            )}

            {stats.categories.map(([category, amount]) => {
              const percent =
                stats.expense > 0
                  ? (amount / stats.expense) * 100
                  : 0;

              return (
                <div key={category}>
                  <div className="mb-3 flex justify-between gap-3 text-sm">
                    <span className="text-slate-300">{category}</span>
                    <span className="font-semibold">
                      {money(amount)} · {percent.toFixed(1)}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#263550]">
                    <div
                      className="h-full rounded-full bg-sky-400"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* TRANSACTIONS */}
<section
  hidden={activeTab !== "transactions"}
  className="overflow-hidden rounded-2xl border border-[#263550] bg-[#111c30]"
>          <div className="border-b border-[#263550] p-6">
            <h2 className="text-xl font-bold">Transaction History</h2>
            <p className="mt-2 text-sm text-slate-400">
              All recorded income and expenses for this month
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-[#0c1729] text-slate-400">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Method</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#263550]">
                {transactions.map((item) => (
                  <tr key={item.id} className="hover:bg-[#18263d]">
                    <td className="p-4 text-slate-300">
                      {item.transaction_date}
                    </td>

                    <td className="p-4">
                      <p className="font-semibold">{item.category}</p>
                      {item.description && (
                        <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                          {item.description}
                        </p>
                      )}
                    </td>

                    <td className="p-4 text-slate-400">
                      {item.payment_method}
                    </td>

                    <td className={`p-4 text-right font-bold ${
                      item.transaction_type === "income"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}>
                      {item.transaction_type === "income" ? "+" : "−"}
                      {money(Number(item.amount))}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => openForm(item.transaction_type, item)}
                        className="mr-3 text-sky-400 hover:text-sky-300"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => void deleteTransaction(item)}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loading && (
              <p className="p-8 text-center text-sm text-slate-400">
                Loading transactions...
              </p>
            )}

            {!loading && transactions.length === 0 && (
              <p className="p-8 text-center text-sm text-slate-500">
                No transactions found for this month.
              </p>
            )}
          </div>
        </section>

        {/* TRANSACTION FORM MODAL */}
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="finance-form-title"
              className="my-auto w-full max-w-lg rounded-2xl border border-[#30415d] bg-[#111c30] p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 id="finance-form-title" className="text-xl font-bold">
                  {editingId ? "Edit Transaction" : "Add Transaction"}
                </h2>

                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="text-xl text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={saveTransaction} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm">Type</label>
                  <select
                    value={form.transaction_type}
                    onChange={(e) => {
                      const type = e.target.value as EntryType;
                      setForm({
                        ...form,
                        transaction_type: type,
                        category:
                          type === "income"
                            ? incomeCategories[0]
                            : expenseCategories[0],
                      });
                    }}
                    className={inputClass}
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm">Amount (৳)</label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    className={inputClass}
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className={inputClass}
                  >
                    {(form.transaction_type === "income"
                      ? incomeCategories
                      : expenseCategories
                    ).map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm">Payment Method</label>
                  <select
                    value={form.payment_method}
                    onChange={(e) =>
                      setForm({ ...form, payment_method: e.target.value })
                    }
                    className={inputClass}
                  >
                    {methods.map((method) => (
                      <option key={method}>{method}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm">Date</label>
                  <input
                    required
                    type="date"
                    value={form.transaction_date}
                    onChange={(e) =>
                      setForm({ ...form, transaction_date: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm">Notes</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className={inputClass}
                    placeholder="Optional description"
                  />
                </div>

                {error && (
                  <p role="alert" className="text-sm text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-blue-600 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Transaction"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
