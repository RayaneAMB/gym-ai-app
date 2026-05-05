# ⚡ GymAI | Forge Your Legacy

**GymAI** est une application de fitness de nouvelle génération propulsée par l'intelligence artificielle. Conçue pour les athlètes exigeants, elle génère des protocoles d'entraînement personnalisés basés sur des données réelles, tout en offrant une expérience utilisateur immersive et dynamique.

---

## 🚀 Fonctionnalités Clés

-   **🧠 Génération de Plan par IA** : Algorithme personnalisé qui crée des séances basées sur vos objectifs (Bulk, Cut, Force), votre expérience et votre équipement.
-   **🎨 Design "Volt Performance"** : Une interface sombre (Obsidian) avec des accents néon (Cyber Volt) pour une esthétique agressive et motivante.
-   **📊 Dashboard Athlète** : Suivi en temps réel de votre split actuel, de votre fréquence d'entraînement et de votre progression.
-   **🔐 Sécurité Avancée** : Intégration complète avec **Neon Auth** pour une gestion fluide et sécurisée des sessions et du profil.
-   **✨ Expérience Fluide** : Animations haute performance avec **Framer Motion** et icônes vectorielles avec **Lucide React**.

## 🛠️ Stack Technique

-   **Frontend** : [React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/)
-   **Styling** : [Tailwind CSS](https://tailwindcss.com/)
-   **Animations** : [Framer Motion](https://www.framer.com/motion/)
-   **Base de données & Auth** : [Neon Database](https://neon.tech/)
-   **Icons** : [Lucide React](https://lucide.dev/)
-   **Routing** : [React Router v6](https://reactrouter.com/)

## 📦 Installation et Lancement

1.  **Cloner le dépôt** :
    ```bash
    git clone [https://github.com/RayaneAMB/gym-ai-app.git](https://github.com/RayaneAMB/gym-ai-app.git)
    cd gym-ai-app
    ```

2.  **Installer les dépendances** :
    ```bash
    npm install
    ```

3.  **Configurer les variables d'environnement** :
    Créez un fichier `.env` à la racine et ajoutez vos clés Neon :
    ```env
    VITE_NEON_PROJECT_ID=votre_id_projet
    ```

4.  **Lancer l'application en mode dev** :
    ```bash
    npm run dev
    ```

## 🎨 Design System

L'application suit une charte graphique stricte axée sur la performance :
-   **Background** : `#09090B` (Noir Ardoise profond)
-   **Card Surface** : `#18181B` (Gris Carbone)
-   **Primary Accent** : `#CCFF00` (Vert Cyber Volt)
-   **Typography** : Oswald (Titres) et Inter (Corps de texte)

## 📁 Structure du Projet

```text
src/
 ┣ componentes/       # Composants UI (Button, Card, Select, etc.)
 ┣ context/           # AuthContext et logique de l'application
 ┣ pages/             # Home, Profile, Account, Onboarding
 ┣ lib/               # Configuration des clients (Neon, Prisma)
 ┗ App.tsx            # Gestion des routes et layout