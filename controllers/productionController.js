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

        // Validation des données requises avec messages d'erreur détaillés
        const { title, artist } = req.body;

        if (!title || !title.trim()) {
            console.log('[PROD CTRL] Validation échouée: titre manquant ou vide');
            return res.status(400).json({
                message: "Le titre est obligatoire",
                error: "TITLE_REQUIRED"
            });
        }

        if (!artist || !artist.trim()) {
            console.log('[PROD CTRL] Validation échouée: artiste manquant ou vide');
            return res.status(400).json({
                message: "L'artiste est obligatoire",
                error: "ARTIST_REQUIRED"
            });
        }

        // Récupération des champs du formulaire avec valeurs par défaut sécurisées
        const description = req.body.description || '';
        const genre = req.body.genre || '';
        const release_date = req.body.release_date || null;

        console.log('[PROD CTRL] Champs extraits:', { title, artist, description, genre, release_date });

        // Gestion des fichiers - vérification de tous les noms possibles des champs
        const audioFile = req.files?.audio?.[0] || req.files?.audio_files?.[0] || null;
        const imageFile = req.files?.image?.[0] || req.files?.cover_image?.[0] || null;

        console.log('[PROD CTRL] Fichiers extraits:', {
            audioFile: audioFile ? { filename: audioFile.filename, size: audioFile.size } : 'aucun',
            imageFile: imageFile ? { filename: imageFile.filename, size: imageFile.size } : 'aucun'
        });

        // Construction des URLs de manière sécurisée
        let imageUrl = null;
        let audioUrl = null;

        if (imageFile && imageFile.filename) {
            imageUrl = `/uploads/${imageFile.filename}`;
            console.log('[PROD CTRL] URL de l\'image créée:', imageUrl);
        }

        if (audioFile && audioFile.filename) {
            audioUrl = `/uploads/${audioFile.filename}`;
            console.log('[PROD CTRL] URL de l\'audio créée:', audioUrl);
        }

        // Préparation des données pour le service avec validation
        const productionData = {
            title: title.trim(),
            artist: artist.trim(),
            description: description.trim(),
            genre: genre.trim(),
            release_date: release_date || null,
            image_url: imageUrl,
            audio_url: audioUrl
        };

        console.log('[PROD CTRL] Données préparées pour le service:', productionData);

        // Utiliser le service pour créer une production
        const newProduction = await ProductionService.createProduction(productionData);

        console.log('[PROD CTRL] Production créée avec succès:', newProduction.id);
        res.status(201).json(newProduction);
    } catch (error) {
        console.error('[PROD CTRL] Erreur lors de la création de la production:', error);

        // Gestion des erreurs spécifiques
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: 'Erreur de validation des données',
                details: error.errors.map(e => e.message),
                error: 'VALIDATION_ERROR'
            });
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                message: 'Une production avec ce titre existe déjà',
                error: 'DUPLICATE_TITLE'
            });
        }

        res.status(500).json({
            message: 'Erreur lors de la création de la production',
            error: 'INTERNAL_ERROR',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const updateProduction = async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`[PROD CTRL] Requête de mise à jour pour production ID ${id}`);
        console.log('[PROD CTRL] req.body:', req.body);
        console.log('[PROD CTRL] req.files:', req.files);

        // D'abord récupérer la production existante
        const existingProduction = await ProductionService.getProductionById(id);
        if (!existingProduction) {
            return res.status(404).json({ message: "Production non trouvée" });
        }

        // COMMENCER AVEC LES DONNÉES EXISTANTES et les mettre à jour seulement si nécessaire
        const updateData = {
            title: req.body.title || existingProduction.title,
            artist: req.body.artist || existingProduction.artist,
            description: req.body.description !== undefined ? req.body.description : existingProduction.description,
            genre: req.body.genre !== undefined ? req.body.genre : existingProduction.genre,
            release_date: req.body.release_date !== undefined ? req.body.release_date : existingProduction.release_date,
            // Conserver les fichiers existants par défaut
            image_url: existingProduction.image_url,
            audio_url: existingProduction.audio_url
        };

        // Gestion des fichiers - remplacer seulement si de nouveaux fichiers sont fournis
        const audioFile = req.files?.audio?.[0] || req.files?.audio_files?.[0] || null;
        const imageFile = req.files?.image?.[0] || req.files?.cover_image?.[0] || null;

        // Remplacer l'image seulement si un nouveau fichier est fourni
        if (imageFile) {
            updateData.image_url = `/uploads/${imageFile.filename}`;
            console.log(`[PROD CTRL] Nouveau fichier image: ${imageFile.filename}`);
        } else {
            console.log(`[PROD CTRL] Conservation de l'image existante`);
        }

        // Remplacer l'audio seulement si un nouveau fichier est fourni
        if (audioFile) {
            updateData.audio_url = `/uploads/${audioFile.filename}`;
            console.log(`[PROD CTRL] Nouveau fichier audio: ${audioFile.filename}`);
        } else {
            console.log(`[PROD CTRL] Conservation de l'audio existant`);
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
