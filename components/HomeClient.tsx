"use client";

import { useState } from "react";
import { Search, History } from "lucide-react";
import Header from "./Header";
import RadarBurst from "./RadarBurst";
import ResultCard, { SearchResult } from "./ResultCard";
import Toast, { ToastData } from "./Toast";
import AuthModal, { PublicUser } from "./AuthModal";
import ReportModal from "./ReportModal";
import { useSignalSound } from "./useSignalSound";
import { typeMeta, EntryType } from "./ui";

type RecentReport = { id: string; type: EntryType; valueRaw: string; category: string; date: string };

export default function HomeClient({
  initialUser,
  recentReports,
  reportCount,
}: {
  initialUser: PublicUser | null;
  recentReports: RecentReport[];
  reportCount: number;
}) {
  const { playScan, playResult } = useSignalSound();
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(initialUser);
  const [query, setQuery] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [toast, setToast] = useState<ToastData>(null);

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [reportOpen, setReportOpen] = useState<{ type: EntryType; value: string } | null | true>(null);

  const runScan = async (raw: string) => {
    const value = raw.trim();
    if (!value || scanning) return;
    setScanning(true);
    setResult(null);
    playScan();

    const started = Date.now();
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: value }),
    });
    const data: SearchResult = await res.json();

    // Keep the radar animation feeling deliberate even when the API is fast.
    const elapsed = Date.now() - started;
    if (elapsed < 900) await new Promise((r) => setTimeout(r, 900 - elapsed));

    setResult(data);
    setScanning(false);
    playResult(data.risk);
    setToast({
      risk: data.risk,
      detail:
        data.risk === "danger"
          ? `${data.exactCount} people reported this ${typeMeta(data.type).label.toLowerCase()}.`
          : data.risk === "caution"
          ? `${data.exactCount + data.fuzzyCount} similar report${data.exactCount + data.fuzzyCount > 1 ? "s" : ""} on file — check for yourself.`
          : "No community reports found for this entry.",
    });
  };

  const openReportFor = (prefill?: { type: EntryType; value: string }) => {
    if (!currentUser) {
      setAuthMode("register");
      setAuthOpen(true);
      return;
    }
    setReportOpen(prefill || true);
  };

  const handleUpgrade = async () => {
    if (!currentUser) {
      setAuthMode("register");
      setAuthOpen(true);
      return;
    }
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setToast({ risk: "caution", detail: data.error || "Couldn't start checkout." });
      }
    } catch {
      setToast({ risk: "caution", detail: "Couldn't reach the server — try again." });
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen">
      <Header
        currentUser={currentUser}
        onLogin={() => { setAuthMode("login"); setAuthOpen(true); }}
        onSignup={() => { setAuthMode("register"); setAuthOpen(true); }}
        onUpgrade={handleUpgrade}
        onLogout={handleLogout}
      />

      <main className="max-w-[780px] mx-auto px-5 pt-14 pb-20">
        <div className="text-center mb-8 animate-fadeUp">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface2 border border-line text-xs text-muted mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulseBg" />
            {reportCount} community reports on file
          </div>
          <h1 className="font-display font-bold leading-tight mb-3" style={{ fontSize: "clamp(28px, 5vw, 44px)" }}>
            Before you trust it,<br />run it through the signal.
          </h1>
          <p className="text-muted text-[15.5px] max-w-[480px] mx-auto">
            Paste a phone number, business, name, or social handle. We check it against what the community has already flagged.
          </p>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); runScan(query); }}
          className="flex gap-2 bg-surface border border-line rounded-2xl p-2"
          style={{ boxShadow: "0 20px 50px -20px rgba(56,189,248,0.15)" }}
        >
          <div className="flex items-center pl-2.5 text-muted"><Search size={18} /></div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="+254 7XX XXX XXX · @handle · business or full name"
            className="flex-1 bg-transparent border-none outline-none text-text text-[15px] font-mono py-2.5 px-1"
          />
          <button type="submit" disabled={scanning} className="bg-cyan text-ink border-none rounded-lg px-5 font-bold text-sm disabled:opacity-70 disabled:cursor-wait">
            {scanning ? "Scanning…" : "Verify"}
          </button>
        </form>

        <div className="flex gap-2 mt-3 flex-wrap justify-center">
          {["+254712345678", "Quickloan Direct Kenya", "@forex_wins_ke"].map((ex) => (
            <button
              key={ex}
              onClick={() => { setQuery(ex); runScan(ex); }}
              className="text-xs text-muted bg-surface border border-line rounded-full px-3 py-1.5 font-mono"
            >
              {ex}
            </button>
          ))}
        </div>

        {scanning && (
          <div className="flex justify-center py-12">
            <RadarBurst risk="clear" />
          </div>
        )}

        {result && !scanning && (
          <ResultCard
            result={result}
            onReport={() => openReportFor({ type: result.type, value: result.query })}
            onRequireAuth={() => { setAuthMode("register"); setAuthOpen(true); }}
            onRequirePremium={handleUpgrade}
          />
        )}

        <div className="mt-14">
          <div className="flex items-center gap-2 mb-3.5">
            <History size={15} className="text-muted" />
            <h3 className="font-display text-[14px] text-muted font-semibold uppercase tracking-wide">Recently reported</h3>
          </div>
          <div className="flex flex-col gap-2">
            {recentReports.map((r) => {
              const Icon = typeMeta(r.type).icon;
              return (
                <div key={r.id} className="flex items-center gap-3 py-3 px-3.5 bg-surface border border-surface2 rounded-lg">
                  <Icon size={15} className="text-muted" />
                  <span className="font-mono text-[13px] text-text flex-1 truncate">{r.valueRaw}</span>
                  <span className="text-xs text-amber bg-amber/10 px-2.5 py-1 rounded-full whitespace-nowrap">{r.category}</span>
                  <span className="text-[11.5px] text-dim whitespace-nowrap">{new Date(r.date).toLocaleDateString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {authOpen && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => setAuthOpen(false)}
          onAuthed={(user, isNew) => {
            setCurrentUser(user);
            setAuthOpen(false);
            setToast({ risk: "clear", detail: isNew ? `Account created — welcome, ${user.name}.` : `Logged in as ${user.name}.` });
          }}
        />
      )}

      {reportOpen && currentUser && (
        <ReportModal
          onClose={() => setReportOpen(null)}
          prefill={typeof reportOpen === "object" ? reportOpen : null}
          currentUser={currentUser}
          onSubmitted={() => {
            setReportOpen(null);
            setToast({ risk: "caution", detail: "Report submitted — thank you for keeping the community safe." });
            if (query) runScan(query);
          }}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
