import { RedirectToSignIn, SignedIn } from "@neondatabase/neon-js/auth/react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../componentes/ui/Card";
import { Select } from "../componentes/ui/Select";
import { useState } from "react";
import { Textarea } from "../componentes/ui/Textarea";
import { ArrowRight, Loader2 } from "lucide-react";
import type { UserProfile } from "../types";
import { useNavigate } from "react-router-dom";

const goalOptions = [
    { value: "Bulk", label: "Prendre du muscle (Prise de masse)" },
    { value: "Cut", label: "Perdre du gras (Sèche)" },
    { value: "recomp", label: "Recomposition corporelle" },
    { value: "strength", label: "Gagner en force" },
    { value: "endurance", label: "Améliorer l'endurance" },
];

const experienceOptions = [
    { value: "Debutant", label: "Débutant (0-1 year)" },
    { value: "Intermediate", label: "Intermédiaire(1-3 years)" },
    { value: "Advanced", label: "Avancé (3+ years )" },
];

const daysOptions = [
    { value: "2", label: "2 jours par semaine" },
    { value: "3", label: "3 jours par semaine" },
    { value: "4", label: "4 jours par semaine" },
    { value: "5", label: "5 jours par semaine" },
    { value: "6", label: "6 jours par semaine" }
];

const sessionOptions = [
    { value: "30", label: "30 minutes" },
    { value: "45", label: "45 minutes" },
    { value: "60", label: "60 minutes" },
    { value: "90", label: "90 minutes" }
];

const equipmentOptions = [
    { value: "Full Gym", label: "Salle de sport complète" },
    { value: "Home Gym", label: "Équipement à domicile" },
    { value: "Dumbbells", label: "Haltères" }
];

const splitOption = [
    { value: "Full Body", label: "Full Body" },
    { value: "Upper/Lower", label: "Haut/Bas" },
    { value: "Push/Pull/Legs", label: "Push/Pull/Jambes" },
    { value: "Custom", label: "Personnalisé par IA" }
];

export default function Onboarding() {
    const { user, saveProfile, generatePlan } = useAuth();
    const [isGenerating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        goal: "bulk",
        experience: "intermediate",
        days: "4",
        session: "60",
        equipment: "full_gym",
        injuries: "",
        split: "upper_lower"
    });

    function updateForm(field: string, value: any) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    async function handleQuestionnaire(e: React.FormEvent) {
        e.preventDefault();
        setError(null); // Reset error state on new submission

        const profile: Omit<UserProfile, "userId" | "updatedAt"> = {
            goal: formData.goal as UserProfile["goal"],
            experience: formData.experience as UserProfile["experience"],
            daysPerWeek: parseInt(formData.days),
            sessionLength: parseInt(formData.session),
            equipment: formData.equipment as UserProfile["equipment"],
            injuries: formData.injuries || null,
            splitPreference: formData.split as UserProfile["splitPreference"],
        };

        try {
            setGenerating(true);
            await saveProfile(profile);
            await generatePlan();
            navigate("/profile");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue");
            setGenerating(false); // Only set false if error, so the loader stays active during redirect
        }
    }

    if (!user) { return <RedirectToSignIn />; }

    return (
        <SignedIn>
            <div className="min-h-screen pt-24 pb-12 px-6">
                <div className="max-w-xl mx-auto">
                    {!isGenerating ? (
                        <Card variant="bordered">
                            <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Parlez-nous de vous</h1>
                            <p className="text-[var(--color-muted)] mb-6">Aidez-nous à créer le programme parfait pour vous</p>
                            
                            {/* Affichage de l'erreur si l'API plante */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleQuestionnaire} className="space-y-6">
                                <Select
                                    id="goal"
                                    label="Quel est votre objectif principal ?"
                                    options={goalOptions}
                                    value={formData.goal}
                                    onChange={(e) => updateForm("goal", e.target.value)}
                                />
                                <Select
                                    id="experience"
                                    label="Niveau d'expérience en musculation ?"
                                    options={experienceOptions}
                                    value={formData.experience}
                                    onChange={(e) => updateForm("experience", e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        id="jours"
                                        label="Jours par semaine ?"
                                        options={daysOptions}
                                        value={formData.days}
                                        onChange={(e) => updateForm("days", e.target.value)}
                                    />
                                    <Select
                                        id="sessionlength"
                                        label="Durée des séances ?"
                                        options={sessionOptions}
                                        value={formData.session}
                                        onChange={(e) => updateForm("session", e.target.value)}
                                    />
                                </div>
                                <Select
                                    id="equipment"
                                    label="Quel équipement avez-vous à votre disposition ?"
                                    options={equipmentOptions}
                                    value={formData.equipment}
                                    onChange={(e) => updateForm("equipment", e.target.value)}
                                />
                                <Select
                                    id="split"
                                    label="Quel type de split souhaitez-vous ?"
                                    options={splitOption}
                                    value={formData.split}
                                    onChange={(e) => updateForm("split", e.target.value)}
                                />
                                <Textarea
                                    id="injuries"
                                    label="Blessures ou limitations ? (optionnel)"
                                    placeholder="Décrivez brièvement toute blessure..."
                                    value={formData.injuries}
                                    onChange={(e) => updateForm("injuries", e.target.value)}
                                />

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent)] text-white px-4 py-2 rounded-xl hover:bg-[var(--color-accent-hover)] transition-colors"
                                    >
                                        Générer mon programme
                                        <ArrowRight className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </form>
                        </Card>
                    ) : (
                        <Card variant="bordered" className="text-center py-16">
                            <Loader2 className="w-12 h-12 text-[var(--color-accent)] mx-auto mb-6 animate-spin" />
                            <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">Création de votre programme</h1>
                            <p className="text-[var(--color-muted)]">Nous générons votre programme avec l'IA. Cela peut prendre quelques secondes...</p>
                        </Card>
                    )}
                </div>
            </div>
        </SignedIn>
    );
}