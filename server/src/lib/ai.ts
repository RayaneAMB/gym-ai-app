import OpenAI from "openai";
import { env } from "../config.js";
import { log } from "./logger.js";
import { parseJsonObject } from "./json.js";
import { planSchema, type TrainingPlanContent } from "../domain/plan.js";
import type { TrainingProfile } from "../domain/profile.js";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENAI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": env.PUBLIC_URL,
    "X-Title": "Gym AI Planner",
  },
});

const SYSTEM_PROMPT = [
  "Tu es un préparateur physique expert qui conçoit des programmes d'entraînement.",
  "Tu réponds EXCLUSIVEMENT avec un objet JSON valide, sans texte d'introduction,",
  "sans commentaire et sans balise markdown. Ta réponse commence par { et finit par }.",
].join(" ");

export class PlanGenerationError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "PlanGenerationError";
  }
}

/**
 * Asks a model for a training plan and returns it validated.
 *
 * Two layers of resilience, both of which this app needs in practice: each
 * model gets a second attempt with the validation error fed back to it, and
 * if a model is retired or rate-limited we fall through to the next one.
 */
export async function generateTrainingPlan(
  profile: TrainingProfile,
): Promise<TrainingPlanContent> {
  const prompt = buildPrompt(profile);
  const failures: string[] = [];

  for (const model of env.OPENROUTER_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const raw = await requestCompletion(model, prompt, failures.at(-1));
        const parsed = parseJsonObject(raw);
        const plan = planSchema.parse(parsed);

        const expected = profile.daysPerWeek;
        if (plan.weeklySchedule.length !== expected) {
          log.warn("Model returned an unexpected number of sessions", {
            model,
            expected,
            got: plan.weeklySchedule.length,
          });
        }

        log.info("Plan generated", { model, attempt, days: plan.weeklySchedule.length });
        return plan;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failures.push(message);
        log.warn("Plan generation attempt failed", { model, attempt, message });

        // A transport/auth failure won't be fixed by rephrasing — move on.
        if (isModelUnavailable(error)) break;
      }
    }
  }

  throw new PlanGenerationError(
    "Impossible de générer un programme pour le moment. Réessayez dans quelques instants.",
    failures,
  );
}

async function requestCompletion(
  model: string,
  prompt: string,
  previousError?: string,
): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ];

  if (previousError) {
    messages.push({
      role: "user",
      content:
        `Ta réponse précédente a été rejetée : ${previousError}. ` +
        "Renvoie uniquement un objet JSON valide respectant exactement la structure demandée.",
    });
  }

  const completion = await openai.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    max_tokens: 4000,
    // Honoured by most OpenRouter models; ignored gracefully by the rest.
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content?.trim()) throw new Error("Le modèle n'a renvoyé aucun contenu");
  return content;
}

function isModelUnavailable(error: unknown): boolean {
  if (!(error instanceof OpenAI.APIError)) return false;
  // 400 shows up when a model doesn't exist or rejects response_format.
  return [400, 401, 402, 404, 429, 502, 503].includes(error.status ?? 0);
}

const GOAL_LABELS: Record<TrainingProfile["goal"], string> = {
  bulk: "prise de masse musculaire",
  cut: "perte de gras en préservant le muscle",
  recomp: "recomposition corporelle",
  strength: "développement de la force maximale",
  endurance: "endurance et condition physique",
  maintain: "maintien de la forme actuelle",
};

const EXPERIENCE_LABELS: Record<TrainingProfile["experience"], string> = {
  beginner: "débutant (0-1 an de pratique)",
  intermediate: "intermédiaire (1-3 ans de pratique)",
  advanced: "avancé (3 ans et plus)",
};

const EQUIPMENT_LABELS: Record<TrainingProfile["equipment"], string> = {
  full_gym: "salle de sport complète (machines, barres, haltères, poulies)",
  home_gym: "home gym (barre, quelques disques, haltères réglables)",
  dumbbells: "haltères uniquement",
  bodyweight: "poids du corps uniquement",
};

const SPLIT_LABELS: Record<TrainingProfile["split"], string> = {
  full_body: "Full Body",
  upper_lower: "Haut / Bas",
  push_pull_legs: "Push / Pull / Jambes",
  custom: "le split que tu juges le plus adapté à ce profil",
};

/** Session length drives how much volume actually fits in a workout. */
function exercisesPerSession(sessionLength: number): string {
  if (sessionLength <= 30) return "3 à 4";
  if (sessionLength <= 45) return "4 à 5";
  if (sessionLength <= 60) return "5 à 6";
  return "6 à 8";
}

function buildPrompt(profile: TrainingProfile): string {
  return `Conçois un programme d'entraînement hebdomadaire pour cet athlète :

- Objectif : ${GOAL_LABELS[profile.goal]}
- Niveau : ${EXPERIENCE_LABELS[profile.experience]}
- Fréquence : ${profile.daysPerWeek} séances par semaine
- Durée par séance : ${profile.sessionLength} minutes
- Équipement disponible : ${EQUIPMENT_LABELS[profile.equipment]}
- Split souhaité : ${SPLIT_LABELS[profile.split]}
${profile.injuries ? `- Blessures / limitations à respecter impérativement : ${profile.injuries}` : "- Aucune blessure signalée"}

Contraintes :
- Exactement ${profile.daysPerWeek} séances dans "weeklySchedule".
- ${exercisesPerSession(profile.sessionLength)} exercices par séance, compatibles avec ${profile.sessionLength} minutes.
- RPE cible entre 6 et 9, cohérent avec le niveau ${EXPERIENCE_LABELS[profile.experience]}.
- Uniquement des exercices réalisables avec : ${EQUIPMENT_LABELS[profile.equipment]}.
${profile.injuries ? `- Exclus tout mouvement aggravant : ${profile.injuries}, et propose des alternatives sûres.` : ""}
- Propose 1 à 2 alternatives par exercice.
- Rédige tout le contenu en français.

Réponds avec exactement cette structure JSON :

{
  "overview": {
    "goal": "description courte de l'objectif",
    "frequency": "${profile.daysPerWeek} séances par semaine",
    "split": "nom du split utilisé",
    "notes": "2 à 3 phrases de conseils clés"
  },
  "weeklySchedule": [
    {
      "day": "Séance 1 — Lundi",
      "focus": "groupes musculaires ciblés",
      "exercises": [
        {
          "name": "Nom de l'exercice",
          "sets": "4",
          "reps": "6-8",
          "rest": "2-3 min",
          "rpe": 8,
          "notes": "consigne technique courte",
          "alternatives": ["Alternative 1", "Alternative 2"]
        }
      ]
    }
  ],
  "progression": "2 à 3 phrases sur la progression semaine après semaine"
}

Règles de format strictes :
- "sets", "reps" et "rest" sont TOUJOURS des chaînes de caractères entre guillemets.
- "rpe" est TOUJOURS un nombre entier unique (jamais une plage).
- Aucune valeur numérique ne doit contenir un tiret sans guillemets (interdit : "sets": 3-4).
- Retourne uniquement le JSON, sans markdown ni texte autour.`;
}
