// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import config from '../config/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem(config.JWT_TOKEN_NAME);
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    if (decoded.exp * 1000 < Date.now()) {
                        localStorage.removeItem(config.JWT_TOKEN_NAME);
                        setUser(null);
                    } else {
                        setUser(decoded);
                    }
                } catch (error) {
                    localStorage.removeItem(config.JWT_TOKEN_NAME);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token } = response.data;
            localStorage.setItem(config.JWT_TOKEN_NAME, token);
            const decoded = jwtDecode(token);
            setUser(decoded);
            return true;
        } catch (error) {
            return Promise.reject(error);
        }
    };

    const register = async (userData) => {
        try {
            await api.post('/auth/register', userData);
            return true;
        } catch (error) {
            return Promise.reject(error);
        }
    };

    const logout = () => {
        localStorage.removeItem(config.JWT_TOKEN_NAME);
        setUser(null);
    };

    const isAdmin = () => {
        return user && user.role === 'admin';
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isAdmin, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);