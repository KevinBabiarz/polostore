import i18n from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'path';
import { fileURLToPath } from 'url';

// Pour obtenir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

i18n
  .use(Backend)
  .init({
    lng: 'fr', // Langue par défaut
    fallbackLng: 'fr',
    debug: process.env.NODE_ENV === 'development',

    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json')
    },

    interpolation: {
      escapeValue: false // Pas besoin d'échapper en backend
    },

    defaultNS: 'common',
    ns: [
      'authService',
      'userService',
      'productionService',
      'favoriteService',
      'contactService',
      'server',
      'setAdmin',
      'errors',
      'validation',
      'user',
      'production'
    ]
  });

export { i18n };
export default i18n;
