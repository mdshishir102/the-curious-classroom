"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type Props = { period: string; income: number; expense: number };

type Goal = {
  id: string;
  title: string;
  target_amount: number | string;
  saved_amount: number | string;
  monthly_plan: number | string;
};

type Source = {
  id: string;
  name: string;
  monthly_amount: number | string;
};

type Fixed = {
  id: string;
  name: string;
  monthly_amount: number | string;
};

const money = (v: number) =>
  "৳" + new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(v);

const SAVE_RATE = 0.2;

const inputCls =
  "w-full rounded-xl border border-[#30415d] bg-[#0a1425] px-4 py-3 text-sm text-white outline-none focus:border-sky-500";
const panel = "rounded-2xl border border-[#263550] bg-[#111c30] p-5 sm:p-6";

const SOURCE_SUGGEST = [
  "ক্লাস ৯ ব্যাচ ফি",
  "ক্লাস ১০ ব্যাচ ফি",
  "ক্লাস ১১ ব্যাচ ফি",
  "ক্লাস ১২ ব্যাচ ফি",
];

const FIXED_SUGGEST = ["রুম ভাড়া", "ম্যানেজার বিল", "বিদ্যুৎ বিল", "ইন্টারনেট", "মোবাইল রিচার্জ"];

const GOAL_SUGGEST = ["স্মার্টবোর্ড", "পিসি / ল্যাপটপ", "ফ্ল্যাট", "জায়গা / জমি"];

const DAILY_ACTIONS = [
  "আজকের সব খরচ লিখে রাখুন (১০ সেকেন্ড লাগে)",
  "২ জন অভিভাবককে ফোন করে ছাত্রের অগ্রগতি জানান",
  "পুরোনো ৩ জন ছাত্রের কাছে নতুন ছাত্রের রেফারেল চান",
  "ফেসবুকে ১টি বায়োলজি টিপ পোস্ট করুন (বিনা খরচে নতুন ছাত্র আনে)",
  "AI Question Generator দিয়ে একটি প্রশ্নসেট বানিয়ে বিক্রির জন্য রাখুন",
  "বকেয়া ফি আছে এমন ছাত্রদের রিমাইন্ডার পাঠান",
  "শখের কিছু কিনতে মন চাইলে ৪৮ ঘণ্টা অপেক্ষা করুন",
  "আজ সঞ্চয়ে সামান্য হলেও কিছু জমান",
  "নতুন ব্যাচ বা বিষয়ের পরিকল্পনা লিখুন (কোন ক্লাসে চাহিদা বেশি?)",
  "একটি রেকর্ডেড কোর্সের রূপরেখা লিখুন (একবার বানালে বারবার বিক্রি হয়)",
];

const GROWTH_IDEAS = [
  {
    title: "ছাত্র সংখ্যা বাড়ান",
    body: "প্রতিটি নতুন ছাত্র মানেই প্রতি মাসে নতুন ফি। যে ব্যাচে ফি বেশি, সেখানে ছাত্র বাড়ালে আয় সবচেয়ে দ্রুত বাড়বে।",
  },
  {
    title: "একই ছাত্রকে দ্বিতীয় বিষয় দিন",
    body: "নতুন ছাত্র না এনেও আয় বাড়ে, যদি বর্তমান ছাত্ররা আরেকটি বিষয় (রসায়ন/ICT) আপনার কাছে পড়ে।",
  },
  {
    title: "ডিজিটাল পণ্য বানান",
    body: "নোটস, মার্কড বুক, AI দিয়ে বানানো প্রশ্নব্যাংক PDF। একবার বানালে বারবার বিক্রি করা যায়।",
  },
  {
    title: "রেকর্ডেড বা অনলাইন কোর্স",
    body: "আপনার ব্যাচের বাইরের ছাত্ররাও কিনতে পারবে। একবার রেকর্ড করলে অনেকের কাছে বিক্রি হয়।",
  },
  {
    title: "ফি আদায় ঠিক রাখুন",
    body: "বকেয়া ফি তুলতে পারলেই অনেক টাকা আসে, নতুন কিছু না করেও।",
  },
  {
    title: "রেফারেল ছাড়",
    body: "একজন ছাত্র আরেকজনকে আনলে ১ মাসের ছাড়। এটাই সবচেয়ে সস্তা বিজ্ঞাপন।",
  },
];

export default function GoalsGrowth({ period, income, expense }: Props) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [fixed, setFixed] = useState<Fixed[]>([]);
  const [cash, setCash] = useState("");
  const [bkash, setBkash] = useState("");
  const [other, setOther] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [gTitle, setGTitle] = useState("");
  const [gTarget, setGTarget] = useState("");
  const [gMonthly, setGMonthly] = useState("");

  const [sName, setSName] = useState("");
  const [sAmount, setSAmount] = useState("");

  const [fName, setFName] = useState("");
  const [fAmount, setFAmount] = useState("");

  const [multiplier, setMultiplier] = useState(2);

  const todayKey = new Date().toISOString().slice(0, 10);
  const [done, setDone] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fin-actions-" + todayKey);
      setDone(raw ? JSON.parse(raw) : {});
    } catch {
      setDone({});
    }
  }, [todayKey]);

  function toggleAction(i: number) {
    const next = { ...done, [i]: !done[i] };
    setDone(next);
    try {
      localStorage.setItem("fin-actions-" + todayKey, JSON.stringify(next));
    } catch {}
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const [g, s, f, b] = await Promise.all([
      supabase.from("personal_finance_goals").select("*").order("created_at"),
      supabase.from("personal_finance_income_sources").select("*").order("created_at"),
      supabase.from("personal_finance_fixed_costs").select("*").order("created_at"),
      supabase.from("personal_finance_balances").select("*").maybeSingle(),
    ]);

    const firstError = g.error || s.error || f.error || b.error;
    if (firstError) {
      setError(firstError.message);
    } else {
      setGoals((g.data ?? []) as Goal[]);
      setSources((s.data ?? []) as Source[]);
      setFixed((f.data ?? []) as Fixed[]);
      if (b.data) {
        setCash(String(b.data.cash ?? 0));
        setBkash(String(b.data.bkash ?? 0));
        setOther(String(b.data.other ?? 0));
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // ---------- বর্তমান টাকা সংরক্ষণ ----------
  async function saveBalance(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");

    const c = Number(cash) || 0;
    const b = Number(bkash) || 0;
    const o = Number(other) || 0;

    if (c < 0 || b < 0 || o < 0) return setError("টাকার পরিমাণ ঋণাত্মক হতে পারবে না।");

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return setError("আবার লগইন করুন।");

    const { error: err } = await supabase.from("personal_finance_balances").upsert(
      {
        owner_id: auth.user.id,
        cash: c,
        bkash: b,
        other: o,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "owner_id" }
    );

    if (err) return setError(err.message);
    setNotice("বর্তমান টাকার তথ্য সংরক্ষণ হয়েছে।");
    void load();
  }

  // ---------- নির্দিষ্ট খরচ ----------
  async function addFixed(e: FormEvent) {
    e.preventDefault();
    setError("");
    const amt = Number(fAmount);
    if (!fName.trim() || !(amt >= 0) || fAmount === "")
      return setError("খরচের নাম ও টাকার পরিমাণ দিন।");

    const { error: err } = await supabase
      .from("personal_finance_fixed_costs")
      .insert({ name: fName.trim(), monthly_amount: amt });

    if (err) return setError(err.message);
    setFName("");
    setFAmount("");
    void load();
  }

  async function deleteFixed(item: Fixed) {
    if (!window.confirm(`"${item.name}" মুছে ফেলবেন?`)) return;
    await supabase.from("personal_finance_fixed_costs").delete().eq("id", item.id);
    void load();
  }

  // ---------- আয়ের উৎস ----------
  async function addSource(e: FormEvent) {
    e.preventDefault();
    setError("");
    const amt = Number(sAmount);
    if (!sName.trim() || !(amt >= 0) || sAmount === "")
      return setError("উৎসের নাম ও মাসিক আয় দিন।");

    const { error: err } = await supabase
      .from("personal_finance_income_sources")
      .insert({ name: sName.trim(), monthly_amount: amt });

    if (err) return setError(err.message);
    setSName("");
    setSAmount("");
    void load();
  }

  async function deleteSource(s: Source) {
    if (!window.confirm(`"${s.name}" মুছে ফেলবেন?`)) return;
    await supabase.from("personal_finance_income_sources").delete().eq("id", s.id);
    void load();
  }

  // ---------- স্বপ্ন ----------
  async function addGoal(e: FormEvent) {
    e.preventDefault();
    setError("");
    const target = Number(gTarget);
    if (!gTitle.trim() || !(target > 0)) return setError("স্বপ্নের নাম ও মোট দাম দিন।");

    const { error: err } = await supabase.from("personal_finance_goals").insert({
      title: gTitle.trim(),
      target_amount: target,
      monthly_plan: Number(gMonthly) || 0,
    });

    if (err) return setError(err.message);
    setGTitle("");
    setGTarget("");
    setGMonthly("");
    void load();
  }

  async function addToGoal(g: Goal) {
    const v = Number(window.prompt(`"${g.title}"-এর জন্য কত টাকা জমা দিলেন?`));
    if (!(v > 0)) return;

    const { error: err } = await supabase
      .from("personal_finance_goals")
      .update({ saved_amount: Number(g.saved_amount) + v })
      .eq("id", g.id);

    if (err) return setError(err.message);
    void load();
  }

  async function deleteGoal(g: Goal) {
    if (!window.confirm(`"${g.title}" মুছে ফেলবেন?`)) return;
    await supabase.from("personal_finance_goals").delete().eq("id", g.id);
    void load();
  }

  // ---------- হিসাব ----------
  const calc = useMemo(() => {
    const totalCash = (Number(cash) || 0) + (Number(bkash) || 0) + (Number(other) || 0);
    const fixedTotal = fixed.reduce((t, x) => t + Number(x.monthly_amount), 0);
    const sourceTotal = sources.reduce((t, x) => t + Number(x.monthly_amount), 0);

    // আয়: আয়ের উৎসের যোগফল থাকলে সেটা, না থাকলে এই মাসের লেখা আয়
    const monthlyIncome = sourceTotal > 0 ? sourceTotal : income;

    const saveAmount = monthlyIncome * SAVE_RATE;
    const afterFixed = monthlyIncome - fixedTotal;
    const freeMoney = afterFixed - saveAmount; // সঞ্চয় ও নির্দিষ্ট খরচের পর হাতে যা থাকে

    const [y, m] = period.split("-").map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const now = new Date();
    const isCurrent = now.getFullYear() === y && now.getMonth() + 1 === m;
    const daysLeft = isCurrent ? daysInMonth - now.getDate() + 1 : daysInMonth;

    // এই মাসে ইতিমধ্যে যা খরচ হয়েছে তার মধ্যে নির্দিষ্ট খরচ আলাদা করা যায় না,
    // তাই এই মাসের মোট লেখা খরচ ধরেই বাকি হিসাব করছি
    const variableBudget = Math.max(0, freeMoney);
    const leftToSpend = variableBudget - Math.max(0, expense - (isCurrent ? 0 : 0));
    const perDay = daysLeft > 0 ? Math.max(0, leftToSpend / daysLeft) : 0;

    // খরচ ৫০/৩০/২০ এর তুলনায় কেমন
    const fixedShare = monthlyIncome > 0 ? (fixedTotal / monthlyIncome) * 100 : 0;

    // বর্তমান টাকা দিয়ে কত মাস চলবে (শুধু নির্দিষ্ট খরচ ধরে)
    const runwayMonths = fixedTotal > 0 ? totalCash / fixedTotal : null;

    return {
      totalCash,
      fixedTotal,
      sourceTotal,
      monthlyIncome,
      saveAmount,
      freeMoney,
      leftToSpend,
      perDay,
      daysLeft,
      fixedShare,
      runwayMonths,
    };
  }, [cash, bkash, other, fixed, sources, income, expense, period]);

  const totalMonthlyPlan = goals.reduce((t, g) => t + Number(g.monthly_plan), 0);

  // স্বপ্নগুলো একে একে (প্রথমটা আগে) পূরণ করলে কত মাস লাগবে
  const goalPlan = useMemo(() => {
    const monthlySave = Math.max(0, calc.saveAmount);
    let elapsed = 0;
    return goals.map((g) => {
      const left = Math.max(0, Number(g.target_amount) - Number(g.saved_amount));
      const months = monthlySave > 0 ? Math.ceil(left / monthlySave) : null;
      const start = elapsed;
      if (months !== null) elapsed += months;
      return { id: g.id, left, months, finishAfter: months === null ? null : start + months };
    });
  }, [goals, calc.saveAmount]);

  const sourceTotal = calc.sourceTotal;
  const baseIncome = calc.monthlyIncome;
  const targetIncome = baseIncome * multiplier;
  const gap = Math.max(0, targetIncome - baseIncome);

  // ---------- ব্যক্তিগত পরামর্শ ----------
  const advice: { title: string; text: string; tone: string }[] = [];

  if (!loading) {
    if (calc.totalCash === 0) {
      advice.push({
        title: "আগে বর্তমান টাকা লিখুন",
        text: "ক্যাশ ও বিকাশে এখন কত আছে সেটা উপরের ঘরে লিখে সংরক্ষণ করুন। এটা ছাড়া সঠিক পরামর্শ দেওয়া সম্ভব না।",
        tone: "text-sky-400",
      });
    }

    if (calc.monthlyIncome === 0) {
      advice.push({
        title: "আয়ের উৎস যোগ করুন",
        text: "ক্লাস ৯, ১০, ১১, ১২ ব্যাচ থেকে মাসে কত টাকা আসে সেটা লিখুন। তাহলে আমি হিসাব করে দেখাতে পারব।",
        tone: "text-sky-400",
      });
    } else {
      if (calc.fixedTotal > calc.monthlyIncome) {
        advice.push({
          title: "সতর্কতা: নির্দিষ্ট খরচ আয়ের চেয়ে বেশি",
          text: `আপনার মাসিক নির্দিষ্ট খরচ ${money(calc.fixedTotal)}, কিন্তু আয় ${money(calc.monthlyIncome)}। এভাবে চললে জমানো টাকা ধীরে ধীরে শেষ হবে। এখন সবচেয়ে জরুরি কাজ আয় বাড়ানো বা কোনো নির্দিষ্ট খরচ কমানো।`,
          tone: "text-rose-400",
        });
      } else if (calc.fixedShare > 60) {
        advice.push({
          title: "নির্দিষ্ট খরচ আয়ের বড় অংশ খেয়ে নিচ্ছে",
          text: `আয়ের ${calc.fixedShare.toFixed(0)}% চলে যাচ্ছে রুম ভাড়া ও বিলে। সাধারণ নিয়মে এটা ৫০%-এর মধ্যে থাকলে ভালো। তাই শখের খরচ কমান এবং আয় বাড়ানোয় জোর দিন।`,
          tone: "text-amber-400",
        });
      } else {
        advice.push({
          title: "নির্দিষ্ট খরচ নিয়ন্ত্রণে আছে",
          text: `আয়ের ${calc.fixedShare.toFixed(0)}% যাচ্ছে নির্দিষ্ট খরচে। এটা ভালো অবস্থা।`,
          tone: "text-emerald-400",
        });
      }

      advice.push({
        title: "আয় আসার দিনই সঞ্চয় আলাদা করুন",
        text: `আয়ের ${SAVE_RATE * 100}% মানে মাসে ${money(calc.saveAmount)} ফি আসার দিনই বিকাশ সঞ্চয়/ব্যাংক/DPS-এ সরিয়ে ফেলুন। হাতে থাকলে খরচ হয়ে যাবে।`,
        tone: "text-violet-400",
      });
    }

    if (calc.runwayMonths !== null && calc.totalCash > 0) {
      advice.push({
        title: "জরুরি তহবিল",
        text: `আপনার বর্তমান ${money(calc.totalCash)} দিয়ে শুধু নির্দিষ্ট খরচ ধরে প্রায় ${calc.runwayMonths.toFixed(1)} মাস চলবে। লক্ষ্য রাখুন অন্তত ৩ মাসের নির্দিষ্ট খরচ (${money(calc.fixedTotal * 3)}) জরুরি অবস্থার জন্য আলাদা রাখার।${
          calc.runwayMonths < 3 ? " আপনি এখনো এর নিচে আছেন, তাই বড় স্বপ্নের আগে এটাই প্রথম লক্ষ্য।" : ""
        }`,
        tone: calc.runwayMonths < 3 ? "text-amber-400" : "text-emerald-400",
      });
    }

    if (goals.length > 0 && calc.saveAmount > 0) {
      const first = goals[0];
      const p = goalPlan[0];
      if (p && p.months !== null) {
        advice.push({
          title: `প্রথম লক্ষ্য: ${first.title}`,
          text: `মাসে ${money(calc.saveAmount)} জমালে "${first.title}" হবে প্রায় ${p.months} মাসে। ছোট স্বপ্ন আগে পূরণ করুন, তাহলে অনুপ্রেরণা থাকে। ফ্ল্যাট বা জমির মতো বড় লক্ষ্যে আয় না বাড়ালে অনেক বছর লাগবে।`,
          tone: "text-sky-400",
        });
      }
    }

    if (sources.length > 1) {
      const top = [...sources].sort((a, b) => Number(b.monthly_amount) - Number(a.monthly_amount))[0];
      const share = sourceTotal > 0 ? (Number(top.monthly_amount) / sourceTotal) * 100 : 0;
      if (share > 50) {
        advice.push({
          title: "একটি ব্যাচের ওপর নির্ভরতা বেশি",
          text: `"${top.name}" থেকে আপনার আয়ের ${share.toFixed(0)}% আসছে। ওই ব্যাচে সমস্যা হলে আয় অনেক কমে যাবে। অন্য ব্যাচ বা ডিজিটাল পণ্য দিয়ে ঝুঁকি ভাগ করুন।`,
          tone: "text-amber-400",
        });
      }
    }
  }



  // ---------- পরামর্শের জন্য কপি ----------
  const [copied, setCopied] = useState(false);

  async function copySummary() {
    const lines = [
      "আমার আর্থিক অবস্থা (পরামর্শের জন্য):",
      "",
      `মাস: ${period}`,
      "",
      "== এখন হাতে আছে ==",
      `ক্যাশ: ${money(Number(cash) || 0)}`,
      `বিকাশ: ${money(Number(bkash) || 0)}`,
      `অন্যান্য: ${money(Number(other) || 0)}`,
      `মোট: ${money(calc.totalCash)}`,
      "",
      "== মাসিক নির্দিষ্ট খরচ ==",
      ...(fixed.length
        ? fixed.map((f) => `${f.name}: ${money(Number(f.monthly_amount))}`)
        : ["(কিছু যোগ করা হয়নি)"]),
      `মোট নির্দিষ্ট খরচ: ${money(calc.fixedTotal)}`,
      "",
      "== আয়ের উৎস (মাসিক) ==",
      ...(sources.length
        ? sources.map((s) => `${s.name}: ${money(Number(s.monthly_amount))}`)
        : ["(কিছু যোগ করা হয়নি)"]),
      `মোট মাসিক আয়: ${money(calc.monthlyIncome)}`,
      "",
      "== এই মাসের Transactions ==",
      `লেখা আয়: ${money(income)}`,
      `লেখা দৈনন্দিন খরচ: ${money(expense)}`,
      "",
      "== আমার স্বপ্ন ==",
      ...(goals.length
        ? goals.map(
            (g) =>
              `${g.title}: দাম ${money(Number(g.target_amount))}, জমেছে ${money(
                Number(g.saved_amount)
              )}, মাসে জমাতে চাই ${money(Number(g.monthly_plan))}`
          )
        : ["(কিছু যোগ করা হয়নি)"]),
      "",
      "== সিস্টেমের হিসাব ==",
      `২০% সঞ্চয়: ${money(calc.saveAmount)}`,
      `আজ নিরাপদে খরচ: ${money(calc.perDay)}`,
      "",
      "আমার সমস্যা/প্রশ্ন: ",
    ];

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3000);
    } catch {
      setError("কপি করা যায়নি। ব্রাউজারের অনুমতি দেখুন।");
    }
  }






  const dayIndex = Math.floor(new Date().getTime() / 86400000);
  const todays = [0, 1, 2].map((k) => (dayIndex * 3 + k) % DAILY_ACTIONS.length);

  return (
    <section className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
          স্বপ্ন ও প্রবৃদ্ধি
        </p>
        <h2 className="text-2xl font-bold text-white">আমার আর্থিক পরিকল্পনা</h2>
        <p className="mt-2 text-sm text-slate-400">
          হাতের টাকা, নির্দিষ্ট খরচ ও আয়ের উৎস লিখুন। বাকি হিসাব ও পরামর্শ সিস্টেম দেবে।
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

      {/* ধাপ ১: বর্তমান টাকা */}
      <div className={panel}>
        <h3 className="text-lg font-bold text-white">১. এখন আমার কাছে কত টাকা আছে?</h3>
        <p className="mt-1 text-xs text-slate-400">ক্যাশ, বিকাশ ও অন্য জায়গায় (ব্যাংক/নগদ) যা আছে লিখুন।</p>

        <form onSubmit={saveBalance} className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-xs text-slate-400">ক্যাশ (৳)</label>
            <input type="number" min="0" value={cash} onChange={(e) => setCash(e.target.value)} placeholder="০" className={inputCls} />
          </div>
          <div>
            <label className="mb-2 block text-xs text-slate-400">বিকাশ (৳)</label>
            <input type="number" min="0" value={bkash} onChange={(e) => setBkash(e.target.value)} placeholder="০" className={inputCls} />
          </div>
          <div>
            <label className="mb-2 block text-xs text-slate-400">অন্যান্য (ব্যাংক/নগদ) (৳)</label>
            <input type="number" min="0" value={other} onChange={(e) => setOther(e.target.value)} placeholder="০" className={inputCls} />
          </div>
          <div className="flex items-end">
            <button className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500">
              সংরক্ষণ করুন
            </button>
          </div>
        </form>

        <p className="mt-4 text-sm text-slate-300">
          মোট হাতে আছে: <b className="text-sky-400">{money(calc.totalCash)}</b>
        </p>
      </div>

      {/* ধাপ ২: নির্দিষ্ট খরচ */}
      <div className={panel}>
        <h3 className="text-lg font-bold text-white">২. প্রতি মাসের নির্দিষ্ট খরচ</h3>
        <p className="mt-1 text-xs text-slate-400">রুম ভাড়া, ম্যানেজার বিল, ইন্টারনেট ইত্যাদি যা প্রতি মাসে দিতেই হয়।</p>

        <form onSubmit={addFixed} className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="খরচের নাম (যেমন: রুম ভাড়া)" list="fixed-suggest" className={inputCls} />
          <datalist id="fixed-suggest">
            {FIXED_SUGGEST.map((x) => (
              <option key={x} value={x} />
            ))}
          </datalist>
          <input type="number" min="0" value={fAmount} onChange={(e) => setFAmount(e.target.value)} placeholder="মাসে কত টাকা (৳)" className={inputCls} />
          <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500">+ খরচ যোগ করুন</button>
        </form>

        <div className="mt-5 space-y-2">
          {fixed.map((f) => (
            <div key={f.id} className="flex items-center justify-between rounded-xl border border-[#2a3a54] bg-[#0b1628] px-4 py-3 text-sm">
              <span className="text-white">{f.name}</span>
              <span className="flex items-center gap-4">
                <span className="font-semibold text-rose-400">{money(Number(f.monthly_amount))}</span>
                <button onClick={() => void deleteFixed(f)} className="text-xs text-rose-400" aria-label="মুছুন">✕</button>
              </span>
            </div>
          ))}
          {!loading && fixed.length === 0 && <p className="text-sm text-slate-500">এখনো কোনো নির্দিষ্ট খরচ যোগ করেননি।</p>}
        </div>

        <p className="mt-4 text-sm text-slate-300">
          মাসে মোট নির্দিষ্ট খরচ: <b className="text-rose-400">{money(calc.fixedTotal)}</b>
        </p>
      </div>

      {/* ধাপ ৩: আয়ের উৎস */}
      <div className={panel}>
        <h3 className="text-lg font-bold text-white">৩. আমার আয়ের উৎস</h3>
        <p className="mt-1 text-xs text-slate-400">প্রতিটি ব্যাচ থেকে মাসে মোট কত টাকা আসে লিখুন।</p>

        <form onSubmit={addSource} className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <input value={sName} onChange={(e) => setSName(e.target.value)} placeholder="উৎসের নাম (যেমন: ক্লাস ১০ ব্যাচ ফি)" list="source-suggest" className={inputCls} />
          <datalist id="source-suggest">
            {SOURCE_SUGGEST.map((x) => (
              <option key={x} value={x} />
            ))}
          </datalist>
          <input type="number" min="0" value={sAmount} onChange={(e) => setSAmount(e.target.value)} placeholder="মাসে কত আসে (৳)" className={inputCls} />
          <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500">+ উৎস যোগ করুন</button>
        </form>

        <div className="mt-5 space-y-2">
          {sources.map((s) => {
            const share = sourceTotal > 0 ? (Number(s.monthly_amount) / sourceTotal) * 100 : 0;
            return (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-[#2a3a54] bg-[#0b1628] px-4 py-3 text-sm">
                <span className="text-white">{s.name}</span>
                <span className="flex items-center gap-4">
                  <span className="text-slate-400">{share.toFixed(0)}%</span>
                  <span className="font-semibold text-emerald-400">{money(Number(s.monthly_amount))}</span>
                  <button onClick={() => void deleteSource(s)} className="text-xs text-rose-400" aria-label="মুছুন">✕</button>
                </span>
              </div>
            );
          })}
          {!loading && sources.length === 0 && <p className="text-sm text-slate-500">এখনো কোনো আয়ের উৎস যোগ করেননি।</p>}
        </div>

        <p className="mt-4 text-sm text-slate-300">
          মাসে মোট আয়: <b className="text-emerald-400">{money(sourceTotal)}</b>
        </p>
      </div>

      {/* ধাপ ৪: আজ কত খরচ করা যাবে */}
      <div className={`${panel} border-sky-500/30`}>
        <p className="text-sm text-slate-400">আজ আপনি নিরাপদে খরচ করতে পারেন</p>
        <h3 className={`mt-2 text-5xl font-bold ${calc.perDay > 0 ? "text-sky-400" : "text-rose-400"}`}>
          {money(calc.perDay)}
        </h3>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["মাসিক আয়", calc.monthlyIncome, "text-emerald-400"],
            ["নির্দিষ্ট খরচ", calc.fixedTotal, "text-rose-400"],
            [`সঞ্চয় (${SAVE_RATE * 100}%)`, calc.saveAmount, "text-violet-400"],
            ["চলতি খরচের জন্য বাকি", Math.max(0, calc.freeMoney), "text-sky-400"],
          ].map(([label, val, color]) => (
            <div key={label as string} className="rounded-xl border border-[#2a3a54] bg-[#0b1628] p-4">
              <p className="text-xs text-slate-400">{label as string}</p>
              <p className={`mt-2 text-lg font-bold ${color as string}`}>{money(val as number)}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs leading-6 text-slate-500">
          হিসাব: মাসিক আয় থেকে নির্দিষ্ট খরচ ও {SAVE_RATE * 100}% সঞ্চয় বাদ দিয়ে যা থাকে, সেখান থেকে এই মাসে
          Transactions ট্যাবে লেখা খরচ ({money(expense)}) বাদ দিয়ে বাকি {calc.daysLeft} দিনে ভাগ করা হয়েছে।
          নির্দিষ্ট খরচ (রুম ভাড়া ইত্যাদি) Transactions-এ আবার লিখলে একই খরচ দুইবার ধরা হবে, তাই সেগুলো এখানেই
          রাখুন, Transactions-এ শুধু দৈনন্দিন খরচ লিখুন।
        </p>
      </div>


      {/* Claude-এর কাছ থেকে পরামর্শ */}
      <div className={`${panel} border-violet-500/30`}>
        <h3 className="text-lg font-bold text-white">Claude-এর কাছ থেকে ব্যক্তিগত পরামর্শ নিন</h3>
        <p className="mt-1 text-xs leading-6 text-slate-400">
          বাটন চাপলে আপনার সব সংখ্যা কপি হবে। তারপর claude.ai-তে এই চ্যাটে পেস্ট করে
          শেষে আপনার সমস্যা লিখুন।
        </p>

        <button
          type="button"
          onClick={() => void copySummary()}
          className="mt-4 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-500"
        >
          {copied ? "✓ কপি হয়েছে" : "পরামর্শের জন্য সব তথ্য কপি করুন"}
        </button>
      </div>






      {/* ব্যক্তিগত পরামর্শ */}
      <div className={`${panel} border-amber-500/30`}>
        <h3 className="text-lg font-bold text-white">আপনার জন্য ব্যক্তিগত পরামর্শ</h3>
        <p className="mt-1 text-xs text-slate-400">আপনার দেওয়া সংখ্যা অনুযায়ী এগুলো নিজে থেকে বদলায়।</p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {advice.map((a, i) => (
            <div key={a.title + i} className="rounded-xl border border-[#2a3a54] bg-[#0b1628] p-4">
              <p className={`text-sm font-bold ${a.tone}`}>
                {i + 1}. {a.title}
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-400">{a.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* স্বপ্নের তালিকা */}
      <div className={panel}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">আমার স্বপ্নের তালিকা</h3>
            <p className="mt-1 text-xs text-slate-400">স্মার্টবোর্ড, পিসি, ফ্ল্যাট, জমি। ছোট স্বপ্ন আগে লিখুন, তাহলে ক্রম ঠিক থাকবে।</p>
          </div>
          {totalMonthlyPlan > 0 && (
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
              মাসে জমাতে হবে: {money(totalMonthlyPlan)}
            </span>
          )}
        </div>

        <form onSubmit={addGoal} className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
          <input value={gTitle} onChange={(e) => setGTitle(e.target.value)} placeholder="স্বপ্নের নাম" list="goal-suggest" className={inputCls} />
          <datalist id="goal-suggest">
            {GOAL_SUGGEST.map((x) => (
              <option key={x} value={x} />
            ))}
          </datalist>
          <input type="number" min="1" value={gTarget} onChange={(e) => setGTarget(e.target.value)} placeholder="মোট দাম (৳)" className={inputCls} />
          <input type="number" min="0" value={gMonthly} onChange={(e) => setGMonthly(e.target.value)} placeholder="মাসে কত জমাবেন (৳)" className={inputCls} />
          <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500">+ স্বপ্ন যোগ করুন</button>
        </form>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {loading && <p className="text-sm text-slate-400">লোড হচ্ছে...</p>}
          {!loading && goals.length === 0 && (
            <p className="text-sm text-slate-500">এখনো কোনো স্বপ্ন যোগ করেননি।</p>
          )}
          {goals.map((g, idx) => {
            const target = Number(g.target_amount);
            const saved = Number(g.saved_amount);
            const plan = Number(g.monthly_plan);
            const pct = Math.min(100, (saved / target) * 100);
            const left = Math.max(0, target - saved);
            const months = plan > 0 ? Math.ceil(left / plan) : null;
            const order = goalPlan[idx];

            return (
              <div key={g.id} className="rounded-xl border border-[#2a3a54] bg-[#0b1628] p-5">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-bold text-white">{g.title}</h4>
                  <button onClick={() => void deleteGoal(g)} className="text-xs text-rose-400 hover:text-rose-300">মুছুন</button>
                </div>

                <p className="mt-2 text-sm text-slate-300">
                  {money(saved)} <span className="text-slate-500">/ {money(target)}</span>
                </p>

                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#263550]">
                  <div className="h-full rounded-full bg-violet-400" style={{ width: `${pct}%` }} />
                </div>

                <p className="mt-3 text-xs leading-6 text-slate-400">
                  {left === 0
                    ? "🎉 স্বপ্ন পূরণ হয়েছে!"
                    : months === null
                      ? "মাসে কত জমাবেন সেটা দিলে কত মাস লাগবে বলে দেব।"
                      : `মাসে ${money(plan)} দিলে ${months} মাসে (${(months / 12).toFixed(1)} বছর) হবে।`}
                </p>

                {left > 0 && order && order.finishAfter !== null && (
                  <p className="mt-1 text-xs leading-6 text-sky-400">
                    আপনার {SAVE_RATE * 100}% সঞ্চয় দিয়ে একে একে করলে এটি পূরণ হবে প্রায় {order.finishAfter} মাস পরে।
                  </p>
                )}

                <button
                  onClick={() => void addToGoal(g)}
                  className="mt-4 rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-300 hover:bg-violet-500/20"
                >
                  + টাকা জমা দিলাম
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-5 text-xs leading-6 text-slate-500">
          "টাকা জমা দিলাম" চাপার আগে ওই টাকা সত্যিই বিকাশ সঞ্চয়/ব্যাংক/DPS-এ আলাদা করে নিন।
          শুধু সিস্টেমে লিখলে টাকা আলাদা হয় না।
        </p>
      </div>

      {/* আয় বাড়ানোর লক্ষ্য */}
      <div className={panel}>
        <h3 className="text-lg font-bold text-white">আমি আয় কতগুণ করতে চাই?</h3>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {[2, 3].map((m) => (
            <button
              key={m}
              onClick={() => setMultiplier(m)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold ${
                multiplier === m ? "bg-emerald-600 text-white" : "border border-[#30415d] text-slate-400"
              }`}
            >
              {m} গুণ
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm text-slate-300">
          এখন: <b className="text-white">{money(baseIncome)}</b> → লক্ষ্য:{" "}
          <b className="text-emerald-400">{money(targetIncome)}</b>
        </p>
        <p className="mt-1 text-sm text-slate-400">
          মাসে আরও <b className="text-white">{money(gap)}</b> বেশি আনতে হবে।
        </p>
      </div>

      {/* আয় বাড়ানোর উপায় */}
      <div className={panel}>
        <h3 className="text-lg font-bold text-white">আয় বাড়ানোর ৬টি উপায়</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {GROWTH_IDEAS.map((idea, i) => (
            <div key={idea.title} className="rounded-xl border border-[#2a3a54] bg-[#0b1628] p-4">
              <p className="text-sm font-bold text-sky-400">
                {i + 1}. {idea.title}
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-400">{idea.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* আজকের ৩টি কাজ */}
      <div className={`${panel} border-amber-500/30`}>
        <h3 className="text-lg font-bold text-white">আজ এই ৩টি কাজ করুন</h3>
        <div className="mt-4 space-y-3">
          {todays.map((idx) => (
            <label key={idx} className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#2a3a54] bg-[#0b1628] p-4">
              <input type="checkbox" checked={!!done[idx]} onChange={() => toggleAction(idx)} className="mt-1 h-4 w-4" />
              <span className={`text-sm ${done[idx] ? "text-slate-500 line-through" : "text-slate-200"}`}>
                {DAILY_ACTIONS[idx]}
              </span>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}