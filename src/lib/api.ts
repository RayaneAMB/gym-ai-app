//import type { TrainingPlan, UserProfile } from "../types";

const BASE_URL = "http://127.0.0.1:3001";

// Interface pour la réponse de la DB (doit correspondre à ton Schema Prisma)
interface PlanResponse {
    id: string;
    user_id: string;
    plan_json: {
        overview: any;
        weeklySchedule: any;
        progression: any;
    };
    version: number;
    created_at: string;
}

// Helper générique pour POST
async function post<T>(path: string, data: object): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "API request failed");
    }
    return res.json();
}

// Helper générique pour GET
async function get<T>(path: string): Promise<T | null> {
    const res = await fetch(`${BASE_URL}/api${path}`);
    
    // 👇 GESTION DU 404: Si on ne trouve rien, on renvoie null en silence
    if (res.status === 404) {
        return null;
    }
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Request failed");
    }
    return res.json();
}

export const api = {
    saveProfile: (userId: string, profileData: any) =>
        post<{ success: boolean; message: string }>("/api/profile", { userId, ...profileData }),

    generatePlan: (userId: string) =>
        post<{ id: string; version: number }>("/api/plan/generate", { userId }),
    
    getCurrentPlan: (userId: string): Promise<PlanResponse | null> => {
        return get<PlanResponse>(`/plan/current?userId=${userId}`);
    }
};