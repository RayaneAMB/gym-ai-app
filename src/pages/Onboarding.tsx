import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import type { TrainingProfile } from "../types";
import {
  DAYS_OPTIONS,
  DEFAULT_PROFILE,
  EQUIPMENT_OPTIONS,
  EXPERIENCE_OPTIONS,
  GOAL_OPTIONS,
  SESSION_OPTIONS,
  SPLIT_OPTIONS,
  labelFor,
  type Option,
} from "../lib/labels";
import { LoadingScreen } from "../componentes/ui/LoadingScreen";

const STEPS = [
  { title: "Quel est ton objectif ?", sub: "On calibre tout le programme autour de ça." },
  { title: "Ton niveau & ton planning", sub: "Pour adapter la charge et la fréquence." },
  { title: "Équipement & structure", sub: "On choisit les exercices selon ce que tu as." },
  { title: "Derniers détails", sub: "Blessures, limitations — ou aucune, c'est très bien aussi." },
];

// ── Building blocks ──────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[11px] font-bold tracking-[.08em] text-[var(--color-ink-faint)] uppercase mb-2">
      {children}
    </span>
  );
}

function ChipGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="contents">
        <FieldLabel>{legend}</FieldLabel>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`flex flex-col items-start px-4 py-2.5 rounded-[10px] border text-left transition-colors duration-150 cursor-pointer
                ${
                  active
                    ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-accent-ink)]"
                    : "bg-[var(--color-surface)] border-[var(--color-line)] text-[var(--color-ink-subtle)] hover:border-[#3f3f46] hover:text-[var(--color-ink-muted)]"
                }`}
            >
              <span className="flex items-center gap-2 text-[13px] font-bold">
                {option.icon && <span aria-hidden="true">{option.icon}</span>}
                {option.label}
              </span>
              {option.hint && (
                <span
                  className={`text-[11px] font-medium ${
                    active ? "text-black/60" : "text-[#3f3f46]"
                  }`}
                >
                  {option.hint}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function NativeSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Option<string>[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[var(--color-surface)] border border-[var(--color-line)] text-[var(--color-ink-muted)] rounded-[10px] px-3.5 py-[11px] pr-9 text-[13px] font-medium appearance-none cursor-pointer outline-none focus:border-[var(--color-accent)] transition-colors"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-[5px] h-[5px] border-r-[1.5px] border-b-[1.5px] border-[var(--color-ink-faint)] rotate-45"
        />
      </div>
    </label>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2 mb-10" aria-label="Progression">
      {STEPS.map((s, i) => (
        <li key={s.title} className="flex items-center gap-2 flex-1">
          <div
            aria-current={i === step ? "step" : undefined}
            className={`w-7 h-7 rounded-full border-[1.5px] flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-colors duration-300
              ${
                i < step
                  ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-accent-ink)]"
                  : i === step
                    ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-transparent"
                    : "border-[var(--color-line)] text-[#3f3f46] bg-[var(--color-surface)]"
              }`}
          >
            {i < step ? <Check className="w-3 h-3" strokeWidth={3} aria-hidden="true" /> : i + 1}
            <span className="sr-only">
              Étape {i + 1} sur {STEPS.length}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`flex-1 h-px transition-colors duration-300 ${
                i < step ? "bg-[var(--color-accent)]" : "bg-[var(--color-line)]"
              }`}
            />
          )}
        </li>
      ))}
    </ol>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Onboarding() {
  const { profile, plan, isDataLoading, saveProfile, generatePlan, isGenerating } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TrainingProfile>(profile ?? DEFAULT_PROFILE);

  // Someone editing an existing profile should start from what they saved, not
  // from the defaults. The profile arrives after the first render, so adopt it
  // during render rather than in an effect (React's "adjusting state when a
  // prop changes" pattern) — an effect here would render the defaults first.
  const [syncedProfile, setSyncedProfile] = useState(profile);
  if (profile && profile !== syncedProfile) {
    setSyncedProfile(profile);
    setForm(profile);
  }

  function update<K extends keyof TrainingProfile>(key: K, value: TrainingProfile[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    setError(null);
    try {
      await saveProfile(form);
      await generatePlan();
      navigate("/profile", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  }

  if (isDataLoading && !profile && !plan) {
    return <LoadingScreen message="Chargement de votre profil…" />;
  }

  if (isGenerating) {
    return (
      <LoadingScreen message="On construit ton programme sur-mesure avec l'IA. Quelques secondes…" />
    );
  }

  const isLastStep = step === STEPS.length - 1;

  const recap: [string, string][] = [
    ["Objectif", labelFor.goal(form.goal)],
    ["Niveau", labelFor.experience(form.experience)],
    ["Fréquence", `${form.daysPerWeek} jours / semaine`],
    ["Durée", `${form.sessionLength} min / séance`],
    ["Équipement", labelFor.equipment(form.equipment)],
    ["Split", labelFor.split(form.split)],
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-lg mx-auto">
        <ProgressBar step={step} />

        <header className="mb-6">
          <p className="text-[10px] font-black tracking-[.12em] text-[var(--color-accent)] uppercase opacity-80 mb-1.5">
            Étape {step + 1} / {STEPS.length}
          </p>
          <h1 className="text-[26px] font-black tracking-tight leading-tight text-[var(--color-ink)] mb-1.5">
            {STEPS[step].title}
          </h1>
          <p className="text-[13px] text-[var(--color-ink-faint)] leading-relaxed">
            {STEPS[step].sub}
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 px-4 py-3 rounded-[10px] bg-red-500/10 border border-red-500/20 text-[var(--color-danger)] text-[13px]"
          >
            {error}
          </div>
        )}

        <div className="mb-8 space-y-5">
          {step === 0 && (
            <ChipGroup
              legend="Objectif principal"
              options={GOAL_OPTIONS}
              value={form.goal}
              onChange={(v) => update("goal", v)}
            />
          )}

          {step === 1 && (
            <>
              <ChipGroup
                legend="Niveau d'expérience"
                options={EXPERIENCE_OPTIONS}
                value={form.experience}
                onChange={(v) => update("experience", v)}
              />
              <div className="grid grid-cols-2 gap-3">
                <NativeSelect
                  label="Jours / semaine"
                  value={String(form.daysPerWeek)}
                  options={DAYS_OPTIONS}
                  onChange={(v) => update("daysPerWeek", Number(v))}
                />
                <NativeSelect
                  label="Durée séance"
                  value={String(form.sessionLength)}
                  options={SESSION_OPTIONS}
                  onChange={(v) => update("sessionLength", Number(v))}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <ChipGroup
                legend="Équipement"
                options={EQUIPMENT_OPTIONS}
                value={form.equipment}
                onChange={(v) => update("equipment", v)}
              />
              <ChipGroup
                legend="Type de split"
                options={SPLIT_OPTIONS}
                value={form.split}
                onChange={(v) => update("split", v)}
              />
            </>
          )}

          {step === 3 && (
            <>
              <label className="block">
                <FieldLabel>
                  Blessures ou limitations{" "}
                  <span className="text-[#3f3f46] normal-case font-normal tracking-normal">
                    (optionnel)
                  </span>
                </FieldLabel>
                <textarea
                  value={form.injuries ?? ""}
                  onChange={(e) => update("injuries", e.target.value || null)}
                  rows={3}
                  maxLength={500}
                  placeholder="Ex : douleur genou droit, épaule fragile…"
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-line)] text-[var(--color-ink-muted)] rounded-[10px] px-3.5 py-3 text-[13px] font-medium resize-none outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-[#3f3f46]"
                />
                <p className="text-[11px] text-[#3f3f46] mt-1.5">
                  Ces infos restent privées et servent uniquement à adapter ton programme.
                </p>
              </label>

              <div className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-[14px] overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--color-line)]">
                  <span className="text-[11px] font-bold tracking-[.08em] text-[var(--color-ink-faint)] uppercase">
                    Récapitulatif
                  </span>
                </div>
                <dl>
                  {recap.map(([key, val]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center px-4 py-3 border-b border-[var(--color-line)] last:border-b-0 text-[13px]"
                    >
                      <dt className="text-[var(--color-ink-faint)] font-medium">{key}</dt>
                      <dd className="text-[var(--color-accent)] font-bold">{val}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="px-5 py-3 rounded-[10px] border border-[var(--color-line)] text-[var(--color-ink-faint)] text-[13px] font-bold hover:border-[#3f3f46] hover:text-[var(--color-ink-muted)] transition-colors"
            >
              ← Retour
            </button>
          )}
          <button
            type="button"
            onClick={() => (isLastStep ? submit() : setStep((s) => s + 1))}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[10px] bg-[var(--color-accent)] text-[var(--color-accent-ink)] text-[14px] font-black uppercase tracking-wide hover:bg-[var(--color-accent-strong)] transition-colors"
          >
            {isLastStep ? (
              "Générer mon programme"
            ) : (
              <>
                Continuer <ArrowRight className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
