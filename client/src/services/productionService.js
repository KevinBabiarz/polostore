// src/services/productionService.js
import api from './api';

// Cache simple pour éviter les requêtes redondantes
const cache = {
    productions: new Map(), // Map des productions par page/params
    productionDetails: new Map(), // Map des détails de production par ID
    TTL: 2 * 60 * 1000, // TTL de 2 minutes (réduit pour le développement)
};

// Fonction pour récupérer toutes les productions avec filtres
export const getProductions = async (page = 1, options = {}) => {
    try {
        // Construction des paramètres de requête
        const params = { page, limit: options.limit || 9 };

        // Ajouter uniquement les filtres dont nous avons besoin
        if (options.search) params.search = options.search;
        // Envoi du genre même s'il est vide (pour l'option "Tous")
        if (options.genre !== undefined) params.genre = options.genre;
        if (options.sortBy) params.sortBy = options.sortBy;
        if (options.releaseDateRange && options.releaseDateRange !== 'all') params.releaseDateRange = options.releaseDateRange;

        // Création d'une clé de cache basée sur les paramètres
        const cacheKey = JSON.stringify(params);
        console.log("Requête avec paramètres:", params);

        // Vérification du cache (désactivé temporairement pour le debug)
        // const cachedData = cache.productions.get(cacheKey);
        // if (cachedData && (Date.now() - cachedData.timestamp < cache.TTL)) {
        //     console.log("Résultats depuis le cache");
        //     return cachedData.data;
        // }

        // Utilisation de l'API avec le préfixe /api géré par l'instance api
        console.log("Appel API pour récupérer les productions");
        const response = await api.get('/productions', { params });
        console.log("Réponse API reçue:", response.data);

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
        const formData = new FormData();

        // Ajouter chaque champ au formData avec les bons noms de champs
        for (const key in productionData) {
            if (productionData[key] !== null && productionData[key] !== undefined) {
                // Mapper les noms de champs pour correspondre à ce que le backend attend
                if (key === 'cover_image') {
                    formData.append('image', productionData[key]);
                } else if (key === 'audio_file') {
                    formData.append('audio', productionData[key]);
                } else {
                    formData.append(key, productionData[key]);
                }
            }
        }

        console.log('Envoi de création de production');
        console.log('Données envoyées:', Object.fromEntries(formData.entries()));

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

        // Ajouter chaque champ au formData avec les bons noms de champs
        for (const key in productionData) {
            if (productionData[key] !== null && productionData[key] !== undefined) {
                // Mapper les noms de champs pour correspondre à ce que le backend attend
                if (key === 'cover_image') {
                    formData.append('image', productionData[key]);
                } else if (key === 'audio_file') {
                    formData.append('audio', productionData[key]);
                } else {
                    formData.append(key, productionData[key]);
                }
            }
        }

        console.log('Envoi de mise à jour pour production ID:', id);
        console.log('Données envoyées:', Object.fromEntries(formData.entries()));

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
