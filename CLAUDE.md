# CLAUDE.md — Guide pour les assistants IA

Ce fichier fournit les informations essentielles sur le dépôt **Bergerat-KPI** à destination des assistants IA (Claude, Copilot, etc.) qui interviennent sur ce projet.

---

## État actuel du projet

> **Statut : Initialisation**
> Le dépôt est en phase de démarrage. Aucun stack technique ni code source n'ont encore été définis.

### Structure actuelle

```
Bergerat-KPI/
├── CLAUDE.md       ← ce fichier
└── README.md       ← titre du projet uniquement
```

---

## Informations générales

| Champ         | Valeur                                |
|---------------|---------------------------------------|
| Nom           | Bergerat-KPI                          |
| Auteur        | B-HG60 (bryanhannoque@gmail.com)      |
| Branche principale | `master`                         |
| Langue préférée | Français                            |
| Date de création | 2026-03-11                         |

---

## Objectif du projet

Le projet **Bergerat-KPI** vise à gérer et visualiser des indicateurs clés de performance (KPI) pour Bergerat. Le détail fonctionnel sera précisé au fur et à mesure de l'avancement du projet.

---

## Stack technique

> À définir. Cette section doit être mise à jour dès que les choix technologiques sont arrêtés.

Exemples de sections à compléter :

- **Langage** : (ex. TypeScript, Python, Go…)
- **Framework** : (ex. Next.js, FastAPI, Django…)
- **Base de données** : (ex. PostgreSQL, MongoDB…)
- **ORM / Query builder** : (ex. Prisma, SQLAlchemy…)
- **Tests** : (ex. Vitest, pytest, Jest…)
- **CI/CD** : (ex. GitHub Actions…)

---

## Conventions de développement

### Langue

- **Commentaires dans le code** : français de préférence
- **Messages de commit** : français
- **Noms de variables/fonctions** : anglais (convention technique universelle)
- **Documentation (README, CLAUDE.md, etc.)** : français

### Messages de commit

Format recommandé :

```
<type>: <description courte>

[corps optionnel]
```

Types courants :
- `feat` : nouvelle fonctionnalité
- `fix` : correction de bug
- `refactor` : refactorisation sans changement de comportement
- `docs` : documentation uniquement
- `test` : ajout ou modification de tests
- `chore` : tâches de maintenance (config, dépendances…)

Exemples :
```
feat: ajout du tableau de bord KPI mensuel
fix: correction du calcul du taux de conversion
docs: mise à jour du README avec les prérequis
```

### Branches

- Branche principale : `master`
- Branches de travail IA : préfixe `claude/`
- Branches de fonctionnalités : `feat/<nom-de-la-feature>`
- Branches de correctifs : `fix/<description-du-bug>`

---

## Workflow de développement

1. Créer une branche depuis `master`
2. Développer la fonctionnalité ou le correctif
3. Écrire ou mettre à jour les tests correspondants
4. Committer avec un message clair (voir conventions ci-dessus)
5. Pousser la branche et ouvrir une Pull Request vers `master`

---

## Instructions pour les assistants IA

### À faire

- Lire ce fichier en priorité avant toute intervention sur le projet
- Respecter la langue française pour les messages de commit et la documentation
- Mettre à jour ce fichier si la structure ou les conventions évoluent
- Travailler sur la branche dédiée `claude/...` fournie dans le contexte de la tâche
- Pousser les modifications avec `git push -u origin <branche>`

### À ne pas faire

- Ne pas pousser directement sur `master`
- Ne pas supprimer de fichiers sans confirmation explicite
- Ne pas introduire de dépendances non discutées
- Ne pas créer de fichiers inutiles ou de documentation non demandée

### Priorités de qualité

1. **Sécurité** : éviter les injections SQL, XSS, exposition de secrets
2. **Lisibilité** : code clair, nommage explicite
3. **Simplicité** : ne pas sur-ingénierer, solutions minimales et ciblées
4. **Tests** : couvrir les cas critiques

---

## Mise à jour de ce fichier

Ce fichier doit être mis à jour à chaque évolution significative :
- Ajout d'un nouveau stack ou outil
- Changement de conventions
- Ajout de scripts ou commandes utiles
- Nouvelles instructions pour les assistants IA

---

*Dernière mise à jour : 2026-03-11*
