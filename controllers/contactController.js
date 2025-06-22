// controllers/contactController.js
import ContactService from "../services/contactService.js";
import Production from "../models/Production.js";

// Soumettre un message de contact
export const submitContactForm = async (req, res) => {
    const { name, email, message, productionId } = req.body;

    try {
        // Vérifier si la production existe si un ID est fourni
        if (productionId) {
            const production = await Production.findByPk(productionId);
            if (!production) {
                return res.status(404).json({ message: "Production non trouvée" });
            }
        }

        // Utiliser le service de contact pour créer un message
        await ContactService.createMessage({
            name,
            email,
            message,
            production_id: productionId || null
        });

        res.status(201).json({ message: "Message envoyé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Récupérer tous les messages (admin seulement)
export const getContactMessages = async (req, res) => {
    try {
        // Récupérer les paramètres de pagination
        const { limit, offset, sortBy, sortOrder } = req.query;

        // Utiliser le service de contact pour récupérer les messages
        const messages = await ContactService.getAllMessages({
            limit: parseInt(limit) || 10,
            offset: parseInt(offset) || 0,
            sortBy: sortBy || 'created_at',
            sortOrder: sortOrder || 'DESC'
        });

        // Formater les résultats pour correspondre à la structure attendue par le frontend
        const formattedMessages = messages.map(message => {
            const plainMessage = message.get({ plain: true });
            return {
                ...plainMessage,
                production_title: plainMessage.production ? plainMessage.production.title : null
            };
        });

        res.status(200).json(formattedMessages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Récupérer un message spécifique
export const getContactMessage = async (req, res) => {
    const { id } = req.params;

    try {
        // Utiliser le service de contact pour récupérer un message spécifique
        const message = await ContactService.getMessageById(id);
        res.status(200).json(message);
    } catch (error) {
        console.error(error);

        if (error.message === "Message non trouvé") {
            return res.status(404).json({ message: error.message });
        }

        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Marquer un message comme lu
export const markMessageAsRead = async (req, res) => {
    const { id } = req.params;

    try {
        // Utiliser le service de contact pour marquer un message comme lu
        const message = await ContactService.markAsRead(id);
        res.status(200).json(message);
    } catch (error) {
        console.error(error);

        if (error.message === "Message non trouvé") {
            return res.status(404).json({ message: error.message });
        }

        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Supprimer un message
export const deleteMessage = async (req, res) => {
    const { id } = req.params;

    try {
        // Utiliser le service de contact pour supprimer un message
        await ContactService.deleteMessage(id);
        res.status(200).json({ message: "Message supprimé avec succès" });
    } catch (error) {
        console.error(error);

        if (error.message === "Message non trouvé") {
            return res.status(404).json({ message: error.message });
        }

        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Compter les messages non lus
export const countUnreadMessages = async (req, res) => {
    try {
        // Utiliser le service de contact pour compter les messages non lus
        const count = await ContactService.countUnreadMessages();
        res.status(200).json({ count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};