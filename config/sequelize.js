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

// Récupération des variables d'environnement
const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_DATABASE
} = process.env;

// Vérification des variables d'environnement
if (!DB_USER || !DB_PASSWORD || !DB_HOST || !DB_DATABASE) {
  console.error('Variables d\'environnement de base de données manquantes:');
  console.error(`DB_USER: ${DB_USER ? 'Défini' : 'Non défini'}`);
  console.error(`DB_PASSWORD: ${DB_PASSWORD ? 'Défini' : 'Non défini'}`);
  console.error(`DB_HOST: ${DB_HOST ? 'Défini' : 'Non défini'}`);
  console.error(`DB_DATABASE: ${DB_DATABASE ? 'Défini' : 'Non défini'}`);
  console.error(`DB_PORT: ${DB_PORT ? 'Défini' : 'Non défini (utilisera le port par défaut)'}`);
}

// Création de l'instance Sequelize avec configuration de base
const sequelize = new Sequelize(DB_DATABASE, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT || 5432,
  dialect: 'postgres',
  logging: false,
  // Ajout d'un timeout raisonnable pour éviter les attentes infinies
  // mais suffisamment long pour laisser la connexion s'établir dans des conditions normales
  dialectOptions: {
    connectTimeout: 20000 // Délai de 20 secondes pour la connexion
  }
});

// Fonction pour tester la connexion
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès.');
    return true;
  } catch (error) {
    console.error('Impossible de se connecter à la base de données:', error);
    throw error; // Propager l'erreur pour arrêter le serveur si la BD n'est pas accessible
  }
};

export default sequelize;
