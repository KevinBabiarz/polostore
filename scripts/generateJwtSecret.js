import crypto from 'crypto';

// Génération d'une clé JWT sécurisée de 64 caractères
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('Clé JWT générée (64 caractères) :');
console.log(jwtSecret);
console.log('\nCopiez cette clé dans votre fichier .env pour JWT_SECRET');
