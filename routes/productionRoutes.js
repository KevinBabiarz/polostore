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
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configuration de multer pour les uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/');
    },
    filename: function (req, file, cb) {
        // Utiliser un timestamp pour éviter les conflits de noms de fichiers
        cb(null, Date.now() + '_' + file.originalname.replace(/\s+/g, '_'));
    }
});

// Filtre pour les types de fichiers autorisés
const fileFilter = function (req, file, cb) {
    if (file.fieldname === 'image' || file.fieldname === 'cover_image') {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            return cb(new Error('Seules les images sont autorisées'), false);
        }
    } else if (file.fieldname === 'audio' || file.fieldname === 'audio_files') {
        if (!file.originalname.match(/\.(mp3|wav|ogg|flac|aac)$/i)) {
            return cb(new Error('Seuls les fichiers audio sont autorisés'), false);
        }
    }
    cb(null, true);
};

// Configuration de multer avec les options définies
const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
    fileFilter: fileFilter
});

// Routes publiques
router.get('/', getAllProductions);
router.get('/:id', getProductionById);

// Routes protégées (nécessite authentification + admin)
router.post('/',
    isAuth,
    isAdmin,
    upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'cover_image', maxCount: 1 },
        { name: 'audio', maxCount: 1 },
        { name: 'audio_files', maxCount: 5 }
    ]),
    createProduction
);

router.put('/:id',
    isAuth,
    isAdmin,
    upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'cover_image', maxCount: 1 },
        { name: 'audio', maxCount: 1 },
        { name: 'audio_files', maxCount: 5 }
    ]),
    updateProduction
);

router.delete('/:id', isAuth, isAdmin, deleteProduction);

export default router;