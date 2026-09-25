import { z } from "zod";

/**
 * The plan shape persisted in `trainings_plan.plan_json` and returned to the client.
 *
 * Models are inconsistent about numeric fields — `sets` comes back as 4 or "3-4",
 * `reps` as 10 or "8-12", `rpe` as 8 or "7-8". Rather than fight that, `sets`/`reps`
 * are normalized to strings and `rpe` to a single number, so the UI never has to
 * guess.
 */

const looseText = z.union([z.string(), z.number()]).transform((v) => String(v).trim());

const rpeSchema = z
  .union([z.string(), z.number()])
  .transform((v) => {
    // "7-8" -> 8 (top of range), "8" -> 8
    const parts = String(v).match(/\d+(?:\.\d+)?/g);
    if (!parts?.length) return 7;
    return Math.round(Number(parts[parts.length - 1]));
  })
  .pipe(z.number().min(1).max(10).catch(7));

export const exerciseSchema = z
  .object({
    name: looseText.pipe(z.string().min(1)).catch("Exercice"),
    sets: looseText.catch("3"),
    reps: looseText.catch("8-12"),
    rest: looseText.catch("60-90 sec"),
    rpe: rpeSchema.catch(7),
    notes: looseText.nullish().transform((v) => v || undefined),
    alternatives: z
      .array(looseText)
      .nullish()
      .transform((v) => (v?.length ? v : undefined)),
  })
  // Tolerate the singular/variant keys models like to emit.
  .passthrough()
  .transform((ex) => ({
    name: ex.name,
    sets: ex.sets,
    reps: ex.reps,
    rest: ex.rest,
    rpe: ex.rpe,
    notes: ex.notes,
    alternatives:
      ex.alternatives ??
      coerceStringArray((ex as Record<string, unknown>).alternative) ??
      coerceStringArray((ex as Record<string, unknown>).alternative_exercises),
  }));

export const daySchema = z
  .object({
    day: looseText.catch("Jour"),
    focus: looseText.catch("Full Body"),
    exercises: z.array(exerciseSchema).optional(),
    // Historical misspelling written by earlier versions of this server.
    exercices: z.array(exerciseSchema).optional(),
  })
  .passthrough()
  .transform((d) => ({
    day: d.day,
    focus: d.focus,
    exercises: d.exercises ?? d.exercices ?? [],
  }));

export const planSchema = z.object({
  overview: z
    .object({
      goal: looseText.catch("Programme personnalisé"),
      frequency: looseText.catch(""),
      split: looseText.catch(""),
      notes: looseText.catch(""),
    })
    .passthrough(),
  weeklySchedule: z.array(daySchema).min(1, "Le plan ne contient aucune séance"),
  progression: looseText.catch(""),
});

export type Exercise = z.infer<typeof exerciseSchema>;
export type DaySchedule = z.infer<typeof daySchema>;
export type TrainingPlanContent = z.infer<typeof planSchema>;

function coerceStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const items = value.map((v) => String(v).trim()).filter(Boolean);
    return items.length ? items : undefined;
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\s*[,;/]\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return undefined;
}
