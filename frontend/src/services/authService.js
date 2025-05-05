// src/services/authService.js
import api from './api';
import config from '../config/config';
import { jwtDecode } from 'jwt-decode';

export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        const { token } = response.data;

        // Stocker le token
        localStorage.setItem(config.JWT_TOKEN_NAME, token);

        // Décoder le token pour obtenir les informations utilisateur
        const decoded = jwtDecode(token);

        return {
            token,
            user: decoded
        };
    } catch (error) {
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem(config.JWT_TOKEN_NAME);
};

export const refreshToken = async () => {
    try {
        const response = await api.post('/auth/refresh-token');
        const { token } = response.data;

        localStorage.setItem(config.JWT_TOKEN_NAME, token);

        return {
            token,
            user: jwtDecode(token)
        };
    } catch (error) {
        throw error;
    }
};

export const getCurrentUser = () => {
    try {
        const token = localStorage.getItem(config.JWT_TOKEN_NAME);
        if (!token) return null;

        const decoded = jwtDecode(token);

        // Vérifier si le token a expiré
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            localStorage.removeItem(config.JWT_TOKEN_NAME);
            return null;
        }

        return decoded;
    } catch (error) {
        localStorage.removeItem(config.JWT_TOKEN_NAME);
        return null;
    }
};

export const isTokenValid = () => {
    return getCurrentUser() !== null;
};