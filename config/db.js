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

    // Debug: Afficher une partie de l'URL (masquer les credentials)
    const maskedUrl = process.env.DATABASE_URL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log('Pool DATABASE_URL (masquée):', maskedUrl);

    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            require: true,
            rejectUnauthorized: false
        },
        // Ajouter des options de retry et timeout
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
        max: 10,
        min: 1
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

// Test de connexion avec plus de debug
pool.query('SELECT NOW()', (err, result) => {
    if (err) {
        console.error('Erreur de connexion PostgreSQL Pool:', err.message);
        console.error('Code d\'erreur:', err.code);
        if (err.code === 'ENOTFOUND') {
            console.error('⚠️  Le serveur PostgreSQL est introuvable. Vérifiez que la base de données Railway est bien provisionnée.');
        }
    } else {
        console.log('✅ Connexion PostgreSQL Pool établie avec succès');
        console.log('🕐 Timestamp serveur:', result.rows[0].now);
    }
});

export default pool;