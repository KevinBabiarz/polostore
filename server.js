import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs';
import sequelize, { testConnection } from "./config/sequelize.js";
import authRoutes from "./routes/authRoutes.js";
import productionRoutes from "./routes/productionRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import createTables from "./config/initDb.js";
import logger from "./utils/logger.js";
import { i18n } from "./utils/i18n.js";
import { cleanExpiredTokens } from "./middleware/authMiddleware.js";
import {
    corsConfig,
    rateLimitConfig,
    securityHeaders,
    securityMonitoring
} from "./config/security.js";

// Importer tous les modèles pour s'assurer qu'ils sont enregistrés
import "./models/User.js";
import "./models/Production.js";
import "./models/ContactMessage.js";
import "./models/Favorite.js";
import "./models/RevokedToken.js";

// Définir __dirname avant son utilisation (ES6 modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// En production (Railway), les variables d'environnement sont injectées automatiquement
// En développement, on peut charger depuis un fichier .env
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

// Configuration du chemin des uploads pour Railway avec volume persistant
const getUploadsPath = () => {
    // Si on est sur Railway avec un volume monté
    if (process.env.RAILWAY_VOLUME_MOUNT_PATH) {
        logger.info(`Volume Railway détecté: ${process.env.RAILWAY_VOLUME_MOUNT_PATH}`);
        return process.env.RAILWAY_VOLUME_MOUNT_PATH;
    }

    // Sinon, utiliser le chemin local
    return path.join(__dirname, 'public/uploads');
};

const UPLOADS_PATH = getUploadsPath();

// Vérifier que la clé secrète JWT existe et est forte
if (!process.env.JWT_SECRET) {
    logger.error('JWT_SECRET manquant dans les variables d\'environnement');
    process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
    logger.warn('JWT_SECRET trop courte, recommandation: minimum 32 caractères');
}

// Afficher les variables d'environnement de base de données pour débogage (sans données sensibles)
if (process.env.DATABASE_URL) {
    logger.info(i18n.t('server.railwayConfigDetected'));
} else {
    logger.info(i18n.t('server.localDbConfig'), {
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT,
    });
}

// Initialiser l'application Express
const app = express();
const port = process.env.PORT || 5050;

// Configuration trust proxy pour Railway et production
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // Corriger l'erreur express-rate-limit sur Railway
}

// Middleware de timing pour mesurer les performances
app.use((req, res, next) => {
    req.startTime = Date.now();
    next();
});

// Configuration CORS sécurisée
app.use(cors(corsConfig));

// Configuration de sécurité avec Helmet (version simplifiée et corrigée)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            mediaSrc: ["'self'", "data:", "blob:"], // Permettre les fichiers audio
            fontSrc: ["'self'"],
            connectSrc: ["'self'", 'https://www.polobeatsprod.com', 'https://polobeatsprod.com', 'https://polostore-five.vercel.app', 'https://polostore-production.up.railway.app'],
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: process.env.NODE_ENV === 'production' ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: false
    } : false
}));

// Limitation du taux de requêtes
const limiter = rateLimit(rateLimitConfig);
app.use('/api/', limiter);

// Headers de sécurité personnalisés
app.use(securityHeaders);

// Monitoring de sécurité
app.use('/api/', securityMonitoring);

// Augmenter la taille limite des requêtes avec des limites raisonnables
app.use(express.json({
    limit: '10mb',
    type: 'application/json'
}));
app.use(express.urlencoded({
    extended: true,
    limit: '10mb',
    parameterLimit: 50 // Limiter le nombre de paramètres
}));

// Middleware pour déboguer les requêtes (seulement en développement)
app.use((req, res, next) => {
    if (!req.path.startsWith('/uploads/') && process.env.NODE_ENV !== 'production') {
        logger.debug(`${req.method} ${req.originalUrl}`, {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
    }
    next();
});

// Fonction d'aide pour déterminer le type MIME correct pour les fichiers audio
const getAudioMimeType = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
        case '.mp3': return 'audio/mpeg';
        case '.wav': return 'audio/wav';
        case '.wave': return 'audio/wav';
        case '.ogg': return 'audio/ogg';
        case '.flac': return 'audio/flac';
        case '.aac': return 'audio/aac';
        case '.m4a': return 'audio/mp4';
        case '.wma': return 'audio/x-ms-wma';
        default: return 'audio/mpeg'; // Par défaut audio
    }
};

// Fonction d'aide pour déterminer le type MIME correct pour les fichiers image
const getImageMimeType = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
        case '.jpg':
        case '.jpeg': return 'image/jpeg';
        case '.png': return 'image/png';
        case '.gif': return 'image/gif';
        case '.webp': return 'image/webp';
        case '.svg': return 'image/svg+xml';
        case '.bmp': return 'image/bmp';
        case '.ico': return 'image/x-icon';
        default: return 'image/jpeg'; // Par défaut image
    }
};

// Middleware sécurisé pour servir les fichiers statiques
app.use('/uploads', (req, res, next) => {
    const filePath = path.join(UPLOADS_PATH, req.path);

    // Vérifier que le chemin ne contient pas de traversée de répertoire
    if (req.path.includes('..') || req.path.includes('~')) {
        logger.warn('Tentative de traversée de répertoire détectée', {
            path: req.path,
            ip: req.ip
        });
        return res.status(403).json({ error: 'Accès interdit' });
    }

    // Vérifier si le fichier existe
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            logger.debug(`Fichier non trouvé: ${filePath}`);
            return res.status(404).json({ error: 'Fichier non trouvé' });
        }

        // Headers de sécurité pour les fichiers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 an

        // Déterminer le type MIME pour les fichiers audio
        if (req.path.match(/\.(mp3|wav|ogg|flac|aac|m4a|wma)$/i)) {
            const mimeType = getAudioMimeType(req.path);
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Accept-Ranges', 'bytes');
        }

        // Déterminer le type MIME pour les fichiers image
        if (req.path.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i)) {
            const mimeType = getImageMimeType(req.path);
            res.setHeader('Content-Type', mimeType);
        }

        // Servir le fichier
        res.sendFile(filePath);
    });
});

// Créer le dossier uploads s'il n'existe pas
if (!fs.existsSync(UPLOADS_PATH)){
    fs.mkdirSync(UPLOADS_PATH, { recursive: true });
    logger.info(`Dossier uploads créé: ${UPLOADS_PATH}`);
}

// Initialiser la base de données
const initializeDatabase = async () => {
    try {
        logger.info('Initialisation de la base de données');
        await testConnection();
        logger.info(i18n.t('server.postgresConnected'));

        await sequelize.sync({ force: false });
        logger.info('Modèles Sequelize synchronisés avec la base de données');

        await createTables();
        logger.info('Tables créées avec succès');

        return true;
    } catch (err) {
        logger.error(i18n.t('server.dbInitError'), { error: err.message });
        throw err;
    }
};

logger.info('🔧 Configuration des routes...');

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/productions", productionRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

logger.info('✅ Routes configurées');

// Route de santé pour Railway health check
app.get("/health", async (req, res) => {
    try {
        // Tester la connexion à la base de données
        await sequelize.authenticate();
        res.status(200).json({
            status: "ok",
            message: "Service en ligne",
            database: "connected",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(503).json({
            status: "error",
            message: "Service indisponible",
            database: "disconnected",
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Route de diagnostic pour vérifier la connexion à PostgreSQL
app.get("/api/db-status", async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({
            status: "ok",
            message: i18n.t('server.connectedToPostgres'),
            dbHost: process.env.DB_HOST,
            dbName: process.env.DB_DATABASE,
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        logger.error(i18n.t('server.dbConnectionError'), { error: error.message });
        res.status(500).json({
            status: "error",
            message: i18n.t('server.postgresConnectionFailed')
        });
    }
});

// Route de test simple
app.get('/test', (req, res) => {
    res.json({
        message: 'API opérationnelle',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Middleware de gestion des erreurs globales
app.use((err, req, res, next) => {
    logger.error('Erreur non gérée', {
        error: err.message,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
        path: req.path,
        method: req.method
    });

    res.status(500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Erreur interne du serveur'
            : err.message
    });
});

// En mode production, servir les fichiers statiques React
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));

    // Catch-all handler pour React Router - doit être APRÈS les routes API et AVANT le middleware 404
    app.get('/*', (req, res, next) => {
        // Ne pas intercepter les routes API
        if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path.startsWith('/health') || req.path.startsWith('/test')) {
            return next();
        }

        // Servir index.html pour toutes les autres routes (React Router)
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

// Middleware pour les routes non trouvées - DOIT ÊTRE LE DERNIER
app.all('*', (req, res) => {
    logger.warn('Route non trouvée', {
        path: req.originalUrl,
        method: req.method,
        ip: req.ip
    });

    res.status(404).json({
        error: 'Route non trouvée'
    });
});

// Gestion gracieuse de l'arrêt du serveur
let server;

const gracefulShutdown = async (signal) => {
    logger.info(`Signal ${signal} reçu, arrêt gracieux du serveur...`);

    if (server) {
        server.close(() => {
            logger.info('Serveur HTTP fermé');
        });
    }

    try {
        await sequelize.close();
        logger.info('Connexion PostgreSQL fermée');
    } catch (error) {
        logger.error('Erreur lors de la fermeture de la connexion PostgreSQL', { error: error.message });
    }

    process.exit(0);
};

// Gestionnaires pour l'arrêt gracieux
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Démarrage du serveur
const startServer = async () => {
    try {
        // Initialiser la base de données avant de démarrer le serveur
        await initializeDatabase();

        // Démarrer le nettoyage périodique des tokens expirés après que tout soit initialisé
        setInterval(async () => {
            try {
                await cleanExpiredTokens();
                logger.info('Nettoyage des tokens expirés effectué');
            } catch (error) {
                logger.error('Erreur lors du nettoyage des tokens expirés', { error: error.message });
            }
        }, 60 * 60 * 1000); // Nettoyage toutes les heures

        // Démarrer le serveur HTTP
        server = app.listen(port, '0.0.0.0', () => {
            logger.info(`🚀 Serveur démarré sur le port ${port}`);
            logger.info(`🕐 Timestamp serveur: ${new Date().toISOString()}`);
            logger.info(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`📍 URL de santé: http://localhost:${port}/health`);
        });

        // Gestion des erreurs du serveur
        server.on('error', (error) => {
            if (error.syscall !== 'listen') {
                throw error;
            }

            const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

            switch (error.code) {
                case 'EACCES':
                    logger.error(`${bind} nécessite des privilèges élevés`);
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    logger.error(`${bind} est déjà utilisé`);
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        });

    } catch (error) {
        logger.error('Erreur lors du démarrage du serveur', { error: error.message });
        process.exit(1);
    }
};

// Lancer le serveur
startServer();
