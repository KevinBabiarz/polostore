// routes/productionRoutes.js
import express from 'express';
import {
    getAllProductions,
    getProductionById,
    createProduction,
    updateProduction,
    deleteProduction
} from '../controllers/productionController.js';
import { protect as isAuth, admin as isAdmin } from '../middleware/authMiddleware.js';
import { secureUpload, cleanupOnError, validateUploadedFiles } from '../middleware/uploadSecurity.js';

const router = express.Router();

// Configuration des champs de fichiers pour multer
const uploadFields = secureUpload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'cover_image', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
    { name: 'audio_files', maxCount: 5 }
]);

// Middleware de gestion des erreurs multer
const handleUploadError = (error, req, res, next) => {
    if (error) {
        console.error('[UPLOAD ERROR]', error.message);

        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'Fichier trop volumineux. La taille maximum autorisée est de 50 MB.'
            });
        }

        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                message: 'Trop de fichiers. Maximum 10 fichiers autorisés.'
            });
        }

        if (error.code === 'LIMIT_FIELD_COUNT') {
            return res.status(400).json({
                message: 'Trop de champs dans la requête.'
            });
        }

        return res.status(400).json({
            message: `Erreur lors du téléchargement: ${error.message}`
        });
    }
    next();
};

// Routes publiques
router.get('/', getAllProductions);
router.get('/:id', getProductionById);

// Routes protégées (nécessite authentification + admin)
router.post('/',
    isAuth,
    isAdmin,
    cleanupOnError,
    (req, res, next) => {
        uploadFields(req, res, (error) => {
            handleUploadError(error, req, res, next);
        });
    },
    validateUploadedFiles,
    createProduction
);

router.put('/:id',
    isAuth,
    isAdmin,
    cleanupOnError,
    (req, res, next) => {
        uploadFields(req, res, (error) => {
            handleUploadError(error, req, res, next);
        });
    },
    validateUploadedFiles,
    updateProduction
);

router.delete('/:id', isAuth, isAdmin, deleteProduction);

export default router;