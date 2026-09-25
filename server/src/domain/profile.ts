import { z } from "zod";

/**
 * Canonical vocabulary for a training profile.
 *
 * Everything is stored and reasoned about in snake_case. The UI used to send
 * display strings ("Full Gym", "Push/Pull/Legs", "Debutant"), so rows written
 * before this module existed still carry those values — `normalizeProfile`
 * folds them back onto the canonical set.
 */
export const GOALS = ["bulk", "cut", "recomp", "strength", "endurance", "maintain"] as const;
export const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export const EQUIPMENT = ["full_gym", "home_gym", "dumbbells", "bodyweight"] as const;
export const SPLITS = ["full_body", "upper_lower", "push_pull_legs", "custom"] as const;

export type Goal = (typeof GOALS)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type Equipment = (typeof EQUIPMENT)[number];
export type Split = (typeof SPLITS)[number];

export interface TrainingProfile {
  goal: Goal;
  experience: ExperienceLevel;
  daysPerWeek: number;
  sessionLength: number;
  equipment: Equipment;
  split: Split;
  injuries: string | null;
}

/** Legacy / display spellings accepted on the way in, keyed by lowercased input. */
const ALIASES: Record<string, Record<string, string>> = {
  goal: {
    bulk: "bulk",
    "prise de masse": "bulk",
    muscle: "bulk",
    cut: "cut",
    "seche": "cut",
    "sèche": "cut",
    fatloss: "cut",
    recomp: "recomp",
    recomposition: "recomp",
    strength: "strength",
    force: "strength",
    endurance: "endurance",
    cardio: "endurance",
    maintain: "maintain",
    maintien: "maintain",
  },
  experience: {
    beginner: "beginner",
    debutant: "beginner",
    "débutant": "beginner",
    novice: "beginner",
    intermediate: "intermediate",
    "intermediaire": "intermediate",
    "intermédiaire": "intermediate",
    advanced: "advanced",
    "avance": "advanced",
    "avancé": "advanced",
    expert: "advanced",
  },
  equipment: {
    full_gym: "full_gym",
    "full gym": "full_gym",
    gym: "full_gym",
    "salle complete": "full_gym",
    home_gym: "home_gym",
    "home gym": "home_gym",
    maison: "home_gym",
    dumbbells: "dumbbells",
    "halteres": "dumbbells",
    "haltères": "dumbbells",
    bodyweight: "bodyweight",
    "poids du corps": "bodyweight",
  },
  split: {
    full_body: "full_body",
    "full body": "full_body",
    fullbody: "full_body",
    upper_lower: "upper_lower",
    "upper/lower": "upper_lower",
    "upper lower": "upper_lower",
    "haut/bas": "upper_lower",
    push_pull_legs: "push_pull_legs",
    "push/pull/legs": "push_pull_legs",
    ppl: "push_pull_legs",
    "push/pull/jambes": "push_pull_legs",
    custom: "custom",
    ia: "custom",
    auto: "custom",
  },
};

function canonicalize<T extends string>(
  field: keyof typeof ALIASES,
  raw: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  if (typeof raw !== "string") return fallback;
  const key = raw.trim().toLowerCase();
  const mapped = ALIASES[field][key] ?? key.replace(/[\s/]+/g, "_");
  return (allowed as readonly string[]).includes(mapped) ? (mapped as T) : fallback;
}

/** Accepts either canonical or legacy display values; always returns canonical. */
export const goalSchema = z.preprocess(
  (v) => canonicalize("goal", v, GOALS, "bulk"),
  z.enum(GOALS),
);
export const experienceSchema = z.preprocess(
  (v) => canonicalize("experience", v, EXPERIENCE_LEVELS, "intermediate"),
  z.enum(EXPERIENCE_LEVELS),
);
export const equipmentSchema = z.preprocess(
  (v) => canonicalize("equipment", v, EQUIPMENT, "full_gym"),
  z.enum(EQUIPMENT),
);
export const splitSchema = z.preprocess(
  (v) => canonicalize("split", v, SPLITS, "custom"),
  z.enum(SPLITS),
);

/** Shape accepted by `POST /api/profile`. */
export const profileInputSchema = z.object({
  goal: goalSchema,
  experience: experienceSchema,
  daysPerWeek: z.coerce.number().int().min(1).max(7),
  sessionLength: z.coerce.number().int().min(15).max(180),
  equipment: equipmentSchema,
  split: splitSchema,
  injuries: z
    .string()
    .trim()
    .max(500)
    .nullish()
    .transform((v) => (v ? v : null)),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;

/**
 * Turns a `user_profile` row into a canonical `TrainingProfile`.
 *
 * This used to read `experience_level` and `prefered_split`, which are not
 * columns — so the model silently received the defaults for every user
 * regardless of what they picked.
 */
export function normalizeProfile(row: {
  goal: string;
  experience: string;
  days_per_week: number;
  session_length: number;
  equipment: string;
  split_preference: string;
  injuries?: string | null;
}): TrainingProfile {
  return {
    goal: canonicalize("goal", row.goal, GOALS, "bulk"),
    experience: canonicalize("experience", row.experience, EXPERIENCE_LEVELS, "intermediate"),
    daysPerWeek: clamp(row.days_per_week, 1, 7, 4),
    sessionLength: clamp(row.session_length, 15, 180, 60),
    equipment: canonicalize("equipment", row.equipment, EQUIPMENT, "full_gym"),
    split: canonicalize("split", row.split_preference, SPLITS, "custom"),
    injuries: row.injuries?.trim() || null,
  };
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}
