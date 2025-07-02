// config/sequelize.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../utils/.env');

// Utiliser le même chemin .env que dans server.js
dotenv.config({ 'path': envPath });

// Configuration pour Railway et développement local
let sequelize;

// Fonction pour créer une URL de connexion à partir des variables individuelles
const createDatabaseUrlFromEnv = () => {
    const {
        PGHOST,
        PGUSER,
        PGPASSWORD,
        PGDATABASE,
        PGPORT = 5432
    } = process.env;

    if (PGHOST && PGUSER && PGPASSWORD && PGDATABASE) {
        return `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}`;
    }
    return null;
};

if (process.env.DATABASE_URL) {
    // Configuration de production avec Railway (utilise DATABASE_URL)
    console.log('Configuration Railway DATABASE_URL détectée');
    console.log('Utilisation de DATABASE_URL pour la connexion PostgreSQL');

    // Debug: Afficher une partie de l'URL (masquer les credentials)
    const maskedUrl = process.env.DATABASE_URL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log('DATABASE_URL (masquée):', maskedUrl);

    let databaseUrl = process.env.DATABASE_URL;

    // Si l'URL contient postgres.railway.internal, préparer un fallback
    let fallbackUrl = null;
    if (databaseUrl.includes('postgres.railway.internal')) {
        console.log('Détection de postgres.railway.internal, préparation du fallback...');
        fallbackUrl = createDatabaseUrlFromEnv();
        if (fallbackUrl) {
            const maskedFallback = fallbackUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
            console.log('URL de fallback disponible:', maskedFallback);
        }
    }

    sequelize = new Sequelize(databaseUrl, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            },
            // Ajouter des options de connexion supplémentaires
            connectTimeout: 60000,
            socketTimeout: 60000,
            keepAlive: true,
            keepAliveInitialDelayMillis: 0
        },
        logging: process.env.NODE_ENV === 'production' ? false : console.log,
        pool: {
            max: 10,
            min: 0,
            acquire: 60000,
            idle: 10000,
            evict: 1000
        },
        retry: {
            match: [
                /ENOTFOUND/,
                /ECONNREFUSED/,
                /ETIMEDOUT/,
                /EHOSTUNREACH/,
                /EAI_AGAIN/,
                /ECONNRESET/
            ],
            max: 5
        }
    });

    // Si fallback disponible, créer une instance de secours
    if (fallbackUrl) {
        const fallbackSequelize = new Sequelize(fallbackUrl, {
            dialect: 'postgres',
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            },
            logging: process.env.NODE_ENV === 'production' ? false : console.log,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        });

        // Stocker le fallback pour usage ultérieur
        sequelize._fallback = fallbackSequelize;
    }
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

// Fonction de test de connexion avec fallback automatique
export const testConnection = async () => {
    const maxRetries = 3; // Réduire pour tester le fallback plus rapidement
    let lastError;

    // Essayer la connexion principale d'abord
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Tentative de connexion PostgreSQL principale (${attempt}/${maxRetries})...`);
            await sequelize.authenticate();
            console.log('✅ Connexion PostgreSQL principale établie avec succès');
            return true;
        } catch (error) {
            lastError = error;
            console.log(`❌ Tentative principale ${attempt} échouée:`, error.message);

            if (attempt < maxRetries) {
                const delay = Math.min(1000 * attempt, 5000); // Délai plus court pour fallback
                console.log(`Nouvelle tentative dans ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    // Si toutes les tentatives principales échouent ET qu'un fallback existe, l'essayer
    if (sequelize._fallback && lastError.message.includes('postgres.railway.internal')) {
        console.log('🔄 Tentative de connexion avec le fallback (variables individuelles)...');

        try {
            await sequelize._fallback.authenticate();
            console.log('✅ Connexion PostgreSQL fallback établie avec succès');

            // Remplacer l'instance principale par le fallback
            const oldSequelize = sequelize;
            sequelize = sequelize._fallback;
            oldSequelize.close?.();

            console.log('🔄 Basculement vers la connexion fallback effectué');
            return true;
        } catch (fallbackError) {
            console.log('❌ Connexion fallback également échouée:', fallbackError.message);
        }
    }

    console.log('❌ Impossible de se connecter à PostgreSQL après toutes les tentatives');
    console.log('Dernière erreur:', lastError.message);

    // Afficher plus de détails sur l'erreur en développement
    if (process.env.NODE_ENV !== 'production') {
        console.log('Détails de l\'erreur:', lastError);
    }

    throw lastError;
};

export default sequelize;
