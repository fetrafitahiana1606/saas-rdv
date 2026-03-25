#!/bin/bash
# Setup script — crée les fichiers .env à partir des exemples
set -e

echo "=== SaaS RDV Setup ==="

# Backend .env
if [ ! -f backend/.env ]; then
  cp .env.example backend/.env
  # Fix DATABASE_HOST pour Docker
  sed -i 's/DATABASE_HOST=.*/DATABASE_HOST=postgres/' backend/.env
  echo "✓ backend/.env créé (depuis .env.example)"
else
  echo "• backend/.env existe déjà"
fi

# Frontend .env.local
if [ ! -f frontend/.env.local ]; then
  echo 'NEXT_PUBLIC_API_URL=http://localhost:3001' > frontend/.env.local
  echo "✓ frontend/.env.local créé"
else
  echo "• frontend/.env.local existe déjà"
fi

echo ""
echo "Setup terminé. Lancez: docker compose up -d --build"
