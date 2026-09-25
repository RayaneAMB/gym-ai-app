import type { NextFunction, Request, Response } from "express";

interface Bucket {
  count: number;
  resetAt: number;
}

interface Options {
  windowMs: number;
  max: number;
}

/**
 * Minimal per-user fixed-window limiter.
 *
 * In-memory on purpose: this API runs as a single instance, and reaching for
 * Redis to throttle one endpoint would cost more than it protects. If the API
 * is ever scaled out, this needs to move to shared storage.
 */
export function rateLimit({ windowMs, max }: Options) {
  const buckets = new Map<string, Bucket>();

  return function limiter(req: Request, res: Response, next: NextFunction) {
    const key = req.userId ?? req.ip ?? "anonymous";
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      if (buckets.size > 1000) sweep(buckets, now);
      return next();
    }

    if (bucket.count >= max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({
        error: `Trop de requêtes. Réessayez dans ${retryAfter} seconde(s).`,
        code: "RATE_LIMITED",
      });
    }

    bucket.count++;
    return next();
  };
}

function sweep(buckets: Map<string, Bucket>, now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}
