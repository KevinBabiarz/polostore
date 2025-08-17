// scripts/createAdmin.js
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import sequelize, { testConnection } from '../config/sequelize.js';
import logger from '../utils/logger.js';
import { i18n } from '../utils/i18n.js';

const createAdmin = async () => {
    try {
        logger.info(i18n.t('admin.createAdmin.creating'));

        // Tester la connexion
        await testConnection();

        // Vérifier si un admin existe déjà
        const existingAdmin = await User.findOne({ where: { role: 'admin' } });

        if (existingAdmin) {
            logger.info(i18n.t('admin.createAdmin.adminExists'));
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

        logger.info(i18n.t('admin.createAdmin.createSuccess'), {
            id: admin.id,
            username: admin.username,
            email: admin.email
        });

        console.log(i18n.t('admin.createAdmin.createSuccess'));
        console.log(i18n.t('admin.createAdmin.emailLabel', { email: admin.email }));
        console.log(i18n.t('admin.createAdmin.passwordLabel', { password: defaultAdmin.password }));
        console.log(i18n.t('admin.createAdmin.changePasswordWarning'));

    } catch (error) {
        logger.error(i18n.t('admin.createAdmin.createError'), { error: error.message });
        console.error(i18n.t('admin.createAdmin.createError'), error);
    } finally {
        await sequelize.close();
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
