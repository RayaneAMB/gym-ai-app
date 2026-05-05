import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import { generateTrainingPlan } from "../lib/ai";

export const planRouter = Router();

// ==========================================
// 1. ROUTE POUR GÉNÉRER ET SAUVEGARDER UN PLAN
// ==========================================
planRouter.post("/generate", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "ID requis" });
    }

    // 1. Récupérer le profil
    const profile = await prisma.user_profile.findUnique({
      where: { user_id: userId }
    });

    if (!profile) {
      return res.status(404).json({ error: "Profil non trouvé" });
    }

    // 2. Générer le plan via l'IA
    const planJson = await generateTrainingPlan(profile);
    const planText = JSON.stringify(planJson, null, 2);

    // 3. Trouver la version actuelle
    const latestPlan = await prisma.trainings_plan.findFirst({
      where: { user_id: userId },
      orderBy: { version: "desc" }
    });

    const nextVersion = latestPlan ? latestPlan.version + 1 : 1;

    // 👇 Cast through JSON to strip TypeScript interfaces → plain object Prisma accepts
    const planJsonSafe = JSON.parse(JSON.stringify(planJson));

    try {
      const newPlan = await prisma.trainings_plan.create({
        data: {
          user_id: userId,
          plan_json: planJsonSafe,
          plan_text: planText,
          version: nextVersion
        },
      });

      return res.json({ id: newPlan.id, success: true });
    } catch (dbError) {
      console.error("Erreur de sauvegarde Database:", dbError);
      return res.status(500).json({ error: "Erreur lors de l'écriture en base de données" });
    }

  } catch (error) {
    console.error("Erreur générale:", error);
    res.status(500).json({ error: "Échec de la génération" });
  }
});


// ==========================================
// 2. ROUTE POUR LIRE LE PLAN ACTUEL
// ==========================================
planRouter.get("/current", async (req: Request, res: Response) => {
  try {
    // On récupère l'ID passé dans l'URL par le frontend (ex: ?userId=123)
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: "L'ID utilisateur est requis" });
    }

    // On cherche le plan le plus récent de cet utilisateur
    const latestPlan = await prisma.trainings_plan.findFirst({
      where: { user_id: userId },
      orderBy: { version: "desc" }, // Version la plus haute en premier
    });

    if (!latestPlan) {
      // Pas de plan ? Pas de problème, on renvoie une 404 que le frontend gèrera
      return res.status(404).json({ error: "Aucun plan trouvé" });
    }

    // On renvoie le plan trouvé au frontend
    return res.json(latestPlan);

  } catch (error) {
    console.error("Erreur lors de la récupération du plan:", error);
    return res.status(500).json({ error: "Échec de la récupération du plan" });
  }
});