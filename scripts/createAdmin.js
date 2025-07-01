// scripts/createAdmin.js
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import sequelize, { testConnection } from '../config/sequelize.js';
import logger from '../utils/logger.js';

const createAdmin = async () => {
    try {
        logger.info('🔧 Création de l\'administrateur par défaut...');

        // Tester la connexion
        await testConnection();

        // Vérifier si un admin existe déjà
        const existingAdmin = await User.findOne({ where: { role: 'admin' } });

        if (existingAdmin) {
            logger.info('✅ Un administrateur existe déjà');
            return;
        }

        // Créer un administrateur par défaut
        const defaultAdmin = {
            username: 'admin',
            email: process.env.ADMIN_EMAIL || 'admin@polostore.com',
            password: process.env.ADMIN_PASSWORD || 'AdminPoloStore2024!',
            role: 'admin',
            isActive: true,
            isBanned: false
        };

        // Hasher le mot de passe
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(defaultAdmin.password, saltRounds);

        // Créer l'utilisateur admin
        const admin = await User.create({
            ...defaultAdmin,
            password: hashedPassword
        });

        logger.info('✅ Administrateur créé avec succès', {
            id: admin.id,
            username: admin.username,
            email: admin.email
        });

        console.log('🎉 Administrateur créé avec succès !');
        console.log(`Email: ${admin.email}`);
        console.log(`Mot de passe: ${defaultAdmin.password}`);
        console.log('⚠️  Changez ce mot de passe après la première connexion !');

    } catch (error) {
        logger.error('❌ Erreur lors de la création de l\'administrateur', {
            error: error.message
        });
        console.error('Erreur:', error.message);
    }
};

// Si le script est exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
    createAdmin().then(() => {
        process.exit(0);
    }).catch(() => {
        process.exit(1);
    });
}

export default createAdmin;
