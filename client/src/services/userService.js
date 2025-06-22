import api from './api';

// Récupérer tous les utilisateurs (pour l'admin)
export const getUsers = async (page = 1, limit = 10, searchTerm = '', sortBy = 'createdAt', order = 'desc') => {
  try {
    const response = await api.get('/users', {
      params: {
        page,
        limit,
        search: searchTerm,
        sortBy,
        order
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Récupérer un utilisateur par son ID
export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Changer le rôle d'un utilisateur (admin/user)
export const changeUserRole = async (id, role) => {
  try {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Désactiver un compte utilisateur
export const disableUser = async (id) => {
  try {
    const response = await api.patch(`/users/${id}/disable`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Réactiver un compte utilisateur
export const enableUser = async (id) => {
  try {
    const response = await api.patch(`/users/${id}/enable`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Supprimer un utilisateur (avec précaution)
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
