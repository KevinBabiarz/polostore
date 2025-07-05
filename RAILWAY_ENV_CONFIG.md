# Configuration des Variables d'Environnement Railway pour polobeatsprod.com

## Variables à configurer dans Railway

Allez dans votre projet Railway → Settings → Variables et ajoutez ces variables :

### Variables de Production

```env
# Domaine principal
PRODUCTION_URL=https://www.polobeatsprod.com
CUSTOM_DOMAIN=www.polobeatsprod.com
API_BASE_URL=https://www.polobeatsprod.com

# Frontend URL (si nécessaire)
FRONTEND_URL=https://www.polobeatsprod.com

# Environnement
NODE_ENV=production
```

### Variables optionnelles de sécurité

```env
# CORS stricte (optionnel)
CORS_STRICT_MODE=true

# Limitation de taux personnalisée
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Vérification post-déploiement

Après avoir configuré ces variables dans Railway :

1. **Redéployez votre service** (Railway → Deployments → Redeploy)
2. **Testez les endpoints** :
   - `https://www.polobeatsprod.com/health`
   - `https://www.polobeatsprod.com/test`
   - `https://www.polobeatsprod.com/api/productions`

3. **Vérifiez les logs** pour confirmer que les nouvelles variables sont prises en compte

## Configuration DNS requise

Assurez-vous que votre DNS OVH pointe vers Railway :

```dns
Type: A
Sous-domaine: www
Cible: [IP fournie par Railway]
TTL: 300

Type: A  
Sous-domaine: (vide ou @)
Cible: [IP fournie par Railway]
TTL: 300
```

## Test de connectivité CORS

Vous pouvez tester que votre domaine est bien autorisé avec cette commande curl :

```bash
curl -H "Origin: https://www.polobeatsprod.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://www.polobeatsprod.com/api/productions
```

Le résultat devrait inclure :
```
Access-Control-Allow-Origin: https://www.polobeatsprod.com
```
