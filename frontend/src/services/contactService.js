// src/services/contactService.js
import api from './api';

export const sendContactMessage = async (messageData) => {
    try {
        const response = await api.post('/contact', messageData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getContactMessages = async () => {
    try {
        const response = await api.get('/contact');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const markMessageAsRead = async (id) => {
    try {
        const response = await api.put(`/contact/${id}/read`);
        return response.data;
    } catch (error) {
        throw error;
    }
};