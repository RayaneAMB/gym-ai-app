import type { Equipment, ExperienceLevel, Goal, Split, TrainingProfile } from "../types";

/**
 * French labels for the canonical API vocabulary.
 *
 * Onboarding and the dashboard used to keep their own copies of these lists,
 * and both sent the *labels* to the API instead of the canonical values — so
 * the server could not match them and quietly fell back to defaults.
 */

export interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
  icon?: string;
}

export const GOAL_OPTIONS: Option<Goal>[] = [
  { value: "bulk", label: "Prise de masse", icon: "💪" },
  { value: "cut", label: "Sèche", icon: "🔥" },
  { value: "recomp", label: "Recomposition", icon: "⚖️" },
  { value: "strength", label: "Force maximale", icon: "🏋️" },
  { value: "endurance", label: "Endurance", icon: "🏃" },
  { value: "maintain", label: "Maintien", icon: "🧘" },
];

export const EXPERIENCE_OPTIONS: Option<ExperienceLevel>[] = [
  { value: "beginner", label: "Débutant", hint: "0-1 an" },
  { value: "intermediate", label: "Intermédiaire", hint: "1-3 ans" },
  { value: "advanced", label: "Avancé", hint: "3+ ans" },
];

export const EQUIPMENT_OPTIONS: Option<Equipment>[] = [
  { value: "full_gym", label: "Salle complète", icon: "🏟️" },
  { value: "home_gym", label: "Home gym", icon: "🏠" },
  { value: "dumbbells", label: "Haltères", icon: "🔩" },
  { value: "bodyweight", label: "Poids du corps", icon: "🤸" },
];

export const SPLIT_OPTIONS: Option<Split>[] = [
  { value: "full_body", label: "Full Body" },
  { value: "upper_lower", label: "Haut / Bas" },
  { value: "push_pull_legs", label: "Push / Pull / Jambes" },
  { value: "custom", label: "L'IA choisit ✦" },
];

export const DAYS_OPTIONS: Option<string>[] = [2, 3, 4, 5, 6].map((d) => ({
  value: String(d),
  label: `${d} jours / semaine`,
}));

export const SESSION_OPTIONS: Option<string>[] = [30, 45, 60, 90].map((m) => ({
  value: String(m),
  label: `${m} min`,
}));

function lookup<T extends string>(options: Option<T>[], value: T): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export const labelFor = {
  goal: (v: Goal) => lookup(GOAL_OPTIONS, v),
  experience: (v: ExperienceLevel) => lookup(EXPERIENCE_OPTIONS, v),
  equipment: (v: Equipment) => lookup(EQUIPMENT_OPTIONS, v),
  split: (v: Split) => lookup(SPLIT_OPTIONS, v),
};

/** Used when someone reaches onboarding without a saved profile. */
export const DEFAULT_PROFILE: TrainingProfile = {
  goal: "bulk",
  experience: "intermediate",
  daysPerWeek: 4,
  sessionLength: 60,
  equipment: "full_gym",
  split: "custom",
  injuries: null,
};
