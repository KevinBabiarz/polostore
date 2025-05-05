// src/config/config.js
const config = {
    // URL de l'API - différentes selon l'environnement
    API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',

    // URL des uploads
    UPLOADS_URL: process.env.REACT_APP_UPLOADS_URL || 'http://localhost:3001/uploads/',

    // Nom du token JWT dans le localStorage
    JWT_TOKEN_NAME: 'production_musicale_token'
};

export default config;