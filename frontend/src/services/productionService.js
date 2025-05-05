// src/services/productionService.js
import api from './api';

export const getProductions = async (page = 1, filters = {}) => {
    try {
        const response = await api.get('/productions', {
            params: { page, ...filters }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getProduction = async (id) => {
    try {
        const response = await api.get(`/productions/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createProduction = async (productionData) => {
    // FormData pour l'upload d'image
    const formData = new FormData();

    Object.keys(productionData).forEach(key => {
        if (key === 'cover_image') {
            if (productionData[key]) {
                formData.append(key, productionData[key]);
            }
        } else {
            formData.append(key, productionData[key]);
        }
    });

    try {
        const response = await api.post('/productions', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateProduction = async (id, productionData) => {
    const formData = new FormData();

    Object.keys(productionData).forEach(key => {
        if (key === 'cover_image') {
            if (productionData[key] && typeof productionData[key] !== 'string') {
                formData.append(key, productionData[key]);
            }
        } else {
            formData.append(key, productionData[key]);
        }
    });

    try {
        const response = await api.put(`/productions/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteProduction = async (id) => {
    try {
        const response = await api.delete(`/productions/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};