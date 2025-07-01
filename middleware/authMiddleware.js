import jwt from "jsonwebtoken";
import AuthService from "../services/authService.js";
import RevokedToken from "../models/RevokedToken.js";
import User from "../models/User.js";
import crypto from "crypto";
import { Op } from "sequelize";

// Fonction pour générer un JTI (JWT ID) unique
const generateJTI = () => {
    return crypto.randomBytes(16).toString('hex');
};

// Fonction pour créer un token JWT avec JTI
export const createTokenWithJTI = (payload) => {
    const jti = generateJTI();
    const tokenPayload = {
        ...payload,
        jti
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });

    return { token, jti };
};

// Fonction pour révoquer un token
export const revokeToken = async (tokenId, userId, reason = null) => {
    try {
        // Décoder le token pour obtenir l'expiration
        const decoded = jwt.decode(tokenId);
        const expiresAt = new Date(decoded.exp * 1000);

        await RevokedToken.create({
            tokenId: decoded.jti || tokenId,
            userId,
            expiresAt,
            reason
        });

        return true;
    } catch (error) {
        console.error('[TOKEN REVOCATION ERROR]', error);
        return false;
    }
};

// Nettoyage automatique des tokens expirés
export const cleanExpiredTokens = async () => {
    try {
        const now = new Date();
        await RevokedToken.destroy({
            where: {
                expiresAt: {
                    [Op.lt]: now
                }
            }
        });
    } catch (error) {
        console.error('[TOKEN CLEANUP ERROR]', error);
    }
};

// Vérification du token améliorée
export const protect = async (req, res, next) => {
    let token;

    // Ne pas logger les détails sensibles en production
    if (process.env.NODE_ENV !== 'production') {
        console.log('[AUTH MIDDLEWARE] Vérification du token');
    }

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Extraire le token du header Authorization
            token = req.headers.authorization.split(" ")[1];

            if (!token) {
                return res.status(401).json({ message: "Token invalide ou mal formaté" });
            }

            // Vérifier et décoder le token
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                // Vérifier si le token est révoqué
                if (decoded.jti) {
                    const revokedToken = await RevokedToken.findOne({
                        where: { tokenId: decoded.jti }
                    });

                    if (revokedToken) {
                        return res.status(401).json({
                            message: "Token révoqué, veuillez vous reconnecter"
                        });
                    }
                }

                // Vérifier si l'utilisateur existe toujours et n'est pas banni
                const user = await User.findByPk(decoded.id, {
                    attributes: ['id', 'email', 'role', 'isActive', 'isBanned']
                });

                if (!user) {
                    return res.status(401).json({
                        message: "Utilisateur non trouvé"
                    });
                }

                if (user.isBanned) {
                    // Révoquer automatiquement le token si l'utilisateur est banni
                    if (decoded.jti) {
                        await revokeToken(token, decoded.id, 'user_banned');
                    }
                    return res.status(403).json({
                        message: "Compte suspendu"
                    });
                }

                if (!user.isActive) {
                    return res.status(401).json({
                        message: "Compte désactivé"
                    });
                }

                // Ajouter les informations de l'utilisateur à la requête
                req.user = {
                    id: decoded.id,
                    email: user.email,
                    role: user.role,
                    jti: decoded.jti
                };

                if (process.env.NODE_ENV !== 'production') {
                    console.log(`[AUTH MIDDLEWARE] Token valide pour l'utilisateur ID: ${decoded.id}`);
                }

                next();
            } catch (jwtError) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error('[AUTH MIDDLEWARE] Erreur JWT:', jwtError.message);
                }

                if (jwtError.name === 'TokenExpiredError') {
                    return res.status(401).json({ message: "Session expirée, veuillez vous reconnecter" });
                }

                return res.status(401).json({ message: "Token invalide" });
            }
        } catch (error) {
            // Ne pas logger les détails de l'erreur en production
            if (process.env.NODE_ENV !== 'production') {
                console.error('[AUTH MIDDLEWARE] Erreur générale:', error.message);
            }
            res.status(401).json({ message: "Erreur d'authentification" });
        }
    } else {
        res.status(401).json({ message: "Accès non autorisé, token manquant" });
    }
};

// Middleware pour vérifier si l'utilisateur est admin
export const admin = (req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[AUTH MIDDLEWARE] Vérification des droits admin pour l'utilisateur ID: ${req.user?.id}`);
    }

    if (!req.user) {
        return res.status(401).json({ message: "Authentification requise" });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Accès refusé : privilèges administrateur requis" });
    }

    next();
};