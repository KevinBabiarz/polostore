// src/services/api.js
import axios from 'axios';
import config from '../config/config';

// URL de base pour toutes les requêtes API
const BASE_URL = config.API_URL;

console.log('API client initializing with base URL:', BASE_URL);

// Configuration optimisée d'axios
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 8000, // Timeout réduit à 8 secondes pour éviter les attentes trop longues
    headers: {
        'Content-Type': 'application/json'
    },
    // Utilisation d'un proxy pour contourner les problèmes CORS en développement
    proxy: false
});

// Nombre maximal de tentatives de reconnexion
const MAX_RETRIES = 1;

// Intercepteur pour ajouter le token d'authentification aux requêtes
api.interceptors.request.use(
    (config) => {
        // Log minimal des requêtes pour débogage
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);

        // Ajouter le token pour toutes les requêtes authentifiées
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Ajouter un paramètre pour éviter la mise en cache des requêtes GET
        if (config.method === 'get') {
            config.params = {
                ...config.params,
                _t: Date.now() // Timestamp unique
            };
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les réponses et les erreurs
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Information d'erreur pour le débogage
        const errorInfo = {
            url: originalRequest?.url,
            method: originalRequest?.method,
            status: error.response?.status,
            message: error.message
        };

        // Vérification si la requête a déjà été tentée
        if (error.message.includes('timeout') &&
            originalRequest &&
            !originalRequest._retry &&
            originalRequest._retryCount < MAX_RETRIES) {

            // Incrémenter le compteur de tentatives
            originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
            console.log(`Retry attempt ${originalRequest._retryCount} for ${originalRequest.url}`);

            // Attendre un court délai avant de réessayer
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Réessayer la requête
            return api(originalRequest);
        }

        // Personnalisation des messages d'erreur
        if (error.message.includes('timeout')) {
            error.message = "La requête a pris trop de temps à répondre. Le serveur est-il démarré ?";
            console.error("Erreur de timeout:", errorInfo);
        } else if (error.code === 'ERR_NETWORK') {
            error.message = "Impossible de se connecter au serveur. Vérifiez que le serveur backend est démarré.";
            console.error("Erreur réseau:", errorInfo);
        } else {
            console.error("Erreur API:", errorInfo);
        }

        return Promise.reject(error);
    }
);

export default api;