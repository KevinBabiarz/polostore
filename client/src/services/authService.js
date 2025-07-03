// src/services/authService.js
import api from './api';
import { jwtDecode } from 'jwt-decode';

// Constante pour le nom du token dans localStorage
const TOKEN_KEY = 'token';

// Configuration de retry
const RETRY_CONFIG = {
  attempts: 2,
  delay: 1000
};

// Fonction adaptée au nouveau modèle Sequelize pour l'inscription
export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de l'inscription:", error.response?.data || error.message);
        throw error;
    }
};

// Fonction pour exécuter une requête avec retry
const executeWithRetry = async (fn, retryConfig = RETRY_CONFIG) => {
    let lastError;

    for (let attempt = 0; attempt < retryConfig.attempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Si ce n'est pas la dernière tentative, attendre avant de réessayer
            if (attempt < retryConfig.attempts - 1) {
                await new Promise(resolve => setTimeout(resolve, retryConfig.delay));
            }
        }
    }

    // Si toutes les tentatives échouent, rejeter avec la dernière erreur
    throw lastError;
};

// Fonction adaptée au nouveau modèle Sequelize pour la connexion
export const login = async (credentials) => {
    try {
        // Utiliser le mécanisme de retry pour la requête d'authentification
        const response = await executeWithRetry(() =>
            api.post('/auth/login', credentials)
        );

        // Le token peut être à différents endroits selon la structure de la réponse
        const token = response.data?.token || response.data?.accessToken;

        if (!token) {
            throw new Error("Réponse d'authentification invalide: token manquant");
        }

        // Stocker le token JWT
        localStorage.setItem(TOKEN_KEY, token);

        try {
            // Récupérer les informations de l'utilisateur à partir du token
            const decodedToken = jwtDecode(token);

            // Essayer d'extraire les données utilisateur de différentes sources possibles
            let userData = response.data?.user || response.data;

            if (!userData || Object.keys(userData).length === 0) {
                userData = decodedToken.user || decodedToken;
            }

            // S'assurer que nous avons au moins un email
            if (!userData.email && credentials.email) {
                userData.email = credentials.email;
            }

            // Déterminer si l'utilisateur est admin (simplification)
            const isAdmin = userData.isAdmin || userData.is_admin ||
                           (userData.role === 'admin') ||
                           decodedToken.isAdmin ||
                           (decodedToken.role === 'admin');

            // Construire l'objet utilisateur unifié avec la structure attendue
            const userObject = {
                ...userData,
                isAdmin: isAdmin,
                role: isAdmin ? 'admin' : userData.role || 'user',
                email: userData.email || credentials.email
            };

            return {
                success: true,
                user: userObject,
                token: token,
                isAdmin: isAdmin
            };
        } catch (decodeError) {
            // En cas d'erreur de décodage, retourner quand même un succès mais avec un utilisateur minimal
            return {
                success: true,
                user: { email: credentials.email },
                token: token,
                isAdmin: false
            };
        }
    } catch (error) {
        // Retourner un objet formaté avec les informations d'erreur
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Échec de la connexion",
            status: error.response?.status
        };
    }
};

export const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
};

export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

// Vérifier si l'utilisateur est connecté
export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;

    try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // Vérifier si le token n'a pas expiré
        return decodedToken.exp > currentTime;
    } catch (error) {
        return false;
    }
};
