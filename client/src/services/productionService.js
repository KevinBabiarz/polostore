// src/services/productionService.js
import api from './api';

// Cache simple pour éviter les requêtes redondantes
const cache = {
    productions: new Map(), // Map des productions par page/params
    productionDetails: new Map(), // Map des détails de production par ID
    TTL: 5 * 60 * 1000, // TTL de 5 minutes
};

// Fonction pour récupérer toutes les productions
export const getProductions = async (page = 1, limit = 10, search = '', genre = '', sortBy = 'latest') => {
    try {
        // Si limit est un objet (options), on extrait les paramètres
        let params = { page };
        if (typeof limit === 'object') {
            params = { ...params, ...limit };
        } else {
            params.limit = limit;
        }

        // Ajout des autres paramètres si présents
        if (search) params.search = search;
        if (genre) params.genre = genre;
        if (sortBy) params.sortBy = sortBy;

        // Création d'une clé de cache basée sur les paramètres
        const cacheKey = JSON.stringify(params);

        // Vérification du cache
        const cachedData = cache.productions.get(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < cache.TTL)) {
            return cachedData.data;
        }

        // Utilisation de l'API avec le préfixe /api géré par l'instance api
        const response = await api.get('/productions', { params });

        // Mise en cache des données
        if (response.data) {
            cache.productions.set(cacheKey, {
                data: response.data,
                timestamp: Date.now()
            });
        }

        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des productions:', error);
        throw error;
    }
};

// Fonction pour récupérer une production par ID
export const getProductionById = async (id) => {
    try {
        // Vérification du cache
        const cachedData = cache.productionDetails.get(id);
        if (cachedData && (Date.now() - cachedData.timestamp < cache.TTL)) {
            return cachedData.data;
        }

        const response = await api.get(`/productions/${id}`);

        // Mise en cache des données
        if (response.data) {
            cache.productionDetails.set(id, {
                data: response.data,
                timestamp: Date.now()
            });
        }

        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération de la production ${id}:`, error);
        throw error;
    }
};

// Fonction pour créer une nouvelle production
export const createProduction = async (productionData) => {
    try {
        // Vérifier si productionData est déjà un FormData
        const formData = productionData instanceof FormData
            ? productionData
            : createFormDataFromObject(productionData);

        const response = await api.post('/productions', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        // Invalider le cache des productions après création
        cache.productions.clear();

        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création de la production:', error);
        throw error;
    }
};

// Fonction utilitaire pour créer un FormData à partir d'un objet
const createFormDataFromObject = (data) => {
    const formData = new FormData();
    for (const key in data) {
        if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
        }
    }
    return formData;
};

// Fonction pour mettre à jour une production existante
export const updateProduction = async (id, productionData) => {
    try {
        const formData = new FormData();

        // Ajouter chaque champ au formData
        for (const key in productionData) {
            if (productionData[key] !== null && productionData[key] !== undefined) {
                formData.append(key, productionData[key]);
            }
        }

        const response = await api.put(`/productions/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        // Invalider les caches après mise à jour
        cache.productions.clear();
        cache.productionDetails.delete(id);

        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la mise à jour de la production ${id}:`, error);
        throw error;
    }
};

// Fonction pour supprimer une production
export const deleteProduction = async (id) => {
    try {
        const response = await api.delete(`/productions/${id}`);

        // Invalider les caches après suppression
        cache.productions.clear();
        cache.productionDetails.delete(id);

        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la suppression de la production ${id}:`, error);
        throw error;
    }
};

// Fonction pour nettoyer le cache
export const clearProductionsCache = () => {
    cache.productions.clear();
    cache.productionDetails.clear();
};
