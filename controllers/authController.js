// controllers/authController.js
import AuthService from "../services/authService.js";

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
        console.log(`[AUTH CTRL] Tentative d'inscription pour ${email}`);

        // Utiliser le service d'authentification pour l'inscription
        const newUser = await AuthService.register({ username, email, password });

        // Générer un token JWT avec le service
        const token = AuthService.generateToken(newUser);

        console.log(`[AUTH CTRL] Inscription réussie pour ${email}`);

        // Renvoyer les informations utilisateur et le token
        res.status(201).json({
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                isAdmin: newUser.is_admin
            },
            token
        });
    } catch (error) {
        console.error(`[AUTH CTRL] Erreur d'inscription: ${error.message}`);

        // Gestion des erreurs spécifiques
        if (error.message === "Cet utilisateur existe déjà") {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
    }
};

// Connexion d'utilisateur
export const login = async (req, res) => {
    console.log("[AUTH CTRL] Tentative de connexion reçue");
    const { email, password } = req.body;

    // Validation des champs améliorée
    if (!email?.trim() || !password) {
        console.log("[AUTH CTRL] Validation échouée: email ou mot de passe manquant");
        return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    try {
        console.log(`[AUTH CTRL] Traitement de la connexion pour ${email}`);

        // Utiliser le service d'authentification pour la connexion
        const user = await AuthService.login(email, password);

        // Générer un token JWT avec le service
        const token = AuthService.generateToken(user);

        console.log(`[AUTH CTRL] Connexion réussie pour ${email}`);

        // Renvoyer les informations utilisateur et le token
        res.status(200).json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isAdmin: user.is_admin
            },
            token
        });
    } catch (error) {
        console.error(`[AUTH CTRL] Erreur de connexion: ${error.message}`);

        // Message d'erreur générique pour la sécurité
        res.status(400).json({ message: "Email ou mot de passe incorrect" });
    }
};

// Récupérer les informations de l'utilisateur actuel
export const getCurrentUser = async (req, res) => {
    try {
        console.log(`[AUTH CTRL] Récupération des données utilisateur`);

        // L'utilisateur est déjà disponible dans req.user via le middleware d'authentification
        const user = req.user;

        if (!user) {
            console.log(`[AUTH CTRL] Aucun utilisateur trouvé dans la requête`);
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        console.log(`[AUTH CTRL] Données utilisateur récupérées pour ID: ${user.id}`);

        res.status(200).json({
            id: user.id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin
        });
    } catch (error) {
        console.error(`[AUTH CTRL] Erreur lors de la récupération des données utilisateur: ${error.message}`);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
