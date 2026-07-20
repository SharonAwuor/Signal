"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";
import { Field, inputClass, primaryBtnClass, CATEGORIES, EntryType, typeMeta } from "./ui";
import { PublicUser } from "./AuthModal";

export default function ReportModal({
  onClose,
  onSubmitted,
  prefill,
  currentUser,
}: {
  onClose: () => void;
  onSubmitted: () => void;
  prefill?: { type: EntryType; value: string } | null;
  currentUser: PublicUser;
}) {
  const [form, setForm] = useState({
    type: prefill?.type || ("phone" as EntryType),
    value: prefill?.value || "",
    category: CATEGORIES[0],
    description: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.value.trim() || !form.description.trim()) {
      setError("Add the contact and a short description before submitting.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't submit the report.");
        return;
      }
      onSubmitted();
    } catch {
      setError("Couldn't reach the server — try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(6,10,20,0.7)] backdrop-blur-sm flex items-center justify-center z-[90] p-4" onClick={onClose}>
      <div className="bg-surface border border-line rounded-2xl p-6 w-[420px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-1">
          <h2 className="font-display text-xl text-text font-bold">Report a scam</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted"><X size={18} /></button>
        </div>
        <p className="text-muted text-[13px] my-2 mb-4">
          Posting as <span className="text-cyan">{currentUser.name}</span>. Other users see your initials only.
        </p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Field label="Type">
            <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as EntryType })}>
              <option value="phone">Phone number</option>
              <option value="business">Business name</option>
              <option value="name">Person's name</option>
              <option value="social">Social media account</option>
            </select>
          </Field>
          <Field label={typeMeta(form.type).label}>
            <input
              className={`${inputClass} font-mono`}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder={form.type === "phone" ? "+254 7XX XXX XXX" : form.type === "social" ? "@handle" : "Full name"}
            />
          </Field>
          <Field label="Category">
            <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="What happened">
            <textarea
              className={`${inputClass} min-h-[84px] resize-y font-body`}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe how contact was made and what was asked for."
            />
          </Field>
          {error && <div className="text-red text-[12.5px]">{error}</div>}
          <button type="submit" disabled={loading} className={primaryBtnClass}>
            <Send size={14} className="inline mr-1.5 -mt-0.5" />
            {loading ? "Submitting…" : "Submit report"}
          </button>
        </form>
      </div>
    </div>
  );
}
