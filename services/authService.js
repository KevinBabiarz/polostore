// services/authService.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

/**
 * Service d'authentification - gère la logique métier liée à l'authentification
 */
export const AuthService = {
    /**
     * Génère un token JWT pour un utilisateur
     * @param {Object} user - L'utilisateur pour lequel générer le token
     * @returns {string} Le token JWT
     */
    generateToken: (user) => {
        if (!process.env.JWT_SECRET) {
            throw new Error("Variable d'environnement JWT_SECRET non définie");
        }

        return jwt.sign(
            {
                id: user.id,
                isAdmin: user.is_admin,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
                algorithm: "HS256"
            }
        );
    },

    /**
     * Enregistre un nouvel utilisateur
     * @param {Object} userData - Données de l'utilisateur à créer
     * @returns {Promise<Object>} L'utilisateur créé
     */
    register: async (userData) => {
        const { username, email, password } = userData;

        // Vérifier si l'utilisateur existe déjà
        const existingEmail = await User.findByEmail(email);
        const existingUsername = await User.findByUsername(username);

        if (existingEmail || existingUsername) {
            throw new Error("Cet utilisateur existe déjà");
        }

        // Créer l'utilisateur avec Sequelize
        return await User.create({
            username,
            email,
            password, // Le hashage sera fait automatiquement par le hook beforeCreate
            is_admin: false // Par défaut, les nouveaux utilisateurs ne sont pas administrateurs
        });
    },

    /**
     * Authentifie un utilisateur
     * @param {string} email - Email de l'utilisateur
     * @param {string} password - Mot de passe de l'utilisateur
     * @returns {Promise<Object>} L'utilisateur authentifié
     */
    login: async (email, password) => {
        console.log(`[AUTH] Tentative de connexion pour: ${email}`);

        try {
            // Rechercher l'utilisateur par email
            const user = await User.findByEmail(email);

            if (!user) {
                console.log(`[AUTH] Utilisateur non trouvé: ${email}`);
                throw new Error("Email ou mot de passe incorrect");
            }

            // Vérifier le mot de passe
            const validPassword = await user.validatePassword(password);

            if (!validPassword) {
                console.log(`[AUTH] Mot de passe invalide pour: ${email}`);
                throw new Error("Email ou mot de passe incorrect");
            }

            console.log(`[AUTH] Connexion réussie pour: ${email}`);
            return user;
        } catch (error) {
            console.error(`[AUTH] Erreur lors de la connexion:`, error);
            throw error;
        }
    },

    /**
     * Vérifie si un token JWT est valide
     * @param {string} token - Token JWT à vérifier
     * @returns {Object} Données décodées du token
     */
    verifyToken: (token) => {
        return jwt.verify(token, process.env.JWT_SECRET);
    }
};

export default AuthService;
