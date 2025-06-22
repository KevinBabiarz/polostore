// migrations/20250622_add_artist_to_productions.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

export async function up() {
  try {
    // Vérifier si la colonne existe déjà
    const [columns] = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'productions' AND column_name = 'artist'`
    );

    // Si la colonne n'existe pas, l'ajouter
    if (columns.length === 0) {
      await sequelize.query(
        `ALTER TABLE productions 
         ADD COLUMN artist VARCHAR(255)`
      );
      console.log('Colonne artist ajoutée à la table productions');
    } else {
      console.log('La colonne artist existe déjà dans la table productions');
    }
  } catch (error) {
    console.error('Erreur lors de la migration :', error);
    throw error;
  }
}

export async function down() {
  try {
    await sequelize.query(
      `ALTER TABLE productions 
       DROP COLUMN artist`
    );
    console.log('Colonne artist supprimée de la table productions');
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la migration :', error);
    throw error;
  }
}

// Pour exécuter cette migration manuellement:
// import { up, down } from './migrations/20250622_add_artist_to_productions.js';
// up().then(() => console.log('Migration terminée')).catch(console.error);
