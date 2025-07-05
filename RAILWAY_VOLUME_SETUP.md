# Configuration du Volume Persistant Railway

## 📋 Résumé des modifications apportées

J'ai modifié votre application pour qu'elle soit compatible avec les volumes persistants Railway :

### 1. Fichiers modifiés :
- ✅ `railway.toml` - Configuration du volume
- ✅ `server.js` - Détection automatique du volume
- ✅ `middleware/uploadSecurity.js` - Adaptation du stockage

### 2. Nouvelles fonctionnalités :
- 🔍 **Détection automatique** : L'app détecte si elle s'exécute avec un volume Railway
- 📁 **Chemin dynamique** : Utilise `/app/public/uploads` sur Railway, `./public/uploads` en local
- 📝 **Logs informatifs** : Affiche le chemin utilisé au démarrage

## 🚀 Instructions de déploiement sur Railway

### Étape 1 : Déployer le code modifié
```bash
git add .
git commit -m "Add Railway persistent volume support"
git push
```

### Étape 2 : Créer le volume persistant
1. **Ouvrez votre projet Railway**
2. **Cliquez sur le service backend**
3. **Allez dans l'onglet "Settings"**
4. **Trouvez la section "Volumes"**
5. **Cliquez sur "Add Volume"**
6. **Configurez le volume :**
   - **Name** : `uploads-volume`
   - **Mount Path** : `/app/public/uploads`
   - **Size** : 1GB (ou selon vos besoins)

### Étape 3 : Redéployer
Après avoir créé le volume, Railway redéploiera automatiquement votre service.

## 🔧 Variables d'environnement automatiques

Railway injectera automatiquement ces variables :
- `RAILWAY_VOLUME_NAME` → `uploads-volume`
- `RAILWAY_VOLUME_MOUNT_PATH` → `/app/public/uploads`
- `RAILWAY_RUN_UID` → `0` (déjà configuré dans railway.toml)

## ✅ Vérification du bon fonctionnement

### 1. Vérifiez les logs au démarrage
Vous devriez voir dans les logs Railway :
```
Volume Railway détecté: /app/public/uploads
Dossier uploads créé: /app/public/uploads
```

### 2. Testez l'upload d'un fichier
- Uploadez une image ou un fichier audio
- Redéployez votre application
- Vérifiez que le fichier est toujours accessible

### 3. Route de test
Ajoutez cette route temporaire pour vérifier :
```javascript
app.get('/api/volume-info', (req, res) => {
    res.json({
        uploadsPath: UPLOADS_PATH,
        railwayVolume: process.env.RAILWAY_VOLUME_MOUNT_PATH || 'Non détecté',
        railwayVolumeName: process.env.RAILWAY_VOLUME_NAME || 'Non détecté',
        filesCount: fs.readdirSync(UPLOADS_PATH).length
    });
});
```

## ⚠️ Points importants

### ✅ Ce qui sera persistant :
- 🖼️ Images uploadées
- 🎵 Fichiers audio
- 📁 Structure des dossiers

### ❌ Ce qui ne sera PAS persistant (normal) :
- 📦 node_modules
- 🏗️ Fichiers de build
- 📝 Logs temporaires

### 🔒 Sécurité maintenue :
- ✅ Validation des types de fichiers
- ✅ Noms de fichiers sécurisés
- ✅ Limitation de taille
- ✅ Protection contre la traversée de répertoires

## 🚨 En cas de problème

### Si les fichiers ne persistent pas :
1. Vérifiez que le volume est bien créé dans Railway
2. Vérifiez le mount path : `/app/public/uploads`
3. Consultez les logs pour voir si le volume est détecté

### Si l'upload ne fonctionne plus :
1. Vérifiez les permissions (RAILWAY_RUN_UID=0)
2. Vérifiez que le dossier est créé au démarrage
3. Testez d'abord en local

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs Railway
2. Testez la route `/api/volume-info` (si ajoutée)
3. Consultez la documentation Railway sur les volumes

---

✨ **Résultat** : Vos fichiers uploadés seront maintenant persistants entre les déploiements !
