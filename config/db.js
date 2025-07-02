import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin absolu
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger avec un chemin absolu
dotenv.config({ path: path.resolve(__dirname, '../utils/.env') });

let pool;

if (process.env.DATABASE_URL) {
    // Configuration Railway avec DATABASE_URL
    console.log('Configuration Railway DATABASE_URL détectée pour pool PostgreSQL');

    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    });
} else {
    // Configuration de développement local
    console.log("Configuration locale pour pool PostgreSQL");
    console.log("Variables d'environnement DB:", {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT
    });

    pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || '5432', 10)
    });
}

// Test de connexion
pool.query('SELECT NOW()', (err) => {
    if (err) {
        console.error('Erreur de connexion PostgreSQL Pool:', err.message);
    } else {
        console.log('✅ Connexion PostgreSQL Pool établie avec succès');
    }
});

export default pool;