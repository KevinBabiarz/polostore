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
import { cleanExpiredTokens } from "./middleware/authMiddleware.js";
import {
    corsConfig,
    helmetConfig,
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

// En production (Railway), les variables d'environnement sont injectées automatiquement
// En développement, on peut charger depuis un fichier .env
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

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
    logger.info("Configuration Railway DATABASE_URL détectée");
} else {
    logger.info("Configuration de base de données locale", {
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT,
    });
}

// Initialiser l'application Express
const app = express();
const port = process.env.PORT || 5050;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
            imgSrc: ["'self'", "data:", "https:"],
            mediaSrc: ["'self'"],
            fontSrc: ["'self'"],
            connectSrc: ["'self'"]
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
        case '.ogg': return 'audio/ogg';
        case '.flac': return 'audio/flac';
        case '.aac': return 'audio/aac';
        default: return 'application/octet-stream';
    }
};

// Middleware sécurisé pour servir les fichiers statiques
app.use('/uploads', (req, res, next) => {
    const filePath = path.join(__dirname, 'public/uploads', req.path);

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
        if (req.path.match(/\.(mp3|wav|ogg|flac|aac)$/i)) {
            const mimeType = getAudioMimeType(req.path);
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Accept-Ranges', 'bytes');
        }

        // Servir le fichier
        res.sendFile(filePath);
    });
});

// Créer le dossier uploads s'il n'existe pas
const dir = './public/uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// Nettoyage périodique des tokens expirés (toutes les heures)
setInterval(async () => {
    try {
        await cleanExpiredTokens();
        logger.info('Nettoyage des tokens expirés effectué');
    } catch (error) {
        logger.error('Erreur lors du nettoyage des tokens', { error: error.message });
    }
}, 3600000); // 1 heure

// Initialiser la base de données
const initializeDatabase = async () => {
    try {
        logger.info('Initialisation de la base de données');
        await testConnection();
        logger.info("Connexion PostgreSQL établie avec succès");

        await sequelize.sync({ force: false });
        logger.info('Modèles Sequelize synchronisés avec la base de données');

        await createTables();
        logger.info('Tables créées avec succès');

        return true;
    } catch (err) {
        logger.error("Erreur d'initialisation de la base de données", { error: err.message });
        throw err;
    }
};

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/productions", productionRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

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
            message: "Connecté à PostgreSQL",
            dbHost: process.env.DB_HOST,
            dbName: process.env.DB_DATABASE,
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        logger.error("Erreur de connexion à la base de données", { error: error.message });
        res.status(500).json({
            status: "error",
            message: "Échec de connexion à PostgreSQL"
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

// Middleware pour les routes non trouvées
app.all('/*', (req, res) => {
    logger.warn('Route non trouvée', {
        path: req.originalUrl,
        method: req.method,
        ip: req.ip
    });

    res.status(404).json({
        error: 'Route non trouvée'
    });
});

// En mode production, servir les fichiers statiques React
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));

    app.get('/*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

// Démarrer le serveur
const startServer = async () => {
    try {
        await initializeDatabase();

        app.listen(port, () => {
            logger.info(`Serveur démarré sur le port ${port}`, {
                environment: process.env.NODE_ENV || 'development',
                port: port
            });
        });
    } catch (error) {
        logger.error('Erreur de démarrage du serveur', { error: error.message });
        process.exit(1);
    }
};

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
    logger.info('Signal SIGTERM reçu, arrêt gracieux du serveur');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('Signal SIGINT reçu, arrêt gracieux du serveur');
    process.exit(0);
});

startServer();
