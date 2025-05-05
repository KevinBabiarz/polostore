// controllers/contactController.js
import pool from "../config/db.js";

// Soumettre un message de contact
export const submitContactForm = async (req, res) => {
    const { name, email, message, productionId } = req.body;

    try {
        // Vérifier si la production existe si un ID est fourni
        if (productionId) {
            const production = await pool.query("SELECT * FROM productions WHERE id = $1", [productionId]);
            if (production.rows.length === 0) {
                return res.status(404).json({ message: "Production non trouvée" });
            }
        }

        const result = await pool.query(
            "INSERT INTO contact_messages (name, email, message, production_id) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, email, message, productionId || null]
        );

        res.status(201).json({ message: "Message envoyé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Récupérer tous les messages (admin seulement)
export const getContactMessages = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT c.*, p.title as production_title FROM contact_messages c LEFT JOIN productions p ON c.production_id = p.id ORDER BY c.created_at DESC"
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Marquer un message comme lu (admin seulement)
export const markMessageAsRead = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "UPDATE contact_messages SET read = true WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Message non trouvé" });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};