// controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

// Inscription d'utilisateur
export const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Vérifier si l'utilisateur existe déjà
        const userExists = await pool.query(
            "SELECT * FROM users WHERE email = $1 OR username = $2",
            [email, username]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "Cet utilisateur existe déjà" });
        }

        // Hacher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Créer l'utilisateur
        const newUser = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, is_admin",
            [username, email, hashedPassword]
        );

        // Générer JWT
        const token = jwt.sign(
            { id: newUser.rows[0].id, isAdmin: newUser.rows[0].is_admin },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(201).json({
            user: newUser.rows[0],
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Connexion d'utilisateur
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (user.rows.length === 0) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect" });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);

        if (!validPassword) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect" });
        }

        const token = jwt.sign(
            { id: user.rows[0].id, isAdmin: user.rows[0].is_admin },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const { password: _, ...userWithoutPassword } = user.rows[0];

        res.status(200).json({
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};