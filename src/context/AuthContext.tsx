import { useCallback, useEffect, useState, type ReactNode } from "react";
import { authClient } from "../lib/auth";
import { ApiError, api } from "../lib/api";
import type { TrainingPlan, TrainingProfile, User } from "../types";
import { AuthContext, type AuthContextValue } from "./auth-context";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<TrainingProfile | null>(null);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Resolve the session once on mount.
  useEffect(() => {
    let cancelled = false;

    authClient
      .getSession()
      .then((result) => {
        if (!cancelled) setUser((result?.data?.user as User) ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsAuthLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const loadData = useCallback(async (signal?: { cancelled: boolean }) => {
    try {
      // Both are independent reads — no reason to wait for one before the other.
      const [profileData, planData] = await Promise.all([
        api.getProfile(),
        api.getCurrentPlan(),
      ]);
      if (signal?.cancelled) return;
      setProfile(profileData);
      setPlan(planData);
      setError(null);
    } catch (err) {
      if (signal?.cancelled) return;
      setError(err instanceof Error ? err.message : "Impossible de charger vos données");
    } finally {
      if (!signal?.cancelled) setHasLoadedData(true);
    }
  }, []);

  // 2. Once the user is known, load their profile and plan.
  useEffect(() => {
    if (isAuthLoading || !user) return;

    const signal = { cancelled: false };
    // `loadData` awaits the network before touching state, so nothing is set
    // synchronously here — the rule just can't see through the async call.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [user, isAuthLoading, loadData]);

  const saveProfile = useCallback(async (next: TrainingProfile) => {
    setError(null);
    const result = await api.saveProfile(next);
    // Trust the server's canonical echo rather than the values we sent.
    setProfile(result?.profile ?? next);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut();
    } finally {
      // Clear locally even if the network call fails — the user asked to leave.
      setUser(null);
      setProfile(null);
      setPlan(null);
      setHasLoadedData(false);
      setError(null);
    }
  }, []);

  const generatePlan = useCallback(async () => {
    setError(null);
    setIsGenerating(true);
    try {
      // The generate endpoint returns the finished plan, so there is no
      // follow-up fetch and no window where the UI shows a stale version.
      const generated = await api.generatePlan();
      if (generated) setPlan(generated);
    } catch (err) {
      const message =
        err instanceof ApiError && err.needsProfile
          ? "Complétez votre profil avant de générer un programme."
          : err instanceof Error
            ? err.message
            : "La génération a échoué";
      setError(message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    // Derived rather than cleared in an effect: signing out must not leave the
    // previous athlete's data on screen for even one render.
    profile: user ? profile : null,
    plan: user ? plan : null,
    isAuthLoading,
    // "Signed in, but the first fetch hasn't landed yet." Derived so that a
    // background refresh never blanks a page that already has content.
    isDataLoading: Boolean(user) && !hasLoadedData,
    isGenerating,
    error,
    clearError: useCallback(() => setError(null), []),
    saveProfile,
    signOut,
    generatePlan,
    refresh: useCallback(() => loadData(), [loadData]),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
