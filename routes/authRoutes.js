import express from "express";
import { register, login, getCurrentUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
// Route protégée pour récupérer les informations de l'utilisateur actuel
router.get("/me", protect, getCurrentUser);

export default router;