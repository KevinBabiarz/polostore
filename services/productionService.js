// services/productionService.js
import Production from '../models/Production.js';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { i18n } from '../utils/i18n.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Service de gestion des productions musicales
 */
export const ProductionService = {
    /**
     * Récupère toutes les productions
     * @param {Object} options - Options de filtre et de pagination
     * @returns {Promise<Object[]>} Liste des productions
     */
    getAllProductions: async (options = {}) => {
        console.log(i18n.t('productionService.fetchingProductions', { options: JSON.stringify(options) }));

        try {
            let {
                limit = 10,
                offset = 0,
                page = 1,
                genre = null,
                search = null,
                category = null, // pour compatibilité
                sortBy = 'created_at',
                sortOrder = 'DESC',
                priceRange = 'all',
                releaseDateRange = 'all'
            } = options;

            // Calculer l'offset à partir de la page si fournie
            if (page && page > 1) {
                offset = (page - 1) * limit;
            }

            // Gestion sécurisée des options de tri
            let orderField = 'created_at'; // Champ par défaut
            let orderDirection = 'DESC';   // Direction par défaut

            // Options de tri sécurisées basées sur les champs existants
            switch (sortBy) {
                case 'latest':
                    orderField = 'created_at';
                    orderDirection = 'DESC';
                    break;
                case 'popular':
                    // Comme "views" n'existe pas dans le modèle, on utilise created_at comme fallback
                    orderField = 'created_at';
                    orderDirection = 'DESC';
                    break;
                case 'price_asc':
                    orderField = 'price';
                    orderDirection = 'ASC';
                    break;
                case 'price_desc':
                    orderField = 'price';
                    orderDirection = 'DESC';
                    break;
                default:
                    // Si sortBy est un nom de champ valide, l'utiliser directement
                    const validFields = ['id', 'title', 'artist', 'genre', 'created_at', 'price'];
                    if (validFields.includes(sortBy)) {
                        orderField = sortBy;
                        orderDirection = sortOrder || 'DESC';
                    }
            }

            // Construction des conditions WHERE
            const whereClause = {};

            // Filtre par genre - LOGIQUE CORRIGÉE
            const genreToFilter = genre || category;
            if (genreToFilter && genreToFilter.trim() !== '' && genreToFilter !== 'all') {
                whereClause.genre = {
                    [Op.like]: `%${genreToFilter.trim()}%`
                };
                console.log(`[PROD SERVICE] Filtre par genre appliqué: ${genreToFilter}`);
            } else {
                console.log('[PROD SERVICE] Aucun filtre par genre (affichage de tous les genres)');
            }

            // Filtre par recherche - LOGIQUE AMÉLIORÉE
            if (search && search.trim() !== '') {
                const searchTerm = search.trim();
                whereClause[Op.or] = [
                    { title: { [Op.iLike]: `%${searchTerm}%` } },
                    { description: { [Op.iLike]: `%${searchTerm}%` } },
                    { artist: { [Op.iLike]: `%${searchTerm}%` } },
                    { genre: { [Op.iLike]: `%${searchTerm}%` } }
                ];
                console.log(`[PROD SERVICE] Filtre par recherche appliqué: "${searchTerm}"`);
            }

            // Filtre par fourchette de prix
            if (priceRange !== 'all') {
                switch(priceRange) {
                    case 'free':
                        whereClause.price = 0;
                        break;
                    case 'under10':
                        whereClause.price = { [Op.lt]: 10 };
                        break;
                    case '10to50':
                        whereClause.price = { [Op.between]: [10, 50] };
                        break;
                    case 'over50':
                        whereClause.price = { [Op.gt]: 50 };
                        break;
                }
            }

            // Filtre par date de sortie
            if (releaseDateRange !== 'all') {
                const now = new Date();
                let dateLimit;

                switch(releaseDateRange) {
                    case 'last_week':
                        dateLimit = new Date(now.setDate(now.getDate() - 7));
                        break;
                    case 'last_month':
                        dateLimit = new Date(now.setMonth(now.getMonth() - 1));
                        break;
                    case 'last_year':
                        dateLimit = new Date(now.setFullYear(now.getFullYear() - 1));
                        break;
                }

                if (dateLimit) {
                    whereClause.created_at = { [Op.gte]: dateLimit };
                }
            }

            // Construction de la requête finale
            const query = {
                where: whereClause,
                order: [[orderField, orderDirection]],
                limit: parseInt(limit),
                offset: parseInt(offset)
            };

            console.log(i18n.t('productionService.executingQuery', { query: JSON.stringify(query, null, 2) }));

            // Exécution de la requête
            const productions = await Production.findAndCountAll(query);

            // Calcul du nombre total de pages
            const totalPages = Math.ceil(productions.count / limit);

            console.log(i18n.t('productionService.productionsFetched', {
                fetched: productions.rows.length,
                total: productions.count
            }));

            // Retourner les données paginées
            return {
                productions: productions.rows,
                totalCount: productions.count,
                totalPages,
                currentPage: page || Math.floor(offset / limit) + 1
            };
        } catch (error) {
            console.error(i18n.t('productionService.errorFetchingProductions', { error: error.message }));
            throw error;
        }
    },

    /**
     * Récupère une production par son ID
     * @param {number} id - ID de la production
     * @returns {Promise<Object>} La production trouvée
     */
    getProductionById: async (id) => {
        console.log(`[PROD SERVICE] Recherche de la production avec l'ID: ${id}`);

        try {
            const production = await Production.findByPk(id);

            if (!production) {
                console.log(`[PROD SERVICE] Production non trouvée avec l'ID: ${id}`);
                throw new Error(i18n.t('productionService.productionNotFound'));
            }

            console.log(`[PROD SERVICE] Production trouvée avec l'ID: ${id}`);
            return production;
        } catch (error) {
            console.error(`[PROD SERVICE] Erreur lors de la récupération de la production ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Crée une nouvelle production
     * @param {Object} productionData - Données de la production
     * @returns {Promise<Object>} La production créée
     */
    createProduction: async (productionData) => {
        console.log(i18n.t('productionService.dataReceivedForCreation', { data: JSON.stringify(productionData) }));

        try {
            // Vérification et gestion des valeurs par défaut pour les champs obligatoires
            const dataToCreate = {
                ...productionData,
                title: productionData.title || 'Sans titre',
                created_at: new Date()
            };

            console.log(i18n.t('productionService.dataReadyForCreation', { data: JSON.stringify(dataToCreate) }));

            const newProduction = await Production.create(dataToCreate);

            console.log(`[PROD SERVICE] Production créée avec succès, ID: ${newProduction.id}`);
            return newProduction;
        } catch (error) {
            console.error(i18n.t('productionService.errorCreatingProduction', { error: error.message }));
            throw error;
        }
    },

    /**
     * Met à jour une production existante
     * @param {number} id - ID de la production à mettre à jour
     * @param {Object} updateData - Nouvelles données
     * @returns {Promise<Object>} La production mise à jour
     */
    updateProduction: async (id, updateData) => {
        console.log(`[PROD SERVICE] Mise à jour de la production ID ${id}`);
        console.log(`[PROD SERVICE] Données de mise à jour reçues:`, updateData);

        try {
            const production = await Production.findByPk(id);

            if (!production) {
                console.log(`[PROD SERVICE] Production non trouvée avec l'ID: ${id}`);
                throw new Error(i18n.t('productionService.productionNotFound'));
            }

            // Gestion du fichier audio si un nouveau fichier est envoyé
            if (updateData.audio_url && production.audio_url &&
                updateData.audio_url !== production.audio_url) {
                // Suppression de l'ancien fichier
                try {
                    // Corriger le chemin pour la suppression de fichier
                    const oldAudioPath = production.audio_url.startsWith('/uploads/')
                        ? production.audio_url.replace('/uploads/', '')
                        : production.audio_url.replace('/api/uploads/', '');
                    const oldFilePath = path.join(__dirname, '..', 'public', 'uploads', oldAudioPath);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                        console.log(`[PROD SERVICE] Ancien fichier audio supprimé: ${oldFilePath}`);
                    }
                } catch (fileError) {
                    console.error(`[PROD SERVICE] Erreur lors de la suppression du fichier audio:`, fileError);
                    // On continue malgré l'erreur de suppression du fichier
                }
            }

            // Gestion du fichier image si un nouveau fichier est envoyé
            if (updateData.image_url && production.image_url &&
                updateData.image_url !== production.image_url) {
                try {
                    // Corriger le chemin pour la suppression de fichier
                    const oldImagePath = production.image_url.startsWith('/uploads/')
                        ? production.image_url.replace('/uploads/', '')
                        : production.image_url.replace('/api/uploads/', '');
                    const oldFilePath = path.join(__dirname, '..', 'public', 'uploads', oldImagePath);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                        console.log(`[PROD SERVICE] Ancien fichier image supprimé: ${oldFilePath}`);
                    }
                } catch (fileError) {
                    console.error(`[PROD SERVICE] Erreur lors de la suppression de l'image:`, fileError);
                    // On continue malgré l'erreur de suppression du fichier
                }
            }

            // Nettoyer les données avant la mise à jour pour éviter les doublons
            const cleanUpdateData = { ...updateData };

            // Supprimer les champs undefined ou null
            Object.keys(cleanUpdateData).forEach(key => {
                if (cleanUpdateData[key] === undefined || cleanUpdateData[key] === null || cleanUpdateData[key] === '') {
                    delete cleanUpdateData[key];
                }
            });

            console.log(`[PROD SERVICE] Données nettoyées pour mise à jour:`, cleanUpdateData);

            // Mettre à jour la production avec les données nettoyées
            const [updatedCount] = await Production.update(cleanUpdateData, {
                where: { id: id },
                returning: true
            });

            if (updatedCount === 0) {
                throw new Error(i18n.t('productionService.noUpdatePerformed'));
            }

            // Récupérer la production mise à jour
            const updatedProduction = await Production.findByPk(id);
            console.log(`[PROD SERVICE] Production mise à jour avec succès, ID: ${id}`);

            return updatedProduction;
        } catch (error) {
            console.error(`[PROD SERVICE] Erreur lors de la mise à jour de la production ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Supprime une production
     * @param {number} id - ID de la production à supprimer
     * @returns {Promise<boolean>} Succès de la suppression
     */
    deleteProduction: async (id) => {
        console.log(`[PROD SERVICE] Suppression de la production ID ${id}`);

        try {
            const production = await Production.findByPk(id);

            if (!production) {
                console.log(`[PROD SERVICE] Production non trouvée avec l'ID: ${id}`);
                throw new Error(i18n.t('productionService.productionNotFound'));
            }

            // Suppression des fichiers associés
            if (production.audio_url) {
                try {
                    const audioPath = path.join(__dirname, '..', 'public', production.audio_url);
                    if (fs.existsSync(audioPath)) {
                        fs.unlinkSync(audioPath);
                        console.log(`[PROD SERVICE] Fichier audio supprimé: ${audioPath}`);
                    }
                } catch (fileError) {
                    console.error(`[PROD SERVICE] Erreur lors de la suppression du fichier audio:`, fileError);
                    // On continue malgré l'erreur de suppression du fichier
                }
            }

            if (production.image_url) {
                try {
                    const imagePath = path.join(__dirname, '..', 'public', production.image_url);
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                        console.log(`[PROD SERVICE] Fichier image supprimé: ${imagePath}`);
                    }
                } catch (fileError) {
                    console.error(`[PROD SERVICE] Erreur lors de la suppression de l'image:`, fileError);
                    // On continue malgré l'erreur de suppression du fichier
                }
            }

            // Supprimer la production de la base de données
            await production.destroy();
            console.log(`[PROD SERVICE] Production supprimée avec succès, ID: ${id}`);

            return true;
        } catch (error) {
            console.error(`[PROD SERVICE] Erreur lors de la suppression de la production ${id}:`, error.message);
            throw error;
        }
    }
};

export default ProductionService;
