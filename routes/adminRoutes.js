import express from "express";
import { getAllUsers } from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Middleware pour vérifier si l'utilisateur est admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: "Accès réservé aux administrateurs" });
    }
};

// Route pour obtenir tous les utilisateurs (protégée + admin seulement)
router.get("/users", protect, isAdmin, getAllUsers);

export default router;