import { createContext } from "react";
import type { TrainingPlan, TrainingProfile, User } from "../types";

export interface AuthContextValue {
  user: User | null;
  profile: TrainingProfile | null;
  plan: TrainingPlan | null;

  /** True until the session has been resolved — the app can't route before this. */
  isAuthLoading: boolean;
  /** True while the profile and plan are being fetched for a signed-in user. */
  isDataLoading: boolean;
  /** True while a plan is being generated, which takes several seconds. */
  isGenerating: boolean;

  error: string | null;
  clearError: () => void;

  saveProfile: (profile: TrainingProfile) => Promise<void>;
  signOut: () => Promise<void>;
  generatePlan: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
