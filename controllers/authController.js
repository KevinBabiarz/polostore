// controllers/authController.js
import AuthService from "../services/authService.js";
import logger from "../utils/logger.js";

// Inscription d'utilisateur
export const register = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Validation des champs améliorée
    if (!username?.trim() || !email?.trim() || !password || !confirmPassword) {
        return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }

    // Vérification que les mots de passe correspondent
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Les mots de passe ne correspondent pas" });
    }

    try {
        logger.info('Tentative d\'inscription', { email: email.toLowerCase() });

        // Utiliser le service d'authentification sécurisé pour l'inscription
        const result = await AuthService.register({
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password
        });

        logger.info('Inscription réussie', { userId: result.user.id });

        // Renvoyer les informations utilisateur et le token
        res.status(201).json({
            message: "Inscription réussie",
            user: result.user,
            token: result.token
        });
    } catch (error) {
        logger.error('Erreur d\'inscription', {
            email: email?.toLowerCase(),
            error: error.message
        });

        // Gestion des erreurs spécifiques
        if (error.message.includes("déjà utilisée") || error.message.includes("déjà pris")) {
            return res.status(409).json({ message: error.message });
        }

        if (error.message.includes("8 caractères") || error.message.includes("invalide")) {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
    }
};

// Connexion d'utilisateur
export const login = async (req, res) => {
    const { email, password } = req.body;

    // Validation des champs
    if (!email?.trim() || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    try {
        logger.info('Tentative de connexion', { email: email.toLowerCase() });

        // Utiliser le service d'authentification sécurisé pour la connexion
        const result = await AuthService.login(email.toLowerCase().trim(), password);

        logger.info('Connexion réussie', { userId: result.user.id });

        // Renvoyer les informations utilisateur et le token
        res.json({
            message: "Connexion réussie",
            user: result.user,
            token: result.token
        });
    } catch (error) {
        logger.warn('Échec de connexion', {
            email: email?.toLowerCase(),
            error: error.message
        });

        // Gestion des erreurs spécifiques
        if (error.message === "Identifiants invalides") {
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        if (error.message === "Compte désactivé" || error.message === "Compte suspendu") {
            return res.status(403).json({ message: error.message });
        }

        res.status(500).json({ message: "Erreur serveur lors de la connexion" });
    }
};

// Déconnexion d'utilisateur (révocation du token)
export const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const userId = req.user?.id;

        if (!token || !userId) {
            return res.status(400).json({ message: "Token ou utilisateur manquant" });
        }

        // Révoquer le token
        const success = await AuthService.logout(token, userId);

        if (success) {
            logger.info('Déconnexion réussie', { userId });
            res.json({ message: "Déconnexion réussie" });
        } else {
            logger.error('Échec de la déconnexion', { userId });
            res.status(500).json({ message: "Erreur lors de la déconnexion" });
        }
    } catch (error) {
        logger.error('Erreur de déconnexion', {
            userId: req.user?.id,
            error: error.message
        });
        res.status(500).json({ message: "Erreur serveur lors de la déconnexion" });
    }
};

// Vérification du statut d'authentification
export const checkAuth = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Non authentifié" });
        }

        // Vérifier que l'utilisateur existe toujours et récupérer ses informations
        const user = await AuthService.getUserById(userId);

        if (!user) {
            return res.status(401).json({ message: "Utilisateur non trouvé" });
        }

        res.json({
            authenticated: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });
    } catch (error) {
        logger.error('Erreur de vérification d\'authentification', {
            userId: req.user?.id,
            error: error.message
        });
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Révocation de tous les tokens d'un utilisateur (utile pour la sécurité)
export const revokeAllTokens = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Non authentifié" });
        }

        const success = await AuthService.revokeAllUserTokens(userId, 'user_request');

        if (success) {
            logger.info('Tous les tokens révoqués', { userId });
            res.json({ message: "Tous les tokens ont été révoqués. Veuillez vous reconnecter." });
        } else {
            res.status(500).json({ message: "Erreur lors de la révocation des tokens" });
        }
    } catch (error) {
        logger.error('Erreur de révocation des tokens', {
            userId: req.user?.id,
            error: error.message
        });
        res.status(500).json({ message: "Erreur serveur" });
    }
};
