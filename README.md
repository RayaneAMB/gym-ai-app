# ⚡ GymAI — Forge Your Legacy

**GymAI** génère des programmes d'entraînement personnalisés à partir de votre objectif, votre
niveau, votre équipement et le temps dont vous disposez réellement. Un LLM rédige le protocole,
le serveur le valide, et l'interface l'affiche séance par séance.

---

## 🏗️ Architecture

Le dépôt contient deux applications qui se déploient séparément :

```text
.
├── src/                    # Frontend React (Vite) — déployé sur Vercel
│   ├── componentes/        # layout/, plan/, ui/
│   ├── context/            # AuthProvider + contexte
│   ├── hooks/              # useAuth
│   ├── lib/                # client API, client auth, libellés
│   ├── pages/              # Home, Onboarding, Profile, Auth, Account
│   └── types/              # contrat partagé avec l'API
└── server/                 # API Express + Prisma — déployée sur Render
    ├── prisma/             # schéma et migrations
    └── src/
        ├── domain/         # vocabulaire canonique + schémas Zod
        ├── lib/            # client IA, Prisma, logger, parsing JSON
        ├── middleware/     # authentification, rate limiting
        └── routes/         # /api/profile, /api/plan
```

### Flux d'une génération

```text
Onboarding  ──POST /api/profile──▶  validation Zod  ──▶  Postgres (user_profile)
            ──POST /api/plan/generate──▶  normalisation du profil
                                     ──▶  OpenRouter (avec repli sur plusieurs modèles)
                                     ──▶  extraction + validation JSON
                                     ──▶  Postgres (trainings_plan, versionné)
                                     ──▶  plan renvoyé au client
```

## 🛠️ Stack

| Domaine       | Technologie                                          |
| ------------- | ---------------------------------------------------- |
| Frontend      | React 19, Vite 8, React Router 7                      |
| Styling       | Tailwind CSS 4 (tokens CSS), Framer Motion            |
| Backend       | Express 5, TypeScript (ESM)                           |
| Base          | PostgreSQL (Neon) via Prisma 7                        |
| Auth          | Neon Auth (Better Auth), jetons de session porteurs   |
| IA            | OpenRouter via le SDK OpenAI                          |
| Validation    | Zod, côté serveur, sur les entrées comme les sorties  |

## 📦 Installation

```bash
git clone https://github.com/RayaneAMB/gym-ai-app.git
cd gym-ai-app
npm run setup
```

`npm run setup` installe les dépendances des deux applications et génère le client Prisma.

### Variables d'environnement

Deux fichiers, chacun avec son modèle versionné :

```bash
cp .env.example .env                # frontend
cp server/.env.example server/.env  # API
```

| Fichier      | Variable             | Rôle                                                              |
| ------------ | -------------------- | ----------------------------------------------------------------- |
| `.env`       | `VITE_API_URL`       | URL de l'API. Vide en dev : le proxy Vite s'en charge.             |
| `.env`       | `VITE_NEON_AUTH_URL` | Serveur Neon Auth.                                                 |
| `server/.env`| `DATABASE_URL`       | Connexion Postgres.                                                |
| `server/.env`| `NEON_AUTH_URL`      | Même valeur que `VITE_NEON_AUTH_URL` — sert à vérifier les jetons. |
| `server/.env`| `OPENAI_API_KEY`     | Clé OpenRouter.                                                    |
| `server/.env`| `OPENROUTER_MODELS`  | Modèles essayés dans l'ordre (repli automatique).                  |
| `server/.env`| `ALLOWED_ORIGINS`    | Origines navigateur autorisées par CORS.                           |

Le serveur refuse de démarrer si une variable obligatoire manque, avec un message qui la nomme.

### Base de données

```bash
npm --prefix server run db:migrate
```

## 🚀 Lancement

```bash
npm run dev:all
```

Démarre le frontend sur `http://localhost:5173` et l'API sur `http://localhost:3001`.
Les requêtes `/api/*` passent par le proxy Vite, donc tout reste en same-origin en développement.

Séparément, si besoin :

```bash
npm run dev       # frontend seul
npm run dev:api   # API seule
```

## ✅ Vérifications

```bash
npm run check     # ESLint + TypeScript sur le frontend et l'API
```

## 🌐 API

Toutes les routes `/api/*` exigent un en-tête `Authorization: Bearer <jeton de session>`.
L'identité vient **toujours** de la session vérifiée, jamais du corps de la requête.

| Méthode | Route                 | Réponse                                             |
| ------- | --------------------- | --------------------------------------------------- |
| `GET`   | `/health`             | État du service (route publique).                    |
| `GET`   | `/api/profile`        | Le profil, ou `204` si aucun n'est enregistré.       |
| `POST`  | `/api/profile`        | Valide et enregistre le profil.                      |
| `POST`  | `/api/plan/generate`  | Génère un plan et le renvoie. Limité à 5/min.        |
| `GET`   | `/api/plan/current`   | Dernière version du plan, ou `204`.                  |
| `GET`   | `/api/plan/history`   | Les 20 dernières versions (id, version, date).       |

### Vocabulaire canonique

Le client et le serveur partagent les mêmes valeurs, en `snake_case` :

| Champ        | Valeurs                                                          |
| ------------ | ---------------------------------------------------------------- |
| `goal`       | `bulk`, `cut`, `recomp`, `strength`, `endurance`, `maintain`      |
| `experience` | `beginner`, `intermediate`, `advanced`                            |
| `equipment`  | `full_gym`, `home_gym`, `dumbbells`, `bodyweight`                 |
| `split`      | `full_body`, `upper_lower`, `push_pull_legs`, `custom`            |

Le serveur accepte aussi les anciennes graphies d'affichage (`"Full Gym"`, `"Push/Pull/Legs"`,
`"Debutant"`…) et les ramène sur ces valeurs, pour que les profils enregistrés avant cette
normalisation restent exploitables.

## 🎨 Design system

Tous les styles passent par les tokens déclarés dans [`src/index.css`](src/index.css) :

| Token                     | Valeur    | Usage                     |
| ------------------------- | --------- | ------------------------- |
| `--color-bg`              | `#09090B` | Fond de page              |
| `--color-surface`         | `#111113` | Champs et cartes          |
| `--color-surface-raised`  | `#18181B` | Cartes en relief          |
| `--color-accent`          | `#CCFF00` | Accent « Cyber Volt »     |
| `--color-ink`             | `#FAFAFA` | Texte principal           |

Typographies : **Oswald** pour les titres, **DM Sans** pour le corps de texte.
L'application respecte `prefers-reduced-motion`.

## 🚢 Déploiement

**Frontend (Vercel)** — build `npm run build`, dossier `dist`. `vercel.json` réécrit toutes les
routes vers `index.html` pour le routage côté client. Définir `VITE_API_URL` et
`VITE_NEON_AUTH_URL`.

**API (Render)** — build `npm install && npm run build`, démarrage `npm start`. Définir les
variables de `server/.env.example`, et surtout `ALLOWED_ORIGINS` sur l'URL du frontend déployé.
