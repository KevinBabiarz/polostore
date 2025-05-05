import express from "express";
import { addFavorite, getUserFavorites, removeFavorite } from "../controllers/favoriteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addFavorite);
router.get("/", protect, getUserFavorites);
router.delete("/:productionId", protect, removeFavorite);

export default router;