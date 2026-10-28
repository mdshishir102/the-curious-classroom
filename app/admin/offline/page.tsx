"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  User,
  Phone,
  MapPin,
  Video,
  Image as ImageIcon,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  X,
  LoaderCircle,
  Building2,
  GraduationCap,
  RotateCcw,
  Info,
  Eye,
} from "lucide-react";

type OfflineInfo = {
  id?: string;
  teacher_name: string;
  teacher_image: string;
  teacher_description: string;
  phone: string;
  location_name: string;
  location_address: string;
  location_video: string;
};

const EMPTY_INFO: OfflineInfo = {
  teacher_name: "",
  teacher_image: "",
  teacher_description: "",
  phone: "",
  location_name: "",
  location_address: "",
  location_video: "",
};

export default function AdminOfflinePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState<OfflineInfo>(EMPTY_INFO);
  const [originalInfo, setOriginalInfo] = useState<OfflineInfo>(EMPTY_INFO);
  const [imgError, setImgError] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [touched, setTouched] = useState(false);

  async function loadInfo() {
    const { data, error } = await supabase
      .from("offline_class_info")
      .select("*")
      .limit(1)
      .single();

    if (data) {
      setInfo(data);
      setOriginalInfo(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadInfo();
  }, []);

  // ছবির URL বদলালে broken-image state রিসেট
  useEffect(() => {
    setImgError(false);
  }, [info.teacher_image]);

  // Toast অটো-ডিসমিস
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const isDirty = JSON.stringify(info) !== JSON.stringify(originalInfo);

  // পেজ ছাড়ার সময় unsaved changes warning
  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  async function saveInfo() {
    setTouched(true);
    setSaving(true);

    const { data: existing } = await supabase
      .from("offline_class_info")
      .select("id")
      .limit(1);

    let result;

    if (existing && existing.length > 0) {
      result = await supabase
        .from("offline_class_info")
        .update({
          teacher_name: info.teacher_name,
          teacher_image: info.teacher_image,
          teacher_description: info.teacher_description,
          phone: info.phone,
          location_name: info.location_name,
          location_address: info.location_address,
          location_video: info.location_video,
        })
        .eq("id", existing[0].id);
    } else {
      result = await supabase.from("offline_class_info").insert({
        teacher_name: info.teacher_name,
        teacher_image: info.teacher_image,
        teacher_description: info.teacher_description,
        phone: info.phone,
        location_name: info.location_name,
        location_address: info.location_address,
        location_video: info.location_video,
      });
    }

    if (result.error) {
      setToast({ type: "error", message: result.error.message });
      setSaving(false);
      return;
    }

    setOriginalInfo(info);
    setLastSaved(new Date());
    setToast({ type: "success", message: "তথ্য সফলভাবে সংরক্ষণ করা হয়েছে।" });
    setSaving(false);
  }

  function updateField(key: string, value: string) {
    setInfo({
      ...info,
      [key]: value,
    });
  }

  function discardChanges() {
    setInfo(originalInfo);
    setTouched(false);
  }

  function copyToClipboard(text: string, key: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }

  // কতগুলো ফিল্ড পূরণ হয়েছে
  const fieldValues = [
    info.teacher_name,
    info.teacher_image,
    info.teacher_description,
    info.phone,
    info.location_name,
    info.location_address,
    info.location_video,
  ];
  const filledCount = fieldValues.filter((v) => v && v.trim() !== "").length;
  const totalFields = fieldValues.length;
  const completionPercent = Math.round((filledCount / totalFields) * 100);

  const requiredMissing = {
    teacher_name: touched && !info.teacher_name.trim(),
    phone: touched && !info.phone.trim(),
    location_name: touched && !info.location_name.trim(),
    location_address: touched && !info.location_address.trim(),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3 bg-[#080D19] text-slate-300">
        <LoaderCircle className="h-5 w-5 animate-spin text-blue-400" />
        <span>Loading...</span>
      </div>
    );
  }

  const inputBase =
    "w-full rounded-xl border bg-[#0B1425] px-4 py-3 text-sm text-white placeholder:text-slate-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D19]";
  const borderOk = "border-white/[0.09]";
  const borderBad = "border-red-400/40";

  return (
    <main className="min-h-screen bg-[#080D19] p-6 pb-28">
      <div className="max-w-5xl mx-auto">

        {/* TOAST */}
        {toast && (
          <div
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-[0_16px_50px_rgba(0,0,0,0.35)] backdrop-blur-sm ${
              toast.type === "success"
                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                : "border-red-400/20 bg-red-500/10 text-red-300"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-current/70 hover:text-current"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* HEADER */}
        <div className="card-lift rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-300">
                <span className="h-px w-7 bg-blue-400" />
                OFFLINE CLASS
              </div>
              <h1 className="mt-2 text-3xl font-semibold text-white flex items-center gap-2">
                <GraduationCap className="h-7 w-7 text-blue-400" />
                অফলাইন ক্লাস ব্যবস্থাপনা
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                শিক্ষক প্রোফাইল ও কোচিং লোকেশনের তথ্য পরিচালনা করুন
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              {isDirty && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                  <Info className="h-3.5 w-3.5" />
                  সংরক্ষিত হয়নি এমন পরিবর্তন আছে
                </span>
              )}
              {lastSaved && !isDirty && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  সর্বশেষ সংরক্ষণ: {lastSaved.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
          </div>

          {/* COMPLETION PROGRESS */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>প্রোফাইল পূর্ণতা</span>
              <span className="font-semibold text-blue-300">
                {filledCount}/{totalFields} ফিল্ড পূরণ ({completionPercent}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* TEACHER INFORMATION */}
        <div className="mt-6 card-lift rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)] p-8">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-300 mb-5">
            <span className="h-px w-7 bg-blue-400" />
            TEACHER PROFILE
          </div>
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-400" />
            শিক্ষক তথ্য
          </h2>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <User className="h-3.5 w-3.5" /> শিক্ষকের নাম
                {requiredMissing.teacher_name && (
                  <span className="text-red-400">• আবশ্যক</span>
                )}
              </label>
              <input
                className={`${inputBase} ${requiredMissing.teacher_name ? borderBad : borderOk}`}
                placeholder="Teacher Name"
                value={info.teacher_name}
                onChange={(e) => updateField("teacher_name", e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <ImageIcon className="h-3.5 w-3.5" /> প্রোফাইল ছবির লিংক
              </label>
              <div className="flex items-center gap-3">
                <input
                  className={`${inputBase} ${borderOk} flex-1`}
                  placeholder="Profile Image URL"
                  value={info.teacher_image}
                  onChange={(e) => updateField("teacher_image", e.target.value)}
                />
                <div className="h-12 w-12 shrink-0 rounded-xl border border-white/[0.09] bg-[#0B1425] overflow-hidden flex items-center justify-center">
                  {info.teacher_image && !imgError ? (
                    <img
                      src={info.teacher_image}
                      alt="preview"
                      className="h-full w-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <User className="h-5 w-5 text-slate-600" />
                  )}
                </div>
              </div>
              {info.teacher_image && imgError && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> ছবিটি লোড করা যায়নি, লিংক চেক করুন
                </p>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <FileText className="h-3.5 w-3.5" /> শিক্ষক পরিচিতি
                </label>
                <span className="text-xs text-slate-500">{info.teacher_description.length} অক্ষর</span>
              </div>
              <textarea
                className={`${inputBase} ${borderOk} resize-none`}
                placeholder="Teacher Description"
                rows={4}
                value={info.teacher_description}
                onChange={(e) => updateField("teacher_description", e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Phone className="h-3.5 w-3.5" /> মোবাইল নম্বর
                {requiredMissing.phone && <span className="text-red-400">• আবশ্যক</span>}
              </label>
              <div className="flex items-center gap-2">
                <input
                  className={`${inputBase} ${requiredMissing.phone ? borderBad : borderOk} flex-1`}
                  placeholder="Mobile Number"
                  value={info.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(info.phone, "phone")}
                  disabled={!info.phone}
                  className="shrink-0 rounded-xl border border-white/[0.09] bg-[#0B1425] p-3 text-slate-400 hover:text-blue-300 hover:border-blue-400/20 disabled:opacity-30 transition"
                  title="কপি করুন"
                >
                  {copiedKey === "phone" ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* LOCATION INFORMATION */}
        <div className="mt-6 card-lift rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)] p-8">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-violet-300 mb-5">
            <span className="h-px w-7 bg-violet-400" />
            LOCATION DETAILS
          </div>
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-violet-400" />
            কোচিং লোকেশন
          </h2>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <MapPin className="h-3.5 w-3.5" /> কোচিং এর নাম
                {requiredMissing.location_name && (
                  <span className="text-red-400">• আবশ্যক</span>
                )}
              </label>
              <input
                className={`${inputBase} ${requiredMissing.location_name ? borderBad : borderOk}`}
                placeholder="Coaching Name"
                value={info.location_name}
                onChange={(e) => updateField("location_name", e.target.value)}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <MapPin className="h-3.5 w-3.5" /> সম্পূর্ণ ঠিকানা
                  {requiredMissing.location_address && (
                    <span className="text-red-400">• আবশ্যক</span>
                  )}
                </label>
                <span className="text-xs text-slate-500">{info.location_address.length} অক্ষর</span>
              </div>
              <textarea
                className={`${inputBase} ${requiredMissing.location_address ? borderBad : borderOk} resize-none`}
                placeholder="Full Address"
                rows={3}
                value={info.location_address}
                onChange={(e) => updateField("location_address", e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Video className="h-3.5 w-3.5" /> গুগল ড্রাইভ লোকেশন ভিডিও লিংক
              </label>
              <div className="flex items-center gap-2">
                <input
                  className={`${inputBase} ${borderOk} flex-1`}
                  placeholder="Google Drive Location Video Link"
                  value={info.location_video}
                  onChange={(e) => updateField("location_video", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(info.location_video, "video")}
                  disabled={!info.location_video}
                  className="shrink-0 rounded-xl border border-white/[0.09] bg-[#0B1425] p-3 text-slate-400 hover:text-blue-300 hover:border-blue-400/20 disabled:opacity-30 transition"
                  title="কপি করুন"
                >
                  {copiedKey === "video" ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              {info.location_video && !info.location_video.startsWith("http") && (
                <p className="mt-1.5 text-xs text-amber-400 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> এটি একটি সঠিক URL মনে হচ্ছে না
                </p>
              )}
            </div>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="mt-6 card-lift rounded-3xl border border-white/[0.09] bg-[#101A2C] shadow-[0_16px_50px_rgba(0,0,0,0.12)] p-8">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-300 mb-5">
            <span className="h-px w-7 bg-emerald-400" />
            LIVE PREVIEW
          </div>
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Eye className="h-5 w-5 text-emerald-400" />
            শিক্ষার্থীরা যেমন দেখবে
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* TEACHER PREVIEW */}
            <div className="rounded-2xl border border-white/[0.07] bg-[#0B1425] p-6">
              <div className="flex items-center gap-4">
                {info.teacher_image && !imgError ? (
                  <img
                    src={info.teacher_image}
                    alt="Teacher"
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white/[0.06] shadow-md"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-400/15 flex items-center justify-center text-3xl">
                    👨‍🏫
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {info.teacher_name || "Teacher Name"}
                  </h3>
                  <p className="text-slate-400 text-sm">Biology Teacher</p>
                </div>
              </div>

              {info.teacher_description && (
                <p className="mt-5 text-slate-300 leading-7 text-sm">
                  {info.teacher_description}
                </p>
              )}

              {info.phone && (
                <a
                  href={`tel:${info.phone}`}
                  className="inline-flex mt-5 items-center gap-2 bg-blue-500/10 border border-blue-400/15 hover:bg-blue-500/20 text-blue-300 px-5 py-3 rounded-xl font-semibold text-sm transition"
                >
                  <Phone className="h-4 w-4" /> {info.phone}
                </a>
              )}
            </div>

            {/* LOCATION PREVIEW */}
            <div className="rounded-2xl border border-white/[0.07] bg-[#0B1425] p-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-violet-400" />
                {info.location_name || "Coaching Location"}
              </h3>

              <p className="mt-4 text-slate-300 leading-7 text-sm">
                {info.location_address || "Location address will appear here."}
              </p>

              {info.location_video && (
                <a
                  href={info.location_video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex mt-5 items-center gap-2 bg-red-500/10 border border-red-400/20 hover:bg-red-500/20 text-red-300 px-5 py-3 rounded-xl font-semibold text-sm transition"
                >
                  <Video className="h-4 w-4" /> Watch Location Guide
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* STICKY SAVE BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.07] bg-[#0B1425]/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            {isDirty ? (
              <span className="text-amber-300 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" /> পরিবর্তনগুলো এখনো সংরক্ষিত হয়নি
              </span>
            ) : lastSaved ? (
              <span className="text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> সব পরিবর্তন সংরক্ষিত আছে
              </span>
            ) : (
              <span>কোনো পরিবর্তন নেই</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isDirty && (
              <button
                onClick={discardChanges}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.09] bg-transparent px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.04] transition disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" /> বাতিল করুন
              </button>
            )}
            <button
              onClick={saveInfo}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl px-6 py-3 font-semibold text-sm shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" /> সংরক্ষণ হচ্ছে...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> তথ্য সংরক্ষণ করুন
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}