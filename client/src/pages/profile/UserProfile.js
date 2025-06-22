import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Button,
  Grid,
  TextField,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setUserData(prevState => ({
        ...prevState,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation des mots de passe si l'utilisateur veut les changer
    if (userData.newPassword) {
      if (userData.newPassword !== userData.confirmPassword) {
        return setError('Les mots de passe ne correspondent pas.');
      }
      if (!userData.currentPassword) {
        return setError('Veuillez entrer votre mot de passe actuel.');
      }
    }

    try {
      // Simuler la mise à jour du profil - à remplacer par votre API réelle
      // await updateUser({ ...userData });
      console.log('Profil mis à jour avec:', userData);
      setSuccess('Profil mis à jour avec succès!');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la mise à jour du profil.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Mon profil
          </Typography>
          <Avatar
            alt={userData.name}
            src="/static/images/avatar/default.jpg"
            sx={{ width: 80, height: 80 }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom"
                name="name"
                value={userData.name}
                onChange={handleChange}
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={userData.email}
                onChange={handleChange}
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
              />
            </Grid>

            {isEditing && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2 }}>Changer de mot de passe</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Laissez ces champs vides si vous ne souhaitez pas modifier votre mot de passe.
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mot de passe actuel"
                    name="currentPassword"
                    type="password"
                    value={userData.currentPassword}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nouveau mot de passe"
                    name="newPassword"
                    type="password"
                    value={userData.newPassword}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirmer le nouveau mot de passe"
                    name="confirmPassword"
                    type="password"
                    value={userData.confirmPassword}
                    onChange={handleChange}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {isEditing ? (
                <>
                  <Button variant="outlined" onClick={() => setIsEditing(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" variant="contained" color="primary">
                    Enregistrer les modifications
                  </Button>
                </>
              ) : (
                <Button variant="contained" onClick={() => setIsEditing(true)}>
                  Modifier le profil
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" sx={{ mb: 3 }}>
          Activité récente
        </Typography>

        <List sx={{ bgcolor: 'background.paper' }}>
          {[1, 2, 3].map((item) => (
            <ListItem key={item} divider>
              <ListItemText
                primary={`Action récente ${item}`}
                secondary={`Description de l'action ${item}. Ceci est un exemple.`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default UserProfile;
