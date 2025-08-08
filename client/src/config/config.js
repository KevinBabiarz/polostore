// src/config/config.js
const config = {
    // URL de l'API - pointer vers votre backend Railway
    API_URL: process.env.NODE_ENV === 'production'
        ? 'https://polostore-production.up.railway.app/api'
        : '/api',

    // URL des uploads - pointer vers votre backend Railway
    UPLOADS_URL: process.env.NODE_ENV === 'production'
        ? 'https://polostore-production.up.railway.app'
        : 'http://localhost:5050',

    // Chemin d'accès pour les nouveaux uploads
    UPLOAD_PATH: '/uploads/'
};

console.log('Configuration API:', config);
console.log('NODE_ENV:', process.env.NODE_ENV);

export default config;