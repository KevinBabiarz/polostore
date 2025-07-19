import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // Chargement des traductions via HTTP
  .use(Backend)
  // Détecteur de langue automatique
  .use(LanguageDetector)
  // Passe l'instance i18n à react-i18next
  .use(initReactI18next)
  // Initialisation avec les options
  .init({
    lng: 'fr', // Langue par défaut au démarrage
    fallbackLng: 'fr', // Langue de repli
    debug: process.env.NODE_ENV === 'development',

    // Configuration du backend
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // Chemin pour charger les fichiers de traduction
    },

    // Configuration des namespaces
    ns: [
      'common',
      'navigation',
      'home',
      'productions',
      'contact',
      'favorites',
      'profile',
      'footer',
      'errors',
      'language',
      'auth',
      'admin',
      'cgu'
    ],
    defaultNS: 'common', // Namespace par défaut

    interpolation: {
      escapeValue: false, // React échappe déjà par défaut
    },

    // Options de détection
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
