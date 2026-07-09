import OpenAI from "openai";
import dotenv from "dotenv";
import { TrainingPlan, UserProfile } from "../../types";

dotenv.config();

export async function generateTrainingPlan(
    profile: UserProfile | Record<string, any>,
): Promise<Omit<TrainingPlan, 'id' | 'user_id' | 'version' | 'created_at'>> {

    const normalizedProfile: UserProfile = {
        goal: profile.goal || "bulk",
        experience_level: profile.experience_level || profile.experience_level || "intermediate",
        days_per_week: profile.days_per_week || 4,
        session_length: profile.session_length || 60,
        equipment: profile.equipment || "full_gym",
        injuries: profile.injuries || null,
        prefered_split: profile.prefered_split || profile.prefered_split || "upper_lower",
    };

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OpenAI API key is not set in environment variables");
    }

    // Connexion à OpenRouter
    const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: apiKey,
        defaultHeaders: {
            "HTTP-Referer": "http://127.0.0.1:3001",
            "X-Title": "Gym AI Planner",
        }
    });

    const prompt = buildPrompt(normalizedProfile);

    try {
        const completion = await openai.chat.completions.create({
            model: "google/gemma-2-9b-it:free",
            messages: [
                {
                    role: "system",
                    content: "Tu es un coach sportif expert et un concepteur de programmes d'entraînement. Tu dois répondre UNIQUEMENT avec un objet JSON valide. Ne dis pas 'bonjour', ne dis pas 'voici le plan', ne mets pas de balises markdown, renvoie JUSTE le JSON commençant par { et finissant par }."
                },
                {
                    role: "user",
                    content: prompt
                },
            ],
            temperature: 0.7,
        });

        const content = completion.choices[0].message.content;
        if (!content) {
            throw new Error("AI malfunction: no content returned");
        }

        console.log("RÉPONSE BRUTE DE L'IA :", content);

        // ✅ LE CORRECTIF EST ICI : On extrait de force uniquement le JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            console.error("Format invalide, pas de JSON trouvé:", content);
            throw new Error("Le format renvoyé par l'IA n'est pas du JSON valide");
        }

        // On prend le résultat extrait et on le parse
        const cleaned = jsonMatch[0];
        const planData = JSON.parse(cleaned);
        
        return formatPlanResponse(planData, normalizedProfile);

    } catch (error) {
        console.error("AI erreur:", error);
        throw error;
    }

    function formatPlanResponse(
        aiResponse: any,
        profile: UserProfile
    ): Omit<TrainingPlan, 'id' | 'user_id' | 'version' | 'created_at'> {
        const plan: Omit<TrainingPlan, 'id' | 'user_id' | 'version' | 'created_at'> = {
            overview: {
                goal: aiResponse.overview?.goal || `Customized ${profile.goal} program`,
                frequency: aiResponse.overview?.frequency || `${profile.days_per_week} jours par semaine`,
                split: aiResponse.overview?.split || profile.prefered_split,
                notes: aiResponse.overview?.notes || "Suivez bien votre programme et bonne chance !",
            },
            weeklySchedule: (aiResponse.weeklySchedule || []).map((day: any) => ({
                day: day.day || "Day",
                focus: day.focus || "Full Body",
                exercices: (day.exercises || day.exercices || []).map((ex: any) => ({
                    name: ex.name || "Exercice",
                    sets: ex.sets || 3,
                    reps: ex.reps || "8-12",
                    rest: ex.rest || "60-90 sec",
                    rpe: ex.rpe || 7,
                    notes: ex.notes,
                    alternative: ex.alternatives || ex.alternative,
                })),
            })),
            progression: aiResponse.progression || "Augmente le poids de 1 à 2,5 kg lorsque tu peux compléter toutes les séries avec une bonne technique.",
        };
        return plan;
    }

    function buildPrompt(userProfile: UserProfile): string {
        const goalMap: Record<string, string> = {
            bulk: "prise de masse",
            cut: "perte de poids",
            maintain: "maintien de la forme",
            strength: "maximiser la force",
            endurance: "améliorer l'endurance",
        };

        const experienceMap: Record<string, string> = {
            Debutant: "débutant (0-1 an)",
            beginner: "débutant (0-1 an)",
            Intermediate: "intermédiaire (1-3 ans)",
            intermediate: "intermédiaire (1-3 ans)",
            Advanced: "avancé (3+ ans)",
            advanced: "avancé (3+ ans)",
        };

        const equipmentMap: Record<string, string> = {
            full_gym: "salle de sport complète",
            home_gym: "équipement à domicile",
            dumbbells: "haltères",
        };

        const splitMap: Record<string, string> = {
            full_body: "Full Body",
            upper_lower: "Haut/Bas",
            push_pull_legs: "Push/Pull/Jambes",
            custom: "Meilleur split personnalisé selon mon profil",
        };

        return `Génère un plan d'entraînement ${userProfile.days_per_week} jours par semaine, avec des sessions de ${userProfile.session_length} minutes, pour un objectif de ${goalMap[userProfile.goal] || userProfile.goal}.
Le plan doit être adapté à un niveau ${experienceMap[userProfile.experience_level] || userProfile.experience_level} et doit utiliser l'équipement suivant : ${equipmentMap[userProfile.equipment] || userProfile.equipment}.
Le split doit être : ${splitMap[userProfile.prefered_split] || userProfile.prefered_split}.
${userProfile.injuries ? `Je souffre des blessures suivantes : ${userProfile.injuries}. Prends-les en compte dans la planification.\n` : ""}

Génère le plan en JSON avec exactement cette structure :

{
  "overview": {
    "goal": "brève description de l'objectif",
    "frequency": "X jours par semaine",
    "split": "nom du split",
    "notes": "notes importantes (2-3 phrases)"
  },
  "weeklySchedule": [
    {
      "day": "Lundi",
      "focus": "groupe musculaire ciblé",
      "exercises": [
        {
          "name": "Nom de l'exercice",
          "sets": 4,
          "reps": "6-8",
          "rest": "2-3 min",
          "rpe": 8,
          "notes": "conseils techniques (optionnel)",
          "alternatives": ["Alternative 1", "Alternative 2"]
        }
      ]
    }
  ],
  "progression": "stratégie de progression (2-3 phrases)"
}

Exigences :
- ${userProfile.days_per_week} jours d'entraînement
- Séances de ${userProfile.session_length} minutes
- 4 à 6 exercices par séance
- RPE entre 6 et 9
- Respecter le split : ${splitMap[userProfile.prefered_split] || userProfile.prefered_split}
- Adapter au niveau : ${experienceMap[userProfile.experience_level] || userProfile.experience_level}
${userProfile.injuries ? `- Éviter : ${userProfile.injuries}` : ""}
- Ajouter des alternatives si possible

Retourne uniquement le JSON, sans texte supplémentaire.`;
    }
}