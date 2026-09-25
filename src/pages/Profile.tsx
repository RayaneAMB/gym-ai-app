import { useState } from "react";
import { Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  Dumbbell,
  RefreshCcw,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import type { DaySchedule, Exercise, TrainingProfile } from "../types";
import { DEFAULT_PROFILE } from "../lib/labels";
import { LoadingScreen, Spinner } from "../componentes/ui/LoadingScreen";
import RecalibrateDrawer from "../componentes/plan/RecalibrateDrawer";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: EASE },
  }),
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function rpeTone(rpe: number) {
  if (rpe >= 8) return "var(--color-danger)";
  if (rpe >= 7) return "var(--color-warn)";
  return "var(--color-ok)";
}

// ── Exercise row ─────────────────────────────────────────────────────────────

function ExerciseRow({ exercise, index }: { exercise: Exercise; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 py-3 border-b border-white/5 last:border-0"
    >
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-[var(--color-ink)]">{exercise.name}</p>
        {exercise.notes && (
          <p className="text-xs text-[var(--color-ink-subtle)] mt-0.5 leading-relaxed">
            {exercise.notes}
          </p>
        )}
        {exercise.alternatives?.length ? (
          <p className="text-[11px] text-[var(--color-ink-faint)] mt-1.5">
            <span className="uppercase tracking-wider font-bold">Alternatives : </span>
            {exercise.alternatives.join(" · ")}
          </p>
        ) : null}
      </div>

      <dl className="flex gap-4 shrink-0">
        {(
          [
            ["Séries", exercise.sets, "var(--color-accent)"],
            ["Reps", exercise.reps, "var(--color-ink)"],
            ["Repos", exercise.rest, "var(--color-ink)"],
            ["RPE", String(exercise.rpe), rpeTone(exercise.rpe)],
          ] as const
        ).map(([label, value, color]) => (
          <div key={label} className="text-center">
            <dt className="text-[10px] text-[var(--color-ink-faint)] uppercase tracking-wider">
              {label}
            </dt>
            <dd className="text-sm font-black" style={{ color }}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );
}

// ── Day accordion ────────────────────────────────────────────────────────────

function DayPanel({
  day,
  index,
  isOpen,
  onToggle,
}: {
  day: DaySchedule;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = `day-panel-${index}`;

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="border border-white/8 overflow-hidden bg-white/[0.015]"
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="font-display text-xs font-black tracking-widest uppercase text-[var(--color-accent)] w-6 text-center">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <p className="font-display text-lg font-black uppercase tracking-tight">{day.day}</p>
            <p className="text-xs text-[var(--color-ink-subtle)] uppercase tracking-widest">
              {day.focus}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--color-ink-faint)]">
            {day.exercises.length} exercice{day.exercises.length > 1 ? "s" : ""}
          </span>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-[var(--color-ink-subtle)]" aria-hidden="true" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 space-y-3 border-t border-white/5 pt-4">
              {day.exercises.map((exercise, i) => (
                <ExerciseRow key={`${exercise.name}-${i}`} exercise={exercise} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Profile() {
  const {
    plan,
    profile,
    isDataLoading,
    isGenerating,
    error,
    clearError,
    saveProfile,
    generatePlan,
  } = useAuth();

  const [showDrawer, setShowDrawer] = useState(false);
  const [openDay, setOpenDay] = useState<number | null>(0);

  // The plan arrives after the session does. Redirecting on `!plan` before the
  // fetch settled is what used to bounce returning athletes into onboarding.
  if (isDataLoading && !plan) return <LoadingScreen message="Chargement de votre programme…" />;
  if (isGenerating) {
    return <LoadingScreen message="Recalibrage en cours. L'IA réécrit votre protocole…" />;
  }
  if (!plan) return <Navigate to="/onboarding" replace />;

  async function handleRecalibrate(next: TrainingProfile) {
    setShowDrawer(false);
    try {
      await saveProfile(next);
      await generatePlan();
    } catch {
      // `error` from the context drives the banner below.
    }
  }

  const { overview, weeklySchedule, progression } = plan.plan;

  const stats = [
    { label: "Objectif", value: overview.goal, icon: Target, color: "#CCFF00" },
    { label: "Fréquence", value: overview.frequency, icon: Calendar, color: "#00FFCC" },
    { label: "Split", value: overview.split, icon: Dumbbell, color: "#FF6B35" },
    { label: "Version", value: `V${plan.version}`, icon: TrendingUp, color: "#C084FC" },
  ];

  return (
    <div
      className="min-h-screen pb-20 text-[var(--color-ink)] bg-noise"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, #1a2a0a 0%, var(--color-bg) 60%)",
      }}
    >
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-28">
        <motion.header
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-14"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-[var(--color-accent)] mb-3">
                Programme généré par IA
              </p>
              <h1 className="font-display text-6xl md:text-8xl font-black uppercase leading-none tracking-tighter">
                Athlete
                <br />
                <span className="text-stroke-accent">Protocol</span>
              </h1>
              <p className="text-[var(--color-ink-subtle)] text-sm mt-4">
                Créé le {formatDate(plan.created_at)} · Version {plan.version}
              </p>
            </div>

            <button
              onClick={() => setShowDrawer(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 font-display font-bold text-sm uppercase tracking-widest border-2 border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-ink)] transition-colors"
            >
              <RefreshCcw className="w-4 h-4" aria-hidden="true" />
              Recalibrer
            </button>
          </div>
        </motion.header>

        {error && (
          <div
            role="alert"
            className="mb-8 flex items-start justify-between gap-4 px-4 py-3 border border-red-500/20 bg-red-500/10 text-[var(--color-danger)] text-sm"
          >
            <span>{error}</span>
            <button
              onClick={clearError}
              className="shrink-0 text-xs uppercase tracking-wider font-bold hover:underline"
            >
              Fermer
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="group relative p-5 border border-white/8 rounded-sm overflow-hidden bg-white/[0.02]"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${stat.color}10 0%, transparent 70%)`,
                }}
              />
              <stat.icon className="w-5 h-5 mb-4" style={{ color: stat.color }} aria-hidden="true" />
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--color-ink-subtle)] mb-1">
                {stat.label}
              </p>
              <p className="text-sm font-bold leading-tight line-clamp-2">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {overview.notes && (
          <motion.section
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mb-12 p-6 border-l-2 border-[var(--color-accent)] bg-[var(--color-accent)]/5"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-[var(--color-accent)]" aria-hidden="true" />
              <h2 className="text-xs font-bold tracking-widest uppercase text-[var(--color-accent)]">
                Notes du programme
              </h2>
            </div>
            <p className="text-[var(--color-ink-muted)] text-sm leading-relaxed">
              {overview.notes}
            </p>
          </motion.section>
        )}

        <motion.section custom={5} variants={fadeUp} initial="hidden" animate="show">
          <h2 className="font-display text-2xl font-black uppercase tracking-tight mb-6">
            Programme hebdomadaire
          </h2>
          <div className="space-y-2">
            {weeklySchedule.map((day, i) => (
              <DayPanel
                key={`${day.day}-${i}`}
                day={day}
                index={i}
                isOpen={openDay === i}
                onToggle={() => setOpenDay(openDay === i ? null : i)}
              />
            ))}
          </div>
        </motion.section>

        {progression && (
          <motion.section
            custom={6}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-8 p-6 border border-white/8 relative overflow-hidden bg-white/[0.015]"
          >
            <div
              aria-hidden="true"
              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 bg-[var(--color-accent)] translate-x-[30%] -translate-y-[30%]"
            />
            <h2 className="text-xs font-bold tracking-widest uppercase text-[var(--color-accent)] mb-3">
              Stratégie de progression
            </h2>
            <p className="text-[var(--color-ink-muted)] text-sm leading-relaxed relative z-10">
              {progression}
            </p>
          </motion.section>
        )}

        {isDataLoading && (
          <div className="mt-8 flex justify-center">
            <Spinner />
          </div>
        )}
      </div>

      <RecalibrateDrawer
        open={showDrawer}
        profile={profile ?? DEFAULT_PROFILE}
        onClose={() => setShowDrawer(false)}
        onSubmit={handleRecalibrate}
      />
    </div>
  );
}
