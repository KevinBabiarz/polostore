// src/services/favoriteService.js
import api from './api';

export const getFavorites = async () => {
    try {
        const response = await api.get('/favorites');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addFavorite = async (productionId) => {
    try {
        const response = await api.post('/favorites', { productionId });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const removeFavorite = async (productionId) => {
    try {
        const response = await api.delete(`/favorites/${productionId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const checkIsFavorite = async (productionId) => {
    try {
        const response = await api.get('/favorites');
        const favorites = response.data;
        return favorites.some(fav => fav.id === parseInt(productionId));
    } catch (error) {
        return false;
    }
};