// src/utils/fileUtils.js

/**
 * Utilitaires pour la gestion des URLs de fichiers (audio, images)
 */

// Configuration des URLs en fonction de l'environnement
const getBaseUrl = () => {
    return process.env.NODE_ENV === 'production'
        ? 'https://polostore-production.up.railway.app'
        : 'http://localhost:5050';
};

/**
 * Convertit une URL de fichier relative en URL absolue
 * @param {string} fileUrl - URL du fichier (peut être relative ou absolue)
 * @returns {string} URL absolue du fichier
 */
export const getAbsoluteFileUrl = (fileUrl) => {
    if (!fileUrl) return null;

    // Si l'URL est déjà absolue (commence par http), la retourner telle quelle
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
        return fileUrl;
    }

    const baseUrl = getBaseUrl();

    // Si l'URL commence par /uploads/, construire l'URL complète
    if (fileUrl.startsWith('/uploads/')) {
        return `${baseUrl}${fileUrl}`;
    }

    // Corriger les anciennes URLs /api/uploads/ vers /uploads/
    if (fileUrl.startsWith('/api/uploads/')) {
        const correctedPath = fileUrl.replace('/api/uploads/', '/uploads/');
        return `${baseUrl}${correctedPath}`;
    }

    // Si c'est juste un nom de fichier, construire l'URL complète
    if (!fileUrl.startsWith('/')) {
        return `${baseUrl}/uploads/${fileUrl}`;
    }

    // Pour tout autre cas, ajouter le baseUrl
    return `${baseUrl}${fileUrl}`;
};

/**
 * Vérifie si un fichier est un fichier audio basé sur son extension
 * @param {string} filename - Nom ou URL du fichier
 * @returns {boolean} True si c'est un fichier audio
 */
export const isAudioFile = (filename) => {
    if (!filename) return false;
    const ext = filename.split('.').pop()?.toLowerCase();
    const audioExtensions = ['mp3', 'wav', 'wave', 'ogg', 'flac', 'aac', 'm4a', 'wma'];
    return audioExtensions.includes(ext);
};

/**
 * Vérifie si un fichier est un fichier image basé sur son extension
 * @param {string} filename - Nom ou URL du fichier
 * @returns {boolean} True si c'est un fichier image
 */
export const isImageFile = (filename) => {
    if (!filename) return false;
    const ext = filename.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
    return imageExtensions.includes(ext);
};

/**
 * Obtient l'extension d'un fichier
 * @param {string} filename - Nom ou URL du fichier
 * @returns {string} Extension du fichier (sans le point)
 */
export const getFileExtension = (filename) => {
    if (!filename) return '';
    return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Construit une URL d'image optimisée
 * @param {string} imageUrl - URL de l'image
 * @returns {string|null} URL absolue de l'image ou null
 */
export const getImageUrl = (imageUrl) => {
    if (!imageUrl || !isImageFile(imageUrl)) return null;
    return getAbsoluteFileUrl(imageUrl);
};

/**
 * Construit une URL d'audio optimisée
 * @param {string} audioUrl - URL de l'audio
 * @returns {string|null} URL absolue de l'audio ou null
 */
export const getAudioUrl = (audioUrl) => {
    if (!audioUrl || !isAudioFile(audioUrl)) return null;
    return getAbsoluteFileUrl(audioUrl);
};

export default {
    getAbsoluteFileUrl,
    getImageUrl,
    getAudioUrl,
    isAudioFile,
    isImageFile,
    getFileExtension
};
