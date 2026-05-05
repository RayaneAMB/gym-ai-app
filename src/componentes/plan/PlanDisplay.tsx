import { Dumbbell, Info, Timer, Zap, Target } from "lucide-react";
import type { DaySchedule, Exercise } from "../../types";
import { Card } from "../ui/Card";

function ExerciseRow({
  exercise,
  index,
}: {
  exercise: Exercise;
  index: number;
}) {
  return (
    <tr className="border-b border-[var(--color-border)]/40 last:border-0 hover:bg-white/[0.02] transition-colors group">
      <td className="py-5 pr-4 pl-6">
        <div className="flex items-start gap-4">
          <span className="text-sm font-bold text-[var(--color-muted)] w-6 mt-0.5 text-right">
            {index + 1}.
          </span>
          <div className="flex-1">
            {/* AMÉLIORATION : Nom de l'exercice blanc, gras et très visible */}
            <p className="text-base font-extrabold text-[var(--color-foreground)] tracking-wide">
              {exercise.name}
            </p>
            
            {/* AMÉLIORATION : Notes encadrées pour ressembler à un "conseil de pro" */}
            {exercise.notes && (
              <div className="mt-2.5 flex items-start gap-2.5 text-xs text-[var(--color-foreground)]/80 bg-white/5 p-3 rounded-lg border border-white/5">
                <Info className="w-4 h-4 shrink-0 text-[var(--color-accent)] mt-0.5" />
                <span className="leading-relaxed">{exercise.notes}</span>
              </div>
            )}
          </div>
        </div>
      </td>

      {/* AMÉLIORATION : Badge "Séries x Reps" beaucoup plus lisible */}
      <td className="py-5 px-4 text-center whitespace-nowrap">
        <div className="inline-flex items-center justify-center gap-1.5 bg-[var(--color-accent)]/10 px-4 py-2 rounded-xl border border-[var(--color-accent)]/20 shadow-sm">
          <span className="text-[var(--color-accent)] font-extrabold text-base">
            {exercise.sets}
          </span>
          <span className="text-[var(--color-muted)] text-sm mx-0.5">×</span>
          {/* Les répétitions sont maintenant bien blanches/claires */}
          <span className="text-[var(--color-foreground)] font-bold text-base">
            {exercise.reps}
          </span>
        </div>
      </td>

      {/* AMÉLIORATION : Temps de repos avec icône */}
      <td className="py-5 px-4 text-center">
        <div className="inline-flex items-center justify-center gap-2 text-[var(--color-muted)] group-hover:text-[var(--color-foreground)] transition-colors">
          <Timer className="w-4 h-4 opacity-70" />
          <span className="font-semibold text-sm">{exercise.rest}</span>
        </div>
      </td>

      {/* AMÉLIORATION : Badge RPE stylisé en "pilule" */}
      <td className="py-5 px-6 text-center">
        <div className="flex justify-center">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-extrabold shadow-sm
              ${
                exercise.rpe >= 8
                  ? `bg-red-500/15 text-red-400 border border-red-500/20`
                  : exercise.rpe >= 7
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                    : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
              }`}
          >
            <Zap className="w-3.5 h-3.5" />
            {exercise.rpe}
          </div>
        </div>
      </td>
    </tr>
  );
}

function DayCard({ schedule }: { schedule: DaySchedule }) {
  const exercisesList = schedule.exercises || (schedule as any).exercices || [];

  return (
    // On retire le padding de la Card pour gérer l'en-tête de bord à bord
    <Card variant="bordered" className="overflow-hidden p-0 mb-8 bg-white/[0.01]">
      
      {/* AMÉLIORATION : Un Header de jour massif et stylé */}
      <div className="bg-gradient-to-r from-white/5 to-transparent p-6 border-b border-[var(--color-border)]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-2xl text-[var(--color-foreground)] mb-1 tracking-tight">
            {schedule.day}
          </h3>
          <p className="text-sm font-bold text-[var(--color-accent)] uppercase tracking-wider flex items-center gap-2">
             <Target className="w-4 h-4"/> {schedule.focus}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-foreground)] bg-white/10 px-4 py-2 rounded-xl border border-white/5">
          <Dumbbell className="w-4 h-4 text-[var(--color-accent)]" />
          <span>{exercisesList.length} exercices</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.02]">
            <tr className="text-[var(--color-muted)] text-xs uppercase tracking-widest border-b border-[var(--color-border)]/50">
              <th className="text-left py-4 px-6 font-bold">Exercice</th>
              <th className="py-4 px-4 font-bold text-center">Séries × Reps</th>
              <th className="py-4 px-4 font-bold text-center">Repos</th>
              <th className="py-4 px-6 font-bold text-center">RPE</th>
            </tr>
          </thead>
          <tbody>
            {exercisesList.map((exercise: Exercise, key: number) => (
              <ExerciseRow key={key} exercise={exercise} index={key} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

interface PlanDisplayProps {
  weeklySchedule: DaySchedule[];
}

export function PlanDisplay({ weeklySchedule }: PlanDisplayProps) {
  const safeSchedule = weeklySchedule || [];

  return (
    <div className="space-y-6 mb-8 mt-4">
      {safeSchedule.map((schedule, key) => (
        <DayCard key={key} schedule={schedule} />
      ))}
    </div>
  );
}