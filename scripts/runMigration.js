// scripts/runMigration.js
import { up } from '../migrations/20250622_add_artist_to_productions.js';

console.log('Démarrage de la migration pour ajouter la colonne "artist"...');
up()
  .then(() => {
    console.log('Migration terminée avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erreur pendant la migration:', error);
    process.exit(1);
  });
