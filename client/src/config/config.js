// src/config/config.js
const config = {
    // URL de l'API - pointer vers votre domaine personnalisé
    API_URL: process.env.NODE_ENV === 'production'
        ? 'https://www.polobeatsprod.com/api'
        : 'http://localhost:5050/api',

    // URL des uploads - pointer vers votre domaine personnalisé
    UPLOADS_URL: process.env.NODE_ENV === 'production'
        ? 'https://www.polobeatsprod.com'
        : 'http://localhost:5050',

    // Chemin d'accès pour les nouveaux uploads
    UPLOAD_PATH: '/uploads/'
};

console.log('Configuration API:', config);
console.log('NODE_ENV:', process.env.NODE_ENV);

export default config;