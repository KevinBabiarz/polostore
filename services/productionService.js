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
        console.log("[PROD] Récupération des productions avec options:", options);

        try {
            const { limit = 10, offset = 0, category = null, sortBy = 'created_at', sortOrder = 'DESC' } = options;

            const query = {
                order: [[sortBy, sortOrder]],
                limit,
                offset
            };

            if (category) {
                query.where = { category };
            }

            const productions = await Production.findAll(query);
            console.log(`[PROD] ${productions.length} productions récupérées avec succès`);
            return productions;
        } catch (error) {
            console.error("[PROD] Erreur lors de la récupération des productions:", error.message);
            throw error;
        }
    },

    /**
     * Récupère une production par son ID
     * @param {number} id - ID de la production
     * @returns {Promise<Object>} La production trouvée
     */
    getProductionById: async (id) => {
        console.log(`[PROD] Recherche de la production avec l'ID: ${id}`);

        try {
            const production = await Production.findByPk(id);

            if (!production) {
                throw new Error("Production non trouvée");
            }

            return production;
        } catch (error) {
            console.error(`[PROD] Erreur lors de la récupération de la production ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Crée une nouvelle production
     * @param {Object} productionData - Données de la production
     * @param {Object} file - Fichier audio uploadé
     * @returns {Promise<Object>} La production créée
     */
    createProduction: async (productionData, file) => {
        console.log("[PROD] Création d'une nouvelle production:", productionData.title);

        try {
            let fileUrl = null;

            if (file) {
                fileUrl = `/uploads/${file.filename}`;
            }

            const newProduction = await Production.create({
                ...productionData,
                audio_url: fileUrl,
                created_at: new Date()
            });

            console.log(`[PROD] Production créée avec succès, ID: ${newProduction.id}`);
            return newProduction;
        } catch (error) {
            console.error("[PROD] Erreur lors de la création de la production:", error.message);
            throw error;
        }
    },

    /**
     * Met à jour une production existante
     * @param {number} id - ID de la production à mettre à jour
     * @param {Object} updateData - Nouvelles données
     * @param {Object} file - Nouveau fichier audio (optionnel)
     * @returns {Promise<Object>} La production mise à jour
     */
    updateProduction: async (id, updateData, file) => {
        console.log(`[PROD] Mise à jour de la production ID ${id}`);

        try {
            const production = await Production.findByPk(id);

            if (!production) {
                throw new Error("Production non trouvée");
            }

            // Si un nouveau fichier est uploadé, supprimer l'ancien et mettre à jour l'URL
            if (file) {
                if (production.audio_url) {
                    const oldFilePath = path.join(__dirname, '..', 'public', production.audio_url);

                    // Supprimer l'ancien fichier s'il existe
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                }

                updateData.audio_url = `/uploads/${file.filename}`;
            }

            // Mettre à jour la production
            await production.update(updateData);
            console.log(`[PROD] Production mise à jour avec succès, ID: ${id}`);

            return production;
        } catch (error) {
            console.error(`[PROD] Erreur lors de la mise à jour de la production ${id}:`, error.message);
            throw error;
        }
    },

    /**
     * Supprime une production
     * @param {number} id - ID de la production à supprimer
     * @returns {Promise<boolean>} Succès de la suppression
     */
    deleteProduction: async (id) => {
        console.log(`[PROD] Suppression de la production ID ${id}`);

        try {
            const production = await Production.findByPk(id);

            if (!production) {
                throw new Error("Production non trouvée");
            }

            // Supprimer le fichier audio associé s'il existe
            if (production.audio_url) {
                const filePath = path.join(__dirname, '..', 'public', production.audio_url);

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            // Supprimer la production de la base de données
            await production.destroy();
            console.log(`[PROD] Production supprimée avec succès, ID: ${id}`);

            return true;
        } catch (error) {
            console.error(`[PROD] Erreur lors de la suppression de la production ${id}:`, error.message);
            throw error;
        }
    }
};

export default ProductionService;
