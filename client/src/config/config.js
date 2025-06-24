// src/config/config.js
const config = {
    // URL de l'API - utilisation d'un chemin relatif pour éviter les problèmes de CORS
    API_URL: '/api',

    // URL des uploads - correspondant au nouveau chemin configuré sur le serveur
    UPLOADS_URL: '',  // Chaîne vide car les URLs des images incluent déjà le chemin complet /api/uploads/

    // Chemin d'accès pour les nouveaux uploads (utile pour les formulaires)
    UPLOAD_PATH: '/api/uploads/'
};

console.log('Configuration API:', config); // Log pour vérifier la configuration

export default config;