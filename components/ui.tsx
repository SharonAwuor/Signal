import { Phone, AtSign, Building2, UserRound, ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";

export type Risk = "danger" | "caution" | "clear";
export type EntryType = "phone" | "business" | "name" | "social";

export const RISK_META: Record<Risk, { label: string; sub: string; color: string; glow: string; Icon: any }> = {
  danger: {
    label: "Reported scam",
    sub: "Multiple people have flagged this as fraudulent.",
    color: "#FB4D6B",
    glow: "rgba(251,77,107,0.35)",
    Icon: ShieldAlert,
  },
  caution: {
    label: "Reported once or twice",
    sub: "Not enough reports to call it a scam yet — read the details below before deciding.",
    color: "#FBBF24",
    glow: "rgba(251,191,36,0.32)",
    Icon: ShieldQuestion,
  },
  clear: {
    label: "No reports found",
    sub: "Nothing flagged yet — that isn't a guarantee it's safe.",
    color: "#34D399",
    glow: "rgba(52,211,153,0.32)",
    Icon: ShieldCheck,
  },
};

export function typeMeta(type: EntryType) {
  switch (type) {
    case "phone":
      return { label: "Phone number", icon: Phone };
    case "social":
      return { label: "Social account", icon: AtSign };
    case "business":
      return { label: "Business", icon: Building2 };
    default:
      return { label: "Name", icon: UserRound };
  }
}

export const CATEGORIES = [
  "Fake M-Pesa agent",
  "Impersonation",
  "Fake loan / upfront fee",
  "Investment scam",
  "Romance scam",
  "Phishing link",
  "Fake job offer",
  "Delivery / parcel scam",
  "Other",
];

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "bg-ink border border-line rounded-lg px-3 py-2.5 text-text text-sm outline-none placeholder:text-dim focus:border-cyan";

export const ghostBtnClass =
  "bg-transparent border border-line text-text rounded-lg px-3.5 py-2 text-sm font-medium cursor-pointer hover:border-cyan/50 transition-colors";

export const primaryBtnClass =
  "bg-cyan text-ink border-none rounded-lg px-4 py-2.5 font-bold text-sm cursor-pointer hover:brightness-110 transition disabled:opacity-60 disabled:cursor-wait";
