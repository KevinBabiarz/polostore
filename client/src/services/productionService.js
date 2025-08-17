// src/services/productionService.js
import api from './api';

// Cache simple pour éviter les requêtes redondantes
const cache = {
    productions: new Map(),
    productionDetails: new Map(),
    TTL: 2 * 60 * 1000,
};

// Helper: construit un FormData à partir d'un objet simple
const toFormData = (data) => {
    const formData = new FormData();

    // Parcourt des champs simples
    Object.entries(data || {}).forEach(([key, value]) => {
        if (value === null || value === undefined) return;

        // Mapping des noms attendus par le backend
        if (key === 'cover_image') {
            // champ image (single)
            formData.append('image', value);
        } else if (key === 'audio_file') {
            // champ audio (single)
            formData.append('audio', value);
        } else if (key === 'audio_files' && Array.isArray(value)) {
            // plusieurs fichiers audio
            value.forEach((file) => formData.append('audio_files', file));
        } else {
            formData.append(key, value);
        }
    });

    return formData;
};

// Fonction pour récupérer toutes les productions avec filtres
export const getProductions = async (page = 1, options = {}) => {
    try {
        const params = { page, limit: options.limit || 9 };
        if (options.search) params.search = options.search;
        if (options.genre !== undefined) params.genre = options.genre;
        if (options.sortBy) params.sortBy = options.sortBy;
        if (options.releaseDateRange && options.releaseDateRange !== 'all') params.releaseDateRange = options.releaseDateRange;

        const cacheKey = JSON.stringify(params);
        console.log('Requête avec paramètres:', params);

        console.log('Appel API pour récupérer les productions');
        const response = await api.get('/productions', { params });
        console.log('Réponse API reçue:', response.data);

        if (response.data) {
            cache.productions.set(cacheKey, { data: response.data, timestamp: Date.now() });
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
        const cachedData = cache.productionDetails.get(id);
        if (cachedData && Date.now() - cachedData.timestamp < cache.TTL) {
            return cachedData.data;
        }

        const response = await api.get(`/productions/${id}`);
        if (response.data) {
            cache.productionDetails.set(id, { data: response.data, timestamp: Date.now() });
        }
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération de la production ${id}:`, error);
        throw error;
    }
};

// Créer une nouvelle production
export const createProduction = async (data) => {
    try {
        // Si on reçoit déjà un FormData (venant d'un composant), le réutiliser tel quel
        const formData = data instanceof FormData ? data : toFormData(data);

        console.log('Envoi de création de production');
        const response = await api.post('/productions', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        cache.productions.clear();
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création de la production:', error);
        throw error;
    }
};

// Mettre à jour une production existante
export const updateProduction = async (id, data) => {
    try {
        const formData = data instanceof FormData ? data : toFormData(data);

        console.log('Envoi de mise à jour pour production ID:', id);
        const response = await api.put(`/productions/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        cache.productions.clear();
        cache.productionDetails.delete(id);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la mise à jour de la production ${id}:`, error);
        throw error;
    }
};

// Supprimer une production
export const deleteProduction = async (id) => {
    try {
        const response = await api.delete(`/productions/${id}`);
        cache.productions.clear();
        cache.productionDetails.delete(id);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la suppression de la production ${id}:`, error);
        throw error;
    }
};

// Nettoyer le cache
export const clearProductionsCache = () => {
    cache.productions.clear();
    cache.productionDetails.clear();
};
