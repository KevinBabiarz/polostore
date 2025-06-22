import User from "../models/User.js";

// Récupérer tous les utilisateurs
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'role', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });

        // Transformer la réponse pour correspondre à la structure attendue
        const formattedUsers = users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            is_admin: user.role === 'admin',
            created_at: user.createdAt
        }));

        res.status(200).json(formattedUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};