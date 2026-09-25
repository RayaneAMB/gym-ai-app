import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { log } from "../lib/logger.js";
import { generateTrainingPlan, PlanGenerationError } from "../lib/ai.js";
import { normalizeProfile } from "../domain/profile.js";
import { planSchema } from "../domain/plan.js";
import { rateLimit } from "../middleware/rateLimit.js";

export const planRouter = Router();

/**
 * Generating a plan is the only expensive call in this API — it hits a paid
 * model and takes seconds. Capped per user so a stuck client (or a bored one
 * clicking "Recalibrer") can't burn the quota.
 */
const generationLimiter = rateLimit({ windowMs: 60_000, max: 5 });

planRouter.post("/generate", generationLimiter, async (req: Request, res: Response) => {
  const userId = req.userId!;

  try {
    const row = await prisma.user_profile.findUnique({ where: { user_id: userId } });
    if (!row) {
      return res.status(409).json({
        error: "Complétez votre profil avant de générer un programme",
        code: "PROFILE_REQUIRED",
      });
    }

    const profile = normalizeProfile(row);
    const planContent = await generateTrainingPlan(profile);

    const latest = await prisma.trainings_plan.findFirst({
      where: { user_id: userId },
      orderBy: { version: "desc" },
      select: { version: true },
    });
    const version = (latest?.version ?? 0) + 1;

    const created = await prisma.trainings_plan.create({
      data: {
        user_id: userId,
        // Prisma's Json input type won't accept a branded TS object directly.
        plan_json: JSON.parse(JSON.stringify(planContent)),
        plan_text: JSON.stringify(planContent, null, 2),
        version,
      },
    });

    return res.status(201).json({
      id: created.id,
      version: created.version,
      created_at: created.created_at,
      plan: planContent,
    });
  } catch (error) {
    if (error instanceof PlanGenerationError) {
      log.error("Plan generation exhausted every model", error.cause);
      return res.status(502).json({ error: error.message, code: "AI_UNAVAILABLE" });
    }
    log.error("Plan generation failed", error);
    return res.status(500).json({ error: "Échec de la génération du programme" });
  }
});

/** Latest plan for the signed-in athlete, or 204 when they have none yet. */
planRouter.get("/current", async (req: Request, res: Response) => {
  try {
    const latest = await prisma.trainings_plan.findFirst({
      where: { user_id: req.userId! },
      orderBy: { version: "desc" },
    });

    if (!latest) return res.status(204).end();

    // Older rows were written with a different exercise shape; re-validating
    // here means the client only ever sees the current one.
    const parsed = planSchema.safeParse(latest.plan_json);
    if (!parsed.success) {
      log.warn("Stored plan failed validation", { planId: latest.id });
      return res.status(422).json({
        error: "Ce programme est illisible, régénérez-le",
        code: "PLAN_CORRUPT",
      });
    }

    return res.json({
      id: latest.id,
      version: latest.version,
      created_at: latest.created_at,
      plan: parsed.data,
    });
  } catch (error) {
    log.error("Failed to load current plan", error);
    return res.status(500).json({ error: "Impossible de récupérer le programme" });
  }
});

/** Version history, newest first — lets the UI show how a programme evolved. */
planRouter.get("/history", async (req: Request, res: Response) => {
  try {
    const plans = await prisma.trainings_plan.findMany({
      where: { user_id: req.userId! },
      orderBy: { version: "desc" },
      select: { id: true, version: true, created_at: true },
      take: 20,
    });
    return res.json(plans);
  } catch (error) {
    log.error("Failed to load plan history", error);
    return res.status(500).json({ error: "Impossible de récupérer l'historique" });
  }
});
