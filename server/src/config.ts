import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const here = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ quiet: true });
// Also load server/.env when the process is started from the repo root.
dotenv.config({ path: path.resolve(here, "../../.env"), quiet: true });

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Variable d'environnement manquante : ${name}. Copiez server/.env.example vers server/.env et remplissez-la.`,
    );
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

/** Trailing slashes break URL concatenation everywhere downstream. */
function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export const env = {
  NODE_ENV: optional("NODE_ENV", "development"),
  PORT: Number(optional("PORT", "3001")),

  DATABASE_URL: required("DATABASE_URL"),

  /** Base URL of the Neon Auth server, e.g. https://<project>.neonauth.<region>.aws.neon.tech/neondb/auth */
  NEON_AUTH_URL: stripTrailingSlash(required("NEON_AUTH_URL")),

  /** OpenRouter key. Named OPENAI_* because the OpenAI SDK is used as the client. */
  OPENAI_API_KEY: required("OPENAI_API_KEY"),

  /**
   * Comma-separated model slugs, tried in order. Free OpenRouter models get
   * rate-limited and retired without notice, so a fallback chain keeps plan
   * generation working instead of failing the whole request.
   */
  OPENROUTER_MODELS: optional(
    "OPENROUTER_MODELS",
    "meta-llama/llama-3.3-70b-instruct:free,google/gemini-2.0-flash-exp:free,mistralai/mistral-small-3.2-24b-instruct:free",
  )
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean),

  /** Browser origins allowed to call this API. */
  ALLOWED_ORIGINS: optional("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((o) => stripTrailingSlash(o.trim()))
    .filter(Boolean),

  /** Public URL of this API, sent to OpenRouter for attribution. */
  PUBLIC_URL: optional("PUBLIC_URL", "http://localhost:3001"),
};

export const isProduction = env.NODE_ENV === "production";
