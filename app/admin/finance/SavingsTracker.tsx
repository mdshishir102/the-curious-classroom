
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type Movement = "deposit" | "withdrawal";

type Saving = {
  id: string;
  movement_type: Movement;
  amount: number | string;
  transaction_date: string;
  note: string | null;
};

type Props = {
  period: string;
};

const money = (value: number) =>
  "৳" +
  new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 2,
  }).format(value);

function dhakaToday() {
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

export default function SavingsTracker({ period }: Props) {
  const [entries, setEntries] = useState<Saving[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [movement, setMovement] = useState<Movement>("deposit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(dhakaToday);

  useEffect(() => {
    let active = true;

    async function loadSavings() {
      setLoading(true);
      setAuthorized(false);
      setError("");

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

        // Load in pages so older savings records are not omitted
        // by Supabase's default response limit.
        const all: Saving[] = [];
        const pageSize = 500;
        let offset = 0;

        while (true) {
          const { data, error: dbError } = await supabase
            .from("personal_finance_savings")
            .select("id, movement_type, amount, transaction_date, note")
            .eq("owner_id", auth.user.id)
            .order("transaction_date", { ascending: false })
            .order("id", { ascending: false })
            .range(offset, offset + pageSize - 1);

          if (dbError) throw dbError;

          const page = (data ?? []) as Saving[];
          all.push(...page);

          if (page.length < pageSize) break;

          offset += pageSize;
        }

        if (!active) return;

        setEntries(all);
        setAuthorized(true);
      } catch (err) {
        if (!active) return;

        setEntries([]);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load savings."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadSavings();

    return () => {
      active = false;
    };
  }, [period, reload]);

  const monthlyEntries = useMemo(
    () =>
      entries.filter((item) =>
        item.transaction_date.startsWith(period)
      ),
    [entries, period]
  );

  const stats = useMemo(() => {
    const sum = (rows: Saving[], type: Movement) =>
      rows
        .filter((row) => row.movement_type === type)
        .reduce((total, row) => total + Number(row.amount), 0);

    const totalDeposits = sum(entries, "deposit");
    const totalWithdrawals = sum(entries, "withdrawal");

    const monthlyDeposits = sum(monthlyEntries, "deposit");
    const monthlyWithdrawals = sum(monthlyEntries, "withdrawal");

    return {
      balance: totalDeposits - totalWithdrawals,
      deposited: monthlyDeposits,
      withdrawn: monthlyWithdrawals,
      monthlyNet: monthlyDeposits - monthlyWithdrawals,
    };
  }, [entries, monthlyEntries]);

  function openForm(type: Movement) {
    setMovement(type);
    setAmount("");
    setNote("");
    setError("");

    const today = dhakaToday();

    setDate(
      today.startsWith(period)
        ? today
        : `${period}-01`
    );

    setFormOpen(true);
  }

  async function saveEntry(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!authorized || saving) return;

    const value = Number(amount);

    if (
      !/^\d+(\.\d{1,2})?$/.test(amount.trim()) ||
      !Number.isFinite(value) ||
      value <= 0 ||
      value >= 10000000000
    ) {
      setError("Enter a valid positive amount with up to 2 decimals.");
      return;
    }

    if (!date || !date.startsWith(period)) {
      setError("Choose a date within the selected reporting month.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const { data: auth, error: authError } =
        await supabase.auth.getUser();

      if (authError || !auth.user) {
        throw new Error("Your login session has expired.");
      }

      const { data, error: dbError } = await supabase
        .from("personal_finance_savings")
        .insert({
          owner_id: auth.user.id,
          movement_type: movement,
          amount: value,
          transaction_date: date,
          note: note.trim() || null,
        })
        .select("id");

      if (dbError) throw dbError;

      if (!data?.length) {
        throw new Error("Savings entry could not be confirmed.");
      }

      setFormOpen(false);
      setMessage("Savings record added successfully.");
      setReload((v) => v + 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save savings record."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(item: Saving) {
    if (
      !window.confirm(
        "Delete this savings record permanently?"
      )
    ) {
      return;
    }

    setError("");

    try {
      const { data: auth, error: authError } =
        await supabase.auth.getUser();

      if (authError || !auth.user) {
        throw new Error("Please login again.");
      }

      const { data, error: dbError } = await supabase
        .from("personal_finance_savings")
        .delete()
        .eq("id", item.id)
        .eq("owner_id", auth.user.id)
        .select("id");

      if (dbError) throw dbError;

      if (!data?.length) {
        throw new Error("Record not deleted. Check your access.");
      }

      setMessage("Savings record deleted.");
      setReload((v) => v + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Delete failed."
      );
    }
  }

  const panel =
    "rounded-2xl border border-[#263550] bg-[#111c30] p-5 sm:p-6";

  const input =
    "w-full rounded-xl border border-[#30415d] bg-[#0a1425] px-4 py-3 text-sm text-white outline-none focus:border-sky-500";

  return (
    <section className="space-y-5">

      {/* SECTION HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
            Wealth Management
          </p>

          <h2 className="text-2xl font-bold">
            My Savings Tracker
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Track money moved into and out of savings.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => openForm("withdrawal")}
            disabled={loading || !authorized}
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/20 disabled:opacity-40"
          >
            − Withdraw
          </button>

          <button
            type="button"
            onClick={() => openForm("deposit")}
            disabled={loading || !authorized}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:opacity-40"
          >
            + Add Savings
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      {message && (
        <div role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {message}
        </div>
      )}

      {/* SAVINGS CARDS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Recorded Savings Balance",
            value: stats.balance,
            color: "text-sky-400",
            symbol: "৳",
          },
          {
            title: "Deposited This Month",
            value: stats.deposited,
            color: "text-emerald-400",
            symbol: "+",
          },
          {
            title: "Withdrawn This Month",
            value: stats.withdrawn,
            color: "text-rose-400",
            symbol: "−",
          },
          {
            title: "Monthly Net Savings",
            value: stats.monthlyNet,
            color: "text-violet-400",
            symbol: "◎",
          },
        ].map((card) => (
          <div key={card.title} className={panel}>
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-[#1b2b44] text-xl font-bold ${card.color}`}>
              {card.symbol}
            </div>

            <p className="mt-5 text-xs font-medium text-slate-400">
              {card.title}
            </p>

            <h3 className={`mt-2 break-words text-2xl font-bold ${card.color}`}>
              {loading ? "—" : money(card.value)}
            </h3>
          </div>
        ))}
      </div>

      {/* EXPLANATION */}
      <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 text-xs leading-6 text-slate-400">
        Savings are separate from income and expenses.
        The recorded balance includes only savings deposits and
        withdrawals entered in this system, not your actual bank
        or bKash balance. You can record existing savings as an
        opening deposit with a note.
      </div>

      {/* HISTORY */}
      <div className="overflow-hidden rounded-2xl border border-[#263550] bg-[#111c30]">
        <div className="border-b border-[#263550] p-5 sm:p-6">
          <h3 className="text-lg font-bold">Savings History</h3>

          <p className="mt-2 text-sm text-slate-400">
            Records for {period}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-[#0c1729] text-slate-400">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Type</th>
                <th className="p-4">Note</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#263550]">
              {monthlyEntries.map((item) => (
                <tr
                  key={item.id}
                  className="transition hover:bg-[#192840]"
                >
                  <td className="p-4 text-slate-300">
                    {item.transaction_date}
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                        item.movement_type === "deposit"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      {item.movement_type === "deposit"
                        ? "Deposit"
                        : "Withdrawal"}
                    </span>
                  </td>

                  <td className="p-4 text-slate-400">
                    {item.note || "—"}
                  </td>

                  <td
                    className={`p-4 text-right font-bold ${
                      item.movement_type === "deposit"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {item.movement_type === "deposit" ? "+" : "−"}
                    {money(Number(item.amount))}
                  </td>

                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => void deleteEntry(item)}
                      className="text-xs font-semibold text-rose-400 hover:text-rose-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && monthlyEntries.length === 0 && (
            <p className="p-8 text-center text-sm text-slate-500">
              No savings records for this month.
            </p>
          )}

          {loading && (
            <p className="p-8 text-center text-sm text-slate-400">
              Loading savings...
            </p>
          )}
        </div>
      </div>

      {/* ADD SAVINGS MODAL */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="savings-form-title"
            className="my-auto w-full max-w-md rounded-2xl border border-[#30415d] bg-[#111c30] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 id="savings-form-title" className="text-xl font-bold">
                {movement === "deposit"
                  ? "Add Savings"
                  : "Withdraw Savings"}
              </h3>

              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="text-xl text-slate-400 hover:text-white"
                aria-label="Close savings form"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveEntry} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm">Amount (৳)</label>
                <input
                  required
                  type="number"
                  min="0.01"
                  max="9999999999.99"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className={input}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm">Date</label>
                <input
                  required
                  type="date"
                  value={date}
                  min={`${period}-01`}
                  max={`${period}-${new Date(
                    Date.UTC(
                      Number(period.slice(0, 4)),
                      Number(period.slice(5, 7)),
                      0
                    )
                  ).getUTCDate()}`}
                  onChange={(e) => setDate(e.target.value)}
                  className={`${input} [color-scheme:dark]`}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm">
                  Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="For example: Transferred to savings account"
                  className={input}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-blue-600 py-3 font-semibold transition hover:bg-blue-500 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : movement === "deposit"
                    ? "Save Deposit"
                    : "Save Withdrawal"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
