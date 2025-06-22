// controllers/favoriteController.js
import FavoriteService from "../services/favoriteService.js";

// Ajouter une production aux favoris
export const addFavorite = async (req, res) => {
    const { productionId } = req.body;
    const userId = req.user.id;

    try {
        // Utiliser le service de favoris pour ajouter une production aux favoris
        const newFavorite = await FavoriteService.addToFavorites(userId, productionId);
        res.status(201).json(newFavorite);
    } catch (error) {
        console.error(error);

        // Gérer les erreurs spécifiques
        if (error.message === "Production non trouvée") {
            return res.status(404).json({ message: error.message });
        } else if (error.message === "Utilisateur non trouvé") {
            return res.status(404).json({ message: error.message });
        } else if (error.message === "Cette production est déjà dans vos favoris") {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Récupérer les favoris d'un utilisateur
export const getUserFavorites = async (req, res) => {
    const userId = req.user.id;

    try {
        // Utiliser le service de favoris pour récupérer les favoris d'un utilisateur
        const productions = await FavoriteService.getUserFavorites(userId);
        res.status(200).json(productions);
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
        // Utiliser le service de favoris pour supprimer un favori
        await FavoriteService.removeFromFavorites(userId, productionId);
        res.status(200).json({ message: "Production retirée des favoris avec succès" });
    } catch (error) {
        console.error(error);

        // Gérer l'erreur spécifique
        if (error.message === "Cette production n'est pas dans vos favoris") {
            return res.status(404).json({ message: error.message });
        }

        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Vérifier si une production est en favori pour un utilisateur
export const checkFavorite = async (req, res) => {
    const { productionId } = req.params;
    const userId = req.user.id;

    try {
        // Utiliser le service de favoris pour vérifier si une production est en favori
        const isFavorite = await FavoriteService.isFavorite(userId, productionId);
        res.status(200).json({ isFavorite });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};