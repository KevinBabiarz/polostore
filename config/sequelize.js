// config/sequelize.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// En production (Railway), les variables d'environnement sont automatiquement disponibles
// En développement, charger depuis .env
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

// Configuration pour Railway et développement local
let sequelize;

if (process.env.DATABASE_URL) {
    // Configuration de production avec Railway (utilise DATABASE_URL)
    console.log('Configuration Railway DATABASE_URL détectée');
    console.log('Utilisation de DATABASE_URL pour la connexion PostgreSQL');

    // Debug: Afficher une partie de l'URL (masquer les credentials)
    const maskedUrl = process.env.DATABASE_URL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log('DATABASE_URL (masquée):', maskedUrl);

    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: process.env.NODE_ENV === 'production' ? false : console.log,
        pool: {
            max: 10,
            min: 0,
            acquire: 60000,
            idle: 10000
        }
    });
} else {
    // Configuration de développement local
    console.log('Configuration de développement local');
    console.log('Variables d\'environnement DB: {');
    console.log(`  user: '${process.env.DB_USER}',`);
    console.log(`  host: '${process.env.DB_HOST}',`);
    console.log(`  database: '${process.env.DB_DATABASE}',`);
    console.log(`  port: '${process.env.DB_PORT}'`);
    console.log('}');

    const {
        DB_USER,
        DB_PASSWORD,
        DB_HOST,
        DB_PORT = 5432,
        DB_DATABASE
    } = process.env;

    // Vérification des variables d'environnement pour le développement
    if (!DB_USER || !DB_PASSWORD || !DB_HOST || !DB_DATABASE) {
        console.error('Variables d\'environnement de base de données manquantes:');
        console.error(`DB_USER: ${DB_USER ? 'Défini' : 'Non défini'}`);
        console.error(`DB_PASSWORD: ${DB_PASSWORD ? 'Défini' : 'Non défini'}`);
        console.error(`DB_HOST: ${DB_HOST ? 'Défini' : 'Non défini'}`);
        console.error(`DB_DATABASE: ${DB_DATABASE ? 'Défini' : 'Non défini'}`);
        process.exit(1);
    }

    sequelize = new Sequelize(DB_DATABASE, DB_USER, DB_PASSWORD, {
        host: DB_HOST,
        port: DB_PORT,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'production' ? false : console.log,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
}

// Fonction de test de connexion
export const testConnection = async () => {
    try {
        console.log('Tentative de connexion à PostgreSQL...');
        await sequelize.authenticate();
        console.log('✅ Connexion à PostgreSQL établie avec succès');
        return true;
    } catch (error) {
        console.log('❌ Impossible de se connecter à PostgreSQL:', error.message);
        throw error;
    }
};

export default sequelize;
