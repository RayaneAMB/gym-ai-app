import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCcw, Settings2, X } from "lucide-react";

import type { TrainingProfile } from "../../types";
import {
  DAYS_OPTIONS,
  EQUIPMENT_OPTIONS,
  EXPERIENCE_OPTIONS,
  GOAL_OPTIONS,
  SESSION_OPTIONS,
  SPLIT_OPTIONS,
  type Option,
} from "../../lib/labels";

const EASE = [0.22, 1, 0.36, 1] as const;

function OptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-[10px] font-black tracking-[0.2em] uppercase text-[var(--color-ink-subtle)] mb-2">
        {label}
      </legend>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border text-left transition-colors duration-150
                ${
                  active
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                    : "border-white/8 bg-white/2 text-[var(--color-ink-subtle)] hover:border-white/20"
                }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

interface Props {
  open: boolean;
  /** The athlete's saved settings — the drawer opens on these, never on defaults. */
  profile: TrainingProfile;
  onClose: () => void;
  onSubmit: (profile: TrainingProfile) => void;
}

/**
 * Bottom sheet for adjusting the profile before regenerating a plan.
 *
 * The previous version kept its own hardcoded defaults, so opening it and
 * hitting "Regenerate" silently overwrote whatever the athlete had chosen
 * with Bulk / Intermediate / 4 days / PPL.
 */
export default function RecalibrateDrawer({ open, profile, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<TrainingProfile>(profile);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Re-sync each time it opens so it never shows stale edits from last time.
  // Done during render, not in an effect, so the first painted frame already
  // shows the saved settings.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setForm(profile);
  }

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  function update<K extends keyof TrainingProfile>(key: K, value: TrainingProfile[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="recalibrate-title"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto bg-[#0f0f10] border-t-2 border-[var(--color-accent)]/30"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-zinc-700" aria-hidden="true" />
            </div>

            <div className="max-w-2xl mx-auto px-6 pb-10 pt-4">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Settings2
                    className="w-5 h-5 text-[var(--color-accent)] shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <h2
                      id="recalibrate-title"
                      className="text-xl font-black uppercase tracking-tight text-[var(--color-ink)]"
                    >
                      Recalibrer le protocole
                    </h2>
                    <p className="text-xs text-[var(--color-ink-subtle)]">
                      Ajustez vos paramètres avant de régénérer
                    </p>
                  </div>
                </div>
                <button
                  ref={closeRef}
                  onClick={onClose}
                  aria-label="Fermer"
                  className="p-2 text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-7">
                <OptionGrid
                  label="Objectif principal"
                  options={GOAL_OPTIONS}
                  value={form.goal}
                  onChange={(v) => update("goal", v)}
                />
                <OptionGrid
                  label="Niveau d'expérience"
                  options={EXPERIENCE_OPTIONS}
                  value={form.experience}
                  onChange={(v) => update("experience", v)}
                />

                <div className="grid grid-cols-2 gap-6">
                  <OptionGrid
                    label="Jours par semaine"
                    options={DAYS_OPTIONS}
                    value={String(form.daysPerWeek)}
                    onChange={(v) => update("daysPerWeek", Number(v))}
                  />
                  <OptionGrid
                    label="Durée des séances"
                    options={SESSION_OPTIONS}
                    value={String(form.sessionLength)}
                    onChange={(v) => update("sessionLength", Number(v))}
                  />
                </div>

                <OptionGrid
                  label="Équipement disponible"
                  options={EQUIPMENT_OPTIONS}
                  value={form.equipment}
                  onChange={(v) => update("equipment", v)}
                />
                <OptionGrid
                  label="Type de split"
                  options={SPLIT_OPTIONS}
                  value={form.split}
                  onChange={(v) => update("split", v)}
                />

                <label className="block">
                  <span className="block text-[10px] font-black tracking-[0.2em] uppercase text-[var(--color-ink-subtle)] mb-2">
                    Blessures / limitations (optionnel)
                  </span>
                  <textarea
                    value={form.injuries ?? ""}
                    onChange={(e) => update("injuries", e.target.value || null)}
                    placeholder="Ex : douleur épaule droite, genou fragile…"
                    rows={2}
                    maxLength={500}
                    className="w-full bg-transparent border border-white/8 px-4 py-3 text-sm text-[var(--color-ink-muted)] placeholder-zinc-600 resize-none focus:outline-none focus:border-[var(--color-accent)]/40 transition-colors"
                  />
                </label>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-sm font-bold uppercase tracking-widest border border-white/10 text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] hover:border-white/30 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => onSubmit(form)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 font-black text-sm uppercase tracking-widest bg-[var(--color-accent)] text-[var(--color-accent-ink)] hover:bg-[var(--color-accent-strong)] transition-colors"
                >
                  <RefreshCcw className="w-4 h-4" aria-hidden="true" />
                  Générer le nouveau programme
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
