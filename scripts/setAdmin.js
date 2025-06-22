// scripts/setAdmin.js
import dotenv from 'dotenv';
import sequelize from '../config/sequelize.js';
import User from '../models/User.js';

// Charger les variables d'environnement
dotenv.config({ path: './utils/.env' });

// Fonction pour définir un utilisateur comme admin par son email
async function setUserAsAdmin(email) {
    try {
        console.log(`Tentative de définition de l'utilisateur ${email} comme administrateur...`);

        // Trouver l'utilisateur par email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.error(`Utilisateur avec l'email ${email} non trouvé.`);
            process.exit(1);
        }

        // Mettre à jour le rôle de l'utilisateur
        await user.update({ role: 'admin' });

        console.log(`L'utilisateur ${email} a été défini comme administrateur avec succès.`);
        console.log(`Détails de l'utilisateur:`);
        console.log(`- ID: ${user.id}`);
        console.log(`- Nom d'utilisateur: ${user.username}`);
        console.log(`- Email: ${user.email}`);
        console.log(`- Rôle: ${user.role}`);
    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        // Fermer la connexion à la base de données
        await sequelize.close();
        process.exit(0);
    }
}

// Vérifier si un email a été fourni
const email = process.argv[2];
if (!email) {
    console.error('Veuillez fournir un email. Exemple: node scripts/setAdmin.js user@example.com');
    process.exit(1);
}

// Exécuter la fonction
setUserAsAdmin(email);
