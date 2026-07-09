import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import { generateTrainingPlan } from "../lib/ai";

export const planRouter = Router();

// ==========================================
// 1. ROUTE POUR GÉNÉRER ET SAUVEGARDER UN PLAN
// ==========================================
planRouter.post("/generate", async (req: Request, res: Response) => {
  console.log("🚨 [1] REQUEST RECEIVED AT /generate!");
  
  try {
    const { userId } = req.body;
    console.log(`📦 [2] Extracted userId: ${userId}`);

    if (!userId) {
      return res.status(400).json({ error: "ID requis" });
    }

    // 1. Récupérer le profil
    console.log("🔍 [3] Fetching user profile from DB...");
    const profile = await prisma.user_profile.findUnique({
      where: { user_id: userId }
    });

    if (!profile) {
      console.log("❌ [CRASH] Profile not found for this user!");
      return res.status(404).json({ error: "Profil non trouvé" });
    }
    console.log(`👤 [4] Profile found! Goal: ${profile.goal}`);

    // 2. Générer le plan via l'IA
    console.log("⏳ [5] Calling OpenRouter AI to generate plan (This might take a moment)...");
    const planJson = await generateTrainingPlan(profile);
    const planText = JSON.stringify(planJson, null, 2);
    console.log("✅ [6] AI Generation Success! Plan received.");

    // 3. Trouver la version actuelle
    console.log("🔍 [7] Fetching previous plan versions...");
    const latestPlan = await prisma.trainings_plan.findFirst({
      where: { user_id: userId },
      orderBy: { version: "desc" }
    });

    const nextVersion = latestPlan ? latestPlan.version + 1 : 1;
    console.log(`📈 [8] Assigning version number: ${nextVersion}`);

    // Cast through JSON to strip TypeScript interfaces → plain object Prisma accepts
    const planJsonSafe = JSON.parse(JSON.stringify(planJson));

    // 4. Sauvegarder dans la DB
    console.log("💾 [9] Saving new plan to Neon Database...");
    const newPlan = await prisma.trainings_plan.create({
      data: {
        user_id: userId,
        plan_json: planJsonSafe,
        plan_text: planText,
        version: nextVersion
      },
    });

    console.log(`🎉 [10] EVERYTHING SUCCEEDED! Plan saved with ID: ${newPlan.id}`);
    return res.json({ id: newPlan.id, success: true });

  } catch (error: any) {
    // THIS IS THE TRAP FOR THE GHOST ERROR
    console.error("❌❌❌ [FATAL CRASH] Route /generate failed!");
    console.error("Error Message:", error.message);
    console.error("Full Stack Trace:", error);
    
    // We send back the exact error message to the frontend so we can see it
    return res.status(500).json({ 
        error: "Échec de la génération", 
        details: error.message || "Unknown error" 
    });
  }
});


// ==========================================
// 2. ROUTE POUR LIRE LE PLAN ACTUEL
// ==========================================
planRouter.get("/current", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: "L'ID utilisateur est requis" });
    }

    const latestPlan = await prisma.trainings_plan.findFirst({
      where: { user_id: userId },
      orderBy: { version: "desc" },
    });

    if (!latestPlan) {
      // ✅ FIX: Instead of throwing a 404 Error, we just return null gracefully.
      // This stops the red error from polluting your frontend console!
      return res.status(200).json(null); 
    }

    return res.json(latestPlan);

  } catch (error) {
    console.error("Erreur lors de la récupération du plan:", error);
    return res.status(500).json({ error: "Échec de la récupération du plan" });
  }
});