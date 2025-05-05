import express from "express";
import { getProductions, getProductionById, createProduction, updateProduction, deleteProduction } from "../controllers/productionController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();

// Configuration de multer pour les uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

router.get("/", getProductions);
router.get("/:id", getProductionById);
router.post("/", protect, admin, upload.single('cover_image'), createProduction);
router.put("/:id", protect, admin, upload.single('cover_image'), updateProduction);
router.delete("/:id", protect, admin, deleteProduction);

export default router;