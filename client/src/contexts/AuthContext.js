// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adminStatus, setAdminStatus] = useState(false);

    // Fonction de détection du statut administrateur adaptée pour Sequelize
    const checkAdminStatus = (userData) => {
        if (!userData) return false;

        // Donner la priorité à la structure documentée du backend (champ 'role')
        if (userData.role === 'admin') {
            console.log('Statut admin détecté via le champ role (Sequelize)');
            return true;
        }

        // Vérifications secondaires pour compatibilité
        const isAdminBoolean =
            userData.isAdmin === true ||
            userData.is_admin === true;

        // Vérification via les claims JWT
        if (userData.claims && userData.claims.isAdmin) {
            return true;
        }

        const result = isAdminBoolean;
        console.log('Vérification admin pour:', userData, 'Résultat:', result);
        return result;
    };

    useEffect(() => {
        // Supprimer le token pour forcer la connexion à chaque démarrage de l'application
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];

        // Vérifier si l'utilisateur est déjà connecté au chargement
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Vérifier la validité du token
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    // Tentative d'obtenir les données utilisateur via /auth/me
                    const response = await api.get('/auth/me');
                    console.log('Données utilisateur reçues de /auth/me:', response.data);

                    // Les données peuvent être directement dans response.data ou dans response.data.user (Sequelize)
                    const userData = response.data.user || response.data;

                    // Vérifier et stocker le statut admin
                    const isUserAdmin = checkAdminStatus(userData);
                    setAdminStatus(isUserAdmin);

                    // Si l'utilisateur est admin mais que le champ n'est pas défini, l'ajouter
                    if (isUserAdmin && userData.isAdmin === undefined) {
                        userData.isAdmin = true;
                    }

                    setUser(userData);

                    console.log('Utilisateur chargé avec statut admin:', isUserAdmin);
                } catch (error) {
                    console.error("Erreur de vérification du token:", error);
                    localStorage.removeItem('token');
                    delete api.defaults.headers.common['Authorization'];
                    setAdminStatus(false);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkLoggedIn();
    }, []);

    // Fonction de connexion
    const login = async (email, password) => {
        try {
            // Utiliser le service d'authentification mis à jour
            const authResult = await authService.login({ email, password });

            // Vérifier si la connexion a réussi
            if (!authResult.success) {
                return {
                    success: false,
                    message: authResult.message || 'Identifiants incorrects. Veuillez réessayer.'
                };
            }

            // Extraction des données utilisateur
            const userData = authResult.user;

            if (!userData) {
                return {
                    success: false,
                    message: "Format de réponse invalide"
                };
            }

            // Configuration du client API avec le token (si nécessaire - normalement déjà fait dans authService)
            if (authResult.token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${authResult.token}`;
            }

            // Mise à jour des états
            setUser(userData);
            setAdminStatus(authResult.isAdmin || false);

            console.log("Connexion réussie, utilisateur défini:", userData);
            console.log("Statut admin:", authResult.isAdmin);

            return { success: true };
        } catch (error) {
            console.error("Erreur de connexion:", error);

            return {
                success: false,
                message: error.message || "Une erreur inattendue s'est produite"
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authService.register(userData);

            // Si l'API retourne directement un token, connecter l'utilisateur
            if (response.token) {
                const token = response.token;
                const userInfo = response.user || {};

                // Vérifier le statut admin
                const isUserAdmin = checkAdminStatus(userInfo);

                // Configurer le client API
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Mettre à jour les états
                setUser(userInfo);
                setAdminStatus(isUserAdmin);

                return { success: true };
            }

            // Si pas de connexion automatique, simplement indiquer le succès
            return { success: true };
        } catch (error) {
            console.error("Erreur d'inscription:", error);
            return {
                success: false,
                message: error.response?.data?.message || "Échec de l'inscription"
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setAdminStatus(false);
    };

    const isAuthenticated = () => !!user;

    // Fonction améliorée pour vérifier si l'utilisateur est administrateur
    const isAdmin = () => {
        // Utiliser l'état dédié au statut admin comme source de vérité principale
        if (adminStatus === true) {
            return true;
        }

        // Si l'état n'est pas défini, vérifier l'objet user
        const adminFromUser = checkAdminStatus(user);

        // Si le statut est trouvé dans user mais pas dans l'état, mettre à jour l'état
        if (adminFromUser && !adminStatus) {
            setAdminStatus(true);
        }

        return adminFromUser;
    };

    const value = {
        user,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin,
        loading,
        adminStatus // Exposer directement le statut admin pour les composants qui en ont besoin
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
    }
    return context;
};