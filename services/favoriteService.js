// services/favoriteService.js
import Favorite from '../models/Favorite.js';
import Production from '../models/Production.js';
import User from '../models/User.js';

/**
 * Service de gestion des favoris
 */
export const FavoriteService = {
    /**
     * Récupère les favoris d'un utilisateur
     * @param {number} userId - ID de l'utilisateur
     * @returns {Promise<Object[]>} Liste des productions favorites
     */
    getUserFavorites: async (userId) => {
        const favorites = await Favorite.findAll({
            where: { user_id: userId },
            include: [{
                model: Production,
                as: 'production'
            }]
        });

        return favorites.map(fav => fav.production);
    },

    /**
     * Ajoute une production aux favoris d'un utilisateur
     * @param {number} userId - ID de l'utilisateur
     * @param {number} productionId - ID de la production à ajouter aux favoris
     * @returns {Promise<Object>} Le favori créé
     */
    addToFavorites: async (userId, productionId) => {
        // Vérifier si l'utilisateur existe
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }

        // Vérifier si la production existe
        const production = await Production.findByPk(productionId);
        if (!production) {
            throw new Error("Production non trouvée");
        }

        // Vérifier si la production est déjà en favoris
        const existingFavorite = await Favorite.findOne({
            where: {
                user_id: userId,
                production_id: productionId
            }
        });

        if (existingFavorite) {
            throw new Error("Cette production est déjà dans vos favoris");
        }

        // Ajouter aux favoris
        return await Favorite.create({
            user_id: userId,
            production_id: productionId,
            added_at: new Date()
        });
    },

    /**
     * Supprime une production des favoris d'un utilisateur
     * @param {number} userId - ID de l'utilisateur
     * @param {number} productionId - ID de la production à retirer des favoris
     * @returns {Promise<boolean>} true si la suppression a réussi
     */
    removeFromFavorites: async (userId, productionId) => {
        const favorite = await Favorite.findOne({
            where: {
                user_id: userId,
                production_id: productionId
            }
        });

        if (!favorite) {
            throw new Error("Cette production n'est pas dans vos favoris");
        }

        await favorite.destroy();
        return true;
    },

    /**
     * Vérifie si une production est en favoris pour un utilisateur
     * @param {number} userId - ID de l'utilisateur
     * @param {number} productionId - ID de la production
     * @returns {Promise<boolean>} true si la production est en favoris
     */
    isFavorite: async (userId, productionId) => {
        const favorite = await Favorite.findOne({
            where: {
                user_id: userId,
                production_id: productionId
            }
        });

        return !!favorite;
    }
};

export default FavoriteService;
