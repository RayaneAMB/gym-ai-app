import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { log } from "../lib/logger.js";
import { normalizeProfile, profileInputSchema } from "../domain/profile.js";

export const profileRouter = Router();

/** Returns the signed-in athlete's profile, or 204 if they haven't made one. */
profileRouter.get("/", async (req: Request, res: Response) => {
  try {
    const row = await prisma.user_profile.findUnique({
      where: { user_id: req.userId! },
    });

    if (!row) return res.status(204).end();
    return res.json(normalizeProfile(row));
  } catch (error) {
    log.error("Failed to load profile", error);
    return res.status(500).json({ error: "Impossible de charger le profil" });
  }
});

profileRouter.post("/", async (req: Request, res: Response) => {
  const parsed = profileInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Profil invalide",
      details: parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    });
  }

  const profile = parsed.data;

  try {
    const row = {
      goal: profile.goal,
      experience: profile.experience,
      days_per_week: profile.daysPerWeek,
      session_length: profile.sessionLength,
      equipment: profile.equipment,
      injuries: profile.injuries,
      split_preference: profile.split,
    };

    await prisma.user_profile.upsert({
      where: { user_id: req.userId! },
      update: { ...row, Updated_at: new Date() },
      create: { user_id: req.userId!, ...row },
    });

    return res.json({ success: true, profile });
  } catch (error) {
    log.error("Failed to save profile", error);
    return res.status(500).json({ error: "Impossible d'enregistrer le profil" });
  }
});
