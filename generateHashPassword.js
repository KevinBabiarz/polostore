// generateHashPassword.js - Script pour générer un hash bcrypt
import bcrypt from 'bcrypt';

const password = 'Poloadmin2025'; // Changez ça
const saltRounds = 12;

const hash = await bcrypt.hash(password, saltRounds);
console.log('Mot de passe hashé pour la DB:');
console.log(hash);
console.log('\nUtilisez ce hash dans la colonne "password" de Railway');

