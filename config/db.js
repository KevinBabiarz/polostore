import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// En production (Railway), les variables d'environnement sont automatiquement disponibles
// En développement, charger depuis .env
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

let pool;

if (process.env.DATABASE_URL) {
    // Configuration Railway avec DATABASE_URL
    console.log('Configuration Railway DATABASE_URL détectée pour pool PostgreSQL');

    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            require: true,
            rejectUnauthorized: false
        },
        connectionTimeoutMillis: 60000,
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

// Test de connexion simple
pool.query('SELECT NOW()', (err, result) => {
    if (err) {
        console.error('Erreur de connexion PostgreSQL Pool:', err.message);
    } else {
        console.log('✅ Connexion PostgreSQL Pool établie avec succès');
        console.log('🕐 Timestamp serveur:', result.rows[0].now);
    }
});

export default pool;