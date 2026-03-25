.PHONY: up down logs logs-backend logs-frontend restart clean ps shell-backend shell-frontend db

## Démarrer tous les services (build + détaché)
up:
	docker compose up -d --build

## Arrêter tous les services
down:
	docker compose down

## Afficher les logs de tous les services (suivi en temps réel)
logs:
	docker compose logs -f

## Afficher les logs du backend uniquement
logs-backend:
	docker compose logs -f backend

## Afficher les logs du frontend uniquement
logs-frontend:
	docker compose logs -f frontend

## Redémarrer tous les services
restart:
	docker compose restart

## Arrêter les services et supprimer les volumes (reset complet)
clean:
	docker compose down -v

## Afficher le statut des services
ps:
	docker compose ps

## Ouvrir un shell dans le conteneur backend
shell-backend:
	docker compose exec backend sh

## Ouvrir un shell dans le conteneur frontend
shell-frontend:
	docker compose exec frontend sh

## Ouvrir psql dans le conteneur PostgreSQL
db:
	docker compose exec postgres psql -U saasrdv -d saasrdv
