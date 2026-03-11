# Bergerat-KPI

Tableau de bord KPI interne pour les managers logistique de **Bergerat Monnoyeur**.

## Stack technique

- **Frontend** : React 18 + TypeScript + Tailwind CSS + shadcn/ui + Recharts
- **Backend** : Node.js + Express + TypeScript
- **Base de données** : PostgreSQL + Prisma ORM
- **Auth** : JWT (rôles : admin, manager, collaborateur)
- **Déploiement** : Docker + docker-compose

## Lancement rapide avec Docker

```bash
docker-compose up --build
```

L'application sera accessible sur :
- **Frontend** : http://localhost
- **API** : http://localhost:3001/api

## Lancement en développement

### Prérequis

- Node.js 20+
- PostgreSQL 16+

### Installation

```bash
# Backend
cd server
npm install
cp ../.env.example .env  # puis modifier les variables
npx prisma migrate dev
npx prisma generate
npm run db:seed
npm run dev

# Frontend (dans un autre terminal)
cd client
npm install
npm run dev
```

Le frontend tourne sur http://localhost:5173 avec proxy vers l'API.

## Comptes de démonstration

| Rôle          | Email                          | Mot de passe  |
|---------------|--------------------------------|---------------|
| Admin         | admin@bergerat.com             | Admin2024!    |
| Manager       | manager@bergerat.com           | Manager2024!  |
| Collaborateur | collaborateur@bergerat.com     | Collab2024!   |

## Structure du projet

```
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/   # Composants UI et layout
│   │   ├── contexts/     # AuthContext
│   │   ├── hooks/        # Hooks personnalisés
│   │   ├── lib/          # Client API, utilitaires
│   │   ├── pages/        # Pages de l'application
│   │   └── types/        # Types TypeScript
│   └── ...
├── server/               # Backend Express
│   ├── src/
│   │   ├── middleware/   # Auth JWT, gestion d'erreurs
│   │   ├── routes/       # Routes API REST
│   │   ├── services/     # Client Prisma
│   │   ├── validators/   # Schémas Zod
│   │   └── seed.ts       # Données initiales
│   └── ...
├── prisma/               # Schéma BDD
├── docker-compose.yml
└── .env.example
```

## API

| Méthode | Route                          | Rôles autorisés         |
|---------|--------------------------------|-------------------------|
| POST    | /api/auth/login                | Public                  |
| GET     | /api/auth/me                   | Authentifié             |
| GET     | /api/users                     | Tous                    |
| POST    | /api/users                     | Admin                   |
| POST    | /api/users/collaborator        | Admin, Manager          |
| DELETE  | /api/users/:id                 | Admin, Manager          |
| GET     | /api/kpi/definitions           | Tous                    |
| GET     | /api/kpi/entries               | Tous                    |
| POST    | /api/kpi/entries               | Admin, Manager          |
| POST    | /api/kpi/entries/:id/comments  | Admin, Manager          |
| GET     | /api/attendance                | Tous                    |
| POST    | /api/attendance                | Admin, Manager          |
| GET     | /api/sections                  | Tous                    |
| POST    | /api/sections                  | Admin, Manager          |
| PATCH   | /api/sections/:id/toggle       | Admin, Manager          |
| DELETE  | /api/sections/:id              | Admin, Manager          |
| GET     | /api/admin/overview            | Admin                   |
| GET     | /api/admin/export              | Admin                   |
