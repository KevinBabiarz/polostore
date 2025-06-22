import jwt from "jsonwebtoken";
import AuthService from "../services/authService.js";

// Vérification du token
export const protect = async (req, res, next) => {
    let token;

    console.log('[AUTH MIDDLEWARE] Vérification du token');

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Extraire le token du header Authorization
            token = req.headers.authorization.split(" ")[1];

            if (!token) {
                console.log('[AUTH MIDDLEWARE] Token manquant après "Bearer"');
                return res.status(401).json({ message: "Token invalide ou mal formaté" });
            }

            // Vérifier et décoder le token
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                console.log(`[AUTH MIDDLEWARE] Token valide pour l'utilisateur ID: ${decoded.id}`);

                // Ajouter les informations de l'utilisateur à la requête
                req.user = decoded;
                next();
            } catch (jwtError) {
                console.error('[AUTH MIDDLEWARE] Erreur JWT:', jwtError.message);

                if (jwtError.name === 'TokenExpiredError') {
                    return res.status(401).json({ message: "Session expirée, veuillez vous reconnecter" });
                }

                return res.status(401).json({ message: "Token invalide" });
            }
        } catch (error) {
            console.error('[AUTH MIDDLEWARE] Erreur générale:', error.message);
            res.status(401).json({ message: "Erreur d'authentification" });
        }
    } else {
        console.log('[AUTH MIDDLEWARE] Aucun token fourni dans les headers');
        res.status(401).json({ message: "Accès non autorisé, token manquant" });
    }
};

// Middleware pour vérifier si l'utilisateur est admin
export const admin = (req, res, next) => {
    console.log(`[AUTH MIDDLEWARE] Vérification des droits admin pour l'utilisateur ID: ${req.user?.id}`);

    if (!req.user) {
        console.log('[AUTH MIDDLEWARE] Aucun utilisateur trouvé dans la requête');
        return res.status(401).json({ message: "Authentification requise" });
    }

    if (req.user.isAdmin) {
        console.log('[AUTH MIDDLEWARE] Droits admin confirmés');
        next();
    } else {
        console.log('[AUTH MIDDLEWARE] Droits admin refusés');
        res.status(403).json({ message: "Accès réservé aux administrateurs" });
    }
};