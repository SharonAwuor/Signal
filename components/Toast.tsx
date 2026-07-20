"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { RISK_META, Risk } from "./ui";

export type ToastData = { risk: Risk; detail: string } | null;

export default function Toast({ toast, onClose }: { toast: ToastData; onClose: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const meta = RISK_META[toast.risk];
  const Icon = meta.Icon;

  return (
    <div
      role="status"
      className="fixed top-5 right-5 z-[100] min-w-[300px] max-w-[360px] bg-surface rounded-xl p-3.5 flex gap-3 items-start animate-toastIn"
      style={{
        border: `1px solid ${meta.color}55`,
        borderLeft: `4px solid ${meta.color}`,
        boxShadow: `0 12px 32px -8px ${meta.glow}, 0 4px 16px rgba(0,0,0,0.4)`,
      }}
    >
      <div
        className="w-[30px] h-[30px] rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${meta.color}22` }}
      >
        <Icon size={16} color={meta.color} strokeWidth={2.4} />
      </div>
      <div className="flex-1">
        <div className="text-text font-semibold text-[13.5px]">{meta.label}</div>
        <div className="text-muted text-[12.5px] mt-0.5 leading-snug">{toast.detail}</div>
      </div>
      <button onClick={onClose} aria-label="Dismiss notification" className="bg-transparent border-none text-muted cursor-pointer p-0.5">
        <X size={15} />
      </button>
    </div>
  );
}
