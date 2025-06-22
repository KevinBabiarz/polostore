// src/utils/errorHandler.js
// Utilitaire pour gérer les erreurs et les afficher dans la console en production
const errorHandler = (error, source = 'Application') => {
    if (process.env.NODE_ENV === 'development') {
        console.error(`[${source}] Erreur:`, error);
    } else {
        // En production, on pourrait utiliser un service de journalisation
        console.error(`[${source}] Erreur: ${error.message}`);

        // Ici vous pourriez ajouter un code pour envoyer l'erreur à un service comme Sentry
        // si (typeof window.Sentry !== 'undefined') {
        //   window.Sentry.captureException(error);
        // }
    }

    return {
        message: error.response?.data?.message || error.message || 'Une erreur est survenue',
        status: error.response?.status || 500
    };
};

export default errorHandler;