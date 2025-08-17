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
            'https://polostore-production.up.railway.app',
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
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
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

// Configuration de limitation du taux de requêtes pour Railway
export const rateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limite par IP
    message: {
        error: 'Trop de requêtes depuis cette IP',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Personnaliser la génération de clé pour Railway
    keyGenerator: (req) => {
        return req.ip || req.connection.remoteAddress;
    },
    // Ignorer certaines routes pour le health check
    skip: (req) => {
        return req.path === '/health' || req.path === '/test';
    }
};

// Headers de sécurité personnalisés
export const securityHeaders = (req, res, next) => {
    // Headers de sécurité supplémentaires
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    // Headers CORS personnalisés pour Railway
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Max-Age', '86400');
    }

    next();
};

// Monitoring de sécurité
export const securityMonitoring = (req, res, next) => {
    // Détecter les tentatives d'attaque
    const suspiciousPatterns = [
        /\.\./,  // Directory traversal
        /<script/i,  // XSS
        /union.*select/i,  // SQL injection
        /javascript:/i,  // JavaScript injection
        /eval\(/i,  // Code injection
        /exec\(/i   // Command injection
    ];

    const userAgent = req.get('User-Agent') || '';
    const fullUrl = req.originalUrl;

    // Vérifier les patterns suspects dans l'URL et User-Agent
    const isSuspicious = suspiciousPatterns.some(pattern =>
        pattern.test(fullUrl) || pattern.test(userAgent)
    );

    if (isSuspicious) {
        console.warn('🚨 Activité suspecte détectée:', {
            ip: req.ip,
            url: fullUrl,
            userAgent: userAgent,
            timestamp: new Date().toISOString()
        });

        // En production, bloquer les requêtes suspectes
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                error: 'Requête bloquée pour des raisons de sécurité'
            });
        }
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
