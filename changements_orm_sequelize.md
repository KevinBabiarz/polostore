# Changements apportés au backend PoloStore

## Introduction d'un ORM (Sequelize)

Nous avons intégré Sequelize, un ORM moderne pour Node.js, dans le projet backend pour améliorer la structure et la maintenabilité du code. Voici un résumé des modifications apportées :

## Nouveaux fichiers créés

1. **config/sequelize.js** - Configuration de la connexion Sequelize à la base de données PostgreSQL.

2. **Modèles Sequelize** dans le dossier `models/` :
   - `User.js` - Gestion des utilisateurs avec méthodes d'authentification
   - `Production.js` - Gestion des productions musicales
   - `ContactMessage.js` - Gestion des messages de contact
   - `Favorite.js` - Gestion des favoris utilisateur

3. **Scripts utilitaires** dans le dossier `scripts/` :
   - `createAdmin.js` - Script pour créer un utilisateur admin
   - `resetAdminPassword.js` - Script pour réinitialiser le mot de passe admin

## Fichiers modifiés

1. **server.js** :
   - Importation et initialisation de Sequelize
   - Synchronisation des modèles avec la base de données
   - Chargement des modèles Sequelize

2. **Contrôleurs** adaptés pour utiliser les modèles Sequelize :
   - `authController.js` - Authentification avec le modèle User
   - `productionController.js` - CRUD pour les productions
   - `favoriteController.js` - Gestion des favoris
   - `contactController.js` - Gestion des messages
   - `adminController.js` - Administration
   - `userController.js` - Gestion utilisateurs

## Avantages des changements

1. **Architecture plus propre** avec une séparation claire entre modèles, contrôleurs et routes.

2. **Code plus maintenable** :
   - Moins de requêtes SQL brutes
   - Méthodes expressives sur les modèles
   - Relations entre tables gérées par l'ORM

3. **Sécurité améliorée** :
   - Validation des données intégrée
   - Protection contre les injections SQL
   - Gestion des mots de passe via hooks

4. **Facilité d'évolution** :
   - Possibilité d'ajouter des migrations
   - Gestion des relations simplifiée
   - Extensibilité des modèles

## Structure MVC renforcée

La nouvelle architecture suit plus rigoureusement le pattern MVC :
- Les **Modèles** encapsulent les données et la logique d'accès
- Les **Contrôleurs** contiennent uniquement la logique métier
- Les **Routes** définissent les points d'entrée de l'API

## Comment utiliser les modèles

Exemples d'utilisation des modèles Sequelize :

```javascript
// Créer un utilisateur
const user = await User.create({
  username: 'nom_utilisateur',
  email: 'email@exemple.com',
  password: 'mot_de_passe'
});

// Rechercher des productions
const productions = await Production.findAll({
  where: { genre: 'rock' },
  order: [['created_at', 'DESC']]
});

// Vérifier un favori
const isFavorite = await Favorite.checkFavorite(userId, productionId);
```

## Résolution de problèmes

En cas de problèmes d'authentification ou de connexion à la base de données :

1. Vérifier les variables d'environnement dans `utils/.env`
3. Surveiller les logs de débogage ajoutés aux méthodes d'authentification


