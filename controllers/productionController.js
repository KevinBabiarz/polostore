// controllers/productionController.js
import ProductionService from '../services/productionService.js';

export const getAllProductions = async (req, res) => {
    console.log('[PROD CTRL] Requête reçue sur /api/productions');
    try {
        // Récupérer tous les paramètres de filtre de la requête
        const {
            page,
            limit,
            offset,
            search,
            genre,
            category,
            sortBy,
            sortOrder,
            priceRange,
            releaseDateRange
        } = req.query;

        console.log('[PROD CTRL] Paramètres de requête reçus:', req.query);

        // Utiliser le service pour récupérer les productions avec tous les filtres
        const result = await ProductionService.getAllProductions({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            offset: parseInt(offset) || 0,
            search,
            genre: genre || category, // Support des deux paramètres pour compatibilité
            sortBy: sortBy || 'latest',
            sortOrder: sortOrder || 'DESC',
            priceRange: priceRange || 'all',
            releaseDateRange: releaseDateRange || 'all'
        });

        console.log(`[PROD CTRL] Productions récupérées: ${result.productions?.length || 0} sur ${result.totalCount || 0}`);
        res.status(200).json(result);
    } catch (error) {
        console.error('[PROD CTRL] Erreur:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des productions' });
    }
};

export const getProductionById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[PROD CTRL] Recherche de la production ID ${id}`);

        // Utiliser le service pour récupérer une production par ID
        const production = await ProductionService.getProductionById(id);
        console.log(`[PROD CTRL] Production ID ${id} trouvée`);

        res.status(200).json(production);
    } catch (error) {
        console.error(`[PROD CTRL] Erreur:`, error);

        // Gérer l'erreur spécifique
        if (error.message === "Production non trouvée") {
            return res.status(404).json({ message: error.message });
        }

        res.status(500).json({ message: 'Erreur lors de la récupération de la production' });
    }
};

export const createProduction = async (req, res) => {
    try {
        console.log('[PROD CTRL] Requête de création reçue');
        console.log('[PROD CTRL] req.body:', req.body);
        console.log('[PROD CTRL] req.files:', req.files);

        // Validation des données requises
        const { title, artist } = req.body;

        if (!title?.trim()) {
            console.log('[PROD CTRL] Validation échouée: titre manquant');
            return res.status(400).json({ message: "Le titre est obligatoire" });
        }

        // Récupération des champs du formulaire
        const description = req.body.description || '';
        const genre = req.body.genre || '';
        const release_date = req.body.release_date || null;

        console.log('[PROD CTRL] Champs extraits:', { title, artist, description, genre, release_date });

        // Gestion des fichiers - vérification de tous les noms possibles des champs
        const audioFile = req.files?.audio?.[0] || req.files?.audio_files?.[0] || null;
        const imageFile = req.files?.image?.[0] || req.files?.cover_image?.[0] || null;

        console.log('[PROD CTRL] Fichiers extraits:', {
            audioFile: audioFile ? audioFile.filename : 'aucun',
            imageFile: imageFile ? imageFile.filename : 'aucun'
        });

        // Construction des URLs de manière sécurisée
        let imageUrl = null;
        let audioUrl = null;

        if (imageFile && imageFile.filename) {
            // Corriger l'URL pour qu'elle pointe vers /uploads/ et non /api/uploads/
            imageUrl = `/uploads/${imageFile.filename}`;
            console.log('[PROD CTRL] URL de l\'image créée:', imageUrl);
        }

        if (audioFile && audioFile.filename) {
            // Corriger l'URL pour qu'elle pointe vers /uploads/ et non /api/uploads/
            audioUrl = `/uploads/${audioFile.filename}`;
            console.log('[PROD CTRL] URL de l\'audio créée:', audioUrl);
        }

        // Préparation des données pour le service
        const productionData = {
            title,
            artist: artist || '',
            description,
            genre,
            release_date,
            image_url: imageUrl,
            audio_url: audioUrl
        };

        // Utiliser le service pour créer une production
        const newProduction = await ProductionService.createProduction(productionData);

        console.log('[PROD CTRL] Production créée avec succès:', newProduction.id);
        res.status(201).json(newProduction);
    } catch (error) {
        console.error('[PROD CTRL] Erreur lors de la création de la production:', error);
        res.status(500).json({ message: 'Erreur lors de la création de la production: ' + error.message });
    }
};

export const updateProduction = async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`[PROD CTRL] Requête de mise à jour pour production ID ${id}`);
        console.log('[PROD CTRL] req.body:', req.body);
        console.log('[PROD CTRL] req.files:', req.files);

        // D'abord récupérer la production existante pour conserver les fichiers actuels
        const existingProduction = await ProductionService.getProductionById(id);
        if (!existingProduction) {
            return res.status(404).json({ message: "Production non trouvée" });
        }

        // Préparation des données à mettre à jour en partant des données existantes
        const updateData = { ...req.body };

        // Gestion des fichiers - conserver les existants si aucun nouveau fichier n'est fourni
        const audioFile = req.files?.audio?.[0] || req.files?.audio_files?.[0] || null;
        const imageFile = req.files?.image?.[0] || req.files?.cover_image?.[0] || null;

        // Pour l'image : utiliser le nouveau fichier si fourni, sinon conserver l'existant
        if (imageFile) {
            updateData.image_url = `/uploads/${imageFile.filename}`;
            console.log(`[PROD CTRL] Nouveau fichier image: ${imageFile.filename}`);
        } else {
            // Conserver l'image existante si elle existe
            if (existingProduction.image_url) {
                updateData.image_url = existingProduction.image_url;
                console.log(`[PROD CTRL] Conservation de l'image existante: ${existingProduction.image_url}`);
            }
        }

        // Pour l'audio : utiliser le nouveau fichier si fourni, sinon conserver l'existant
        if (audioFile) {
            updateData.audio_url = `/uploads/${audioFile.filename}`;
            console.log(`[PROD CTRL] Nouveau fichier audio: ${audioFile.filename}`);
        } else {
            // Conserver l'audio existant s'il existe
            if (existingProduction.audio_url) {
                updateData.audio_url = existingProduction.audio_url;
                console.log(`[PROD CTRL] Conservation de l'audio existant: ${existingProduction.audio_url}`);
            }
        }

        console.log(`[PROD CTRL] Données finales pour mise à jour:`, updateData);

        // Utiliser le service pour mettre à jour une production
        const updatedProduction = await ProductionService.updateProduction(id, updateData);
        console.log(`[PROD CTRL] Production ID ${id} mise à jour avec succès`);

        res.status(200).json(updatedProduction);
    } catch (error) {
        console.error(`[PROD CTRL] Erreur lors de la mise à jour:`, error);

        if (error.message === "Production non trouvée") {
            return res.status(404).json({ message: error.message });
        }

        res.status(500).json({ message: 'Erreur lors de la mise à jour de la production' });
    }
};

export const deleteProduction = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[PROD CTRL] Requête de suppression pour production ID ${id}`);

        // Utiliser le service pour supprimer une production
        await ProductionService.deleteProduction(id);
        console.log(`[PROD CTRL] Production ID ${id} supprimée avec succès`);

        res.status(200).json({ message: 'Production supprimée avec succès' });
    } catch (error) {
        console.error(`[PROD CTRL] Erreur lors de la suppression:`, error);

        if (error.message === "Production non trouvée") {
            return res.status(404).json({ message: error.message });
        }

        res.status(500).json({ message: 'Erreur lors de la suppression de la production' });
    }
};
