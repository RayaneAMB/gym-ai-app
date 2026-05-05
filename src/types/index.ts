

export interface User {
    id: string;
    email: string;
    createdAt: Date;
}

export interface UserProfile {
    userId: string;
    goal: "cut" | "bulk"|"recomp"|"strength" | "maintain";
    experience: "beginner" | "intermediate" | "advanced";
    daysPerWeek: number;
    sessionLength: number;
    equipment: "full_gym" | "home_gym" | "dumbbells";
    injuries?: string | null;
    splitPreference: "full_body" | "upper_lower" | "push_pull_legs" | "custom";
    updatedAt: string;
}
export interface PlanOverview {
    goal: string;
    frequency: string;
    split: string;
    notes : string;
}

export interface DaySchedule {
    day: string;
    focus: string;
    exercises: Exercise[];
    
}

export interface Exercise {
    name: string;
    sets: number;
    reps: number;
    rest: string;
    rpe: number;
    notes?: string;
    alternative_exercises?: string[];
} 


export interface TrainingPlan {
    id: string;
    user_id: string;
    overview: PlanOverview;
    weeklySchedule: DaySchedule[];
    progression :string;
    version: number;
    created_at: Date;}