// src/pages/favorites/Favorites.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFavorites, removeFavorite } from '../../services/favoriteService';
import {
    Container, Typography, Grid, Card, CardMedia, CardContent,
    CardActions, Button, Box, Snackbar, Alert, IconButton
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import config from '../../config/config';

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openAlert, setOpenAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const data = await getFavorites();
            setFavorites(data);
        } catch (error) {
            console.error("Erreur lors du chargement des favoris:", error);
            setAlertMessage('Erreur lors du chargement des favoris');
            setOpenAlert(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const handleRemoveFavorite = async (productionId) => {
        try {
            await removeFavorite(productionId);
            setFavorites(favorites.filter(fav => fav.id !== productionId));
            setAlertMessage('Production retirée des favoris');
            setOpenAlert(true);
        } catch (error) {
            console.error("Erreur lors de la suppression du favori:", error);
            setAlertMessage('Erreur lors de la suppression du favori');
            setOpenAlert(true);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Mes Favoris
            </Typography>

            {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography>Chargement...</Typography>
                </Box>
            ) : (
                <>
                    {favorites.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body1" gutterBottom>
                                Vous n'avez pas encore de favoris.
                            </Typography>
                            <Button
                                component={Link}
                                to="/productions"
                                variant="contained"
                                color="primary"
                                sx={{ mt: 2 }}
                            >
                                Parcourir les productions
                            </Button>
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {favorites.map(production => (
                                <Grid item xs={12} sm={6} md={4} key={production.id}>
                                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={production.cover_image
                                                ? `${config.UPLOADS_URL}${production.cover_image}`
                                                : '/placeholder.jpg'}
                                            alt={production.title}
                                        />
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography gutterBottom variant="h5" component="h2">
                                                {production.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {production.artist}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {production.release_date && new Date(production.release_date).toLocaleDateString()}
                                            </Typography>
                                        </CardContent>
                                        <CardActions>
                                            <Button
                                                component={Link}
                                                to={`/productions/${production.id}`}
                                                size="small"
                                                color="primary"
                                            >
                                                Voir détails
                                            </Button>
                                            <IconButton
                                                color="error"
                                                size="small"
                                                onClick={() => handleRemoveFavorite(production.id)}
                                                aria-label="Retirer des favoris"
                                            >
                                                <Delete />
                                            </IconButton>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </>
            )}

            <Snackbar
                open={openAlert}
                autoHideDuration={6000}
                onClose={() => setOpenAlert(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setOpenAlert(false)}
                    severity="success"
                    variant="filled"
                >
                    {alertMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Favorites;