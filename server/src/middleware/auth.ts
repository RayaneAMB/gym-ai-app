import type { NextFunction, Request, Response } from "express";
import { env } from "../config.js";
import { log } from "../lib/logger.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Set by `requireAuth`. Always the id of a verified session's user. */
      userId?: string;
    }
  }
}

interface CachedSession {
  userId: string;
  expiresAt: number;
}

/**
 * Sessions are verified against the Neon Auth server, so a naive implementation
 * would add a round trip to every request. Tokens are cached for a short window
 * — long enough to make a page load cheap, short enough that a revoked session
 * stops working quickly.
 */
const SESSION_CACHE_TTL_MS = 60_000;
const sessionCache = new Map<string, CachedSession>();

function readBearerToken(req: Request): string | null {
  const header = req.header("authorization");
  if (!header) return null;
  const [scheme, ...rest] = header.split(" ");
  if (scheme.toLowerCase() !== "bearer") return null;
  const token = rest.join(" ").trim();
  return token || null;
}

async function resolveUserId(token: string): Promise<string | null> {
  const cached = sessionCache.get(token);
  if (cached && cached.expiresAt > Date.now()) return cached.userId;
  if (cached) sessionCache.delete(token);

  const response = await fetch(`${env.NEON_AUTH_URL}/get-session`, {
    headers: { authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    if (response.status !== 401) {
      log.warn("Auth server rejected a session lookup", { status: response.status });
    }
    return null;
  }

  const body = (await response.json().catch(() => null)) as
    | { user?: { id?: unknown } }
    | null;
  const userId = body?.user?.id;
  if (typeof userId !== "string" || !userId) return null;

  sessionCache.set(token, { userId, expiresAt: Date.now() + SESSION_CACHE_TTL_MS });
  return userId;
}

/**
 * Rejects the request unless it carries a session token that the auth server
 * still recognises, then pins `req.userId` to that session's user.
 *
 * Routes must read the caller's identity from `req.userId` and never from the
 * request body or query string: those are attacker-controlled, and trusting
 * them let anyone read or overwrite another athlete's profile and plans.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = readBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Authentification requise" });
  }

  try {
    const userId = await resolveUserId(token);
    if (!userId) {
      return res.status(401).json({ error: "Session invalide ou expirée" });
    }
    req.userId = userId;
    return next();
  } catch (error) {
    log.error("Session verification failed", error);
    return res.status(503).json({ error: "Service d'authentification indisponible" });
  }
}

/** Exposed for tests and for clearing state after a sign-out. */
export function clearSessionCache() {
  sessionCache.clear();
}
