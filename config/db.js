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

// Vérifier les variables chargées
console.log("Variables d'environnement DB:", {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
});

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10)
});

// Test de connexion
pool.query('SELECT NOW()', (err) => {
    if (err) {
        console.error('Erreur de connexion PostgreSQL:', err);
    } else {
        console.log('Connexion PostgreSQL établie avec succès');
    }
});

export default pool;