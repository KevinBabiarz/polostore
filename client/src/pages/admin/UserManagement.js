import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, IconButton,
  Button, TextField, InputAdornment, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Chip, Alert,
  FormControlLabel, Switch, CircularProgress, Tooltip, Divider,
  Grid, Card, CardContent, TableSortLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import { getUsers, changeUserRole, enableUser, disableUser, deleteUser } from '../../services/userService';

const UserManagement = () => {
  // États
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [orderBy, setOrderBy] = useState('createdAt'); // Par défaut, tri par date de création
  const [order, setOrder] = useState('desc'); // Par défaut, ordre décroissant

  // Chargement initial des utilisateurs
  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, searchTerm, orderBy, order]);

  // Fonction pour récupérer les utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers(page + 1, rowsPerPage, searchTerm, orderBy, order);

      // Adaptation des données pour qu'elles fonctionnent avec le composant existant
      let adaptedUsers = [];

      if (response && Array.isArray(response)) {
        // Si la réponse est un tableau d'utilisateurs
        adaptedUsers = response.map(user => ({
          ...user,
          // Conversion du champ is_admin en role pour compatibilité avec le frontend
          role: user.is_admin ? 'admin' : 'user',
          // Assurer que l'ID est correctement mappé
          _id: user.id || user._id,
          // Par défaut, considérer l'utilisateur comme actif s'il n'y a pas de champ isActive
          isActive: user.isActive === undefined ? true : user.isActive
        }));
        setTotalCount(adaptedUsers.length);
      } else if (response && response.users) {
        // Si la réponse a la structure { users: [...], totalCount: n }
        adaptedUsers = response.users.map(user => ({
          ...user,
          role: user.is_admin ? 'admin' : 'user',
          _id: user.id || user._id,
          isActive: user.isActive === undefined ? true : user.isActive
        }));
        setTotalCount(response.totalCount || adaptedUsers.length);
      }

      console.log("Utilisateurs adaptés:", adaptedUsers);
      setUsers(adaptedUsers);
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs:", err);
      setError("Impossible de charger la liste des utilisateurs: " + (err.message || "Erreur inconnue"));
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaires d'événements pour la pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Gestionnaire de recherche
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Gestionnaire de tri
  const handleSort = (property) => () => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Fonctions pour les actions sur les utilisateurs
  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedUser(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteUser(selectedUser._id);
      setSuccessMessage(`Utilisateur ${selectedUser.name || selectedUser.email} supprimé avec succès`);
      fetchUsers();
    } catch (err) {
      setError(`Erreur lors de la suppression: ${err.message}`);
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleOpenRoleDialog = (user) => {
    setSelectedUser(user);
    setOpenRoleDialog(true);
  };

  const handleCloseRoleDialog = () => {
    setOpenRoleDialog(false);
    setSelectedUser(null);
  };

  const handleConfirmRoleChange = async () => {
    try {
      const newRole = selectedUser.role === 'admin' ? 'user' : 'admin';
      await changeUserRole(selectedUser._id, newRole);
      setSuccessMessage(`Rôle modifié en ${newRole} pour ${selectedUser.name || selectedUser.email}`);
      fetchUsers();
    } catch (err) {
      setError(`Erreur lors du changement de rôle: ${err.message}`);
    } finally {
      handleCloseRoleDialog();
    }
  };

  const handleOpenStatusDialog = (user) => {
    setSelectedUser(user);
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setSelectedUser(null);
  };

  const handleConfirmStatusChange = async () => {
    try {
      if (selectedUser.isActive) {
        await disableUser(selectedUser._id);
        setSuccessMessage(`Compte de ${selectedUser.name || selectedUser.email} désactivé`);
      } else {
        await enableUser(selectedUser._id);
        setSuccessMessage(`Compte de ${selectedUser.name || selectedUser.email} réactivé`);
      }
      fetchUsers();
    } catch (err) {
      setError(`Erreur lors du changement de statut: ${err.message}`);
    } finally {
      handleCloseStatusDialog();
    }
  };

  // Effacer les messages après un délai
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestion des Utilisateurs
      </Typography>

      {/* Statistiques des utilisateurs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Utilisateurs</Typography>
              <Typography variant="h3">{totalCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Utilisateurs Actifs</Typography>
              <Typography variant="h3">{users.filter(user => user.isActive).length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Administrateurs</Typography>
              <Typography variant="h3">{users.filter(user => user.role === 'admin').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Désactivés</Typography>
              <Typography variant="h3">{users.filter(user => !user.isActive).length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Messages de succès ou d'erreur */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Barre d'outils */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            label="Rechercher des utilisateurs"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={fetchUsers}
            disabled={loading}
          >
            Actualiser
          </Button>
        </Box>
      </Paper>

      {/* Tableau des utilisateurs */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main', '& th': { color: 'white' } }}>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={handleSort('name')}
                  sx={{ color: 'white !important' }}
                >
                  Nom
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'email'}
                  direction={orderBy === 'email' ? order : 'asc'}
                  onClick={handleSort('email')}
                  sx={{ color: 'white !important' }}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'createdAt'}
                  direction={orderBy === 'createdAt' ? order : 'asc'}
                  onClick={handleSort('createdAt')}
                  sx={{ color: 'white !important' }}
                >
                  Inscrit le
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Rôle</TableCell>
              <TableCell align="center">Statut</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Chargement des utilisateurs...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1">
                    Aucun utilisateur trouvé.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>{user.name || '—'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={user.role === 'admin' ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                      label={user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                      color={user.role === 'admin' ? 'secondary' : 'default'}
                      variant={user.role === 'admin' ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={user.isActive ? <CheckCircleIcon /> : <BlockIcon />}
                      label={user.isActive ? 'Actif' : 'Inactif'}
                      color={user.isActive ? 'success' : 'error'}
                      variant={user.isActive ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Tooltip title="Changer le rôle">
                        <IconButton
                          onClick={() => handleOpenRoleDialog(user)}
                          color="primary"
                          size="small"
                        >
                          {user.role === 'admin' ? <PersonIcon /> : <AdminPanelSettingsIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.isActive ? 'Désactiver' : 'Activer'}>
                        <IconButton
                          onClick={() => handleOpenStatusDialog(user)}
                          color={user.isActive ? 'error' : 'success'}
                          size="small"
                        >
                          {user.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          onClick={() => handleOpenDeleteDialog(user)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </TableContainer>

      {/* Boîte de dialogue de confirmation pour la suppression */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
            <strong>{selectedUser?.name || selectedUser?.email}</strong> ?
            <br />
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Boîte de dialogue de confirmation pour le changement de rôle */}
      <Dialog
        open={openRoleDialog}
        onClose={handleCloseRoleDialog}
      >
        <DialogTitle>Changer le rôle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedUser?.role === 'admin'
              ? `Rétrograder ${selectedUser?.name || selectedUser?.email} au rôle d'utilisateur ?`
              : `Promouvoir ${selectedUser?.name || selectedUser?.email} au rôle d'administrateur ?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog}>Annuler</Button>
          <Button onClick={handleConfirmRoleChange} color="primary" variant="contained">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Boîte de dialogue de confirmation pour le changement de statut */}
      <Dialog
        open={openStatusDialog}
        onClose={handleCloseStatusDialog}
      >
        <DialogTitle>Changer le statut</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedUser?.isActive
              ? `Désactiver le compte de ${selectedUser?.name || selectedUser?.email} ?`
              : `Réactiver le compte de ${selectedUser?.name || selectedUser?.email} ?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Annuler</Button>
          <Button
            onClick={handleConfirmStatusChange}
            color={selectedUser?.isActive ? "error" : "success"}
            variant="contained"
          >
            {selectedUser?.isActive ? "Désactiver" : "Réactiver"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;
