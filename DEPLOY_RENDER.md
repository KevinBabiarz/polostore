# Guide de déploiement sur Render

## 📋 Prérequis
- Compte GitHub avec votre code pushé
- Compte Render (gratuit disponible)
- Base de données PostgreSQL (Render fournit un service gratuit)

## 🚀 Étapes de déploiement

### 1. Préparation de la base de données PostgreSQL sur Render

1. Connectez-vous sur [Render.com](https://render.com)
2. Cliquez sur "New +" → "PostgreSQL"
3. Configurez votre base de données :
   - **Name**: `polostore-db`
   - **Database**: `polostore`
   - **User**: `polostore_user`
   - **Region**: Choisissez la plus proche de vos utilisateurs
   - **Plan**: Free (pour commencer)
4. Cliquez sur "Create Database"
5. **IMPORTANT**: Copiez l'URL de connexion (External Database URL)

### 2. Déploiement du service web

1. Sur Render, cliquez sur "New +" → "Web Service"
2. Connectez votre repository GitHub
3. Configurez le service :
   - **Name**: `polostore-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (pour commencer)

### 3. Configuration des variables d'environnement

Dans les settings de votre web service, ajoutez ces variables d'environnement :

#### Variables OBLIGATOIRES :
```
NODE_ENV=production
PORT=10000
JWT_SECRET=dc98b99dcc43973021aa99b0d68e91cb6e7d3bf7f26d37913c6491f5b40a4d84
JWT_EXPIRE=7d
DATABASE_URL=[Coller l'URL de votre base PostgreSQL ici]
```

#### Variables OPTIONNELLES pour l'admin :
```
ADMIN_EMAIL=votre-email@example.com
ADMIN_PASSWORD=VotreMotDePasseSecurise123!
```

#### Variables pour CORS (à ajuster selon votre frontend) :
```
FRONTEND_URL=https://votre-frontend.onrender.com
PRODUCTION_URL=https://votre-frontend.onrender.com
```

### 4. Premier déploiement

1. Cliquez sur "Create Web Service"
2. Render va automatiquement :
   - Cloner votre repo
   - Installer les dépendances (`npm install`)
   - Exécuter le build (`npm run build`)
   - Démarrer l'application (`npm start`)

### 5. Initialisation de la base de données

Une fois le déploiement réussi, vous devez initialiser la base de données :

1. Dans le dashboard Render, allez dans votre service web
2. Cliquez sur "Shell" (terminal)
3. Exécutez les commandes suivantes :

```bash
# Initialiser les tables
npm run migrate

# Créer l'administrateur par défaut
npm run seed
```

### 6. Vérification du déploiement

Testez ces endpoints pour vérifier que tout fonctionne :

- `GET https://votre-app.onrender.com/test` → Doit retourner un JSON avec le statut
- `GET https://votre-app.onrender.com/api/db-status` → Doit confirmer la connexion DB
- `POST https://votre-app.onrender.com/api/auth/login` → Pour tester l'authentification

## 🔧 Configuration CORS pour le frontend

Si vous déployez aussi votre frontend sur Render, mettez à jour la variable `FRONTEND_URL` avec l'URL de votre frontend déployé.

## 📝 Notes importantes

### Limitations du plan gratuit Render :
- Le service se met en veille après 15 minutes d'inactivité
- Premier démarrage peut prendre 30-60 secondes
- 750 heures par mois (suffisant pour un projet personnel)

### Sécurité en production :
- ✅ JWT_SECRET sécurisé (64 caractères)
- ✅ CORS configuré pour votre domaine uniquement
- ✅ Rate limiting activé
- ✅ Headers de sécurité configurés
- ✅ Logs sécurisés (pas de données sensibles)

### Monitoring :
- Consultez les logs dans le dashboard Render
- Les erreurs sont automatiquement capturées
- Métriques de performance disponibles

## 🚨 Post-déploiement

1. **Changez le mot de passe admin** après la première connexion
2. **Testez toutes les fonctionnalités** (auth, upload, CRUD)
3. **Configurez votre frontend** pour pointer vers la nouvelle API
4. **Sauvegardez vos variables d'environnement** dans un endroit sûr

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez les logs dans le dashboard Render
2. Vérifiez que toutes les variables d'environnement sont configurées
3. Testez la connexion à la base de données

URL de votre API une fois déployée : `https://votre-app-name.onrender.com`
