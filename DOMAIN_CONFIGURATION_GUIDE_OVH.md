# 🌐 Configuration du Nom de Domaine Principal sur Railway avec OVH

## 📋 Vue d'ensemble

Ce guide vous explique comment connecter votre **domaine principal** acheté chez OVH à votre backend Railway, avec des instructions détaillées pour la configuration DNS.

## 🚀 Étapes de configuration

### Étape 1 : Achat et configuration du domaine OVH

#### 🛒 **Achat du domaine chez OVH**
1. **Rendez-vous sur [ovh.com](https://www.ovh.com)**
2. **Recherchez votre nom de domaine** dans la barre de recherche
3. **Sélectionnez l'extension** (recommandé : `.com`)
4. **Ajoutez au panier** et procédez au paiement
5. **Attendez l'activation** (généralement 15-30 minutes)

#### 💡 **Conseils pour choisir votre domaine**
- ✅ Privilégiez un `.com` pour la reconnaissance internationale
- ✅ Évitez les tirets et chiffres
- ✅ Gardez-le court et mémorable
- ✅ Vérifiez qu'il correspond à votre marque

### Étape 2 : Ajouter le domaine dans Railway

1. **Accédez à votre projet Railway**
   - Ouvrez [railway.app](https://railway.app)
   - Connectez-vous et sélectionnez votre projet

2. **Sélectionnez votre service backend**
   - Cliquez sur le service qui héberge votre API (pas PostgreSQL)
   - Vous devriez voir votre service avec l'URL actuelle : `xxx.up.railway.app`

3. **Configurez le domaine personnalisé**
   - Allez dans l'onglet **"Settings"**
   - Trouvez la section **"Domains"** (en haut de la page)
   - Cliquez sur **"Custom Domain"** ou **"Add Domain"**

4. **Entrez votre domaine principal**
   ```
   votredomaine.com
   ```
   ⚠️ **Important** : N'ajoutez pas `https://` ou `www.`, juste le nom de domaine

5. **Validez**
   - Cliquez sur **"Add"** ou **"Create"**
   - Railway va générer une **adresse IP** à utiliser

### Étape 3 : Configuration DNS détaillée chez OVH

#### 🏢 **Accès à la gestion DNS OVH**

1. **Connectez-vous à votre [Espace Client OVH](https://www.ovh.com/manager/)**
2. **Dans le menu de gauche** : cliquez sur **"Noms de domaine"**
3. **Cliquez sur votre domaine** nouvellement acheté
4. **Onglet "Zone DNS"** (c'est là que vous allez travailler)

#### 📊 **Configuration pour domaine principal**

Railway vous aura fourni une **adresse IP** (exemple : `192.168.1.100`). Vous devez maintenant la configurer dans OVH :

##### **Étapes détaillées dans l'interface OVH :**

1. **Nettoyer les enregistrements existants (si nécessaire)**
   - Repérez les enregistrements A existants pour `@` (domaine principal)
   - Supprimez-les en cliquant sur l'icône poubelle
   - ⚠️ **Gardez** les enregistrements MX (emails) et NS (nameservers)

2. **Ajouter l'enregistrement A principal**
   - Cliquez sur **"Ajouter une entrée"**
   - Sélectionnez **"A"** dans la liste des types
   - **Sous-domaine** : laissez vide (ou tapez `@`)
   - **Cible** : l'IP fournie par Railway (ex: `192.168.1.100`)
   - **TTL** : `300` (5 minutes)
   - Cliquez **"Suivant"** puis **"Confirmer"**

3. **Ajouter l'enregistrement www (recommandé)**
   - Cliquez à nouveau **"Ajouter une entrée"**
   - Sélectionnez **"A"**
   - **Sous-domaine** : `www`
   - **Cible** : la même IP que précédemment
   - **TTL** : `300`
   - Confirmer

#### 📋 **Exemple concret de configuration OVH**

Dans votre zone DNS OVH, vous devriez avoir :

```dns
# Enregistrement 1 (domaine principal)
Type: A
Sous-domaine: (vide ou @)
Cible: 192.168.1.100
TTL: 300

# Enregistrement 2 (avec www)
Type: A  
Sous-domaine: www
Cible: 192.168.1.100
TTL: 300
```

#### ⏱️ **Propagation DNS avec OVH**

OVH a généralement une propagation rapide :
- **Local/France** : 5-30 minutes
- **Europe** : 1 heure
- **International** : 2-4 heures maximum

### Étape 4 : Vérification de la propagation DNS

#### 🔍 **Outils de vérification**

##### **Ligne de commande Windows**
```cmd
# Vérifier votre domaine
nslookup votredomaine.com

# Vérifier avec www
nslookup www.votredomaine.com
```

##### **Outils en ligne recommandés**
- [DNS Checker](https://dnschecker.org) - Vérification mondiale
- [What's My DNS](https://whatsmydns.net) - Propagation en temps réel
- [OVH DNS Propagation](https://www.ovh.com/fr/support/) - Outils OVH

##### **Vérification depuis OVH**
Dans votre espace client OVH :
- Zone DNS → **"Tester la résolution"**
- Entrez votre domaine pour vérifier

### Étape 5 : Mise à jour de la configuration backend

Une fois votre domaine configuré et propagé, je dois mettre à jour votre configuration :

#### **Configuration CORS à mettre à jour**

Dans `config/security.js`, ajout de votre domaine :

```javascript
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://polostore-five.vercel.app', // Frontend Vercel
    'https://www.polobeatsprod.com', // ← VOTRE DOMAINE PRINCIPAL
    'https://polobeatsprod.com', // ← SANS WWW
    /\.vercel\.app$/ // Domaines Vercel
];
```

#### **Variables d'environnement Railway**

Ajoutez ces variables dans Railway (Settings → Variables) :

```env
PRODUCTION_URL=https://www.polobeatsprod.com
CUSTOM_DOMAIN=votredomaine.com
API_BASE_URL=https://votredomaine.com
```

### Étape 6 : Vérification finale

#### ✅ **Tests de fonctionnement**

1. **Test de base (health check) :**
   ```
   https://votredomaine.com/health
   ```

2. **Test API simple :**
   ```
   https://votredomaine.com/test
   ```

3. **Test API productions :**
   ```
   https://votredomaine.com/api/productions
   ```

4. **Test avec www :**
   ```
   https://www.votredomaine.com/health
   ```

#### 🛠️ **Dépannage spécifique OVH**

##### **Erreur "Site can't be reached"**
- ✅ Vérifiez la propagation DNS (attendre 30 min de plus)
- ✅ Vérifiez l'IP dans la zone DNS OVH
- ✅ Testez avec `nslookup` depuis votre machine

##### **Erreur de certificat SSL**
- ✅ Railway génère automatiquement le SSL (attendre 5-10 min)
- ✅ Forcez le HTTPS dans votre navigateur

##### **Erreur CORS**
- ✅ Vérifiez que le domaine est dans `allowedOrigins`
- ✅ Redéployez Railway après modification CORS

## 📝 Exemple complet avec domaine

### **Domaine choisi :** `monstore.com`

#### **Configuration DNS OVH :**
```dns
A @ 192.168.1.100
A www 192.168.1.100
```

#### **URLs finales :**
- ✅ Site : `https://monstore.com`
- ✅ API Health : `https://monstore.com/health`
- ✅ API Test : `https://monstore.com/test`
- ✅ API Productions : `https://monstore.com/api/productions`
- ✅ Uploads : `https://monstore.com/uploads/fichier.jpg`

## 🎯 Avantages du domaine principal

- ✅ **URL courte et professionnelle** : `monstore.com/api/...`
- ✅ **Cohérence de marque** : Même domaine pour tout
- ✅ **SEO optimisé** : Autorité de domaine concentrée
- ✅ **SSL automatique** : HTTPS gratuit via Railway
- ✅ **Mémorisation facile** : Une seule URL à retenir

## 💡 Spécificités OVH

### **Interface OVH avantages**
- 🇫🇷 **Support français** disponible
- 🔧 **Interface intuitive** pour la zone DNS
- 📊 **Mode Expert et Assisté** disponibles
- 📧 **Gestion emails** intégrée si besoin
- 💰 **Prix compétitifs** sur les domaines

### **Après achat OVH**
- ⏱️ **Activation rapide** : 15-30 minutes
- 🔧 **Zone DNS** : Accessible immédiatement
- 📱 **App mobile OVH** : Gestion depuis votre téléphone
- 🛡️ **Protection WHOIS** : Incluse gratuitement

## ⚡ Checklist finale domaine principal

- [ ] Domaine acheté et activé chez OVH
- [ ] Domaine principal ajouté dans Railway
- [ ] IP Railway récupérée
- [ ] Enregistrement A configuré dans zone DNS OVH (@)
- [ ] Enregistrement A pour www configuré
- [ ] Propagation DNS vérifiée (15-60 min)
- [ ] CORS mis à jour pour inclure votre domaine
- [ ] Variables d'environnement Railway ajoutées
- [ ] SSL actif et fonctionnel
- [ ] Tests API complets réussis

## 📞 Support

### **Si problème avec OVH :**
- 📞 Support OVH : 1007 (gratuit depuis la France)
- 💬 Chat en ligne dans l'espace client
- 📧 Tickets de support

### **Si problème avec Railway :**
- 📋 Logs dans Dashboard → Service → Deployments
- 🔍 Vérification DNS avec les outils en ligne
- 📖 Documentation Railway

---

**🚀 Résultat final : Votre API sera accessible via `https://votredomaine.com/api/...` avec votre propre domaine professionnel !**

**Une fois votre domaine acheté et configuré, donnez-moi le nom exact pour que je mette à jour automatiquement votre configuration CORS.** 🌐
