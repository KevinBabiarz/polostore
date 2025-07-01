// scripts/runMigration.js
import sequelize, { testConnection } from '../config/sequelize.js';
import createTables from '../config/initDb.js';
import logger from '../utils/logger.js';

// Importer tous les modèles
import '../models/User.js';
import '../models/Production.js';
import '../models/ContactMessage.js';
import '../models/Favorite.js';
import '../models/RevokedToken.js';

const runMigration = async () => {
    try {
        logger.info('🚀 Démarrage des migrations...');

        // Tester la connexion
        await testConnection();
        logger.info('✅ Connexion à la base de données établie');

        // Synchroniser les modèles
        await sequelize.sync({ force: false });
        logger.info('✅ Modèles synchronisés avec la base de données');

        // Créer les tables avec les contraintes
        await createTables();
        logger.info('✅ Tables créées avec succès');

        logger.info('🎉 Migrations terminées avec succès !');
        process.exit(0);

    } catch (error) {
        logger.error('❌ Erreur lors des migrations', { error: error.message });
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
};

// Exécuter les migrations
runMigration();
