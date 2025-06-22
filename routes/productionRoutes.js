// routes/productionRoutes.js
import express from 'express';
import { getAllProductions, getProductionById, createProduction } from '../controllers/productionController.js';
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
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
    fileFilter: function (req, file, cb) {
        if (file.fieldname === 'image') {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new Error('Seules les images sont autorisées'));
            }
        } else if (file.fieldname === 'audio') {
            if (!file.originalname.match(/\.(mp3|wav|ogg)$/)) {
                return cb(new Error('Seuls les fichiers audio sont autorisés'));
            }
        }
        cb(null, true);
    }
});

router.get('/', getAllProductions);
router.get('/:id', getProductionById);
router.post('/', isAuth, isAdmin, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
]), createProduction);

export default router;