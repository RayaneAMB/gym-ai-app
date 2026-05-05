import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, Target, Calendar, Dumbbell, TrendingUp, ChevronDown, Zap, X, Settings2 } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

// ── Form options (same as Onboarding) ──────────────────────────────────────
const goalOptions = [
  { value: "Bulk", label: "Prendre du muscle" },
  { value: "Cut", label: "Perdre du gras (Sèche)" },
  { value: "recomp", label: "Recomposition corporelle" },
  { value: "strength", label: "Gagner en force" },
  { value: "endurance", label: "Améliorer l'endurance" },
];
const experienceOptions = [
  { value: "Debutant", label: "Débutant (0-1 an)" },
  { value: "Intermediate", label: "Intermédiaire (1-3 ans)" },
  { value: "Advanced", label: "Avancé (3+ ans)" },
];
const daysOptions = [
  { value: "2", label: "2 jours / semaine" },
  { value: "3", label: "3 jours / semaine" },
  { value: "4", label: "4 jours / semaine" },
  { value: "5", label: "5 jours / semaine" },
  { value: "6", label: "6 jours / semaine" },
];
const sessionOptions = [
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "60 min" },
  { value: "90", label: "90 min" },
];
const equipmentOptions = [
  { value: "Full Gym", label: "Salle complète" },
  { value: "Home Gym", label: "Maison" },
  { value: "Dumbbells", label: "Haltères" },
];
const splitOptions = [
  { value: "Full Body", label: "Full Body" },
  { value: "Upper/Lower", label: "Haut / Bas" },
  { value: "Push/Pull/Legs", label: "Push / Pull / Jambes" },
  { value: "Custom", label: "Personnalisé par IA" },
];

// ── Reusable styled select ──────────────────────────────────────────────────
function ModalSelect({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-500 mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="px-3 py-2 text-xs font-bold uppercase tracking-wider border transition-all duration-150 text-left"
            style={{
              borderColor: value === opt.value ? "#CCFF00" : "rgba(255,255,255,0.08)",
              background: value === opt.value ? "rgba(204,255,0,0.08)" : "rgba(255,255,255,0.02)",
              color: value === opt.value ? "#CCFF00" : "#71717a",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function Profile() {
  const { user, isloading, plan, saveProfile, generatePlan } = useAuth();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [openDay, setOpenDay] = useState<number | null>(0);

  // Modal form state — pre-filled with sensible defaults
  const [form, setForm] = useState({
    goal: "Bulk",
    experience: "Intermediate",
    days: "4",
    session: "60",
    equipment: "Full Gym",
    split: "Push/Pull/Legs",
    injuries: "",
  });

  if (!user && !isloading) return <Navigate to="/auth/sign-in" replace />;
  if (!plan) return <Navigate to="/onboarding" replace />;

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRecalibrate() {
    setIsRegenerating(true);
    setShowModal(false);
    try {
      await saveProfile({
        goal: form.goal as any,
        experience: form.experience as any,
        daysPerWeek: parseInt(form.days),
        sessionLength: parseInt(form.session),
        equipment: form.equipment as any,
        injuries: form.injuries || null,
        splitPreference: form.split as any,
      });
      await generatePlan();
    } finally {
      setIsRegenerating(false);
    }
  }

  function formatDate(dateValue: Date | string) {
    return new Date(dateValue).toLocaleDateString("fr-FR", {
      month: "long", day: "numeric", year: "numeric",
    });
  }

  const stats = [
    { label: "Objectif", val: plan.overview.goal, icon: Target, color: "#CCFF00" },
    { label: "Fréquence", val: plan.overview.frequency, icon: Calendar, color: "#00FFCC" },
    { label: "Split", val: plan.overview.split, icon: Dumbbell, color: "#FF6B35" },
    { label: "Version", val: `V${plan.version}`, icon: TrendingUp, color: "#C084FC" },
  ];

  return (
    <div
      className="min-h-screen pb-20 text-white"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% -10%, #1a2a0a 0%, #09090B 60%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Noise overlay */}
      <div
        style={{
          position: "fixed", inset: 0, opacity: 0.03, pointerEvents: "none", zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-28">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="mb-14"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#CCFF00] mb-3">
                Programme Généré par IA
              </p>
              <h1
                className="text-6xl md:text-8xl font-black uppercase leading-none tracking-tighter"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Athlete
                <br />
                <span className="text-transparent" style={{ WebkitTextStroke: "2px #CCFF00" }}>
                  Protocol
                </span>
              </h1>
              <p className="text-zinc-500 text-sm mt-4">
                Créé le {formatDate(plan.created_at)} · Version {plan.version}
              </p>
            </div>

            {/* Recalibrer button — now opens modal */}
            <motion.button
              onClick={() => setShowModal(true)}
              disabled={isRegenerating}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="relative flex items-center gap-3 px-6 py-3 font-bold text-sm uppercase tracking-widest overflow-hidden border-2 border-[#CCFF00] text-[#CCFF00] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              <motion.span
                className="absolute inset-0 bg-[#CCFF00]"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ zIndex: 0 }}
              />
              <span className="relative z-10 flex items-center gap-2 mix-blend-exclusion">
                <motion.span
                  animate={isRegenerating ? { rotate: 360 } : { rotate: 0 }}
                  transition={isRegenerating ? { repeat: Infinity, duration: 0.8, ease: "linear" } : {}}
                >
                  <RefreshCcw className="w-4 h-4" />
                </motion.span>
                {isRegenerating ? "Génération..." : "Recalibrer"}
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="group relative p-5 border border-white/8 rounded-sm overflow-hidden cursor-default"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(circle at 50% 50%, ${stat.color}10 0%, transparent 70%)` }}
              />
              <stat.icon className="w-5 h-5 mb-4" style={{ color: stat.color }} />
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-zinc-500 mb-1">{stat.label}</p>
              <p className="text-sm font-bold text-white leading-tight line-clamp-2">{stat.val}</p>
            </motion.div>
          ))}
        </div>

        {/* NOTES BANNER */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show" className="mb-12 p-6 border-l-2 border-[#CCFF00] bg-[#CCFF00]/5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-[#CCFF00]" />
            <p className="text-xs font-bold tracking-widest uppercase text-[#CCFF00]">Notes du Programme</p>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed">{plan.overview.notes}</p>
        </motion.div>

        {/* WEEKLY SCHEDULE */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-6 text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
            Programme Hebdomadaire
          </h2>
          <div className="space-y-2">
            {plan.weeklySchedule.map((day: any, i: number) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" animate="show" className="border border-white/8 overflow-hidden" style={{ background: "rgba(255,255,255,0.015)" }}>
                <button
                  onClick={() => setOpenDay(openDay === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black tracking-widest uppercase text-[#CCFF00] w-6 text-center" style={{ fontFamily: "'Oswald', sans-serif" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-lg font-black uppercase tracking-tight" style={{ fontFamily: "'Oswald', sans-serif" }}>{day.day}</p>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest">{day.focus}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-600">{(day.exercices || day.exercises || []).length} exercices</span>
                    <motion.div animate={{ rotate: openDay === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    </motion.div>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {openDay === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="px-6 pb-4 space-y-3 border-t border-white/5 pt-4">
                        {(day.exercices || day.exercises || []).map((ex: any, j: number) => (
                          <motion.div
                            key={j}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: j * 0.05 }}
                            className="flex items-start justify-between gap-4 py-3 border-b border-white/5 last:border-0"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-white">{ex.name}</p>
                              {ex.notes && <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{ex.notes}</p>}
                            </div>
                            <div className="flex gap-3 shrink-0">
                              {[["Séries", ex.sets, "#CCFF00"], ["Reps", ex.reps, "white"], ["Repos", ex.rest, "white"], ["RPE", ex.rpe, "#71717a"]].map(([lbl, val, col]) => (
                                <div key={lbl as string} className="text-center">
                                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{lbl}</p>
                                  <p className="text-sm font-black" style={{ color: col as string }}>{val}</p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* PROGRESSION */}
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="show" className="mt-8 p-6 border border-white/8 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.015)" }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20" style={{ background: "#CCFF00", transform: "translate(30%, -30%)" }} />
          <p className="text-xs font-bold tracking-widest uppercase text-[#CCFF00] mb-3">Stratégie de Progression</p>
          <p className="text-zinc-300 text-sm leading-relaxed relative z-10">{plan.progression}</p>
        </motion.div>
      </div>

      {/* ── RECALIBRATION MODAL ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            />

            {/* Drawer — slides up from bottom */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto"
              style={{
                background: "#0f0f10",
                borderTop: "2px solid rgba(204,255,0,0.3)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-zinc-700" />
              </div>

              <div className="max-w-2xl mx-auto px-6 pb-10 pt-4">
                {/* Modal header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Settings2 className="w-5 h-5 text-[#CCFF00]" />
                    <div>
                      <h2 className="text-xl font-black uppercase tracking-tight text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
                        Recalibrer le Protocol
                      </h2>
                      <p className="text-xs text-zinc-500">Ajustez vos paramètres avant de régénérer</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-7">
                  <ModalSelect label="Objectif principal" value={form.goal} onChange={(v) => updateForm("goal", v)} options={goalOptions} />
                  <ModalSelect label="Niveau d'expérience" value={form.experience} onChange={(v) => updateForm("experience", v)} options={experienceOptions} />

                  <div className="grid grid-cols-2 gap-6">
                    <ModalSelect label="Jours par semaine" value={form.days} onChange={(v) => updateForm("days", v)} options={daysOptions} />
                    <ModalSelect label="Durée des séances" value={form.session} onChange={(v) => updateForm("session", v)} options={sessionOptions} />
                  </div>

                  <ModalSelect label="Équipement disponible" value={form.equipment} onChange={(v) => updateForm("equipment", v)} options={equipmentOptions} />
                  <ModalSelect label="Type de split" value={form.split} onChange={(v) => updateForm("split", v)} options={splitOptions} />

                  {/* Injuries textarea */}
                  <div>
                    <p className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-500 mb-2">Blessures / Limitations (optionnel)</p>
                    <textarea
                      value={form.injuries}
                      onChange={(e) => updateForm("injuries", e.target.value)}
                      placeholder="Ex: douleur épaule droite, genou fragile..."
                      rows={2}
                      className="w-full bg-transparent border border-white/8 px-4 py-3 text-sm text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none focus:border-[#CCFF00]/40 transition-colors"
                    />
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 text-sm font-bold uppercase tracking-widest border border-white/10 text-zinc-500 hover:text-white hover:border-white/30 transition-colors"
                  >
                    Annuler
                  </button>
                  <motion.button
                    onClick={handleRecalibrate}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 font-black text-sm uppercase tracking-widest bg-[#CCFF00] text-black"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Générer le nouveau programme
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}