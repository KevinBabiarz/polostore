// services/userService.js
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';  // Ajout de l'import pour Op

/**
 * Service de gestion des utilisateurs
 */
export const UserService = {
    /**
     * Récupère tous les utilisateurs
     * @param {Object} options - Options de filtrage et pagination
     * @returns {Promise<Object[]>} Liste des utilisateurs
     */
    getAllUsers: async (options = {}) => {
        console.log("[USER SERVICE] Récupération des utilisateurs avec options:", options);

        try {
            const {
                limit = 10,
                offset = 0,
                sortBy = 'created_at',
                sortOrder = 'DESC',
                search = null
            } = options;

            const query = {
                attributes: { exclude: ['password'] }, // Exclure le mot de passe des résultats
                order: [[sortBy, sortOrder]],
                limit,
                offset
            };

            // Ajouter une recherche par username ou email si nécessaire
            if (search) {
                query.where = {
                    [Op.or]: [
                        { username: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } }
                    ]
                };
            }

            const users = await User.findAll(query);
            console.log(`[USER SERVICE] ${users.length} utilisateurs récupérés avec succès`);
            return users;
        } catch (error) {
            console.error("[USER SERVICE] Erreur lors de la récupération des utilisateurs:", error.message);
            throw error;
        }
    },

    /**
     * Récupère un utilisateur par son ID
     * @param {number} id - ID de l'utilisateur
     * @returns {Promise<Object>} L'utilisateur trouvé
     */
    getUserById: async (id) => {
        console.log(`[USER SERVICE] Recherche de l'utilisateur avec l'ID: ${id}`);

        try {
            const user = await User.findByPk(id, {
                attributes: { exclude: ['password'] } // Exclure le mot de passe
            });

            if (!user) {
                console.log(`[USER SERVICE] Utilisateur non trouvé avec l'ID: ${id}`);
                throw new Error("Utilisateur non trouvé");
            }

            console.log(`[USER SERVICE] Utilisateur trouvé avec l'ID: ${id}`);
            return user;
        } catch (error) {
            console.error(`[USER SERVICE] Erreur lors de la récupération de l'utilisateur ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Met à jour un utilisateur
     * @param {number} id - ID de l'utilisateur à mettre à jour
     * @param {Object} updateData - Nouvelles données
     * @returns {Promise<Object>} L'utilisateur mis à jour
     */
    updateUser: async (id, updateData) => {
        const user = await User.findByPk(id);

        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }

        // Si le mot de passe est fourni, le hook beforeUpdate s'occupera du hashage
        await user.update(updateData);

        // Retourner l'utilisateur sans le mot de passe
        const { password, ...userWithoutPassword } = user.get();
        return userWithoutPassword;
    },

    /**
     * Change le mot de passe d'un utilisateur
     * @param {number} id - ID de l'utilisateur
     * @param {string} currentPassword - Mot de passe actuel
     * @param {string} newPassword - Nouveau mot de passe
     * @returns {Promise<boolean>} true si le changement a réussi
     */
    changePassword: async (id, currentPassword, newPassword) => {
        const user = await User.findByPk(id);

        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }

        // Vérifier le mot de passe actuel
        const validPassword = await user.validatePassword(currentPassword);
        if (!validPassword) {
            throw new Error("Mot de passe actuel incorrect");
        }

        // Mettre à jour le mot de passe
        await user.update({ password: newPassword });
        return true;
    },

    /**
     * Définit le statut administrateur d'un utilisateur
     * @param {number} id - ID de l'utilisateur
     * @param {boolean} isAdmin - Nouveau statut administrateur
     * @returns {Promise<Object>} L'utilisateur mis à jour
     */
    setAdminStatus: async (id, isAdmin) => {
        if (typeof isAdmin !== 'boolean') {
            throw new Error("Le statut administrateur doit être un booléen");
        }

        const user = await User.findByPk(id);

        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }

        await user.update({ is_admin: isAdmin });

        // Retourner l'utilisateur sans le mot de passe
        const { password, ...userWithoutPassword } = user.get();
        return userWithoutPassword;
    },

    /**
     * Supprime un utilisateur
     * @param {number} id - ID de l'utilisateur à supprimer
     * @returns {Promise<boolean>} true si la suppression a réussi
     */
    deleteUser: async (id) => {
        const user = await User.findByPk(id);

        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }

        await user.destroy();
        return true;
    }
};

export default UserService;
