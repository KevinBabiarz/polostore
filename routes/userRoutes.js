import express from "express";
import {
    getUsers,
    getUserById,
    updateUser,
    changePassword,
    setAdminStatus,
    deleteUser
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route pour obtenir tous les utilisateurs (pour les admins)
router.get("/", protect, getUsers);

// Route pour obtenir un utilisateur par ID
router.get("/:id", protect, getUserById);

// Route pour mettre à jour un utilisateur
router.put("/:id", protect, updateUser);

// Route pour changer le mot de passe
router.patch("/:id/password", protect, changePassword);

// Route pour changer le statut admin (admin seulement)
router.patch("/:id/role", protect, admin, setAdminStatus);

// Route pour supprimer un utilisateur
router.delete("/:id", protect, deleteUser);

export default router;