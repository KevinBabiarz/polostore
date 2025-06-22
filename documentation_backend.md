# Documentation détaillée du Backend PoloStore

## Architecture générale

Le backend de PoloStore est une API REST développée avec Node.js et Express, suivant une architecture MVC (Modèle-Vue-Contrôleur). Il utilise Sequelize comme ORM pour gérer les interactions avec une base de données PostgreSQL.

## Structure du projet

```
polostorebackend/
├── config/               # Configuration (base de données, initialisation)
├── controllers/          # Logique métier
├── middleware/           # Middleware (authentification, validation)
├── models/               # Modèles de données (Sequelize)
├── public/uploads/       # Stockage des fichiers uploadés
├── routes/               # Définition des routes API
├── utils/                # Utilitaires divers
├── server.js            # Point d'entrée de l'application
└── setAdmin.js          # Script utilitaire pour définir un utilisateur comme admin
```

## Base de données

La connexion à la base de données est configurée dans `config/db.js` pour les requêtes SQL directes et dans `config/sequelize.js` pour l'ORM Sequelize. L'initialisation des tables est gérée dans `config/initDb.js`, bien que maintenant la plupart des tables soient également gérées par les modèles Sequelize.

## Modèles (Models)

Les modèles représentent les structures de données et encapsulent la logique d'accès à la base de données:

1. **User.js** - Gestion des utilisateurs et authentification
2. **Production.js** - Productions musicales (titres, descriptions, fichiers audio)
3. **Favorite.js** - Relations entre utilisateurs et productions favorites
4. **ContactMessage.js** - Messages de contact envoyés par les utilisateurs

## Contrôleurs (Controllers)

Les contrôleurs contiennent la logique métier et traitent les requêtes HTTP:

1. **authController.js** - Inscription, connexion et authentification
2. **productionController.js** - CRUD pour les productions musicales
3. **favoriteController.js** - Gestion des favoris
4. **contactController.js** - Gestion des messages de contact
5. **adminController.js** - Fonctionnalités réservées aux administrateurs
6. **userController.js** - Gestion des utilisateurs

## Routes (Routes)

Les routes définissent les points d'entrée de l'API:

1. **authRoutes.js** - `/auth/register`, `/auth/login`
2. **productionRoutes.js** - `/productions`
3. **favoriteRoutes.js** - `/favorites`
4. **contactRoutes.js** - `/contact`
5. **adminRoutes.js** - `/admin`
6. **userRoutes.js** - `/users`

## Middleware

Les middlewares interviennent entre les requêtes et les contrôleurs:

- **authMiddleware.js** - Vérifie l'authentification et les autorisations

## Gestion des rôles utilisateurs/administrateurs

### Modèle de données des utilisateurs

Le rôle utilisateur est défini dans le modèle `User.js` avec le champ `role`:

```javascript
role: {
  type: DataTypes.STRING,
  allowNull: false,
  defaultValue: 'user',
  validate: {
    isIn: [['user', 'admin']]
  }
}
```

Ce champ peut prendre deux valeurs: `'user'` (utilisateur standard) ou `'admin'` (administrateur).

### Attribution des rôles

1. **Par défaut**: Tout nouvel utilisateur reçoit le rôle `'user'` lors de son inscription.
2. **Promotion au statut admin**: Un administrateur peut être créé via le script `setAdmin.js` ou par un autre administrateur existant.

### Authentification et autorisation

1. **Génération de token JWT**:
   - Lors de la connexion, un token JWT est généré par `authController.js`
   - Le token contient l'ID utilisateur, l'email et le statut admin (`isAdmin: user.role === 'admin'`)

2. **Middleware d'authentification**:
   - Vérifie la validité du token JWT
   - Extrait les informations utilisateur et les ajoute à l'objet `req.user`
   - Contrôle les accès aux routes protégées

3. **Middleware de vérification admin**:
   - Vérifie que `req.user.isAdmin === true` avant d'autoriser l'accès aux fonctionnalités d'administration

```javascript
// Exemple isAdmin middleware
export const isAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Accès refusé: droits d'administrateur requis" });
    }
    next();
};
```

### Fonctionnalités réservées aux administrateurs

Les routes administratives sont protégées par le middleware `isAdmin`:

1. **Gestion des utilisateurs**:
   - Liste de tous les utilisateurs
   - Modification des rôles des utilisateurs

2. **Administration des productions**:
   - Suppression de productions
   - Modification de productions de tout utilisateur

3. **Gestion des messages de contact**:
   - Accès à tous les messages reçus
   - Marquage des messages comme lus

### Implémentation technique

1. **Dans les routes**:
   ```javascript
   // Exemple de route protégée pour admin
   router.get("/users", protect, isAdmin, adminController.getAllUsers);
   ```

2. **Dans les contrôleurs**:
   Les contrôleurs font confiance au middleware et n'effectuent pas de vérification supplémentaire du rôle.

3. **Dans le frontend**:
   L'interface utilisateur s'adapte en fonction du rôle de l'utilisateur connecté, en masquant ou affichant les fonctionnalités admin.

## Flux d'authentification complet

1. L'utilisateur s'inscrit via `/auth/register`
2. L'utilisateur se connecte via `/auth/login` et reçoit un token JWT
3. Le token JWT est stocké dans le frontend (localStorage ou cookies)
4. Pour chaque requête protégée, le frontend envoie le token dans l'en-tête `Authorization`
5. Le middleware `protect` vérifie le token et extrait les informations utilisateur
6. Pour les routes admin, le middleware `isAdmin` vérifie le rôle de l'utilisateur
7. Si toutes les vérifications passent, le contrôleur approprié traite la requête

## Points importants sur la sécurité

1. **Hachage des mots de passe**: Les mots de passe sont hachés avec bcrypt avant d'être stockés
2. **Authentification par token**: Utilisation de JWT avec expiration
3. **Validation des données**: Sequelize effectue une validation des données entrantes
4. **Protection contre l'injection SQL**: L'utilisation de Sequelize protège des injections SQL
