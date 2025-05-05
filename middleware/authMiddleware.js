// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Récupérer le token
            token = req.headers.authorization.split(" ")[1];

            // Vérifier le token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Récupérer l'utilisateur
            const user = await pool.query("SELECT id, username, email, is_admin FROM users WHERE id = $1", [decoded.id]);

            if (user.rows.length === 0) {
                return res.status(401).json({ message: "Non autorisé, utilisateur non trouvé" });
            }

            req.user = user.rows[0];
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: "Non autorisé, token invalide" });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Non autorisé, pas de token" });
    }
};

export const admin = (req, res, next) => {
    if (req.user && req.user.is_admin) {
        next();
    } else {
        res.status(403).json({ message: "Non autorisé, réservé aux administrateurs" });
    }
};