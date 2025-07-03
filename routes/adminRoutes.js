import express from "express";
import { getAllUsers } from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route pour obtenir tous les utilisateurs (protégée + admin seulement)
router.get("/users", protect, admin, getAllUsers);

export default router;