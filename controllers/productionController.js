// controllers/productionController.js
import pool from "../config/db.js";

// Récupérer toutes les productions
export const getProductions = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM productions ORDER BY created_at DESC");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Récupérer une production par ID
export const getProductionById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query("SELECT * FROM productions WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Production non trouvée" });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Créer une nouvelle production (admin seulement)
export const createProduction = async (req, res) => {
    const { title, description, release_date } = req.body;
    const cover_image = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const result = await pool.query(
            "INSERT INTO productions (title, description, cover_image, release_date) VALUES ($1, $2, $3, $4) RETURNING *",
            [title, description, cover_image, release_date]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Mettre à jour une production (admin seulement)
export const updateProduction = async (req, res) => {
    const { id } = req.params;
    const { title, description, release_date } = req.body;
    const cover_image = req.file ? `/uploads/${req.file.filename}` : undefined;

    try {
        // Récupérer les données actuelles
        const currentProduction = await pool.query("SELECT * FROM productions WHERE id = $1", [id]);

        if (currentProduction.rows.length === 0) {
            return res.status(404).json({ message: "Production non trouvée" });
        }

        const updateFields = {
            title: title || currentProduction.rows[0].title,
            description: description || currentProduction.rows[0].description,
            cover_image: cover_image || currentProduction.rows[0].cover_image,
            release_date: release_date || currentProduction.rows[0].release_date,
            updated_at: new Date()
        };

        const result = await pool.query(
            "UPDATE productions SET title = $1, description = $2, cover_image = $3, release_date = $4, updated_at = $5 WHERE id = $6 RETURNING *",
            [updateFields.title, updateFields.description, updateFields.cover_image, updateFields.release_date, updateFields.updated_at, id]
        );

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Supprimer une production (admin seulement)
export const deleteProduction = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query("DELETE FROM productions WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Production non trouvée" });
        }

        res.status(200).json({ message: "Production supprimée avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};