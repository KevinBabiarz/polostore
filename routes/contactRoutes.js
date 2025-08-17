import express from "express";
import { submitContactForm, getContactMessages, markMessageAsRead, getContactMessage, deleteMessage } from "../controllers/contactController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", submitContactForm);
router.get("/", protect, admin, getContactMessages);
router.get("/:id", protect, admin, getContactMessage);
router.put("/:id/read", protect, admin, markMessageAsRead);
router.delete("/:id", protect, admin, deleteMessage);

export default router;