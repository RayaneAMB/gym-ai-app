import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, User } from "lucide-react";
import { AccountView, NeonAuthUIProvider } from "@neondatabase/neon-js/auth/react";

import { authClient } from "../lib/auth";

const TABS = [
  { id: "settings", label: "Profil", icon: User },
  { id: "security", label: "Sécurité", icon: Shield },
] as const;

export default function Account() {
  const { pathname } = useParams();
  const navigate = useNavigate();

  // `/account` with no segment lands on the profile tab.
  const active = TABS.some((t) => t.id === pathname) ? pathname! : "settings";

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 selection:bg-[var(--color-accent)] selection:text-[var(--color-accent-ink)]">
      {/*
        Neon's account UI now picks up the Volt palette from the shadcn-style
        tokens declared in index.css, so no colour overrides are needed here.
        The only thing left to suppress is its built-in tab bar, which the
        sidebar below replaces.
      */}
      <style>{`.neon-account nav { display: none !important; }`}</style>

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 mb-10"
        >
          <button
            onClick={() => navigate("/profile")}
            aria-label="Retour au programme"
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-[var(--color-accent)]"
          >
            <ArrowLeft className="w-6 h-6" aria-hidden="true" />
          </button>
          <h1 className="font-display text-4xl font-black uppercase tracking-tighter">
            Athlete <span className="text-[var(--color-accent)]">Settings</span>
          </h1>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">
          <nav className="w-full md:w-64 space-y-2" aria-label="Sections du compte">
            {TABS.map((tab) => {
              const isActive = active === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(`/account/${tab.id}`)}
                  aria-current={isActive ? "page" : undefined}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-colors
                    ${
                      isActive
                        ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)] shadow-[0_0_20px_rgba(204,255,0,0.2)]"
                        : "text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] hover:bg-white/5"
                    }`}
                >
                  <tab.icon className="w-5 h-5" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="flex-1 bg-[var(--color-surface-raised)] border border-white/5 rounded-2xl overflow-hidden neon-account p-8 shadow-2xl">
            <NeonAuthUIProvider authClient={authClient}>
              <AccountView pathname={active} />
            </NeonAuthUIProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
