# CLAUDE.md — Guide pour les assistants IA

Ce fichier fournit les informations essentielles sur le dépôt **Bergerat-KPI** à destination des assistants IA (Claude, Copilot, etc.) qui interviennent sur ce projet.

---

## État actuel du projet

> **Statut : Application complète — prête pour déploiement**
> Frontend React + Backend Express + base PostgreSQL avec Docker.

### Structure du projet

```
Bergerat-KPI/
├── client/                   # Frontend React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # Composants shadcn/ui (Button, Card, Input, Badge, Toast)
│   │   │   └── layout/       # AppLayout, Sidebar, Header
│   │   ├── contexts/         # AuthContext (auth + rôles)
│   │   ├── lib/              # api.ts (client HTTP), utils.ts
│   │   ├── pages/            # LoginPage, DashboardPage, AttendancePage, SectionsPage,
│   │   │                     # TeamPage, AdminOverviewPage, AdminUsersPage
│   │   └── types/            # Types TypeScript partagés
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── nginx.conf            # Config Nginx pour Docker
│   └── Dockerfile
├── server/                   # Backend Express + TypeScript
│   ├── src/
│   │   ├── routes/           # auth, users, kpi, attendance, sections, admin
│   │   ├── middleware/       # auth.ts (JWT + authorize), errorHandler.ts
│   │   ├── services/         # prisma.ts (client Prisma)
│   │   ├── validators/       # Schémas Zod pour validation entrées
│   │   ├── seed.ts           # Données initiales (comptes démo + KPIs par défaut)
│   │   └── index.ts          # Point d'entrée Express
│   ├── tsconfig.json
│   └── Dockerfile
├── prisma/
│   └── schema.prisma         # Modèles : User, KpiDefinition, KpiEntry, Comment,
│                             #           Attendance, CustomSection
├── docker-compose.yml        # PostgreSQL + server + client
├── .env.example
├── .gitignore
├── CLAUDE.md                 # ← ce fichier
└── README.md
```

---

## Informations générales

| Champ              | Valeur                           |
|--------------------|----------------------------------|
| Nom                | Bergerat-KPI                     |
| Client             | Bergerat Monnoyeur               |
| Branche principale | `master`                         |
| Langue préférée    | Français                         |

---

## Stack technique

- **Langage** : TypeScript (frontend et backend)
- **Frontend** : React 18 + Vite + Tailwind CSS + shadcn/ui + Recharts
- **Backend** : Node.js + Express 4
- **BDD** : PostgreSQL 16 + Prisma ORM
- **Auth** : JWT (bcryptjs + jsonwebtoken)
- **Validation** : Zod
- **Déploiement** : Docker + docker-compose + Nginx

## Commandes utiles

```bash
# Développement backend
cd server && npm run dev          # Démarre avec tsx watch
cd server && npm run db:seed      # Initialise les données de démo
cd server && npx prisma studio    # Interface visuelle Prisma

# Développement frontend
cd client && npm run dev          # Vite dev server sur :5173

# Docker (production)
docker-compose up --build         # Lance tout (BDD + API + front)
```

---

## Rôles et permissions

| Fonctionnalité              | Admin | Manager | Collaborateur |
|-----------------------------|-------|---------|---------------|
| Voir les KPIs               |  oui  |   oui   |      oui      |
| Saisir / modifier les KPIs  |  oui  |   oui   |      non      |
| Laisser un commentaire       |  oui  |   oui   |      non      |
| Gérer les présences          |  oui  |   oui   |      non      |
| Ajouter/supprimer collaborateur | oui | oui   |      non      |
| Créer une section KPI        |  oui  |   oui   |      non      |
| Vue globale tous managers    |  oui  |   non   |      non      |
| Export CSV                   |  oui  |   non   |      non      |
| Gérer les utilisateurs       |  oui  |   non   |      non      |

Le middleware `authorize()` dans `server/src/middleware/auth.ts` protège les routes côté API.
Le composant `ProtectedRoute` dans `client/src/App.tsx` protège les routes côté frontend.
Le contexte `useAuth().canEdit` conditionne l'affichage des éléments d'édition.

---

## Conventions de développement

### Langue

- **Messages de commit** : français, format conventionnel (`feat:`, `fix:`, `docs:`, etc.)
- **Noms de variables/fonctions** : anglais
- **Documentation** : français

### Architecture backend

- Chaque domaine a sa propre route dans `server/src/routes/`
- Validation Zod dans `server/src/validators/index.ts`
- Pas de controllers séparés — la logique est directement dans les handlers de route
- `prisma.upsert()` utilisé pour la saisie KPI et présences (idempotent)

### Architecture frontend

- Pages dans `client/src/pages/`, une par route
- Composants UI réutilisables dans `client/src/components/ui/` (style shadcn)
- Client API centralisé dans `client/src/lib/api.ts` — toutes les requêtes passent par `api.*`
- Alias `@/` configuré dans Vite pour résoudre vers `client/src/`

### Branches

- Branche principale : `master`
- Branches IA : `claude/...`
- Branches features : `feat/<nom>`
- Branches fixes : `fix/<description>`

---

## Instructions pour les assistants IA

### À faire

- Lire ce fichier avant toute intervention
- Respecter le français pour les commits et la documentation
- Mettre à jour ce fichier si la structure évolue
- Valider les données côté serveur avec Zod
- Protéger les routes API par rôle avec `authorize()`
- Vérifier `canEdit` côté frontend avant d'afficher des formulaires

### À ne pas faire

- Ne pas pousser sur `master` directement
- Ne pas permettre aux collaborateurs d'écrire (même via API)
- Ne pas exposer les mots de passe ou le JWT_SECRET
- Ne pas créer de fichiers inutiles

### Priorités de qualité

1. **Sécurité** : pas d'injection, validation Zod, protection JWT
2. **Lisibilité** : code clair, nommage explicite
3. **Simplicité** : pas de sur-ingénierie
4. **Cohérence** : suivre les patterns existants

---

*Dernière mise à jour : 2026-03-11*
