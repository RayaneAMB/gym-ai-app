import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma";

export const profileRouter = Router(); 

profileRouter.post("/" , async(req:Request , res:Response) => {
    try {
        const {userId , ...profileData} = req.body;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        
        // 👇 1. Utilise les noms exacts de ton UserProfile
        const {
            goal,
            experience,
            daysPerWeek,
            sessionLength,
            equipment,
            injuries,
            splitPreference,
        } = profileData;
        
        // 👇 2. Mets à jour la validation
        if (!goal || !experience || !daysPerWeek || !sessionLength || !equipment || !splitPreference) {
            return res.status(400).json({ error: "Missing required profile fields" });
        }
        
        await prisma.user_profile.upsert({
            where: { user_id: userId },
            update: {
                goal,
                experience,
                days_per_week: daysPerWeek, // 👇 3. Associe avec les nouveaux noms
                session_length: sessionLength,
                equipment,
                injuries: injuries || null,
                split_preference: splitPreference,
                Updated_at: new Date(),
            },
            create: {
                user_id: userId,
                goal,
                experience,
                days_per_week: daysPerWeek,
                session_length: sessionLength,
                equipment,
                injuries: injuries || null,
                split_preference: splitPreference,
            },
        });

        res.json({ success: true, message: "Profile saved successfully!" });  
    } catch (error) { 
        console.error("Error creating profile:", error);
        res.status(500).json({ error: "Failed to create profile" });
    }
});