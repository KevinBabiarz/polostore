// services/contactService.js
import ContactMessage from '../models/ContactMessage.js';
import Production from '../models/Production.js';

/**
 * Service de gestion des messages de contact
 */
export const ContactService = {
    /**
     * Récupère tous les messages de contact
     * @param {Object} options - Options de pagination
     * @returns {Promise<Object[]>} Liste des messages de contact
     */
    getAllMessages: async (options = {}) => {
        const { limit = 10, offset = 0, sortBy = 'created_at', sortOrder = 'DESC' } = options;

        return await ContactMessage.findAll({
            include: [
                {
                    model: Production,
                    as: 'production',
                    attributes: ['id', 'title'],
                    required: false
                }
            ],
            order: [[sortBy, sortOrder]],
            limit,
            offset
        });
    },

    /**
     * Récupère un message de contact par son ID
     * @param {number} id - ID du message
     * @returns {Promise<Object>} Le message trouvé
     */
    getMessageById: async (id) => {
        const message = await ContactMessage.findByPk(id, {
            include: [
                {
                    model: Production,
                    as: 'production',
                    attributes: ['id', 'title'],
                    required: false
                }
            ]
        });

        if (!message) {
            throw new Error("Message non trouvé");
        }

        return message;
    },

    /**
     * Crée un nouveau message de contact
     * @param {Object} messageData - Données du message
     * @returns {Promise<Object>} Le message créé
     */
    createMessage: async (messageData) => {
        return await ContactMessage.create({
            ...messageData,
            created_at: new Date(),
            is_read: false
        });
    },

    /**
     * Marque un message comme lu
     * @param {number} id - ID du message
     * @returns {Promise<Object>} Le message mis à jour
     */
    markAsRead: async (id) => {
        const message = await ContactMessage.findByPk(id);

        if (!message) {
            throw new Error("Message non trouvé");
        }

        await message.update({ is_read: true });
        return message;
    },

    /**
     * Supprime un message de contact
     * @param {number} id - ID du message à supprimer
     * @returns {Promise<boolean>} true si la suppression a réussi
     */
    deleteMessage: async (id) => {
        const message = await ContactMessage.findByPk(id);

        if (!message) {
            throw new Error("Message non trouvé");
        }

        await message.destroy();
        return true;
    },

    /**
     * Compte le nombre de messages non lus
     * @returns {Promise<number>} Le nombre de messages non lus
     */
    countUnreadMessages: async () => {
        return await ContactMessage.count({
            where: {
                is_read: false
            }
        });
    }
};

export default ContactService;
