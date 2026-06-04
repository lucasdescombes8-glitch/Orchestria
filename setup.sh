#!/bin/bash
set -e

echo "🚀 Initialisation d'Orchestria..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installation des dépendances..."
  npm install
fi

# Push DB schema and seed
echo "🗄️  Initialisation de la base de données..."
DATABASE_URL="file:./prisma/dev.db" npx prisma db push --accept-data-loss 2>/dev/null || true
DATABASE_URL="file:./prisma/dev.db" npx prisma db seed 2>/dev/null || echo "⚠️  Données de démonstration déjà présentes."

echo ""
echo "✅ Orchestria est prêt !"
echo ""
echo "   🌐 Lancement du serveur..."
npm run dev
