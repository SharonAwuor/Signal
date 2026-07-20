"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Field, inputClass, primaryBtnClass } from "./ui";

export type PublicUser = { id: string; name: string; email: string; premium: boolean; createdAt: string };

export default function AuthModal({
  mode,
  setMode,
  onClose,
  onAuthed,
}: {
  mode: "login" | "register";
  setMode: (m: "login" | "register") => void;
  onClose: () => void;
  onAuthed: (user: PublicUser, isNew: boolean) => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      onAuthed(data.user, mode === "register");
    } catch {
      setError("Couldn't reach the server — try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(6,10,20,0.7)] backdrop-blur-sm flex items-center justify-center z-[90] p-4" onClick={onClose}>
      <div className="bg-surface border border-line rounded-2xl p-6 w-[380px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-1">
          <h2 className="font-display text-xl text-text font-bold">
            {mode === "register" ? "Create your account" : "Log in"}
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-muted"><X size={18} /></button>
        </div>
        <p className="text-muted text-[13px] my-2 mb-4">
          {mode === "register"
            ? "Report scams and see full report details for free."
            : "Welcome back — verify with your saved history."}
        </p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === "register" && (
            <Field label="Full name">
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Wanjiru Kamau" />
            </Field>
          )}
          <Field label="Email">
            <input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </Field>
          <Field label="Password">
            <input className={inputClass} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </Field>
          {error && <div className="text-red text-[12.5px]">{error}</div>}
          <button type="submit" disabled={loading} className={primaryBtnClass}>
            {loading ? "Please wait…" : mode === "register" ? "Create account" : "Log in"}
          </button>
        </form>
        <div className="mt-4 text-center text-[12.5px] text-muted">
          {mode === "register" ? (
            <>Already have an account?{" "}
              <button onClick={() => setMode("login")} className="text-cyan font-semibold">Log in</button>
            </>
          ) : (
            <>New here?{" "}
              <button onClick={() => setMode("register")} className="text-cyan font-semibold">Create an account</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
