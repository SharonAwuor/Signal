"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, FileText, Clock, Sparkles } from "lucide-react";
import Header from "./Header";
import ReportModal from "./ReportModal";
import Toast, { ToastData } from "./Toast";
import { RISK_META, ghostBtnClass, primaryBtnClass } from "./ui";
import { PublicUser } from "./AuthModal";

type ReportRow = { id: string; type: string; valueRaw: string; category: string; date: string };
type SearchRow = { id: string; query: string; type: string; risk: "danger" | "caution" | "clear"; date: string };

function EmptyRow({ text }: { text: string }) {
  return <div className="p-4 text-center text-dim text-[13px] border border-dashed border-line rounded-lg">{text}</div>;
}

export default function DashboardClient({
  user,
  reports,
  searches,
}: {
  user: PublicUser;
  reports: ReportRow[];
  searches: SearchRow[];
}) {
  const router = useRouter();
  const [reportOpen, setReportOpen] = useState(false);
  const [toast, setToast] = useState<ToastData>(null);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (data.url) window.location.href = data.url;
    else setToast({ risk: "caution", detail: data.error || "Couldn't start checkout." });
  };

  const handleManageBilling = async () => {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (data.url) window.location.href = data.url;
    else setToast({ risk: "caution", detail: data.error || "Couldn't open billing portal." });
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const initials = user.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen">
      <Header
        currentUser={user}
        onLogin={() => {}}
        onSignup={() => {}}
        onUpgrade={handleUpgrade}
        onLogout={handleLogout}
      />

      <main className="max-w-[720px] mx-auto px-5 pt-10 pb-20 animate-fadeUp">
        <div className="flex items-center gap-4 p-5 bg-surface border border-line rounded-2xl mb-6">
          <div className="w-[54px] h-[54px] rounded-full bg-surface2 flex items-center justify-center font-display text-lg font-bold text-cyan">
            {initials}
          </div>
          <div className="flex-1">
            <div className="font-display text-lg font-bold flex items-center gap-2">
              {user.name}
              {user.premium && (
                <span className="text-[11px] text-amber bg-amber/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Crown size={11} /> Premium
                </span>
              )}
            </div>
            <div className="text-[13px] text-muted">
              {user.email} · joined {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>
          {user.premium ? (
            <button onClick={handleManageBilling} disabled={loading} className={ghostBtnClass}>Manage billing</button>
          ) : (
            <button onClick={handleUpgrade} disabled={loading} className={primaryBtnClass} style={{ background: "#FBBF24" }}>
              <Crown size={13} className="inline mr-1.5 -mt-0.5" /> Upgrade
            </button>
          )}
        </div>

        {!user.premium && (
          <div className="bg-surface border border-line rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles size={16} className="text-amber" />
              <h3 className="font-display text-[15px]">What Premium unlocks</h3>
            </div>
            <ul className="list-disc pl-[18px] text-text/85 text-[13.5px] leading-loose">
              <li>Full report details — description, date, and reporter for every match</li>
              <li>Fuzzy-match variants — near-miss numbers and misspelled names, not just exact hits</li>
              <li>A verified badge on the reports you submit</li>
            </ul>
          </div>
        )}

        <div className="flex justify-between items-center mb-3">
          <h3 className="font-display text-[15px] flex items-center gap-2">
            <FileText size={15} className="text-muted" /> Your reports ({reports.length})
          </h3>
          <button onClick={() => setReportOpen(true)} className={ghostBtnClass}>+ New report</button>
        </div>
        <div className="flex flex-col gap-2 mb-7">
          {reports.length === 0 && <EmptyRow text="No reports submitted yet — flag a scam to help others." />}
          {reports.map((r) => (
            <div key={r.id} className="bg-surface border border-surface2 rounded-lg p-3">
              <div className="flex justify-between mb-1">
                <span className="font-mono text-[13px]">{r.valueRaw}</span>
                <span className="text-[11.5px] text-dim">{new Date(r.date).toLocaleDateString()}</span>
              </div>
              <div className="text-xs text-amber">{r.category}</div>
            </div>
          ))}
        </div>

        <h3 className="font-display text-[15px] mb-3 flex items-center gap-2">
          <Clock size={15} className="text-muted" /> Search history
        </h3>
        <div className="flex flex-col gap-2">
          {searches.length === 0 && <EmptyRow text="Your verified searches will show up here." />}
          {searches.map((s) => {
            const meta = RISK_META[s.risk];
            return (
              <div key={s.id} className="flex items-center gap-2.5 bg-surface border border-surface2 rounded-lg px-3 py-2.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                <span className="font-mono text-[13px] flex-1 truncate">{s.query}</span>
                <span className="text-[11.5px] text-dim whitespace-nowrap">{new Date(s.date).toLocaleDateString()}</span>
              </div>
            );
          })}
        </div>
      </main>

      {reportOpen && (
        <ReportModal
          onClose={() => setReportOpen(false)}
          currentUser={user}
          onSubmitted={() => {
            setReportOpen(false);
            setToast({ risk: "caution", detail: "Report submitted." });
            router.refresh();
          }}
        />
      )}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
