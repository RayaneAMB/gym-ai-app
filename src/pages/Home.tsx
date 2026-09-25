import { Link, Navigate } from "react-router-dom";
import { ArrowRight, Calendar, Clock, Sparkles, Target, Zap } from "lucide-react";

import { Button } from "../componentes/ui/Button";
import { Card } from "../componentes/ui/Card";
import { useAuth } from "../hooks/useAuth";
import { LoadingScreen } from "../componentes/ui/LoadingScreen";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Programme par IA",
    description:
      "Un protocole d'entraînement calibré sur vos objectifs, votre niveau et votre planning.",
  },
  {
    icon: Target,
    title: "Orienté objectif",
    description:
      "Prise de masse, sèche, force ou endurance : le programme est optimisé pour votre cible.",
  },
  {
    icon: Calendar,
    title: "Planning flexible",
    description: "2 séances ou 6 par semaine — la structure s'adapte à votre emploi du temps.",
  },
  {
    icon: Clock,
    title: "Temps maîtrisé",
    description: "Chaque séance tient dans la durée dont vous disposez réellement.",
  },
];

const STEPS = [
  { n: "01", title: "Décrivez-vous", text: "Objectif, niveau, équipement, disponibilité." },
  { n: "02", title: "L'IA construit", text: "Séances, séries, RPE et progression sur-mesure." },
  { n: "03", title: "Entraînez-vous", text: "Suivez le protocole, recalibrez quand tout change." },
];

export default function Home() {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) return <LoadingScreen />;
  if (user) return <Navigate to="/profile" replace />;

  return (
    <div className="min-h-screen">
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[var(--color-accent)]/5 via-transparent to-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] max-w-full h-[800px] bg-[var(--color-accent)]/10 rounded-full blur-3xl"
        />

        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface-raised)] border border-[var(--color-line)] mb-8">
            <Zap className="w-4 h-4 text-[var(--color-accent)]" aria-hidden="true" />
            <span className="text-sm text-[var(--color-ink-subtle)]">
              Programmes d'entraînement générés par IA
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tight mb-6 leading-[0.95]">
            Votre programme
            <br />
            <span className="text-[var(--color-accent)]">sur-mesure</span> en secondes
          </h1>

          <p className="text-xl text-[var(--color-ink-subtle)] max-w-2xl mx-auto mb-10">
            Arrêtez d'improviser. Obtenez un protocole d'entraînement construit pour vos
            objectifs, votre expérience et le temps dont vous disposez.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/onboarding">
              <Button size="lg">
                Commencer gratuitement
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/auth/sign-in">
              <Button variant="secondary" size="lg">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold uppercase mb-4">
              Pourquoi GymAI ?
            </h2>
            <p className="text-[var(--color-ink-subtle)] text-lg max-w-2xl mx-auto">
              L'expertise de la préparation physique, appliquée automatiquement à votre situation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <Card
                key={feature.title}
                variant="bordered"
                className="group hover:border-[var(--color-accent)]/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)]/20 transition-colors">
                  <feature.icon
                    className="w-6 h-6 text-[var(--color-accent)]"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-[var(--color-ink-subtle)] text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-[var(--color-line)]">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold uppercase mb-14 text-center">
            Comment ça marche
          </h2>
          <ol className="grid md:grid-cols-3 gap-10">
            {STEPS.map((step) => (
              <li key={step.n}>
                <span className="font-display text-5xl font-black text-[var(--color-accent)]/30 block mb-3">
                  {step.n}
                </span>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-[var(--color-ink-subtle)] text-sm leading-relaxed">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>

          <div className="text-center mt-16">
            <Link to="/onboarding">
              <Button size="lg">
                Créer mon programme
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
