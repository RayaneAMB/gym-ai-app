/**
 * Contract shared with the API. The server validates every payload against the
 * same vocabulary (see `server/src/domain/`), so these unions are the single
 * source of truth for what the UI is allowed to send.
 */

export const GOALS = ["bulk", "cut", "recomp", "strength", "endurance", "maintain"] as const;
export const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export const EQUIPMENT = ["full_gym", "home_gym", "dumbbells", "bodyweight"] as const;
export const SPLITS = ["full_body", "upper_lower", "push_pull_legs", "custom"] as const;

export type Goal = (typeof GOALS)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type Equipment = (typeof EQUIPMENT)[number];
export type Split = (typeof SPLITS)[number];

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string | null;
}

export interface TrainingProfile {
  goal: Goal;
  experience: ExperienceLevel;
  daysPerWeek: number;
  sessionLength: number;
  equipment: Equipment;
  split: Split;
  injuries: string | null;
}

/**
 * `sets` and `reps` are strings, not numbers: models answer with ranges
 * ("3-4", "8-12") as often as with single values, and the server normalizes
 * everything to text rather than throwing information away.
 */
export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  rpe: number;
  notes?: string;
  alternatives?: string[];
}

export interface DaySchedule {
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface PlanOverview {
  goal: string;
  frequency: string;
  split: string;
  notes: string;
}

export interface TrainingPlanContent {
  overview: PlanOverview;
  weeklySchedule: DaySchedule[];
  progression: string;
}

export interface TrainingPlan {
  id: string;
  version: number;
  created_at: string;
  plan: TrainingPlanContent;
}

export interface PlanRevision {
  id: string;
  version: number;
  created_at: string;
}
