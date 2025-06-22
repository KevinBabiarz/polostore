import api from './api';

// Cache simple pour éviter les requêtes redondantes
const cache = {
    users: new Map(), // Map des utilisateurs par page/params
    userDetails: new Map(), // Map des détails d'utilisateur par ID
    TTL: 2 * 60 * 1000, // TTL de 2 minutes
};

// Récupérer tous les utilisateurs (pour l'admin)
export const getUsers = async (page = 1, limit = 10, searchTerm = '', sortBy = 'created_at', order = 'DESC') => {
  try {
    console.log('[CLIENT] Récupération des utilisateurs avec params:', { page, limit, searchTerm, sortBy, order });

    // Création d'une clé de cache basée sur les paramètres
    const cacheKey = JSON.stringify({ page, limit, searchTerm, sortBy, order });

    // Vérification du cache
    const cachedData = cache.users.get(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp < cache.TTL)) {
      console.log('[CLIENT] Utilisateurs récupérés du cache');
      return cachedData.data;
    }

    // Calculer l'offset basé sur la page et la limite
    const offset = (page - 1) * limit;

    // Paramètres de requête adaptés au backend
    const params = {
      limit,
      offset,
      search: searchTerm,
      sortBy,
      sortOrder: order
    };

    console.log('[CLIENT] Envoi requête API:', params);
    const response = await api.get('/users', { params });
    console.log('[CLIENT] Réponse API utilisateurs:', response.data ? response.data.length : 'aucune');

    // Mise en cache des données
    if (response.data) {
      cache.users.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }

    return response.data;
  } catch (error) {
    console.error('[CLIENT] Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
};

// Récupérer un utilisateur par son ID
export const getUserById = async (id) => {
  try {
    console.log(`[CLIENT] Récupération de l'utilisateur ID: ${id}`);

    // Vérification du cache
    const cachedData = cache.userDetails.get(id);
    if (cachedData && (Date.now() - cachedData.timestamp < cache.TTL)) {
      return cachedData.data;
    }

    const response = await api.get(`/users/${id}`);

    // Mise en cache des données
    if (response.data) {
      cache.userDetails.set(id, {
        data: response.data,
        timestamp: Date.now()
      });
    }

    return response.data;
  } catch (error) {
    console.error(`[CLIENT] Erreur lors de la récupération de l'utilisateur ${id}:`, error);
    throw error;
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData);

    // Invalider les caches
    cache.users.clear();
    cache.userDetails.delete(id);

    return response.data;
  } catch (error) {
    console.error(`[CLIENT] Erreur lors de la mise à jour de l'utilisateur ${id}:`, error);
    throw error;
  }
};

// Changer le rôle d'un utilisateur (admin/user)
export const changeUserRole = async (id, isAdmin) => {
  try {
    const response = await api.patch(`/users/${id}/role`, { isAdmin });

    // Invalider les caches
    cache.users.clear();
    cache.userDetails.delete(id);

    return response.data;
  } catch (error) {
    console.error(`[CLIENT] Erreur lors du changement de rôle de l'utilisateur ${id}:`, error);
    throw error;
  }
};

// Désactiver un compte utilisateur
export const disableUser = async (id) => {
  try {
    const response = await api.patch(`/users/${id}/status`, { isActive: false });

    // Invalider les caches
    cache.users.clear();
    cache.userDetails.delete(id);

    return response.data;
  } catch (error) {
    console.error(`[CLIENT] Erreur lors de la désactivation de l'utilisateur ${id}:`, error);
    throw error;
  }
};

// Activer un compte utilisateur
export const enableUser = async (id) => {
  try {
    const response = await api.patch(`/users/${id}/status`, { isActive: true });

    // Invalider les caches
    cache.users.clear();
    cache.userDetails.delete(id);

    return response.data;
  } catch (error) {
    console.error(`[CLIENT] Erreur lors de l'activation de l'utilisateur ${id}:`, error);
    throw error;
  }
};

// Supprimer un utilisateur
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);

    // Invalider les caches
    cache.users.clear();
    cache.userDetails.delete(id);

    return response.data;
  } catch (error) {
    console.error(`[CLIENT] Erreur lors de la suppression de l'utilisateur ${id}:`, error);
    throw error;
  }
};

// Fonction pour nettoyer le cache
export const clearUsersCache = () => {
  cache.users.clear();
  cache.userDetails.clear();
};
