import express from "express";
import { submitContactForm, getContactMessages, markMessageAsRead } from "../controllers/contactController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", submitContactForm);
router.get("/", protect, admin, getContactMessages);
router.put("/:id/read", protect, admin, markMessageAsRead);

export default router;