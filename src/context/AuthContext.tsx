import { createContext, type ReactNode, useCallback, useRef, useState, useEffect, useContext } from "react";
import type { TrainingPlan, User, UserProfile } from "../types";
import { authClient } from "../lib/auth";
import { api } from "../lib/api";

interface AuthContextType {
    user: User | null;
    plan: TrainingPlan | null; 
    isloading: boolean;
    
    saveProfile: (profileData: Omit<UserProfile, "userId" | "updatedAt">) => Promise<void>;
    generatePlan: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [neonUser, setNeonUser] = useState<User | null>(null); // Type this as User, not any
    const [plan, setPlan] = useState<TrainingPlan | null>(null);
    const [isloading, setIsLoading] = useState(true);
    const isRefereshingRef = useRef(false);

    // Load User Session
    useEffect(() => {
        async function loadUser() {
            try {
                const result = await authClient.getSession();
                if (result && result.data?.user) {
                    setNeonUser(result.data.user as User);
                } else {
                    setNeonUser(null);
                }
            } catch (error) {
                setNeonUser(null);
            } finally {
                setIsLoading(false);
            }
        }
        loadUser();
    }, []);
    useEffect(()=>{
        if (!isloading){
            if(neonUser?.id){
                refreshData()
            } else{
                setPlan(null);
            }
            setIsLoading(false);
        }
    },[neonUser?.id, isloading])
    // Refresh Plan Data
   const refreshData = useCallback(async () => {
        // 1. On stocke l'ID dans une constante locale. TypeScript adore ça !
        const currentUserId = neonUser?.id;

        // 2. On vérifie la constante
        if (!currentUserId || isRefereshingRef.current) return;
        
        isRefereshingRef.current = true;

        try {
            // 3. On utilise la constante locale au lieu de neonUser.id
            const planData = await api.getCurrentPlan(currentUserId);
            
            if (planData) {
                setPlan({
                    id: planData.id,
                    user_id: planData.user_id,
                    overview: planData.plan_json.overview,
                    weeklySchedule: planData.plan_json.weeklySchedule,
                    progression: planData.plan_json.progression,
                    version: planData.version,
                    created_at: new Date(planData.created_at)
                });
            } else {
                setPlan(null);
            }
        } catch (error) {
            console.error("Error refreshing data:", error);
        } finally {
            isRefereshingRef.current = false;
        }
    }, [neonUser?.id]); // Use optional chaining here

    // Auto-refresh plan when user loads
    useEffect(() => {
        if (neonUser) {
            refreshData();
        }
    }, [neonUser, refreshData]);

    async function saveProfile(profileData: Omit<UserProfile, "userId" | "updatedAt">) {
        if (!neonUser) throw new Error("User not authenticated");
        await api.saveProfile(neonUser.id, profileData);
        await refreshData();
    }

    async function generatePlan() {
        if (!neonUser) throw new Error("Authentication required");
        await api.generatePlan(neonUser.id);
        await refreshData();
    }

    return (
        <AuthContext.Provider value={{ user: neonUser, plan, isloading, saveProfile, generatePlan }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}