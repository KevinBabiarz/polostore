// middleware/uploadSecurity.js
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

// Configuration du chemin des uploads pour Railway avec volume persistant
const getUploadsPath = () => {
    // Si on est sur Railway avec un volume monté
    if (process.env.RAILWAY_VOLUME_MOUNT_PATH) {
        return process.env.RAILWAY_VOLUME_MOUNT_PATH;
    }

    // Sinon, utiliser le chemin local
    return './public/uploads/';
};

const UPLOADS_PATH = getUploadsPath();

// Liste des types MIME autorisés
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
];

const ALLOWED_AUDIO_TYPES = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/flac',
    'audio/aac',
    'audio/x-wav',
    'audio/wave'
];

// Extensions de fichiers autorisées
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const ALLOWED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.aac'];

// Vérification avancée du type de fichier
const verifyFileType = (file, allowedTypes, allowedExtensions) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype.toLowerCase();

    // Vérifier l'extension
    if (!allowedExtensions.includes(fileExtension)) {
        return false;
    }

    // Vérifier le type MIME
    if (!allowedTypes.includes(mimeType)) {
        return false;
    }

    return true;
};

// Génération de nom de fichier sécurisé
const generateSecureFilename = (originalname) => {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalname).toLowerCase();
    const baseName = path.basename(originalname, extension)
        .replace(/[^a-zA-Z0-9.-_]/g, '_') // Remplacer les caractères spéciaux
        .substring(0, 50); // Limiter la longueur

    return `${timestamp}_${randomBytes}_${baseName}${extension}`;
};

// Configuration de stockage sécurisée
const secureStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(UPLOADS_PATH)) {
            fs.mkdirSync(UPLOADS_PATH, { recursive: true });
        }

        cb(null, UPLOADS_PATH);
    },
    filename: function (req, file, cb) {
        const secureFilename = generateSecureFilename(file.originalname);
        cb(null, secureFilename);
    }
});

// Filtre de fichiers renforcé
const secureFileFilter = (req, file, cb) => {
    try {
        // Vérifier le nom du champ
        const validFields = ['image', 'cover_image', 'audio', 'audio_files'];
        if (!validFields.includes(file.fieldname)) {
            return cb(new Error(`Champ de fichier non autorisé: ${file.fieldname}`), false);
        }

        // Vérifier la taille du nom de fichier
        if (file.originalname.length > 255) {
            return cb(new Error('Nom de fichier trop long'), false);
        }

        // Vérifier selon le type de champ
        if (file.fieldname === 'image' || file.fieldname === 'cover_image') {
            if (!verifyFileType(file, ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_EXTENSIONS)) {
                return cb(new Error('Type d\'image non autorisé. Formats acceptés: JPG, PNG, GIF, WebP'), false);
            }
        } else if (file.fieldname === 'audio' || file.fieldname === 'audio_files') {
            if (!verifyFileType(file, ALLOWED_AUDIO_TYPES, ALLOWED_AUDIO_EXTENSIONS)) {
                return cb(new Error('Type de fichier audio non autorisé. Formats acceptés: MP3, WAV, OGG, FLAC, AAC'), false);
            }
        }

        cb(null, true);
    } catch (error) {
        cb(new Error(`Erreur de validation du fichier: ${error.message}`), false);
    }
};

// Configuration multer sécurisée
export const secureUpload = multer({
    storage: secureStorage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB maximum
        files: 10, // Maximum 10 fichiers
        fields: 20, // Maximum 20 champs
        fieldNameSize: 100, // Taille max du nom de champ
        fieldSize: 1024 * 1024 // Taille max des champs non-fichier (1MB)
    },
    fileFilter: secureFileFilter
});

// Middleware de nettoyage des fichiers temporaires en cas d'erreur
export const cleanupOnError = (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;

    // Intercepter les réponses d'erreur pour nettoyer les fichiers
    const cleanup = () => {
        if (req.files) {
            const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
            files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
    };

    res.send = function(data) {
        if (res.statusCode >= 400) {
            cleanup();
        }
        originalSend.call(this, data);
    };

    res.json = function(data) {
        if (res.statusCode >= 400) {
            cleanup();
        }
        originalJson.call(this, data);
    };

    next();
};

// Middleware de validation post-upload
export const validateUploadedFiles = (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next();
    }

    try {
        const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();

        for (const file of files) {
            // Vérifier que le fichier existe
            if (!fs.existsSync(file.path)) {
                throw new Error(`Fichier manquant: ${file.filename}`);
            }

            // Vérifier la taille réelle du fichier
            const stats = fs.statSync(file.path);
            if (stats.size === 0) {
                fs.unlinkSync(file.path); // Supprimer le fichier vide
                throw new Error(`Fichier vide détecté: ${file.originalname}`);
            }

            // Vérifier que la taille correspond
            if (stats.size !== file.size) {
                fs.unlinkSync(file.path);
                throw new Error(`Taille de fichier incohérente: ${file.originalname}`);
            }
        }

        next();
    } catch (error) {
        return res.status(400).json({
            message: `Erreur de validation des fichiers: ${error.message}`
        });
    }
};

export default {
    secureUpload,
    cleanupOnError,
    validateUploadedFiles
};
