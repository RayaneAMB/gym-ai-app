import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Check } from "lucide-react";
import type { UserProfile } from "../types";
import { useAuth } from "../context/AuthContext";

const GOALS = [
  { value: "Bulk",      label: "Prise de masse",      icon: "💪" },
  { value: "Cut",       label: "Sèche / Fat loss",    icon: "🔥" },
  { value: "recomp",    label: "Recomposition",       icon: "⚖️" },
  { value: "strength",  label: "Force maximale",      icon: "🏋️" },
  { value: "endurance", label: "Cardio / Endurance",  icon: "🏃" },
];

const EXP = [
  { value: "Debutant",      label: "Débutant",      sub: "0-1 an" },
  { value: "Intermediate",  label: "Intermédiaire", sub: "1-3 ans" },
  { value: "Advanced",      label: "Avancé",        sub: "3+ ans" },
];

const EQUIP = [
  { value: "Full Gym",   label: "Salle complète", icon: "🏟️" },
  { value: "Home Gym",   label: "Home gym",       icon: "🏠" },
  { value: "Dumbbells",  label: "Haltères seuls", icon: "🔩" },
];

const SPLIT = [
  { value: "Full Body",       label: "Full Body" },
  { value: "Upper/Lower",     label: "Haut / Bas" },
  { value: "Push/Pull/Legs",  label: "PPL" },
  { value: "Custom",          label: "IA choisit ✦" },
];

const DAYS  = ["2","3","4","5","6"];
const DURS  = [
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "60 min" },
  { value: "90", label: "90 min" },
];

const STEPS = [
  { tag: "Étape 1 / 4", title: "Quel est ton objectif ?",    sub: "On calibre tout le programme autour de ça." },
  { tag: "Étape 2 / 4", title: "Ton niveau & ton planning",  sub: "Pour adapter la charge et la fréquence." },
  { tag: "Étape 3 / 4", title: "Équipement & structure",     sub: "On choisit les exercices selon ce que tu as." },
  { tag: "Étape 4 / 4", title: "Derniers détails",           sub: "Blessures, limitations — ou aucune, c'est cool aussi." },
];

const RECAP_LABELS: Record<string, Record<string, string>> = {
  goal:  { Bulk:"Prise de masse", Cut:"Sèche", recomp:"Recomposition", strength:"Force", endurance:"Endurance" },
  exp:   { Debutant:"Débutant", Intermediate:"Intermédiaire", Advanced:"Avancé" },
  equip: { "Full Gym":"Salle complète", "Home Gym":"Home gym", Dumbbells:"Haltères" },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Chip({
  label, icon, active, onClick,
}: { label: string; icon?: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] border text-[13px] font-semibold transition-all duration-150 cursor-pointer select-none
        ${active
          ? "bg-[#CCFF00] border-[#CCFF00] text-black"
          : "bg-[#111113] border-[#1e1e22] text-[#71717a] hover:border-[#3f3f46] hover:text-[#a1a1aa]"
        }`}
    >
      {icon && <span className="text-[14px] leading-none">{icon}</span>}
      {label}
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[11px] font-bold tracking-[.08em] text-[#52525b] uppercase mb-2">
      {children}
    </span>
  );
}

function NativeSelect({
  value, onChange, children,
}: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-[#111113] border border-[#1e1e22] text-[#a1a1aa] rounded-[10px] px-3.5 py-[11px] pr-9 text-[13px] font-medium appearance-none cursor-pointer outline-none focus:border-[#CCFF00] transition-colors"
      >
        {children}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-[5px] h-[5px] border-r-[1.5px] border-b-[1.5px] border-[#52525b] rotate-45" />
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {STEPS.map((_, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div className={`w-7 h-7 rounded-full border-[1.5px] flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all duration-300
            ${i < step  ? "bg-[#CCFF00] border-[#CCFF00] text-black"
            : i === step ? "border-[#CCFF00] text-[#CCFF00] bg-transparent"
            :              "border-[#1e1e22] text-[#3f3f46] bg-[#111]"}`}
          >
            {i < step ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px transition-all duration-300 ${i < step ? "bg-[#CCFF00]" : "bg-[#1e1e22]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Step content ──────────────────────────────────────────────────────────────

function Step1({ form, update }: { form: any; update: (k: string, v: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Objectif principal</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {GOALS.map(g => (
            <Chip key={g.value} label={g.label} icon={g.icon}
              active={form.goal === g.value} onClick={() => update("goal", g.value)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Step2({ form, update }: { form: any; update: (k: string, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>Niveau d'expérience</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {EXP.map(e => (
            <button
              key={e.value} type="button"
              onClick={() => update("experience", e.value)}
              className={`flex flex-col px-4 py-2.5 rounded-[10px] border text-left transition-all duration-150 cursor-pointer
                ${form.experience === e.value
                  ? "bg-[#CCFF00] border-[#CCFF00] text-black"
                  : "bg-[#111113] border-[#1e1e22] text-[#71717a] hover:border-[#3f3f46]"}`}
            >
              <span className="text-[13px] font-bold">{e.label}</span>
              <span className={`text-[11px] font-medium ${form.experience === e.value ? "text-black/60" : "text-[#3f3f46]"}`}>{e.sub}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Jours / semaine</FieldLabel>
          <NativeSelect value={form.days} onChange={v => update("days", v)}>
            {DAYS.map(d => <option key={d} value={d}>{d} jours</option>)}
          </NativeSelect>
        </div>
        <div>
          <FieldLabel>Durée séance</FieldLabel>
          <NativeSelect value={form.session} onChange={v => update("session", v)}>
            {DURS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </NativeSelect>
        </div>
      </div>
    </div>
  );
}

function Step3({ form, update }: { form: any; update: (k: string, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>Équipement</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {EQUIP.map(e => (
            <Chip key={e.value} label={e.label} icon={e.icon}
              active={form.equipment === e.value} onClick={() => update("equipment", e.value)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Type de split</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {SPLIT.map(s => (
            <Chip key={s.value} label={s.label}
              active={form.splitPreference === s.value} onClick={() => update("splitPreference", s.value)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Step4({ form, update }: { form: any; update: (k: string, v: any) => void }) {
  const recap = [
    ["Objectif",   RECAP_LABELS.goal[form.goal]  || form.goal],
    ["Niveau",     RECAP_LABELS.exp[form.experience] || form.experience],
    ["Fréquence",  `${form.days} jours / semaine`],
    ["Durée",      `${form.session} min / séance`],
    ["Équipement", RECAP_LABELS.equip[form.equipment] || form.equipment],
    ["Split",      form.splitPreference],
  ];

  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>
          Blessures ou limitations{" "}
          <span className="text-[#3f3f46] normal-case font-normal tracking-normal">(optionnel)</span>
        </FieldLabel>
        <textarea
          value={form.injuries}
          onChange={e => update("injuries", e.target.value)}
          rows={3}
          placeholder="Ex : douleur genou droit, épaule fragile..."
          className="w-full bg-[#111113] border border-[#1e1e22] text-[#a1a1aa] rounded-[10px] px-3.5 py-3 text-[13px] font-medium resize-none outline-none focus:border-[#CCFF00] transition-colors placeholder:text-[#3f3f46]"
        />
        <p className="text-[11px] text-[#3f3f46] mt-1.5">Ces infos restent privées et servent uniquement à adapter ton programme.</p>
      </div>

      {/* Récap */}
      <div className="bg-[#111113] border border-[#1e1e22] rounded-[14px] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e1e22]">
          <span className="text-[11px] font-bold tracking-[.08em] text-[#52525b] uppercase">Récapitulatif</span>
        </div>
        {recap.map(([k, v], i) => (
          <div key={i} className="flex justify-between items-center px-4 py-3 border-b border-[#1e1e22] last:border-b-0 text-[13px]">
            <span className="text-[#52525b] font-medium">{k}</span>
            <span className="text-[#CCFF00] font-bold">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Onboarding() {
  const { saveProfile, generatePlan } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [isGenerating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    goal:             "Bulk",
    experience:       "Intermediate",
    days:             "4",
    session:          "60",
    equipment:        "Full Gym",
    splitPreference:  "Full Body",
    injuries:         "",
  });

  function update(key: string, value: any) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function submit() {
    setError(null);
    const profile: Omit<UserProfile, "userId" | "updatedAt"> = {
      goal:             form.goal as UserProfile["goal"],
      experience:       form.experience as UserProfile["experience"],
      daysPerWeek:      parseInt(form.days),
      sessionLength:    parseInt(form.session),
      equipment:        form.equipment as UserProfile["equipment"],
      splitPreference:  form.splitPreference as UserProfile["splitPreference"],
      injuries:         form.injuries || null,
    };
    try {
      setGenerating(true);
      await saveProfile(profile);
      await generatePlan();
      navigate("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setGenerating(false);
    }
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-5 text-center max-w-xs">
          <div className="w-12 h-12 rounded-full border-2 border-[#1e1e22] border-t-[#CCFF00] animate-spin" />
          <div>
            <p className="text-lg font-black tracking-tight text-white mb-1">Génération en cours…</p>
            <p className="text-[13px] text-[#52525b] leading-relaxed">
              On construit ton programme sur-mesure avec l'IA. Quelques secondes…
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] pt-24 pb-16 px-6">
      <div className="max-w-lg mx-auto">

        <ProgressBar step={step} />

        {/* Header */}
        <div className="mb-6">
          <p className="text-[10px] font-black tracking-[.12em] text-[#CCFF00] uppercase opacity-80 mb-1.5">
            {STEPS[step].tag}
          </p>
          <h1 className="text-[26px] font-black tracking-tight leading-tight text-white mb-1.5">
            {STEPS[step].title}
          </h1>
          <p className="text-[13px] text-[#52525b] leading-relaxed">{STEPS[step].sub}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]">
            {error}
          </div>
        )}

        {/* Step content */}
        <div className="mb-8">
          {step === 0 && <Step1 form={form} update={update} />}
          {step === 1 && <Step2 form={form} update={update} />}
          {step === 2 && <Step3 form={form} update={update} />}
          {step === 3 && <Step4 form={form} update={update} />}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="px-5 py-3 rounded-[10px] border border-[#1e1e22] bg-transparent text-[#52525b] text-[13px] font-bold hover:border-[#3f3f46] hover:text-[#a1a1aa] transition-all"
            >
              ← Retour
            </button>
          )}
          <button
            type="button"
            onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : submit()}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[10px] bg-[#CCFF00] text-black text-[14px] font-black uppercase tracking-wide hover:opacity-90 transition-opacity"
          >
            {step < STEPS.length - 1 ? (
              <>Continuer <ArrowRight className="w-4 h-4" strokeWidth={2.5} /></>
            ) : (
              <>Générer mon programme</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}