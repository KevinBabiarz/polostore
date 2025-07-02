// src/config/config.js
const config = {
    // URL de l'API - pointer vers votre backend Railway
    API_URL: process.env.NODE_ENV === 'production'
        ? 'https://reasonable-healing-production.up.railway.app/api'
        : 'http://localhost:5050/api',

    // URL des uploads - pointer vers votre backend Railway
    UPLOADS_URL: process.env.NODE_ENV === 'production'
        ? 'https://reasonable-healing-production.up.railway.app'
        : 'http://localhost:5050',

    // Chemin d'accès pour les nouveaux uploads
    UPLOAD_PATH: '/api/uploads/'
};

console.log('Configuration API:', config);

export default config;