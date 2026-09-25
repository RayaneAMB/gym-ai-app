import type { PlanRevision, TrainingPlan, TrainingProfile } from "../types";
import { authClient } from "./auth";

/**
 * Left empty in development so requests go through the Vite proxy (see
 * vite.config.ts) and stay same-origin. Set VITE_API_URL for deployed builds.
 */
const BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

/** An API response that carried a structured error body. */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }

  /** True when the profile must be filled in before this call can succeed. */
  get needsProfile() {
    return this.code === "PROFILE_REQUIRED";
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const session = await authClient.getSession();
  const token = session?.data?.session?.token;
  if (!token) throw new ApiError("Session expirée, reconnectez-vous", 401);
  return { authorization: `Bearer ${token}` };
}

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
}

/**
 * Returns `null` for 204, which the API uses to say "nothing saved yet" —
 * an empty profile or plan is a normal state, not an error.
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T | null> {
  const { method = "GET", body } = options;

  const response = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers: {
      ...(await authHeader()),
      ...(body === undefined ? {} : { "content-type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) return null;

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(
      payload?.error ?? `La requête a échoué (${response.status})`,
      response.status,
      payload?.code,
    );
  }

  return (await response.json()) as T;
}

export const api = {
  getProfile: () => request<TrainingProfile>("/profile"),

  saveProfile: (profile: TrainingProfile) =>
    request<{ success: true; profile: TrainingProfile }>("/profile", {
      method: "POST",
      body: profile,
    }),

  getCurrentPlan: () => request<TrainingPlan>("/plan/current"),

  generatePlan: () => request<TrainingPlan>("/plan/generate", { method: "POST" }),

  getPlanHistory: () => request<PlanRevision[]>("/plan/history"),
};
