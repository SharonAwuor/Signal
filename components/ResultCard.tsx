import { AlertTriangle, Lock, Crown } from "lucide-react";
import { RISK_META, typeMeta, ghostBtnClass, Risk, EntryType } from "./ui";

export type SearchResult = {
  query: string;
  type: EntryType;
  risk: Risk;
  tier: "guest" | "free" | "premium";
  exactCount: number;
  fuzzyCount: number;
  exactMatches: { id: string; category: string; description?: string; date: string; reporter?: string }[];
  fuzzyMatches: { id: string; category: string; description?: string; date: string; reporter?: string; similarity: number }[];
};

function LockedPanel({ icon: Icon, title, actionLabel, onClick, amber }: any) {
  const color = amber ? "#FBBF24" : "#38BDF8";
  return (
    <div className="flex items-center gap-3 py-3.5 px-4 rounded-lg" style={{ background: `${color}0F`, border: `1px dashed ${color}55` }}>
      <Icon size={17} color={color} />
      <span className="text-[13px] text-text/90 flex-1">{title}</span>
      <button onClick={onClick} className="border-none rounded-lg px-3 py-1.5 text-[12.5px] font-bold cursor-pointer whitespace-nowrap" style={{ background: color, color: "#08131F" }}>
        {actionLabel}
      </button>
    </div>
  );
}

export default function ResultCard({
  result,
  onReport,
  onRequireAuth,
  onRequirePremium,
}: {
  result: SearchResult;
  onReport: () => void;
  onRequireAuth: () => void;
  onRequirePremium: () => void;
}) {
  const meta = RISK_META[result.risk];
  const Icon = meta.Icon;
  const totalMatches = result.exactCount + result.fuzzyCount;

  return (
    <div
      className="mt-7 bg-surface rounded-2xl p-6 animate-fadeUp"
      style={{ border: `1px solid ${meta.color}40`, boxShadow: `0 24px 60px -20px ${meta.glow}` }}
    >
      <div className="flex gap-4 items-center">
        <div
          className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${meta.color}20`, border: `1.5px solid ${meta.color}55` }}
        >
          <Icon size={26} color={meta.color} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[13px] text-muted mb-0.5 truncate">
            {typeMeta(result.type).label} · {result.query}
          </div>
          <div className="font-display text-[19px] font-bold" style={{ color: meta.color }}>{meta.label}</div>
          <div className="text-[13px] text-muted mt-0.5">{meta.sub}</div>
        </div>
        <button onClick={onReport} className={`${ghostBtnClass} whitespace-nowrap`}>
          <AlertTriangle size={13} className="inline mr-1.5 -mt-0.5" /> Report
        </button>
      </div>

      {totalMatches > 0 && (
        <div className="mt-5 border-t border-surface2 pt-4">
          <div className="text-xs text-muted font-semibold uppercase tracking-wide mb-2.5">
            {result.exactCount > 0 && `${result.exactCount} exact report${result.exactCount > 1 ? "s" : ""}`}
            {result.exactCount > 0 && result.fuzzyCount > 0 && " · "}
            {result.fuzzyCount > 0 && `${result.fuzzyCount} similar entr${result.fuzzyCount > 1 ? "ies" : "y"} found`}
          </div>

          {result.tier === "guest" ? (
            <LockedPanel icon={Lock} title="Log in to see categories and full history" actionLabel="Sign up free" onClick={onRequireAuth} />
          ) : result.tier === "free" ? (
            <>
              <div className="flex gap-1.5 flex-wrap mb-3.5">
                {[...new Set(result.exactMatches.map((m) => m.category))].map((c) => (
                  <span key={c} className="text-xs text-amber bg-amber/10 px-2.5 py-1 rounded-full">{c}</span>
                ))}
              </div>
              <LockedPanel
                icon={Crown}
                title="Premium unlocks each report's full description, date, and reporter"
                actionLabel="Upgrade to Premium"
                onClick={onRequirePremium}
                amber
              />
            </>
          ) : (
            <div className="flex flex-col gap-2.5">
              {result.exactMatches.map((m) => (
                <div key={m.id} className="bg-ink border border-surface2 rounded-lg p-3">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-amber bg-amber/10 px-2.5 py-1 rounded-full">{m.category}</span>
                    <span className="text-[11.5px] text-dim">{new Date(m.date).toLocaleDateString()} · reported by {m.reporter}</span>
                  </div>
                  <div className="text-[13.5px] text-text/85 leading-relaxed">{m.description}</div>
                </div>
              ))}
              {result.fuzzyMatches.length > 0 && (
                <>
                  <div className="text-xs text-muted font-semibold uppercase tracking-wide mt-2">Possible variants</div>
                  {result.fuzzyMatches.map((m) => (
                    <div key={m.id} className="bg-ink border border-dashed border-surface2 rounded-lg p-3">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs text-cyan bg-cyan/10 px-2.5 py-1 rounded-full">{m.category} · {m.similarity}% match</span>
                        <span className="text-[11.5px] text-dim">{new Date(m.date).toLocaleDateString()} · {m.reporter}</span>
                      </div>
                      <div className="text-[13.5px] text-text/85 leading-relaxed">{m.description}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
