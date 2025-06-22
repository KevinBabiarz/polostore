// services/productionService.js
import Production from '../models/Production.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
        console.log("[PROD SERVICE] Récupération des productions avec options:", options);

        try {
            let { limit = 10, offset = 0, category = null, sortBy = 'created_at', sortOrder = 'DESC' } = options;

            // Correction : si sortBy vaut 'latest', on utilise 'created_at'
            if (sortBy === 'latest') sortBy = 'created_at';

            // Si un genre est spécifié, utiliser la méthode statique du modèle
            if (category) {
                console.log(`[PROD SERVICE] Recherche par genre: ${category}`);
                return await Production.findByGenre(category);
            }

            // Sinon, faire une requête personnalisée
            const query = {
                order: [[sortBy, sortOrder]],
                limit: parseInt(limit),
                offset: parseInt(offset)
            };

            console.log(`[PROD SERVICE] Exécution de la requête avec limit=${limit}, offset=${offset}`);
            const productions = await Production.findAll(query);
            console.log(`[PROD SERVICE] ${productions.length} productions récupérées avec succès`);
            return productions;
        } catch (error) {
            console.error("[PROD SERVICE] Erreur lors de la récupération des productions:", error.message);
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
                throw new Error("Production non trouvée");
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
        console.log("[PROD SERVICE] Données reçues pour la création:", JSON.stringify(productionData));

        try {
            // Vérification et gestion des valeurs par défaut pour les champs obligatoires
            const dataToCreate = {
                ...productionData,
                title: productionData.title || 'Sans titre',
                created_at: new Date()
            };

            console.log("[PROD SERVICE] Données prêtes pour création:", JSON.stringify(dataToCreate));

            const newProduction = await Production.create(dataToCreate);

            console.log(`[PROD SERVICE] Production créée avec succès, ID: ${newProduction.id}`);
            return newProduction;
        } catch (error) {
            console.error("[PROD SERVICE] Erreur lors de la création de la production:", error.message);
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

        try {
            const production = await Production.findByPk(id);

            if (!production) {
                console.log(`[PROD SERVICE] Production non trouvée avec l'ID: ${id}`);
                throw new Error("Production non trouvée");
            }

            // Gestion du fichier audio si un nouveau fichier est envoyé
            if (updateData.audio_url && production.audio_url &&
                updateData.audio_url !== production.audio_url) {
                // Suppression de l'ancien fichier
                try {
                    const oldFilePath = path.join(__dirname, '..', 'public', production.audio_url);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                        console.log(`[PROD SERVICE] Ancien fichier audio supprimé: ${oldFilePath}`);
                    }
                } catch (fileError) {
                    console.error(`[PROD SERVICE] Erreur lors de la suppression du fichier audio:`, fileError);
                    // On continue malgré l'erreur de suppression du fichier
                }
            }

            // Mettre à jour la production
            await production.update(updateData);
            console.log(`[PROD SERVICE] Production mise à jour avec succès, ID: ${id}`);

            return production;
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
                throw new Error("Production non trouvée");
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
