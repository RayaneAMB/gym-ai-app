import express from "express";
import cors from "cors";
import { env, isProduction } from "./config.js";
import { log } from "./lib/logger.js";
import { requireAuth } from "./middleware/auth.js";
import { planRouter } from "./routes/plan.js";
import { profileRouter } from "./routes/profile.js";

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

/** Distinguishes a rejected origin from a genuine server fault. */
class CorsError extends Error {
  constructor() {
    super("Origin non autorisée");
    this.name = "CorsError";
  }
}

/** Vite picks a free port when the default is taken, so dev can't pin one. */
function isLocalhost(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin requests and server-to-server calls arrive without an Origin.
      if (!origin) return callback(null, true);

      const normalized = origin.replace(/\/+$/, "");
      if (env.ALLOWED_ORIGINS.includes(normalized)) return callback(null, true);
      if (!isProduction && isLocalhost(normalized)) return callback(null, true);

      log.warn("Blocked a cross-origin request", { origin });
      return callback(new CorsError());
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Every route below this point requires a verified session.
app.use("/api/profile", requireAuth, profileRouter);
app.use("/api/plan", requireAuth, planRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Route inconnue" });
});

app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    if (error instanceof CorsError) {
      return res.status(403).json({ error: error.message, code: "ORIGIN_NOT_ALLOWED" });
    }

    log.error("Unhandled error", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      // Internal messages can leak schema and key details — dev only.
      ...(isProduction ? {} : { details: error.message }),
    });
  },
);

app.listen(env.PORT, "0.0.0.0", () => {
  log.info(`API listening on port ${env.PORT}`, {
    env: env.NODE_ENV,
    models: env.OPENROUTER_MODELS,
    allowedOrigins: env.ALLOWED_ORIGINS,
  });
});
