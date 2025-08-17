import express from "express";
import { register, login, logout, checkAuth, revokeAllTokens, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Rate limiting spécifique pour l'authentification (temporairement assoupli pour debug)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Augmenté temporairement pour debug
    message: {
        error: "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // Ne compter que les échecs
});

// Rate limiting pour l'inscription (temporairement assoupli)
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 50, // Augmenté temporairement
    message: {
        error: "Trop d'inscriptions depuis cette IP. Veuillez réessayer plus tard."
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Routes publiques avec rate limiting
router.post("/register", registerLimiter, register);
router.post("/login", authLimiter, login);

// Routes protégées (nécessitent une authentification)
router.post("/logout", protect, logout);
router.get("/check", protect, checkAuth);
router.get("/me", protect, getMe);
router.post("/revoke-all", protect, revokeAllTokens);

export default router;