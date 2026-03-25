# SaaS RDV — Application de prise de rendez-vous

Application SaaS de reservation de rendez-vous avec NestJS (backend), Next.js (frontend) et PostgreSQL.

## Prerequis

- [Docker](https://www.docker.com/) et Docker Compose installes
- Un compte [Google Cloud](https://console.cloud.google.com/) avec des credentials OAuth2 configures
- Un compte [Stripe](https://stripe.com/) avec les cles API et les IDs de prix configures

## Installation et demarrage

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd saas-rdv
```

### 2. Configurer les variables d environnement

Copier le fichier exemple :

```bash
cp .env.example backend/.env
```

Editer `backend/.env` avec vos credentials :
- **Google OAuth** : `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **JWT** : `JWT_SECRET` (generer une cle forte en production)
- **Stripe** : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`, `STRIPE_BUSINESS_PRICE_ID`

Le fichier `frontend/.env.local` est pre-configure pour le developpement local.

### 3. Demarrer les services

```bash
make up
```

Les services demarrent dans cet ordre : PostgreSQL -> Backend -> Frontend.

## URLs

| Service    | URL                   |
|------------|-----------------------|
| Frontend   | http://localhost:3000 |
| Backend    | http://localhost:3001 |
| PostgreSQL | localhost:5432        |

## Commandes disponibles

| Commande              | Description                                   |
|-----------------------|-----------------------------------------------|
| `make up`             | Demarrer tous les services (build inclus)     |
| `make down`           | Arreter tous les services                     |
| `make logs`           | Suivre les logs de tous les services          |
| `make logs-backend`   | Suivre les logs du backend uniquement         |
| `make logs-frontend`  | Suivre les logs du frontend uniquement        |
| `make restart`        | Redemarrer tous les services                  |
| `make clean`          | Arreter les services et supprimer les volumes |
| `make ps`             | Afficher le statut des services               |
| `make shell-backend`  | Ouvrir un shell dans le conteneur backend     |
| `make shell-frontend` | Ouvrir un shell dans le conteneur frontend    |
| `make db`             | Ouvrir psql dans le conteneur PostgreSQL      |
