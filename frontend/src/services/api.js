// src/services/api.js
import axios from 'axios';
import config from '../config/config';
import { getCurrentUser, refreshToken } from './authService';
import errorHandler from '../utils/errorHandler';

// Créer une instance Axios avec la configuration de base
const api = axios.create({
    baseURL: config.API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use(
    (config) => {
        const user = getCurrentUser();
        if (user) {
            config.headers.Authorization = `Bearer ${localStorage.getItem(config.JWT_TOKEN_NAME)}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les réponses et les erreurs
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Gérer l'expiration du token (401 Unauthorized)
        if (error.response && error.response.status === 401) {
            try {
                // Essayer de rafraîchir le token
                await refreshToken();

                // Récupérer le nouveau token
                const token = localStorage.getItem(config.JWT_TOKEN_NAME);

                // Refaire la requête originale avec le nouveau token
                error.config.headers.Authorization = `Bearer ${token}`;
                return api(error.config);
            } catch (refreshError) {
                // Si le rafraîchissement échoue, rediriger vers la page de connexion
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Gérer les autres erreurs
        errorHandler(error, 'API');
        return Promise.reject(error);
    }
);

export default api;