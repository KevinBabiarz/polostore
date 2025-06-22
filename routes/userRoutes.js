import express from "express";
import { getUsers } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route pour obtenir les utilisateurs avec filtre admin optionnel
router.get("/", protect, getUsers);

export default router;