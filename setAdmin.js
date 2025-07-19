// Script pour mettre à jour un utilisateur en tant qu'admin
import pool from './config/db.js';
import dotenv from 'dotenv';
import { i18n } from './utils/i18n.js';


// En production (Railway), les variables d'environnement sont automatiquement disponibles
// En développement, charger depuis .env
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

// Email de l'utilisateur à promouvoir comme administrateur
const userEmail = 'poloadmin@gmail.com'; // Remplacez par votre email

async function setAdminRole() {
  try {
    // Vérifier si la colonne is_admin existe
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_admin'
    `);

    let result;

    if (checkResult.rows.length > 0) {
      // Si is_admin existe, mettre à jour directement
      result = await pool.query(
        "UPDATE users SET is_admin = true WHERE email = $1 RETURNING id, username, email, is_admin",
        [userEmail]
      );
    } else {
      // Sinon, vérifier si role existe et le transformer en is_admin
      console.log(i18n.t('setAdmin.checkingRoleColumn'));

      const checkRoleResult = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
      `);

      if (checkRoleResult.rows.length > 0) {
        console.log("La colonne role existe, modification de la structure...");
        // Ajouter is_admin et le définir en fonction de role
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false`);
        await pool.query(`UPDATE users SET is_admin = (role = 'admin')`);

        // Mettre à jour l'utilisateur spécifique
        result = await pool.query(
          "UPDATE users SET is_admin = true WHERE email = $1 RETURNING id, username, email, is_admin, role",
          [userEmail]
        );
      } else {
        throw new Error(i18n.t('setAdmin.noAdminColumns'));
      }
    }

    if (result.rows.length === 0) {
      console.log(`Aucun utilisateur trouvé avec l'email ${userEmail}`);
      return;
    }

    console.log('Utilisateur mis à jour avec succès:');
    console.log(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut admin:', error);
  } finally {
    // Fermer la connexion
    pool.end();
  }
}

setAdminRole();
