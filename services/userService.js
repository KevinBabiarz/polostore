// services/userService.js
-import bcrypt from 'bcrypt';  // Ajout de l'import pour Op
+// (bcrypt supprimé – non utilisé ici)
import { Op } from 'sequelize';  // Ajout de l'import pour Op
import { i18n } from '../utils/i18n.js';

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
        console.log(i18n.t('userService.fetchingUsers', { options: JSON.stringify(options) }));

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
            console.error(i18n.t('userService.errorFetchingUsers', { error: error.message }));
            throw error;
        }
    },

    /**
     * Récupère un utilisateur par son ID
     * @param {number} id - ID de l'utilisateur
     * @returns {Promise<Object>} L'utilisateur trouvé
     */
    getUserById: async (id) => {
        console.log(i18n.t('userService.searchUser', { id }));

        try {
            const user = await User.findByPk(id, {
                attributes: { exclude: ['password'] }
            });

            if (!user) {
                console.log(i18n.t('userService.userNotFound', { id }));
                throw new Error(i18n.t('userService.userNotFound', { id }));
            }

            console.log(i18n.t('userService.userFound', { id }));
            return user;
        } catch (error) {
            console.error(i18n.t('userService.errorFetchingUser', { id, error: error.message }));
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
            throw new Error(i18n.t('userService.userNotFound', { id }));
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
            throw new Error(i18n.t('userService.userNotFound', { id }));
        }

        // Vérifier le mot de passe actuel
        const validPassword = await user.validatePassword(currentPassword);
        if (!validPassword) {
            throw new Error(i18n.t('userService.invalidCurrentPassword'));
        }

        // Mettre à jour le mot de passe
        await user.update({ password: newPassword });
    },

    /**
     * Définit le statut administrateur d'un utilisateur
     * @param {number} id - ID de l'utilisateur
     * @param {boolean} isAdmin - Nouveau statut administrateur
     * @returns {Promise<Object>} L'utilisateur mis à jour
     */
    setAdminStatus: async (id, isAdmin) => {
        if (typeof isAdmin !== 'boolean') {
            throw new Error(i18n.t('userService.adminStatusMustBeBoolean'));
        }

        const user = await User.findByPk(id);

        if (!user) {
            throw new Error(i18n.t('userService.userNotFoundSimple'));
        }

        await user.update({ is_admin: isAdmin, role: isAdmin ? 'admin' : 'user' });

        // Retourner l'utilisateur sans le mot de passe
        const { password, ...userWithoutPassword } = user.get();
        return userWithoutPassword;
    },

    /**
     * Définit le statut actif d'un utilisateur
     * @param {number} id - ID de l'utilisateur
     * @param {boolean} isActive - Nouveau statut actif
     * @returns {Promise<Object>} L'utilisateur mis à jour
     */
    setActiveStatus: async (id, isActive) => {
        if (typeof isActive !== 'boolean') {
            throw new Error('Le statut actif doit être un booléen');
        }

        const user = await User.findByPk(id);
        if (!user) {
            throw new Error(i18n.t('userService.userNotFoundSimple'));
        }

        await user.update({ is_active: isActive });

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
            throw new Error(i18n.t('userService.userNotFoundSimple'));
        }

        await user.destroy();
        return true;
    }
};

export default UserService;
