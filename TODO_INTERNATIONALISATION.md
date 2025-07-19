# TODO - Internationalisation i18next

## Fichiers à internationaliser avec i18n.t()

### ✅ DÉJÀ FAIT (Partiellement)
- `services/authService.js` - ✅ JWT_SECRET message
- `services/userService.js` - ✅ Messages d'erreur principaux
- `services/favoriteService.js` - ✅ Messages d'erreur
- `services/contactService.js` - ✅ Messages d'erreur

### 🔄 EN COURS / À COMPLÉTER

#### 1. services/userService.js
**Lignes à internationaliser :**
- Ligne 17: `"[USER SERVICE] Récupération des utilisateurs avec options:"` 
  → `i18n.t('userService.fetchingUsers')`
- Ligne 49: `"[USER SERVICE] Erreur lors de la récupération des utilisateurs:"` 
  → `i18n.t('userService.errorFetchingUsers')`
- Ligne 133: `"Le statut administrateur doit être un booléen"` 
  → `i18n.t('userService.adminStatusMustBeBoolean')`
- Ligne 139: `"Utilisateur non trouvé"` 
  → `i18n.t('userService.userNotFound')`
- Ligne 158: `"Utilisateur non trouvé"` 
  → `i18n.t('userService.userNotFound')`

#### 2. services/productionService.js
**Lignes à internationaliser :**
- Ligne 182: `"Production non trouvée"` 
  → `i18n.t('productionService.productionNotFound')`
- Ligne 199: `"[PROD SERVICE] Données reçues pour la création:"` 
  → `i18n.t('productionService.dataReceivedForCreation')`
- Ligne 209: `"[PROD SERVICE] Données prêtes pour création:"` 
  → `i18n.t('productionService.dataReadyForCreation')`
- Ligne 216: `"[PROD SERVICE] Erreur lors de la création de la production:"` 
  → `i18n.t('productionService.errorCreatingProduction')`
- Ligne 236: `"Production non trouvée"` 
  → `i18n.t('productionService.productionNotFound')`
- Ligne 297: `"Aucune mise à jour effectuée"` 
  → `i18n.t('productionService.noUpdatePerformed')`
- Ligne 324: `"Production non trouvée"` 
  → `i18n.t('productionService.productionNotFound')`

#### 3. server.js
**Lignes à internationaliser :**
- Ligne 69: `"Configuration Railway DATABASE_URL détectée"` 
  → `i18n.t('server.railwayConfigDetected')`
- Ligne 71: `"Configuration de base de données locale"` 
  → `i18n.t('server.localDbConfig')`
- Ligne 235: `"Connexion PostgreSQL établie avec succès"` 
  → `i18n.t('server.postgresConnected')`
- Ligne 245: `"Erreur d'initialisation de la base de données"` 
  → `i18n.t('server.dbInitError')`
- Ligne 291: `"Connecté à PostgreSQL"` 
  → `i18n.t('server.connectedToPostgres')`
- Ligne 297: `"Erreur de connexion à la base de données"` 
  → `i18n.t('server.dbConnectionError')`
- Ligne 300: `"Échec de connexion à PostgreSQL"` 
  → `i18n.t('server.postgresConnectionFailed')`

#### 4. setAdmin.js
**Lignes à internationaliser :**
- Ligne 34: `"La colonne is_admin n'existe pas, vérifions role..."` 
  → `i18n.t('setAdmin.checkingRoleColumn')`
- Ligne 54: `"Ni is_admin ni role n'existent dans la table users"` 
  → `i18n.t('setAdmin.noAdminColumns')`

### 📋 AUTRES FICHIERS À VÉRIFIER

#### Controllers (à examiner)
- `controllers/adminController.js`
- `controllers/authController.js`
- `controllers/contactController.js`
- `controllers/favoriteController.js`
- `controllers/productionController.js`
- `controllers/userController.js`

#### Middleware (à examiner)
- `middleware/authMiddleware.js`
- `middleware/uploadSecurity.js`

#### Models (à examiner)
- `models/User.js`
- `models/Production.js`
- `models/Favorite.js`
- `models/ContactMessage.js`
- `models/RevokedToken.js`

### 🎯 TRADUCTIONS À AJOUTER dans locales/fr/translation.json

```json
{
  "userService": {
    "fetchingUsers": "[USER SERVICE] Récupération des utilisateurs avec options: {{options}}",
    "errorFetchingUsers": "[USER SERVICE] Erreur lors de la récupération des utilisateurs: {{error}}",
    "adminStatusMustBeBoolean": "Le statut administrateur doit être un booléen"
  },
  "productionService": {
    "productionNotFound": "Production non trouvée",
    "dataReceivedForCreation": "[PROD SERVICE] Données reçues pour la création: {{data}}",
    "dataReadyForCreation": "[PROD SERVICE] Données prêtes pour création: {{data}}",
    "errorCreatingProduction": "[PROD SERVICE] Erreur lors de la création de la production: {{error}}",
    "noUpdatePerformed": "Aucune mise à jour effectuée"
  },
  "server": {
    "railwayConfigDetected": "Configuration Railway DATABASE_URL détectée",
    "localDbConfig": "Configuration de base de données locale",
    "postgresConnected": "Connexion PostgreSQL établie avec succès",
    "dbInitError": "Erreur d'initialisation de la base de données",
    "connectedToPostgres": "Connecté à PostgreSQL",
    "dbConnectionError": "Erreur de connexion à la base de données",
    "postgresConnectionFailed": "Échec de connexion à PostgreSQL"
  },
  "setAdmin": {
    "checkingRoleColumn": "La colonne is_admin n'existe pas, vérifions role...",
    "noAdminColumns": "Ni is_admin ni role n'existent dans la table users"
  }
}
```

### 📝 CHECKLIST DE PROGRESSION

- [ ] Compléter userService.js
- [ ] Compléter productionService.js  
- [ ] Internationaliser server.js
- [ ] Internationaliser setAdmin.js
- [ ] Examiner tous les controllers
- [ ] Examiner tous les middleware
- [ ] Examiner tous les models
- [ ] Ajouter toutes les traductions manquantes
- [ ] Tester que tout fonctionne

### 💡 NOTES IMPORTANTES

1. **Import i18n** : S'assurer que chaque fichier importe `import { i18n } from '../utils/i18n.js';`
2. **Paramètres** : Utiliser `{{variable}}` pour les variables dynamiques
3. **Consistance** : Garder la même structure de clés (service.action)
4. **Test** : Tester chaque modification pour éviter les erreurs

### 🚀 COMMANDES UTILES

```bash
# Rechercher tous les messages en français
grep -r "é\|è\|ê\|ë\|à\|â\|ä\|ô\|ö\|ù\|û\|ü\|ç\|ñ" services/ controllers/ middleware/ models/

# Rechercher les console.log
grep -r "console\." services/ controllers/ middleware/ models/

# Rechercher les throw new Error
grep -r "throw new Error" services/ controllers/ middleware/ models/
```
