import Teachers from "@/components/Teachers";
import AdmissionCTA from "@/components/AdmissionCTA";

export default function TeachersPage() {
  return (
    <main className="min-h-screen bg-[#080D19]">
      <h1 className="sr-only">শিক্ষক পরিচিতি — Shishir BioVerse</h1>
      <Teachers />
      <AdmissionCTA />
    </main>
  );
}