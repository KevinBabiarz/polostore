// scripts/createAdmin.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import sequelize from '../config/sequelize.js';
import User from '../models/User.js';

// Configuration du chemin .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../utils/.env');
dotenv.config({ 'path': envPath });

// Données de l'administrateur
const adminData = {
  username: 'poloadmin',
  email: 'poloadmin@gmail.com',
  password: 'admin123', // Vous pourrez changer ce mot de passe
  role: 'admin'
};

// Fonction pour créer un administrateur
async function createAdmin() {
  try {
    // Tester la connexion à la base de données
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès');

    // Synchroniser le modèle avec la base de données
    await sequelize.sync({ alter: true });

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({
      where: {
        email: adminData.email
      }
    });

    if (existingAdmin) {
      console.log('Un utilisateur avec cet email existe déjà');
      console.log('Mise à jour des informations et du rôle en admin...');

      // Hacher le mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminData.password, salt);

      // Mettre à jour l'utilisateur existant
      await existingAdmin.update({
        username: adminData.username,
        password: hashedPassword,
        role: 'admin'
      });

      console.log('Utilisateur mis à jour avec le rôle admin!');
    } else {
      // Hacher le mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminData.password, salt);

      // Créer un nouvel administrateur
      await User.create({
        username: adminData.username,
        email: adminData.email,
        password: hashedPassword,
        role: 'admin'
      });

      console.log('Administrateur créé avec succès!');
    }

    console.log('Email: poloadmin@gmail.com');
    console.log('Mot de passe: admin123');

  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur:', error);
  } finally {
    // Fermer la connexion à la base de données
    await sequelize.close();
  }
}

// Exécuter la fonction
createAdmin();
