"use client";

import Link from "next/link";
import { Radar, Crown, User, LogOut } from "lucide-react";
import { ghostBtnClass, primaryBtnClass } from "./ui";
import { PublicUser } from "./AuthModal";

export default function Header({
  currentUser,
  onLogin,
  onSignup,
  onUpgrade,
  onLogout,
}: {
  currentUser: PublicUser | null;
  onLogin: () => void;
  onSignup: () => void;
  onUpgrade: () => void;
  onLogout: () => void;
}) {
  return (
    <header className="flex justify-between items-center px-7 py-4 border-b border-surface2 sticky top-0 bg-ink/85 backdrop-blur-md z-40">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-[30px] h-[30px] rounded-lg bg-cyan flex items-center justify-center">
          <Radar size={17} color="#08131F" strokeWidth={2.4} />
        </div>
        <span className="font-display font-bold text-lg text-text tracking-wide">SIGNAL</span>
      </Link>
      <div className="flex items-center gap-2.5">
        {currentUser ? (
          <>
            {!currentUser.premium && (
              <button onClick={onUpgrade} className={ghostBtnClass} style={{ borderColor: "#FBBF2455", color: "#FBBF24" }}>
                <Crown size={14} className="inline mr-1.5 -mt-0.5" /> Go Premium
              </button>
            )}
            <Link href="/dashboard" className={ghostBtnClass}>
              <User size={14} className="inline mr-1.5 -mt-0.5" /> {currentUser.name.split(" ")[0]}
              {currentUser.premium && <Crown size={12} color="#FBBF24" className="inline ml-1.5 -mt-0.5" />}
            </Link>
            <button onClick={onLogout} aria-label="Log out" className="text-muted"><LogOut size={17} /></button>
          </>
        ) : (
          <>
            <button onClick={onLogin} className={ghostBtnClass}>Log in</button>
            <button onClick={onSignup} className={primaryBtnClass}>Sign up</button>
          </>
        )}
      </div>
    </header>
  );
}
