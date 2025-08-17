import UserService from "../services/userService.js";

export const getUsers = async (req, res) => {
    try {
        console.log('[USER CTRL] Requête reçue sur /api/users');

        // Récupérer les paramètres de la requête
        const { limit, offset, sortBy, sortOrder, search } = req.query;

        console.log('[USER CTRL] Paramètres reçus:', { limit, offset, sortBy, sortOrder, search });

        // Options pour le service
        const options = {
            limit: parseInt(limit) || 10,
            offset: parseInt(offset) || 0,
            sortBy: sortBy || 'created_at',
            sortOrder: sortOrder || 'DESC',
            search: search || null
        };

        // Utiliser le service utilisateur pour récupérer les utilisateurs
        const users = await UserService.getAllUsers(options);

        console.log(`[USER CTRL] ${users.length} utilisateurs récupérés`);

        // Transformer la réponse pour correspondre à la structure attendue par le frontend
        const formattedUsers = users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            isAdmin: user.is_admin,
            isActive: user.is_active,
            created_at: user.created_at
        }));

        res.status(200).json(formattedUsers);
    } catch (error) {
        console.error('[USER CTRL] Erreur:', error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des utilisateurs" });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[USER CTRL] Recherche de l'utilisateur ID ${id}`);

        // Utiliser le service utilisateur pour récupérer un utilisateur par ID
        const user = await UserService.getUserById(id);

        console.log(`[USER CTRL] Utilisateur ID ${id} trouvé`);

        // Transformer la réponse pour correspondre à la structure attendue
        const formattedUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            isAdmin: user.is_admin,
            isActive: user.is_active,
            created_at: user.created_at
        };

        res.status(200).json(formattedUser);
    } catch (error) {
        console.error('[USER CTRL] Erreur:', error);

        if (error?.message && error.message.includes("Utilisateur non trouvé")) {
            return res.status(404).json({ message: error.message });
        }

        res.status(500).json({ message: "Erreur serveur lors de la récupération de l'utilisateur" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Vérifier si l'utilisateur qui fait la demande a les droits
        const requestingUserId = req.user.id;
        const isAdmin = req.user.isAdmin;

        // Seul l'admin ou l'utilisateur lui-même peut modifier son profil
        if (!isAdmin && requestingUserId !== parseInt(id)) {
            return res.status(403).json({ message: "Accès refusé" });
        }

        // Empêcher les mises à jour de champs sensibles
        delete updateData.id;
        delete updateData.created_at;
        delete updateData.password; // le changement de mdp passe par /:id/password

        // Bloquer l'escalade de privilèges pour les non-admins
        if (!isAdmin) {
            delete updateData.is_admin;
            delete updateData.is_active;
        }

        // Utiliser le service utilisateur pour mettre à jour un utilisateur
        const updatedUser = await UserService.updateUser(id, updateData);

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);

        if (error?.message && error.message.includes("Utilisateur non trouvé")) {
            return res.status(404).json({ message: error.message });
        }

        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        // Vérifier si l'utilisateur qui fait la demande a les droits
        const requestingUserId = req.user.id;

        // Seul l'utilisateur lui-même peut changer son mot de passe
        if (requestingUserId !== parseInt(id)) {
            return res.status(403).json({ message: "Accès refusé" });
        }

        // Valider les données
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Les mots de passe actuels et nouveaux sont requis" });
        }

        // Utiliser le service utilisateur pour changer le mot de passe
        await UserService.changePassword(id, currentPassword, newPassword);

        res.status(200).json({ message: "Mot de passe changé avec succès" });
    } catch (error) {
        console.error(error);

        if (error?.message && error.message.includes("Utilisateur non trouvé")) {
            return res.status(404).json({ message: error.message });
        } else if (error?.message && error.message.toLowerCase().includes("mot de passe actuel")) {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const setAdminStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isAdmin } = req.body;

        // Vérifier si l'utilisateur qui fait la demande est admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: "Accès refusé" });
        }

        // Valider les données
        if (typeof isAdmin !== 'boolean') {
            return res.status(400).json({ message: "Le statut administrateur doit être un booléen" });
        }

        // Utiliser le service utilisateur pour définir le statut admin
        const updatedUser = await UserService.setAdminStatus(id, isAdmin);

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);

        if (error?.message && error.message.includes("Utilisateur non trouvé")) {
            return res.status(404).json({ message: error.message });
        }

        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier si l'utilisateur qui fait la demande est admin ou l'utilisateur lui-même
        const isAdmin = req.user.isAdmin;
        const requestingUserId = req.user.id;

        // Seul l'admin ou l'utilisateur lui-même peut supprimer son compte
        if (!isAdmin && requestingUserId !== parseInt(id)) {
            return res.status(403).json({ message: "Accès refusé" });
        }

        // Utiliser le service utilisateur pour supprimer un utilisateur
        await UserService.deleteUser(id);

        res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        console.error(error);

        if (error?.message && error.message.includes("Utilisateur non trouvé")) {
            return res.status(404).json({ message: error.message });
        }

        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Nouveau: changer le statut actif/inactif (admin uniquement)
export const setActiveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        // Vérifier si l'utilisateur qui fait la demande est admin (déjà garanti par le middleware côté route)
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ message: "Le statut actif doit être un booléen" });
        }

        const updatedUser = await UserService.setActiveStatus(id, isActive);
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);

        if (error?.message && error.message.includes("Utilisateur non trouvé")) {
            return res.status(404).json({ message: error.message });
        }

        res.status(500).json({ message: "Erreur serveur" });
    }
};
