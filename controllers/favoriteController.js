// controllers/favoriteController.js
import pool from "../config/db.js";

// Ajouter une production aux favoris
export const addFavorite = async (req, res) => {
    const { productionId } = req.body;
    const userId = req.user.id;

    try {
        // Vérifier si la production existe
        const production = await pool.query("SELECT * FROM productions WHERE id = $1", [productionId]);

        if (production.rows.length === 0) {
            return res.status(404).json({ message: "Production non trouvée" });
        }

        // Vérifier si déjà dans les favoris
        const existingFavorite = await pool.query(
            "SELECT * FROM favorites WHERE user_id = $1 AND production_id = $2",
            [userId, productionId]
        );

        if (existingFavorite.rows.length > 0) {
            return res.status(400).json({ message: "Cette production est déjà dans vos favoris" });
        }

        // Ajouter aux favoris
        const result = await pool.query(
            "INSERT INTO favorites (user_id, production_id) VALUES ($1, $2) RETURNING *",
            [userId, productionId]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Récupérer les favoris d'un utilisateur
export const getUserFavorites = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            "SELECT p.* FROM favorites f JOIN productions p ON f.production_id = p.id WHERE f.user_id = $1",
            [userId]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Supprimer un favori
export const removeFavorite = async (req, res) => {
    const { productionId } = req.params;
    const userId = req.user.id;

    try {
        const result = await pool.query(
            "DELETE FROM favorites WHERE user_id = $1 AND production_id = $2 RETURNING *",
            [userId, productionId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Favori non trouvé" });
        }

        res.status(200).json({ message: "Favori supprimé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};