export interface UserProfile {
    goal: string;
    experience_level: string;
    days_per_week: number;
    session_length: number;
    equipment: string;
    injuries?: string | null;
    prefered_split?:string; 
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