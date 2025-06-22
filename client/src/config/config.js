// src/config/config.js
const config = {
    // URL de l'API - utilisation d'un chemin relatif pour éviter les problèmes de CORS
    API_URL: '/api',

    // URL des uploads - aussi avec chemin relatif
    UPLOADS_URL: '/uploads/'
};

console.log('Configuration API:', config); // Log pour vérifier la configuration

export default config;