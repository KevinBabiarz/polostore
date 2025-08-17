// src/pages/admin/UserManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  TablePagination,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import * as userService from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const { t } = useTranslation('admin'); // Spécifier le namespace admin
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // État pour la pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  // État pour la recherche et le tri
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // État pour le modal d'édition
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    isAdmin: false,
    isActive: true
  });

  // État pour le modal de confirmation de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Fonction pour charger les utilisateurs
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Convertir la page pour l'API (MUI est 0-based, API est 1-based)
      const apiPage = page + 1;

      const response = await userService.getUsers(
        apiPage,
        rowsPerPage,
        searchTerm,
        sortBy,
        sortOrder
      );

      // Vérifier si la réponse est un tableau ou un objet avec une propriété "users"
      if (response) {
        if (Array.isArray(response)) {
          // Si la réponse est directement un tableau d'utilisateurs
          setUsers(response);
          setTotalUsers(response.length);
          console.log('Utilisateurs chargés:', response.length);
        } else if (response.users) {
          // Si la réponse est un objet avec une propriété users
          setUsers(response.users);
          setTotalUsers(response.totalCount || response.users.length);
          console.log('Utilisateurs chargés:', response.users.length);
        } else {
          // Aucun format reconnu
          console.error('Format de réponse non reconnu:', response);
          setUsers([]);
          setTotalUsers(0);
        }
      } else {
        setUsers([]);
        setTotalUsers(0);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      setError('userManagement.errors.loadUsers');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, sortBy, sortOrder]);

  // Charger les utilisateurs au montage et lorsque les paramètres changent
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Gestion des changements de page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Gestion des changements de lignes par page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Ouvrir le dialogue d'édition
  const handleEditUser = async (userId) => {
    try {
      setLoading(true);
      const userData = await userService.getUserById(userId);

      setSelectedUser(userData);
      setEditFormData({
        username: userData.username || '',
        email: userData.email || '',
        isAdmin: userData.isAdmin || userData.role === 'admin' || false,
        isActive: userData.isActive !== false // true par défaut si non défini
      });
      setEditDialogOpen(true);
    } catch (err) {
      console.error("Erreur lors de la récupération des détails de l'utilisateur:", err);
      setError('userManagement.errors.loadUser');
    } finally {
      setLoading(false);
    }
  };

  // Gérer les changements dans le formulaire d'édition
  const handleFormChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = name === 'isAdmin' || name === 'isActive' ? checked : value;

    setEditFormData({
      ...editFormData,
      [name]: newValue
    });
  };

  // Sauvegarder les changements d'un utilisateur
  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      await userService.updateUser(selectedUser.id, editFormData);

      // Mettre à jour le rôle si nécessaire
      if (editFormData.isAdmin !== (selectedUser.isAdmin || selectedUser.role === 'admin')) {
        await userService.changeUserRole(selectedUser.id, editFormData.isAdmin);
      }

      // Mettre à jour le statut actif si nécessaire (API disponible)
      if (typeof editFormData.isActive === 'boolean' && editFormData.isActive !== (selectedUser.isActive === true)) {
        if (editFormData.isActive) {
          await userService.enableUser(selectedUser.id);
        } else {
          await userService.disableUser(selectedUser.id);
        }
      }

      setEditDialogOpen(false);
      loadUsers();
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", err);
      setError('userManagement.errors.updateUser');
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir le dialogue de confirmation de suppression
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Confirmer la suppression d'un utilisateur
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setLoading(true);
      await userService.deleteUser(userToDelete.id);

      setDeleteDialogOpen(false);
      loadUsers(); // Recharger la liste des utilisateurs
    } catch (err) {
      console.error("Erreur lors de la suppression de l'utilisateur:", err);
      setError('userManagement.errors.deleteUser');
    } finally {
      setLoading(false);
    }
  };

  // Changer rapidement le statut d'activation d'un utilisateur
  const handleToggleStatus = async (user) => {
    try {
      setLoading(true);
      if (user.isActive) {
        await userService.disableUser(user.id);
      } else {
        await userService.enableUser(user.id);
      }
      loadUsers(); // Recharger la liste des utilisateurs
    } catch (err) {
      console.error("Erreur lors du changement de statut:", err);
      setError('userManagement.errors.changeStatus');
    } finally {
      setLoading(false);
    }
  };

  // Changer rapidement le rôle d'un utilisateur
  const handleToggleAdmin = async (user) => {
    const isCurrentlyAdmin = user.isAdmin || user.role === 'admin';
    try {
      setLoading(true);
      await userService.changeUserRole(user.id, !isCurrentlyAdmin);
      loadUsers(); // Recharger la liste des utilisateurs
    } catch (err) {
      console.error("Erreur lors du changement de rôle:", err);
      setError('userManagement.errors.changeRole');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('userManagement.title')}
      </Typography>

      {/* Barre de recherche et filtres */}
      <Box sx={{ display: 'flex', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label={t('userManagement.search')}
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, minWidth: '200px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel id="sort-by-label">{t('userManagement.sortBy')}</InputLabel>
          <Select
            labelId="sort-by-label"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            label="Trier par"
          >
            <MenuItem value="created_at">{t('userManagement.createdAt')}</MenuItem>
            <MenuItem value="username">{t('userManagement.username')}</MenuItem>
            <MenuItem value="email">{t('userManagement.email')}</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel id="order-label">{t('userManagement.order')}</InputLabel>
          <Select
            labelId="order-label"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            label="Ordre"
          >
            <MenuItem value="ASC">{t('userManagement.asc')}</MenuItem>
            <MenuItem value="DESC">{t('userManagement.desc')}</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => loadUsers()}
        >
          {t('userManagement.refresh')}
        </Button>
      </Box>

      {/* Messages d'erreur */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t(error)}
        </Alert>
      )}

      {/* Tableau des utilisateurs */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label={t('userManagement.tableAriaLabel')}>
          <TableHead>
            <TableRow>
              <TableCell>{t('userManagement.user')}</TableCell>
              <TableCell>{t('userManagement.email')}</TableCell>
              <TableCell>{t('userManagement.role')}</TableCell>
              <TableCell>{t('userManagement.status')}</TableCell>
              <TableCell>{t('userManagement.createdAt')}</TableCell>
              <TableCell align="center">{t('userManagement.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && !users.length ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {t('userManagement.noUsers')}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isAdmin = user.isAdmin || user.role === 'admin';
                return (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        icon={isAdmin ? <AdminIcon /> : <UserIcon />}
                        label={isAdmin ? t('userManagement.admin') : t('userManagement.user')}
                        color={isAdmin ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={user.isActive ? <CheckCircleIcon /> : <BlockIcon />}
                        label={user.isActive ? t('userManagement.active') : t('userManagement.inactive')}
                        color={user.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date((user.created_at || user.createdAt || user.createdOn || Date.now())).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        {/* Ne pas permettre les actions sur son propre compte */}
                        {currentUser && user.id !== currentUser.id && (
                          <>
                            <Tooltip title={t('userManagement.edit')}>
                              <IconButton onClick={() => handleEditUser(user.id)} size="small">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={isAdmin ? t('userManagement.demote') : t('userManagement.promote')}>
                              <IconButton
                                onClick={() => handleToggleAdmin(user)}
                                size="small"
                                color={isAdmin ? "default" : "primary"}
                              >
                                <AdminIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={user.isActive ? t('userManagement.deactivate') : t('userManagement.activate')}>
                              <IconButton
                                onClick={() => handleToggleStatus(user)}
                                size="small"
                                color={user.isActive ? "error" : "success"}
                              >
                                {user.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={t('userManagement.delete')}>
                              <IconButton
                                onClick={() => handleDeleteClick(user)}
                                size="small"
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {currentUser && user.id === currentUser.id && (
                          <Typography variant="caption" color="textSecondary">
                            {t('userManagement.currentAccount')}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={totalUsers}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={t('userManagement.rowsPerPage')}
        labelDisplayedRows={({ from, to, count }) =>
          t('userManagement.displayedRows', { from, to, count })
        }
      />

      {/* Modal d'édition */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('userManagement.editDialogTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="username"
            label={t('userManagement.username')}
            type="text"
            fullWidth
            variant="outlined"
            value={editFormData.username}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="email"
            label={t('userManagement.email')}
            type="email"
            fullWidth
            variant="outlined"
            value={editFormData.email}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography component="label" htmlFor="isAdmin" sx={{ mr: 1 }}>
                {t('userManagement.admin')}
              </Typography>
              <input
                type="checkbox"
                id="isAdmin"
                name="isAdmin"
                checked={editFormData.isAdmin}
                onChange={handleFormChange}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography component="label" htmlFor="isActive" sx={{ mr: 1 }}>
                {t('userManagement.active')}
              </Typography>
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={editFormData.isActive}
                onChange={handleFormChange}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>{t('common:cancel')}</Button>
          <Button onClick={handleSaveUser} color="primary" variant="contained">
            {t('common:save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('userManagement.confirmDeleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('userManagement.confirmDeleteText', { username: userToDelete?.username })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('common:cancel')}</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            {t('userManagement.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
