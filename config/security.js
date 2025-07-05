// config/security.js
import helmet from 'helmet';
import cors from 'cors';

// Configuration CORS sécurisée
export const corsConfig = {
    origin: function (origin, callback) {
        // En développement, autoriser toutes les origines
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }

        // En production, définir les domaines autorisés
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'https://www.polobeatsprod.com', // Domaine principal avec www
            'https://polobeatsprod.com', // Domaine sans www
            'https://polostore-frontend.vercel.app', // Ancien domaine Vercel
            'https://polostore-five.vercel.app', // Domaine Vercel actuel
            /\.vercel\.app$/ // Autoriser tous les sous-domaines Vercel
        ];

        // Autoriser les requêtes sans origine (applications mobiles, Postman, etc.)
        if (!origin) return callback(null, true);

        // Vérifier si l'origine est autorisée (string ou regex)
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            if (typeof allowedOrigin === 'string') {
                return allowedOrigin === origin;
            }
            return allowedOrigin.test(origin);
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Non autorisé par la politique CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    credentials: true,
    maxAge: 86400, // Cache preflight pour 24 heures
    optionsSuccessStatus: 200 // Support pour les anciens navigateurs
};

// Configuration Helmet pour la sécurité (version corrigée)
export const helmetConfig = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            mediaSrc: ["'self'"],
            fontSrc: ["'self'"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: false // Changé de true à false pour éviter les problèmes
    },
    noSniff: true,
    frameguard: { action: 'deny' },
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
};

// Middleware de limitation de taux (Rate limiting)
export const rateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Plus strict en production
    message: {
        error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Ignorer la limitation pour les fichiers statiques
        return req.path.startsWith('/uploads/') || req.path.startsWith('/api/uploads/');
    }
};

// Headers de sécurité supplémentaires
export const securityHeaders = (req, res, next) => {
    // Empêcher la mise en cache des réponses sensibles
    if (req.path.startsWith('/api/')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
    }

    // Headers personnalisés
    res.setHeader('X-API-Version', '1.0');
    res.setHeader('X-Response-Time', Date.now() - req.startTime);

    next();
};

// Middleware de détection d'attaques
export const securityMonitoring = (req, res, next) => {
    const suspiciousPatterns = [
        /(<script|javascript:|vbscript:|onload=|onerror=)/i,
        /(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER)\s+/i,
        /(\.\.\/|\.\.\\|\/etc\/passwd|\/windows\/system32)/i,
        /(\||\;|\`|\$\(|\$\{)/
    ];

    const checkPayload = (data) => {
        if (typeof data === 'string') {
            return suspiciousPatterns.some(pattern => pattern.test(data));
        }
        if (typeof data === 'object' && data !== null) {
            return Object.values(data).some(value => checkPayload(value));
        }
        return false;
    };

    // Vérifier les paramètres de requête
    if (checkPayload(req.query) || checkPayload(req.body)) {
        return res.status(400).json({
            error: 'Requête suspecte détectée'
        });
    }

    next();
};

export default {
    corsConfig,
    helmetConfig,
    rateLimitConfig,
    securityHeaders,
    securityMonitoring
};
