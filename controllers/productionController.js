// controllers/productionController.js
import ProductionService from '../services/productionService.js';

export const getAllProductions = async (req, res) => {
    console.log('[PRODUCTION CTRL] Requête reçue sur /api/productions');
    try {
        // Récupérer les paramètres de la requête pour la pagination et le tri
        const { limit, offset, category, sortBy, sortOrder } = req.query;
        console.log('[PRODUCTION CTRL] Appel à ProductionService.getAllProductions avec params:', { limit, offset, category, sortBy, sortOrder });
        // Utiliser le service pour récupérer les productions
        const productions = await ProductionService.getAllProductions({
            limit: parseInt(limit) || 10,
            offset: parseInt(offset) || 0,
            category,
            sortBy: sortBy || 'created_at',
            sortOrder: sortOrder || 'DESC'
        });
        console.log('[PRODUCTION CTRL] Productions récupérées:', productions && productions.length);
        res.status(200).json(productions);
    } catch (error) {
        console.error('[PRODUCTION CTRL] Erreur:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des productions' });
    }
};

export const getProductionById = async (req, res) => {
    try {
        const { id } = req.params;

        // Utiliser le service pour récupérer une production par ID
        const production = await ProductionService.getProductionById(id);
        res.status(200).json(production);
    } catch (error) {
        console.error(error);

        // Gérer l'erreur spécifique
        if (error.message === "Production non trouvée") {
            return res.status(404).json({ message: error.message });
        }

        res.status(500).json({ message: 'Erreur lors de la récupération de la production' });
    }
};

export const createProduction = async (req, res) => {
    try {
        const { title, description, genre } = req.body;

        // Récupérer le fichier audio uploadé
        const file = req.files?.audio?.[0] || null;

        // Utiliser le service pour créer une production
        const newProduction = await ProductionService.createProduction(
            {
                title,
                description,
                genre,
                image_url: req.files?.image?.[0] ? `/uploads/${req.files.image[0].filename}` : null
            },
            file
        );

        res.status(201).json(newProduction);
    } catch (error) {
        console.error('Erreur lors de la création de la production:', error);
        res.status(500).json({ message: 'Erreur lors de la création de la production' });
    }
};

export const updateProduction = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const file = req.files?.audio?.[0] || null;

        // Utiliser le service pour mettre à jour une production
        const updatedProduction = await ProductionService.updateProduction(id, updateData, file);
        res.status(200).json(updatedProduction);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la production:', error);

        if (error.message === "Production non trouvée") {
            return res.status(404).json({ message: error.message });
        }

        res.status(500).json({ message: 'Erreur lors de la mise à jour de la production' });
    }
};

export const deleteProduction = async (req, res) => {
    try {
        const { id } = req.params;

        // Utiliser le service pour supprimer une production
        await ProductionService.deleteProduction(id);
        res.status(200).json({ message: 'Production supprimée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de la production:', error);

        if (error.message === "Production non trouvée") {
            return res.status(404).json({ message: error.message });
        }

        res.status(500).json({ message: 'Erreur lors de la suppression de la production' });
    }
};
