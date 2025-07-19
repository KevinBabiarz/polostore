// scripts/setAdmin.js
import dotenv from 'dotenv';
import sequelize from '../config/sequelize.js';
import User from '../models/User.js';
import { i18n } from '../utils/i18n.js';

// En production (Railway), les variables d'environnement sont automatiquement disponibles
// En développement, charger depuis .env
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

// Fonction pour définir un utilisateur comme admin par son email
async function setUserAsAdmin(email) {
    try {
        console.log(i18n.t('admin.setAdmin.attempting', { email }));

        // Trouver l'utilisateur par email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.error(i18n.t('admin.setAdmin.userNotFound'));
            process.exit(1);
        }

        // Mettre à jour le rôle de l'utilisateur
        await user.update({ role: 'admin' });

        console.log(i18n.t('admin.setAdmin.success', { email }));
        console.log(`Détails de l'utilisateur:`);
        console.log(`- ID: ${user.id}`);
        console.log(`- Nom d'utilisateur: ${user.username}`);
        console.log(`- Email: ${user.email}`);
        console.log(`- Rôle: ${user.role}`);
    } catch (error) {
        console.error(i18n.t('admin.setAdmin.error'), error);
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
