#!/bin/bash

# Script de build pour Render
echo "🚀 Démarrage du build pour Render..."

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

# Création des dossiers nécessaires
echo "📁 Création des dossiers..."
mkdir -p public/uploads
mkdir -p logs

# Vérification des variables d'environnement critiques
echo "🔍 Vérification des variables d'environnement..."
if [ -z "$JWT_SECRET" ]; then
    echo "❌ ERREUR: JWT_SECRET manquant"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERREUR: DATABASE_URL manquant"
    exit 1
fi

echo "✅ Build terminé avec succès!"
