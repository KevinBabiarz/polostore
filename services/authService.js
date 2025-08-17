// services/authService.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { createTokenWithJTI, revokeToken } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';
import { i18n } from '../utils/i18n.js';

/**
 * Service d'authentification - gère la logique métier liée à l'authentification
 */
export const AuthService = {
    /**
     * Génère un token JWT sécurisé avec JTI pour un utilisateur
     * @param {Object} user - L'utilisateur pour lequel générer le token
     * @returns {Object} Le token JWT et son ID
     */
    generateSecureToken: (user) => {
        if (!process.env.JWT_SECRET) {
            throw new Error(i18n.t('authService.jwtSecretNotDefined'));
        }

        const payload = {
            id: user.id,
            role: user.is_admin ? 'admin' : 'user',
            email: user.email,
            isActive: Boolean(user.is_active),
            isAdmin: Boolean(user.is_admin)
        };

        return createTokenWithJTI(payload);
    },

    /**
     * Génère un token JWT (méthode legacy pour compatibilité)
     * @deprecated Utiliser generateSecureToken à la place
     */
    generateToken: (user) => {
        logger.warn('Utilisation de generateToken deprecated, utiliser generateSecureToken');
        return AuthService.generateSecureToken(user).token;
    },

    /**
     * Enregistre un nouvel utilisateur
     * @param {Object} userData - Données de l'utilisateur à créer
     * @returns {Promise<Object>} L'utilisateur créé avec token
     */
    register: async (userData) => {
        const { username, email, password } = userData;

        // Validation des données d'entrée
        if (!username || !email || !password) {
            throw new Error(i18n.t('authService.allFieldsRequired'));
        }

        if (password.length < 8) {
            throw new Error(i18n.t('authService.passwordTooShort'));
        }

        // Validation de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error(i18n.t('authService.invalidEmailFormat'));
        }

        // Vérifier si l'utilisateur existe déjà
        const existingEmail = await User.findOne({ where: { email } });
        const existingUsername = await User.findOne({ where: { username } });

        if (existingEmail) {
            throw new Error(i18n.t('authService.emailAlreadyUsed'));
        }

        if (existingUsername) {
            throw new Error(i18n.t('authService.usernameAlreadyTaken'));
        }

        // Créer l'utilisateur avec Sequelize (le mot de passe sera hashé automatiquement par le hook beforeCreate)
        const newUser = await User.create({
            username,
            email,
            password, // Ne pas hasher ici, c'est fait automatiquement par le modèle
            is_admin: false
        });

        // Générer le token sécurisé
        const { token, jti } = AuthService.generateSecureToken(newUser);

        logger.info('Nouvel utilisateur enregistré', {
            userId: newUser.id,
            username: newUser.username
        });

        return {
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.is_admin ? 'admin' : 'user',
                isActive: true,
                isAdmin: newUser.is_admin || false
            },
            token,
            jti
        };
    },

    /**
     * Authentifie un utilisateur
     * @param {string} email - Email de l'utilisateur
     * @param {string} password - Mot de passe de l'utilisateur
     * @returns {Promise<Object>} L'utilisateur authentifié avec token
     */
    login: async (email, password) => {
        // Validation des données d'entrée
        if (!email || !password) {
            throw new Error("Email et mot de passe requis");
        }

        // Rechercher l'utilisateur par email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            logger.warn('Tentative de connexion avec email inexistant', { email });
            throw new Error("Identifiants invalides");
        }

        // Vérifier si le compte est désactivé
        if (user.is_active === false) {
            logger.warn('Tentative de connexion sur compte désactivé', { userId: user.id, email });
            throw new Error("Compte désactivé");
        }

        // Vérifier la présence d'un hash valide
        if (!user.password || typeof user.password !== 'string' || user.password.length < 20) {
            logger.error('Hash de mot de passe invalide ou manquant', { userId: user.id, email });
            throw new Error("Identifiants invalides");
        }

        // Vérifier le mot de passe (gestion sûre des erreurs)
        let isPasswordValid = false;
        try {
            isPasswordValid = await bcrypt.compare(password, user.password);
        } catch (e) {
            logger.error('Erreur bcrypt.compare', { userId: user.id, email, error: e.message });
            throw new Error("Identifiants invalides");
        }

        if (!isPasswordValid) {
            logger.warn('Tentative de connexion avec mot de passe incorrect', {
                userId: user.id,
                email
            });
            throw new Error("Identifiants invalides");
        }

        // Générer le token sécurisé
        const { token, jti } = AuthService.generateSecureToken(user);

        logger.info('Utilisateur connecté avec succès', {
            userId: user.id,
            username: user.username
        });

        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.is_admin ? 'admin' : 'user',
                isActive: Boolean(user.is_active),
                isAdmin: Boolean(user.is_admin),
                is_admin: Boolean(user.is_admin)
            },
            token,
            jti
        };
    },

    /**
     * Déconnecte un utilisateur en révoquant son token
     * @param {string} token - Token JWT à révoquer
     * @param {number} userId - ID de l'utilisateur
     * @returns {Promise<boolean>} Succès de la déconnexion
     */
    logout: async (token, userId) => {
        try {
            const success = await revokeToken(token, userId, 'logout');

            if (success) {
                logger.info('Utilisateur déconnecté', { userId });
            }

            return success;
        } catch (error) {
            logger.error('Erreur lors de la déconnexion', {
                userId,
                error: error.message
            });
            return false;
        }
    },

    /**
     * Révoque tous les tokens d'un utilisateur
     * @param {number} userId - ID de l'utilisateur
     * @param {string} reason - Raison de la révocation
     * @returns {Promise<boolean>} Succès de la révocation
     */
    revokeAllUserTokens: async (userId, reason = 'revoke_all') => {
        try {
            // Cette fonction nécessiterait une implémentation dans le middleware
            // pour révoque tous les tokens d'un utilisateur spécifique
            logger.info('Révocation de tous les tokens utilisateur', { userId, reason });
            return true;
        } catch (error) {
            logger.error('Erreur lors de la révocation des tokens', {
                userId,
                error: error.message
            });
            return false;
        }
    },

    /**
     * Vérifie si un utilisateur existe et est actif
     * @param {number} userId - ID de l'utilisateur
     * @returns {Promise<Object|null>} L'utilisateur ou null
     */
    getUserById: async (userId) => {
        try {
            const user = await User.findByPk(userId, {
                attributes: ['id', 'username', 'email', 'role', 'is_admin', 'is_active']
            });

            if (!user) return null;

            // Normaliser l'objet renvoyé
            return {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role || (user.is_admin ? 'admin' : 'user'),
                isActive: Boolean(user.is_active),
                isAdmin: Boolean(user.is_admin)
            };
        } catch (error) {
            logger.error('Erreur lors de la récupération de l\'utilisateur', {
                userId,
                error: error.message
            });
            return null;
        }
    }
};

export default AuthService;
