# orepmi_web

Site Web pour Orepmi - Application bâtie avec **AdonisJS 6** (moteur de templates Edge.js) et configurée pour **Supabase** (PostgreSQL).

---

## 🚀 Démarrage rapide

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration de l'environnement & Supabase

Un fichier `.env` est déjà initialisé. Renseignez vos identifiants Supabase :

```env
# Dans votre tableau de bord Supabase : Project Settings -> Database -> Connection string -> URI
# Recommandé (Pooler en mode Transaction ou Session) :
DATABASE_URL="postgresql://postgres.[VOTRE-PROJECT-REF]:[VOTRE-MOT-DE-PASSE]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require"
DB_SSL=true

# Optionnel : Clés API Supabase (pour Storage, Auth, Realtime)
# Project Settings -> API :
SUPABASE_URL="https://[VOTRE-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="votre-cle-anon"
SUPABASE_SERVICE_ROLE_KEY="votre-cle-service-role"
```

> **Note sur le Pooler Supabase** :
> - Port `6543` : Transaction mode (idéal pour requêtes légères et architectures serverless).
> - Port `5432` : Session mode ou connexion directe (recommandé pour exécuter les migrations).

### 3. Exécuter les migrations de base de données

Une fois le fichier `.env` configuré avec vos accès Supabase :

```bash
node ace migration:run
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

Rendez-vous ensuite sur [http://localhost:3333](http://localhost:3333).

---

## 🛠️ Stack technique

- **Framework** : [AdonisJS 6](https://adonisjs.com/)
- **Vues** : [Edge.js](https://edgejs.dev/) (Server-Side Rendering sans SPA/Vue/React)
- **Base de données / ORM** : [Lucid ORM](https://lucid.adonisjs.com/) avec pilote `pg` PostgreSQL
- **BaaS** : [Supabase](https://supabase.com/) (PostgreSQL & `@supabase/supabase-js`)
- **Assets** : Vite + Alpine.js
- **Validation** : VineJS

---

## 📂 Organisation du projet

- `config/database.ts` : Configuration de la connexion PostgreSQL/Supabase (support URL pooler et SSL).
- `start/env.ts` : Validation des variables d'environnement (`DATABASE_URL`, `SUPABASE_*`, etc.).
- `app/services/supabase.ts` : Service singleton pour utiliser le client Supabase JS (`supabase.client` et `supabase.admin`).
- `database/migrations/` : Fichiers de migration Lucid pour la base PostgreSQL.
- `resources/views/` : Templates Edge.js.
- `start/routes.ts` : Définition des routes HTTP.

---

## 📜 Scripts disponibles

| Commande | Description |
| --- | --- |
| `npm run dev` | Démarre le serveur de développement avec HMR |
| `npm run build` | Compile l'application et les assets pour la production |
| `npm run typecheck` | Vérifie les types TypeScript (`tsc --noEmit`) |
| `npm run lint` | Lance le linter ESLint |
| `npm test` | Exécute la suite de tests (Japa) |
| `node ace migration:run` | Applique les migrations en attente sur la base de données |
| `node ace migration:status` | Affiche l'état des migrations |
